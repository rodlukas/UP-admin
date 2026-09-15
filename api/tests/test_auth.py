from django.contrib.auth import authenticate, get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

AUTH_URL = reverse("token_obtain")


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
    může a case-insensitive větev backendu pak nemá jak rozhodnout, kterého uživatele
    volající myslí. Nesmí to skončit `MultipleObjectsReturned`, tedy HTTP 500 - viz
    fallback na přesnou shodu v api/auth_backends.py.
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
    Neaktivní uživatel se nesmí přihlásit ani přes case-insensitive větev.

    Vlastní backend přepisuje `authenticate()` celé, takže kontrola `is_active`
    (`user_can_authenticate`) v něm drží jen tím, že je ručně opsaná - bez tohohle testu
    by se dala vypustit, aniž by to cokoliv v suitě poznalo.
    """

    def setUp(self) -> None:
        get_user_model().objects.create_user(
            username="neaktivni-ucitel", password="test-password", is_active=False
        )

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

    def test_backend_itself_rejects_inactive_user(self) -> None:
        # primo pres authenticate(), ne jen pres view - simplejwt ma vlastni
        # USER_AUTHENTICATION_RULE, takze samotna 401 vyse by neaktivitu potvrdila
        # i v pripade, ze by ji backend pustil dal
        self.assertIsNone(authenticate(username="Neaktivni-Ucitel", password="test-password"))


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
