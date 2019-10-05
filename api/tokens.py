from rest_framework_simplejwt.serializers import TokenObtainSlidingSerializer
from rest_framework_simplejwt.views import TokenObtainSlidingView


class MyTokenObtainSlidingSerializer(TokenObtainSlidingSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # pridani vlastnich claims k tokenu
        token["username"] = user.username
        token["email"] = user.email

        return token


class MyTokenObtainSlidingView(TokenObtainSlidingView):
    serializer_class = MyTokenObtainSlidingSerializer
