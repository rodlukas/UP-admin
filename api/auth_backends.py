"""
Vlastní autentizační backendy.
"""

from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.http import HttpRequest


class CaseInsensitiveModelBackend(ModelBackend):
    """
    Přihlášení bez ohledu na velikost písmen v username.

    Mobilní klávesnice (typicky Android) umí kapitalizovat první písmeno
    username i přes `autocapitalize="none"` na inputu (viz
    frontend/src/pages/Login.tsx) - HTML atribut je jen hint, který
    některé klávesnice/prohlížeče ignorují. Case-insensitive porovnání
    na backendu je proto jediné spolehlivé místo, kde se to dá ošetřit.
    """

    def authenticate(
        self,
        request: HttpRequest | None,
        username: str | None = None,
        password: str | None = None,
        **kwargs: Any,
    ) -> User | None:
        user_model = get_user_model()
        if username is None:
            username = kwargs.get(user_model.USERNAME_FIELD)
        if username is None or password is None:
            return None
        try:
            user = user_model._default_manager.get(
                **{f"{user_model.USERNAME_FIELD}__iexact": username}
            )
        except user_model.DoesNotExist:
            # stejny workaround jako v ModelBackend - zabranuje timing utoku
            # rozlisujicimu mezi neexistujicim uzivatelem a spatnym heslem
            user_model().set_password(password)
            return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
