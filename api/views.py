"""
Views - na základě requestu vrátí příslušnou response.
"""

from typing import Any

from django.db.models import Prefetch
from django.db.models.deletion import ProtectedError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import viewsets, mixins
from rest_framework.filters import OrderingFilter
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.views import APIView

from admin.models import (
    Application,
    Attendance,
    AttendanceState,
    Course,
    Client,
    Group,
    Lecture,
    Membership,
)
from . import filters as custom_filters
from .mixins import ProtectedErrorMixin
from .serializers import (
    ApplicationSerializer,
    AttendanceSerializer,
    AttendanceStateSerializer,
    CourseSerializer,
    ClientSerializer,
    GroupSerializer,
    LectureSerializer,
    MembershipPlainSerializer,
)
from .services import Bank


@extend_schema_view(
    list=extend_schema(tags=["Klienti"]),
    retrieve=extend_schema(tags=["Klienti"]),
    create=extend_schema(tags=["Klienti"]),
    update=extend_schema(tags=["Klienti"]),
    partial_update=extend_schema(tags=["Klienti"]),
    destroy=extend_schema(tags=["Klienti"]),
)
class ClientViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro klienty.
    """

    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filterset_fields = ("active",)

    @extend_schema(
        summary="Seznam klientů",
        description="Vrátí seznam všech klientů seřazených vzestupně dle příjmení a křestního jména.",
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail klienta", description="Vrátí konkrétního klienta.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření klienta", description="Vytvoří klienta.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava klienta", description="Upraví konkrétního klienta.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Částečná úprava klienta",
        description="Částečně upraví konkrétního klienta.",
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání klienta", description="Smaže konkrétního klienta.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result("Klienta lze smazat jen pokud nemá žádné lekce.")
        return result


@extend_schema_view(
    update=extend_schema(tags=["Účasti"]),
    partial_update=extend_schema(tags=["Účasti"]),
)
class AttendanceViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    ViewSet pro účasti.
    """

    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    @extend_schema(summary="Úprava účasti", description="Upraví konkrétní účast.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Částečná úprava účasti", description="Částečně upraví konkrétní účast.")
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)


