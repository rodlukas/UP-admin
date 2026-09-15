"""
Vlastní autentizační backendy.
"""

from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.http import HttpRequest
from django.views.decorators.debug import sensitive_variables


class CaseInsensitiveModelBackend(ModelBackend):
    """
    Přihlášení bez ohledu na velikost písmen v username.

    Mobilní klávesnice (typicky Android) umí kapitalizovat první písmeno
    username i přes `autocapitalize="none"` na inputu (viz
    frontend/src/pages/Login.tsx) - HTML atribut je jen hint, který
    některé klávesnice/prohlížeče ignorují. Case-insensitive porovnání
    na backendu je proto jediné spolehlivé místo, kde se to dá ošetřit.
    """

    # `ModelBackend.authenticate` je timhle dekorovana taky - prepsanim metody bychom o to
    # prisli a heslo v plaintextu by se objevilo v promennych ramce Django error reportu
    # (technicka 500 stranka pri DEBUG, mail na ADMINS, cokoliv nad `ExceptionReporter`).
    # Sentry to sice scrubuje sam, ale Django reporting ne - overeno porovnanim vystupu
    # `ExceptionReporter.get_traceback_html()` s timhle dekoratorem a bez nej.
    @sensitive_variables("password")
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
            # stejny ucel jako `check_password_with_timing_attack_mitigation()`, kterou vola
            # ModelBackend - zahasovat heslo i kdyz uzivatel neexistuje, aby se podle doby
            # odpovedi nedal rozlisit neexistujici uzivatel od spatneho hesla
            user_model().set_password(password)
            return None
        except user_model.MultipleObjectsReturned:
            # Unique index na username je case-sensitive, takze "ucitel" a "Ucitel" muzou
            # v DB existovat vedle sebe (createsuperuser ani admin tomu nebrani,
            # normalize_username dela jen NFKC, ne case folding). Case-insensitive vetev
            # pak nema jak rozhodnout, ktereho z nich uzivatel mysli - bez tohohle by
            # neodchycene MultipleObjectsReturned shodilo prihlaseni na 500, a to OBEMA,
            # i pri presne napsanem jmene. Fallback je proto chovani puvodniho
            # ModelBackend: presna shoda.
            try:
                user = user_model._default_manager.get(**{user_model.USERNAME_FIELD: username})
            except user_model.DoesNotExist:
                user_model().set_password(password)
                return None
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
