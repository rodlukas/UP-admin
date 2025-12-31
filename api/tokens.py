"""
Vlastní definice způsobu serializace JWT tokenů.
"""

from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.serializers import TokenObtainSlidingSerializer
from rest_framework_simplejwt.models import TokenUser
from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.views import TokenObtainSlidingView, TokenRefreshSlidingView


class MyTokenObtainSlidingSerializer(TokenObtainSlidingSerializer):
    """
    Vlastní serializace JWT tokenu - přidání vlastních claims k tokenu.

    Vychází z: https://django-rest-framework-simplejwt.readthedocs.io/en/latest/customizing_token_claims.html
    """

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

    @extend_schema(
        summary="Získání JWT tokenu",
        description="Získá JWT token pro autentizaci. Vyžaduje username a password.",
        tags=["Autentizace"],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MyTokenRefreshSlidingView(TokenRefreshSlidingView):
    """
    View zařizující refresh JWT tokenu.
    """

    @extend_schema(
        summary="Obnovení JWT tokenu",
        description="Obnoví JWT token pomocí stávajícího tokenu.",
        tags=["Autentizace"],
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
