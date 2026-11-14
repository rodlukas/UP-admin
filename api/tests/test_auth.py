import base64
import os
from unittest import mock

from django.contrib.auth import authenticate, get_user_model
from django.core.cache import cache
from django.http import HttpResponse
from django.test import Client, TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from admin.models import Client as ClientModel
from api.throttles import ClientIpScopedRateThrottle
from api.tokens import MyTokenObtainSlidingSerializer

AUTH_URL = reverse("token_obtain")
REFRESH_URL = reverse("token_refresh")
CLIENTS_URL = reverse("client-list")


class CaseInsensitiveLoginTest(TestCase):
    """
    Testy pro přihlášení bez ohledu na velikost písmen v username.

    Mobilní klávesnice (typicky Android) umí kapitalizovat první písmeno
    username i přes `autocapitalize="none"` na inputu (viz
    frontend/src/pages/Login.tsx) - HTML atribut je jen hint, který
    některé klávesnice/prohlížeče ignorují.
    """

    def setUp(self) -> None:
        self.username = "case-insensitive-login-test-user"
        self.password = "test-password"
        get_user_model().objects.create_user(username=self.username, password=self.password)

    def test_login_with_capitalized_first_letter_succeeds(self) -> None:
        response = self.client.post(
            AUTH_URL, {"username": "Case-insensitive-login-test-user", "password": self.password}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.json())

    def test_login_with_original_case_still_succeeds(self) -> None:
        response = self.client.post(
            AUTH_URL, {"username": self.username, "password": self.password}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.json())

    def test_login_with_wrong_password_still_fails(self) -> None:
        response = self.client.post(
            AUTH_URL,
            {"username": "Case-insensitive-login-test-user", "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CaseVariantCollisionLoginTest(TestCase):
    """
    Dvě uživatelská jména lišící se jen velikostí písmen.

    Unique index na username je case-sensitive, takže taková dvojice v DB vzniknout
    může a normalizace pak nemá jak rozhodnout, kterého uživatele volající myslí.
    Napsaná hodnota proto zůstane beze změny a rozhodne přesná shoda ve `ModelBackend`
    (viz api/tokens.py).
    """

    def setUp(self) -> None:
        get_user_model().objects.create_user(username="ucitel", password="heslo-male")
        get_user_model().objects.create_user(username="Ucitel", password="heslo-velke")

    def test_exact_match_wins_for_lowercase_user(self) -> None:
        response = self.client.post(AUTH_URL, {"username": "ucitel", "password": "heslo-male"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_exact_match_wins_for_capitalized_user(self) -> None:
        response = self.client.post(AUTH_URL, {"username": "Ucitel", "password": "heslo-velke"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ambiguous_case_is_rejected_not_crashed(self) -> None:
        # "UCITEL" nesedi presne na zadneho z nich - musi prijit cista 401, ne 500
        response = self.client.post(AUTH_URL, {"username": "UCITEL", "password": "heslo-male"})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class InactiveUserLoginTest(TestCase):
    """
    Neaktivní uživatel se nesmí přihlásit ani po normalizaci username.

    Normalizace dosazuje username z DB, takže neaktivnímu uživateli otevírá i tvary, které
    by jinak na přesnou shodu nesedly - kontrola `is_active` musí platit i pro ně.
    """

    def setUp(self) -> None:
        get_user_model().objects.create_user(
            username="neaktivni-ucitel", password="test-password", is_active=False
        )
        # aktivni protejsek se stejnym tvarem jmena, jako kontrola: `AuthenticationFailed` je
        # stejna pro "uzivatel neexistuje" i pro "existuje, ale je neaktivni", takze bez tehle
        # dvojice by testy nize prosly i tehdy, kdyby normalizace vubec nebezela
        get_user_model().objects.create_user(username="aktivni-ucitel", password="test-password")

    def test_inactive_user_cannot_log_in_with_exact_username(self) -> None:
        response = self.client.post(
            AUTH_URL, {"username": "neaktivni-ucitel", "password": "test-password"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_inactive_user_cannot_log_in_with_different_case(self) -> None:
        response = self.client.post(
            AUTH_URL, {"username": "Neaktivni-Ucitel", "password": "test-password"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_normalization_cannot_resurrect_inactive_user(self) -> None:
        # primo pres serializer, ne pres view: 401 z view nerekne, co ji zpusobilo, a tady
        # jde o to, ze uzivatele nesmi vzkrisit prave normalizace - ta mu jinou velikost
        # pismen otevira, takze musi narazit az na `is_active`.
        # Prvni assert drzi, ze normalizace v tomhle tvaru jmena opravdu bezi; bez nej by
        # druhy prosel i s uplne vypnutou normalizaci.
        MyTokenObtainSlidingSerializer().validate(
            {"username": "Aktivni-Ucitel", "password": "test-password"}
        )
        with self.assertRaises(AuthenticationFailed):
            MyTokenObtainSlidingSerializer().validate(
                {"username": "Neaktivni-Ucitel", "password": "test-password"}
            )


class DiacriticsLoginTest(TestCase):
    """
    Česká diakritika v username.

    `__iexact` se na PostgreSQL překládá na `UPPER(sloupec) = UPPER(%s)` a `upper()` je
    závislé na ctype databáze - na `C`/`POSIX` by se neascii písmena přestala skládat
    a case-insensitive přihlášení by pro ně tiše přestalo fungovat. Lokál i CI jedou na
    `cs_CZ.UTF-8` (db/Dockerfile), tenhle test to pro ně drží.
    """

    def setUp(self) -> None:
        self.password = "test-password"
        get_user_model().objects.create_user(username="čeněk", password=self.password)

    def test_login_with_capitalized_diacritics_succeeds(self) -> None:
        response = self.client.post(AUTH_URL, {"username": "Čeněk", "password": self.password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_with_uppercase_diacritics_succeeds(self) -> None:
        response = self.client.post(AUTH_URL, {"username": "ČENĚK", "password": self.password})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BasicAuthDisabledTest(TestCase):
    """
    Basic auth API nepřijímá.

    Prohlížeč si basic auth pamatuje a posílá ji sám, i s formulářem odeslaným z cizí
    stránky, a DRF u ní CSRF nekontroluje. Navíc každý požadavek s ní hashuje heslo dřív,
    než by ho mohl zastavit throttling. Testy drží, že se nevrátí tiše.
    """

    def setUp(self) -> None:
        get_user_model().objects.create_user(username="ucitel-basic", password="test-password")
        token = base64.b64encode(b"ucitel-basic:test-password").decode()
        self.basic_header = {"authorization": f"Basic {token}"}

    def test_valid_basic_credentials_are_rejected(self) -> None:
        response = self.client.get(CLIENTS_URL, headers=self.basic_header)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_challenge_does_not_ask_browser_for_basic_credentials(self) -> None:
        # `WWW-Authenticate: Basic` by prohlizeci nabidl nativni dialog a ulozeni udaju
        response = self.client.get(CLIENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(response["WWW-Authenticate"].startswith("Bearer"))

    def test_cross_site_form_post_with_basic_credentials_creates_nothing(self) -> None:
        csrf_client = Client(enforce_csrf_checks=True)
        response = csrf_client.post(
            CLIENTS_URL,
            "firstname=x&surname=y&phone=&email=&note=csrf&active=true",
            content_type="application/x-www-form-urlencoded",
            headers={**self.basic_header, "origin": "https://evil.example"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(ClientModel.objects.filter(note="csrf").exists())


class TokenRevocationTest(TestCase):
    """
    Odebraný přístup ruší i už vydané tokeny.

    Bez načtení uživatele při každém požadavku (`JWTAuthentication`), `CHECK_REVOKE_TOKEN`
    a kontroly uživatele při refreshi (api/tokens.py) by token smazaného, deaktivovaného
    nebo přeheslovaného uživatele dál fungoval a obnovoval se až do konce
    `SLIDING_TOKEN_REFRESH_LIFETIME`.
    """

    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="odchazejici-ucitel", password="test-password"
        )
        response = self.client.post(
            AUTH_URL, {"username": "odchazejici-ucitel", "password": "test-password"}
        )
        self.token = response.json()["token"]

    def _get_clients(self) -> HttpResponse:
        return self.client.get(CLIENTS_URL, headers={"authorization": f"Bearer {self.token}"})

    def _refresh(self) -> HttpResponse:
        return self.client.post(REFRESH_URL, {"token": self.token})

    def _assert_revoked(self) -> None:
        self.assertEqual(self._get_clients().status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self._refresh().status_code, status.HTTP_401_UNAUTHORIZED)

    def test_valid_token_works_and_refreshes(self) -> None:
        # kontrola: bez odebrani pristupu token funguje, jinak by testy nize nic nedokazaly
        self.assertEqual(self._get_clients().status_code, status.HTTP_200_OK)
        self.assertEqual(self._refresh().status_code, status.HTTP_200_OK)

    def test_deactivated_user(self) -> None:
        self.user.is_active = False
        self.user.save()
        self._assert_revoked()

    def test_password_change(self) -> None:
        self.user.set_password("nove-heslo")
        self.user.save()
        self._assert_revoked()

    def test_deleted_user(self) -> None:
        self.user.delete()
        self._assert_revoked()


class LoginThrottleTest(TestCase):
    """
    Přihlášení má limit pokusů na IP adresu a odmítnutý pokus už heslo nehashuje.

    V testech je limit vypnutý (`DEFAULT_THROTTLE_RATES` v up/settings/base.py), tady se
    zapíná přímo na throttle třídě - DRF si sazby čte jednou při importu.
    """

    def setUp(self) -> None:
        cache.clear()
        get_user_model().objects.create_user(username="ucitel-limit", password="test-password")
        patcher = mock.patch.object(
            ClientIpScopedRateThrottle, "THROTTLE_RATES", {"jwt-auth": "2/min"}
        )
        patcher.start()
        self.addCleanup(patcher.stop)
        self.addCleanup(cache.clear)

    def _login(self, ip: str) -> HttpResponse:
        return self.client.post(
            AUTH_URL,
            {"username": "ucitel-limit", "password": "spatne-heslo"},
            headers={"fly-client-ip": ip},
        )

    def test_attempts_over_limit_are_rejected_before_password_check(self) -> None:
        with mock.patch(
            "rest_framework_simplejwt.serializers.authenticate", wraps=authenticate
        ) as spy:
            self.assertEqual(self._login("192.0.2.1").status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertEqual(self._login("192.0.2.1").status_code, status.HTTP_401_UNAUTHORIZED)
            self.assertEqual(
                self._login("192.0.2.1").status_code, status.HTTP_429_TOO_MANY_REQUESTS
            )
        self.assertEqual(spy.call_count, 2)

    @mock.patch.dict(os.environ, {"FLY_APP_NAME": "uspesnyprvnacek-test"})
    def test_limit_is_per_client_ip_on_fly(self) -> None:
        self._login("192.0.2.1")
        self._login("192.0.2.1")
        self.assertEqual(self._login("192.0.2.2").status_code, status.HTTP_401_UNAUTHORIZED)

    def test_client_sent_fly_header_is_ignored_off_fly(self) -> None:
        # mimo Fly hlavicku nikdo neprepisuje - vlastni hodnotou by si utocnik pri kazdem
        # pokusu zalozil nove pocitadlo
        with mock.patch.dict(os.environ):
            os.environ.pop("FLY_APP_NAME", None)
            self._login("192.0.2.1")
            self._login("192.0.2.2")
            self.assertEqual(
                self._login("192.0.2.3").status_code, status.HTTP_429_TOO_MANY_REQUESTS
            )
