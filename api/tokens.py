"""
Vlastní definice způsobu serializace JWT tokenů.
"""

from typing import Any

from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.models import TokenUser
from rest_framework_simplejwt.serializers import (
    TokenObtainSlidingSerializer,
    TokenRefreshSlidingSerializer,
)
from rest_framework_simplejwt.tokens import SlidingToken, Token
from rest_framework_simplejwt.views import TokenObtainSlidingView, TokenRefreshSlidingView

from api.throttles import ClientIpScopedRateThrottle


class MyTokenObtainSlidingSerializer(TokenObtainSlidingSerializer):
    """
    Vlastní serializace JWT tokenu - přidání vlastních claims k tokenu.

    Vychází z: https://django-rest-framework-simplejwt.readthedocs.io/en/latest/customizing_token_claims.html
    """

    def validate(self, attrs: dict[str, Any]) -> dict[str, str]:
        """
        Dosadí za napsané username to, které je v DB, bez ohledu na velikost písmen.

        Mobilní klávesnice (typicky Android) umí kapitalizovat první písmeno username
        i přes `autocapitalize="none"` na inputu (viz frontend/src/pages/Login.tsx) - HTML
        atribut je jen hint, který některé klávesnice a prohlížeče ignorují, takže srovnat
        to musí server.

        Tenhle endpoint je jediné místo, kde API ověřuje heslo (aplikace i Swagger se
        přihlašují JWT tokenem, viz `DEFAULT_AUTHENTICATION_CLASSES`), takže normalizace
        platí pro každé přihlášení.

        Cena je jeden dotaz navíc na každý pokus o přihlášení, včetně neúspěšných:
        `__iexact` se překládá na `UPPER("username") = UPPER(%s)`, na což index nesedí,
        a `authenticate()` si pak dělá vlastní `get_by_natural_key()`. Při počtu uživatelů
        tohohle nasazení (jednotky) je to bez dopadu.

        Normalizace patří sem, a ne do vlastního autentizačního backendu: `ModelBackend`
        má oddělenou synchronní a asynchronní větev a vlastní ošetření časovacího útoku,
        takže jeho podědění znamená držet krok s jeho vnitřní stavbou. Takhle se
        `authenticate()` volá beze změny a obojí zůstává na Djangu.

        Dvojice lišící se jen velikostí písmen ("ucitel"/"Ucitel") v DB vzniknout může -
        unique index na username je case-sensitive a `normalize_username` dělá jen NFKC,
        ne case folding. V takovém případě se napsaná hodnota nechá být a rozhodne přesná
        shoda ve `ModelBackend`; jinak by nebylo jak poznat, kterého z nich volající myslí.
        """
        username = attrs.get(self.username_field)
        if username:
            # `[:2]` staci: rozlisuje se jen "prave jedna shoda" od "vic nez jedna"
            matches = list(
                get_user_model()
                ._default_manager.filter(**{f"{self.username_field}__iexact": username})
                .values_list(self.username_field, flat=True)[:2]
            )
            if len(matches) == 1:
                attrs[self.username_field] = matches[0]
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user: TokenUser) -> Token:  # type: ignore[override]
        """
        Serializuje JWT token a přidá k němu vlastní claims o uživateli (username, email).
        """
        token = super().get_token(user)

        # pridani vlastnich claims k tokenu
        token["username"] = user.username
        token["email"] = user.email

        return token


class MyTokenObtainSlidingView(TokenObtainSlidingView):
    """
    View zařizující vlastní upravenou definici serializace JWT tokenu.
    """

    serializer_class = MyTokenObtainSlidingSerializer
    # overeni hesla je umyslne drahe (PBKDF2) a endpoint je verejny - throttle bezi pred
    # serializerem, takze odmitnuty pozadavek uz heslo nehashuje (limit viz
    # DEFAULT_THROTTLE_RATES)
    throttle_classes = [ClientIpScopedRateThrottle]
    throttle_scope = "jwt-auth"

    @extend_schema(
        summary="Získání JWT tokenu",
        description="Získá JWT token pro autentizaci. Vyžaduje username a password.",
        tags=["Autentizace"],
    )
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().post(request, *args, **kwargs)


class MyTokenRefreshSlidingSerializer(TokenRefreshSlidingSerializer):
    """
    Refresh sliding tokenu jen pro uživatele, kterému přístup pořád platí.

    Stock `TokenRefreshSlidingSerializer` ověří jen podpis a `refresh_exp` a token znovu
    podepíše - uživatele vůbec nenačte. Token smazaného, deaktivovaného nebo přeheslovaného
    uživatele by se tak dal obnovovat až do konce `SLIDING_TOKEN_REFRESH_LIFETIME`. Kontrolu
    proto dělá stejná `JWTAuthentication.get_user` jako u každého požadavku na API
    (existence, `is_active`, `CHECK_REVOKE_TOKEN`).
    """

    def validate(self, attrs: dict[str, Any]) -> dict[str, str]:
        JWTAuthentication().get_user(SlidingToken(attrs["token"]))
        return super().validate(attrs)


class MyTokenRefreshSlidingView(TokenRefreshSlidingView):
    """
    View zařizující refresh JWT tokenu.
    """

    serializer_class = MyTokenRefreshSlidingSerializer

    @extend_schema(
        summary="Obnovení JWT tokenu",
        description="Obnoví JWT token pomocí stávajícího tokenu.",
        tags=["Autentizace"],
    )
    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().post(request, *args, **kwargs)
