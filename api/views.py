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
    MembershipSerializer,
)
from .services import Bank


class ClientViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro klienty.

    list: Vrátí seznam všech klientů seřazených vzestupně dle příjmení a křestního jména.
    retrieve: Vrátí konkrétního klienta.
    update: Upraví konkrétního klienta.
    create: Vytvoří klienta.
    partial_update: Částečně upraví konkrétního klienta.
    destroy: Smaže konkrétního klienta.
    """

    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filterset_fields = ("active",)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result("Klienta lze smazat jen pokud nemá žádné lekce.")
        return result


class AttendanceViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    ViewSet pro účasti.

    update: Upraví konkrétní účast.
    partial_update: Částečně upraví konkrétní účast.
    """

    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class MembershipViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    ViewSet pro členství ve skupině.

    update: Upraví konkrétní členství.
    partial_update: Částečně upraví konkrétní členství.
    """

    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro stavy účasti.

    list: Vrátí seznam všech stavů účasti seřazených vzestupně dle názvu.
    retrieve: Vrátí konkrétní stav účasti.
    update: Upraví konkrétní stav účasti.
    create: Vytvoří stav účasti.
    partial_update: Částečně upraví konkrétní stav účasti.
    destroy: Smaže konkrétní stav účasti.
    """

    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result(
                "Stav účasti lze smazat jen pokud není použit u žádného klienta (jeho účasti)."
            )
        return result


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro skupiny.

    list:
        Vrátí seznam všech skupin seřazených vzestupně dle názvu včetně vnořených
        informací o kurzu a členství (a příslušných klientech).
    retrieve: Vrátí konkrétní skupinu.
    update: Upraví konkrétní skupinu.
    create: Vytvoří skupinu.
    partial_update: Částečně upraví konkrétní skupinu.
    destroy: Smaže konkrétní skupinu.
    """

    queryset = Group.objects.select_related("course").prefetch_related(
        Prefetch("memberships", queryset=Membership.objects.select_related("client"))
    )
    serializer_class = GroupSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = custom_filters.GroupFilter


class CourseViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    """
    ViewSet pro kurzy.

    list: Vrátí seznam všech kurzů seřazených vzestupně dle názvu.
    retrieve: Vrátí konkrétní kurz.
    update: Upraví konkrétní kurz.
    create: Vytvoří kurz.
    partial_update: Částečně upraví konkrétní kurz.
    destroy: Smaže konkrétní kurz.
    """

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = ("visible",)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result(
                "Kurz lze smazat jen pokud se nikde nepoužívá "
                "(neexistuje žádná lekce kurzu ani skupina patřící k danému kurzu)."
            )
        return result


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro zájemce o kurzy.

    list:
        Vrátí seznam všech žádostí seřazených vzestupně dle příjmení a křestního jména klienta
        včetně vnořených informací o kurzu a klientovi.
    retrieve: Vrátí konkrétní žádost o kurz.
    update: Upraví konkrétní žádost o kurz.
    create: Vytvoří žádost o kurz.
    partial_update: Částečně upraví konkrétní žádost o kurz.
    destroy: Smaže konkrétní žádost o kurz.
    """

    queryset = Application.objects.select_related("course", "client")
    serializer_class = ApplicationSerializer


class LectureViewSet(viewsets.ModelViewSet):
    """
    ViewSet pro lekce.

    list:
        Vrátí seznam všech lekcí seřazených sestupně dle startu lekce včetně vnořených informací o kurzu,
        účastech (a příslušných klientech), kurzu skupiny, členství ve skupině (a příslušných klientech).
    retrieve: Vrátí konkrétní lekci.
    update: Upraví konkrétní lekci.
    create: Vytvoří lekci.
    partial_update: Částečně upraví konkrétní lekci.
    destroy: Smaže konkrétní lekci.
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

    def get_serializer(self, *args: Any, **kwargs: Any) -> BaseSerializer:
        # pokud prislo pole, nastav serializer na many=True
        if isinstance(kwargs.get("data", {}), list):
            kwargs["many"] = True
        return super().get_serializer(*args, **kwargs)


class BankView(APIView):
    """
    View pro získání výpisu transakcí z bankovního účtu.
    """

    @method_decorator(cache_page(60))
    def get(self, request: Request) -> Response:
        """
        Vrátí výpis transakcí z bankovního účtu.
        """
        return Bank().get_transactions()