@extend_schema_view(
    update=extend_schema(tags=["Členství ve skupině"]),
    partial_update=extend_schema(tags=["Členství ve skupině"]),
)
class MembershipViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    ViewSet pro členství ve skupině.
    """

    queryset = Membership.objects.all()
    serializer_class = MembershipPlainSerializer

    @extend_schema(summary="Úprava členství", description="Upraví konkrétní členství.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Částečná úprava členství", description="Částečně upraví konkrétní členství."
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)


@extend_schema_view(
    list=extend_schema(tags=["Stavy účasti"]),
    retrieve=extend_schema(tags=["Stavy účasti"]),
    create=extend_schema(tags=["Stavy účasti"]),
    update=extend_schema(tags=["Stavy účasti"]),
    partial_update=extend_schema(tags=["Stavy účasti"]),
    destroy=extend_schema(tags=["Stavy účasti"]),
)
class AttendanceStateViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro stavy účasti.
    """

    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer

    @extend_schema(
        summary="Seznam stavů účasti",
        description="Vrátí seznam všech stavů účasti seřazených vzestupně dle názvu.",
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail stavu účasti", description="Vrátí konkrétní stav účasti.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření stavu účasti", description="Vytvoří stav účasti.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava stavu účasti", description="Upraví konkrétní stav účasti.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Částečná úprava stavu účasti", description="Částečně upraví konkrétní stav účasti."
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání stavu účasti", description="Smaže konkrétní stav účasti.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result(
                "Stav účasti lze smazat jen pokud není použit u žádného klienta (jeho účasti)."
            )
        return result


@extend_schema_view(
    list=extend_schema(tags=["Skupiny"]),
    retrieve=extend_schema(tags=["Skupiny"]),
    create=extend_schema(tags=["Skupiny"]),
    update=extend_schema(tags=["Skupiny"]),
    partial_update=extend_schema(tags=["Skupiny"]),
    destroy=extend_schema(tags=["Skupiny"]),
)
class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro skupiny.
    """

    queryset = Group.objects.select_related("course").prefetch_related(
        Prefetch("memberships", queryset=Membership.objects.select_related("client"))
    )
    serializer_class = GroupSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = custom_filters.GroupFilter

    @extend_schema(
        summary="Seznam skupin",
        description=(
            "Vrátí seznam všech skupin seřazených vzestupně dle názvu včetně vnořených "
            "informací o kurzu a členství (a příslušných klientech)."
        ),
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail skupiny", description="Vrátí konkrétní skupinu.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření skupiny", description="Vytvoří skupinu.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava skupiny", description="Upraví konkrétní skupinu.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Částečná úprava skupiny", description="Částečně upraví konkrétní skupinu."
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání skupiny", description="Smaže konkrétní skupinu.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().destroy(request, *args, **kwargs)


@extend_schema_view(
    list=extend_schema(tags=["Kurzy"]),
    retrieve=extend_schema(tags=["Kurzy"]),
    create=extend_schema(tags=["Kurzy"]),
    update=extend_schema(tags=["Kurzy"]),
    partial_update=extend_schema(tags=["Kurzy"]),
    destroy=extend_schema(tags=["Kurzy"]),
)
class CourseViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro kurzy.
    """

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = ("visible",)

    @extend_schema(
        summary="Seznam kurzů",
        description="Vrátí seznam všech kurzů seřazených vzestupně dle názvu.",
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail kurzu", description="Vrátí konkrétní kurz.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření kurzu", description="Vytvoří kurz.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava kurzu", description="Upraví konkrétní kurz.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Částečná úprava kurzu", description="Částečně upraví konkrétní kurz.")
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání kurzu", description="Smaže konkrétní kurz.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result(
                "Kurz lze smazat jen pokud se nikde nepoužívá "
                "(neexistuje žádná lekce kurzu ani skupina patřící k danému kurzu)."
            )
        return result


@extend_schema_view(
    list=extend_schema(tags=["Zájemci o kurzy"]),
    retrieve=extend_schema(tags=["Zájemci o kurzy"]),
    create=extend_schema(tags=["Zájemci o kurzy"]),
    update=extend_schema(tags=["Zájemci o kurzy"]),
    partial_update=extend_schema(tags=["Zájemci o kurzy"]),
    destroy=extend_schema(tags=["Zájemci o kurzy"]),
)
class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro zájemce o kurzy.
    """

    queryset = Application.objects.select_related("course", "client")
    serializer_class = ApplicationSerializer

    @extend_schema(
        summary="Seznam žádostí o kurzy",
        description=(
            "Vrátí seznam všech žádostí seřazených vzestupně dle příjmení a křestního jména klienta "
            "včetně vnořených informací o kurzu a klientovi."
        ),
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail žádosti o kurz", description="Vrátí konkrétní žádost o kurz.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření žádosti o kurz", description="Vytvoří žádost o kurz.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava žádosti o kurz", description="Upraví konkrétní žádost o kurz.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Částečná úprava žádosti o kurz",
        description="Částečně upraví konkrétní žádost o kurz.",
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání žádosti o kurz", description="Smaže konkrétní žádost o kurz.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().destroy(request, *args, **kwargs)


@extend_schema_view(
    list=extend_schema(tags=["Lekce"]),
    retrieve=extend_schema(tags=["Lekce"]),
    create=extend_schema(tags=["Lekce"]),
    update=extend_schema(tags=["Lekce"]),
    partial_update=extend_schema(tags=["Lekce"]),
    destroy=extend_schema(tags=["Lekce"]),
)
class LectureViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro lekce.
    """

    queryset = (
        Lecture.objects.order_by("-start")
        .select_related("group__course", "course")
        .prefetch_related(
            Prefetch("attendances", queryset=Attendance.objects.select_related("client")),
            Prefetch("group__memberships", queryset=Membership.objects.select_related("client")),
        )
    )
    serializer_class = LectureSerializer
    filter_backends = OrderingFilter, DjangoFilterBackend
    filterset_class = custom_filters.LectureFilter
    ordering_fields = ("start",)

    @extend_schema(
        summary="Seznam lekcí",
        description=(
            "Vrátí seznam všech lekcí seřazených sestupně dle startu lekce včetně vnořených informací o kurzu, "
            "účastech (a příslušných klientech), kurzu skupiny, členství ve skupině (a příslušných klientech)."
        ),
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(summary="Detail lekce", description="Vrátí konkrétní lekci.")
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary="Vytvoření lekce", description="Vytvoří lekci.")
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(summary="Úprava lekce", description="Upraví konkrétní lekci.")
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(summary="Částečná úprava lekce", description="Částečně upraví konkrétní lekci.")
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary="Smazání lekce", description="Smaže konkrétní lekci.")
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().destroy(request, *args, **kwargs)

    def get_serializer(self, *args: Any, **kwargs: Any) -> BaseSerializer:
        # pokud prislo pole, nastav serializer na many=True
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True
        return super().get_serializer(*args, **kwargs)


class BankView(APIView):
    """
    View pro získání výpisu transakcí z bankovního účtu.
    """

    @extend_schema(
        summary="Výpis transakcí",
        description="Vrátí výpis transakcí z bankovního účtu.",
        tags=["Bankovní transakce"],
        responses={
            200: OpenApiResponse(description="Výpis transakcí z bankovního účtu."),
            500: OpenApiResponse(
                description="Chyba při získávání dat z banky. Obsahuje error_info s popisem chyby."
            ),
        },
    )
    @method_decorator(cache_page(60))
    def get(self, request: Request) -> Response:
        return Bank().get_transactions()
