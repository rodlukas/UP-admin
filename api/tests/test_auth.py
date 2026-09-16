import base64

from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from api.tokens import MyTokenObtainSlidingSerializer

AUTH_URL = reverse("token_obtain")
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


class BasicAuthCaseSensitivityTest(TestCase):
    """
    Basic auth zůstává na PŘESNOU shodu.

    Normalizace username sedí v serializeru JWT endpointu (api/tokens.py), takže se týká jen
    přihlášení z aplikace. `BasicAuthentication` je první v `DEFAULT_AUTHENTICATION_CLASSES`,
    tedy pokrývá celé `/api/v1/`, a jde přes stock `ModelBackend`. Je to vědomý kompromis
    a tenhle test drží tu hranici, aby se neposunula tiše - třeba návratem globálního
    `AUTHENTICATION_BACKENDS`, po kterém by se case-insensitive chování rozlilo na celé API.
    """

    def setUp(self) -> None:
        get_user_model().objects.create_user(username="ucitel-basic", password="test-password")

    def _get_with_basic_auth(self, username: str) -> HttpResponse:
        token = base64.b64encode(f"{username}:test-password".encode()).decode()
        return self.client.get(CLIENTS_URL, headers={"authorization": f"Basic {token}"})

    def test_basic_auth_accepts_exact_username(self) -> None:
        response = self._get_with_basic_auth("ucitel-basic")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_basic_auth_rejects_different_case(self) -> None:
        response = self._get_with_basic_auth("Ucitel-Basic")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
