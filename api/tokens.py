"""
Vlastní definice způsobu serializace JWT tokenů.
"""

from rest_framework_simplejwt.serializers import TokenObtainSlidingSerializer
from rest_framework_simplejwt.models import TokenUser
from rest_framework_simplejwt.tokens import SlidingToken
from rest_framework_simplejwt.views import TokenObtainSlidingView


class MyTokenObtainSlidingSerializer(TokenObtainSlidingSerializer):
    """
    Vlastní serializace JWT tokenu - přidání vlastních claims k tokenu.

    Vychází z: https://django-rest-framework-simplejwt.readthedocs.io/en/latest/customizing_token_claims.html
    """

    @classmethod
    def get_token(cls, user: TokenUser) -> SlidingToken:
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
