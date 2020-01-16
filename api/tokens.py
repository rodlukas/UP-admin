"""
Vlastní definice způsobu serializace JWT tokenů.
"""
from rest_framework_simplejwt.serializers import TokenObtainSlidingSerializer
from rest_framework_simplejwt.state import User
from rest_framework_simplejwt.tokens import SlidingToken
from rest_framework_simplejwt.views import TokenObtainSlidingView


class MyTokenObtainSlidingSerializer(TokenObtainSlidingSerializer):
    """
    Vlastní serializace JWT tokenu - přidání vlastních claims k tokenu.

    Vychází z: https://github.com/davesque/django-rest-framework-simplejwt#customizing-token-claims
    """

    @classmethod
    def get_token(cls, user: User) -> SlidingToken:
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
