from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status

AUTH_URL = "/api/v1/jwt-auth/"


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
