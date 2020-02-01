"""
Mixins použité pro sdílení funkcionality napříč třídami (views).
"""
from rest_framework import status
from rest_framework.response import Response


class ProtectedErrorMixin:
    """
    Mixin pro zobrazení chyby, že nelze kvůli FK závislosti smazat danou instanci.
    """

    @staticmethod
    def get_result(message: str) -> Response:
        """
        Vrátí chybovou hlášku s popisem chyby vzniklé při neúspěšnému pokusu o smazání instance kvůli FK závislosti.
        """
        return Response(status=status.HTTP_403_FORBIDDEN, data={"detail": message})
