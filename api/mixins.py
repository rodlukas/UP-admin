from rest_framework.response import Response
from rest_framework import status


class ProtectedErrorMixin:
    """
    zobrazeni chyby, ze nelze kvuli FK zavislosti smazat danou instanci
    """
    @staticmethod
    def get_result(message):
        return Response(status=status.HTTP_403_FORBIDDEN, data={'detail': message})
