"""
Views - na základě requestu vrátí příslušnou response.
"""

from typing import Any

from django.db.models import Count, F, Prefetch, Q, QuerySet, Sum
from django.db.models.functions import ExtractMonth
from django.db.models.deletion import ProtectedError
from django.utils import timezone
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
            Prefetch(
                "attendances",
                queryset=Attendance.objects.select_related("client", "attendancestate"),
            ),
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
    def get(self, request: Request) -> Response:
        return Bank().get_transactions()


def _all_excused_grp(base: "QuerySet") -> "QuerySet":
    """
    Skupinové lekce kde všichni účastníci mají omluveno (fakticky neproběhly).
    """
    return (
        base.filter(group__isnull=False)
        .annotate(
            total_att=Count("attendances"),
            excused_att=Count("attendances", filter=Q(attendances__attendancestate__excused=True)),
        )
        .filter(total_att__gt=0, total_att=F("excused_att"))
    )


def _rate(num: int, den: int) -> float:
    """
    Míra v procentech (1 desetinné místo); 0.0 pokud je jmenovatel nulový.
    """
    return round(num / den * 100, 1) if den else 0.0


class StatisticsView(APIView):
    """
    View pro získání statistik aplikace.

    Query parametry:
      year  – konkrétní rok (např. "2024"), výchozí = všechny roky;
              při zadání roku se vynechávají rozklady ``by_year`` a ``by_year_course``.

    Agregace proběhlých lekcí (počty „proběhlé“, ind./skup., odučené minuty) vycházejí z
    nezrušených lekcí (``canceled=False``) a vylučují skupinové lekce, kde mají všichni
    účastníci omluveno (fakticky neproběhly). Počty zrušení a míra zrušení počítají ze
    všech proběhlých lekcí v rozsahu filtru (včetně ``canceled=True``).
    """

    @extend_schema(
        summary="Statistiky aplikace",
        description=(
            "Vrátí souhrnné statistiky: počty klientů a skupin (celkem/aktivní/neaktivní) "
            "a počty proběhlých nezrušených lekcí (celkem/individuální/skupinové/odučené minuty) "
            "včetně rozkladu po letech, po měsících (sezónnost), žebříčků klientů a skupin "
            "s nejvíce proběhlými lekcemi a seznamu dostupných roků. Filtr: `year` (konkrétní rok)."
        ),
        tags=["Statistiky"],
        responses={200: OpenApiResponse(description="Statistiky aplikace.")},
    )
    def get(self, request: Request) -> Response:
        now = timezone.now()

        # --- Klienti ---
        total_clients = Client.objects.count()
        active_clients = Client.objects.filter(active=True).count()
        # Klienti bez jediné účasti na jakékoli lekci (globální stav, bez filtrů)
        clients_without_lectures = Client.objects.filter(attendances__isnull=True).count()

        # --- Skupiny ---
        total_groups = Group.objects.count()
        active_groups = Group.objects.filter(active=True).count()

        # --- Dostupné roky (ze všech proběhlých lekcí, nezávisle na filtru year) ---
        available_years = list(
            Lecture.objects.filter(start__isnull=False, start__lte=now)
            .values_list("start__year", flat=True)
            .distinct()
            .order_by("-start__year")
        )

        # --- Year filtr ---
        year_param = request.query_params.get("year")
        selected_year: int | None = None
        if year_param:
            try:
                selected_year = int(year_param)
            except (ValueError, TypeError):
                pass

        # --- Základní querysets ---
        # Všechny proběhlé lekce (i zrušené)
        all_qs = Lecture.objects.filter(start__isnull=False, start__lte=now)
        # Nezrušené proběhlé lekce – všechny roky (pro by_year rozklad)
        base_all_qs = all_qs.filter(canceled=False)
        # S filtrem roku
        year_all_qs = all_qs.filter(start__year=selected_year) if selected_year else all_qs
        base_qs = base_all_qs.filter(start__year=selected_year) if selected_year else base_all_qs

        # --- Zrušené lekce ---
        total_in_scope = year_all_qs.count()
        canceled_count = year_all_qs.filter(canceled=True).count()
        canceled_rate = _rate(canceled_count, total_in_scope)

        # --- Individuální omluvené lekce ---
        # V systému jsou vždy canceled=True (omluva individuální lekce = lekce se zruší).
        # excused_individual_count je tedy podmnožina canceled_count – nepřičítá se k not_happened znovu.
        ind_att_global = Attendance.objects.filter(
            lecture__start__isnull=False,
            lecture__start__lte=now,
            lecture__group__isnull=True,
            attendancestate__excused=True,
        )
        year_ind_att = (
            ind_att_global.filter(lecture__start__year=selected_year)
            if selected_year
            else ind_att_global
        )
        excused_individual_count = year_ind_att.count()

        # --- Skupinové lekce kde všichni účastníci omluveni ---
        # Tyto lekce fakticky neproběhly (nikdo nepřišel), přestože canceled=False.
        all_excused_grp_qs = _all_excused_grp(base_qs)
        all_excused_grp_count = all_excused_grp_qs.count()

        # Omluvené neproběhlé: individuální omluvené (⊆ canceled_count) + skupinové kde všichni omluveni.
        excused_not_happened_count = excused_individual_count + all_excused_grp_count
        # Neproběhlé celkem: zrušené + skupinové kde všichni omluveni.
        # Individuální omluvené jsou již zahrnuty v canceled_count (canceled=True), nepřičítají se znovu.
        not_happened_count = canceled_count + all_excused_grp_count

        # --- Efektivní queryset: proběhlé lekce ---
        # Vylučuje: zrušené (canceled=True, zahrnuje individuální omluvené) + skupinové kde všichni omluveni.
        effective_qs = base_qs.exclude(pk__in=all_excused_grp_qs.values("pk"))
        # Verze bez year filtru pro by_year rozklad
        all_excused_grp_all_years_qs = _all_excused_grp(base_all_qs)
        effective_all_qs = base_all_qs.exclude(pk__in=all_excused_grp_all_years_qs.values("pk"))

        # --- Agregace proběhlých lekcí ---
        agg = effective_qs.aggregate(
            total=Count("id"),
            individual=Count("id", filter=Q(group__isnull=True)),
            group=Count("id", filter=Q(group__isnull=False)),
            total_minutes=Sum("duration"),
        )

        # --- Doplňkové per-course statistiky ---
        canceled_by_course = {
            r["course__id"]: r
            for r in year_all_qs.values("course__id").annotate(
                total_all=Count("id"), total_canceled=Count("id", filter=Q(canceled=True))
            )
        }
        excused_individual_by_course = {
            r["lecture__course_id"]: r["cnt"]
            for r in year_ind_att.values("lecture__course_id").annotate(cnt=Count("id"))
        }
        all_excused_grp_by_course = {
            r["course_id"]: r["cnt"]
            for r in all_excused_grp_qs.values("course_id").annotate(cnt=Count("id"))
        }
        # --- Rozklad po kurzech (vždy, reaguje na filtr roku) ---
        by_course_qs = (
            effective_qs.values("course__id", "course__name", "course__color")
            .annotate(
                total=Count("id"),
                individual=Count("id", filter=Q(group__isnull=True)),
                group=Count("id", filter=Q(group__isnull=False)),
                total_minutes=Sum("duration"),
            )
            .order_by("-total")
        )
        by_course = [
            {
                "course_id": row["course__id"],
                "course_name": row["course__name"],
                "course_color": row["course__color"],
                "total": row["total"],
                "individual": row["individual"],
                "group": row["group"],
                "total_minutes": row["total_minutes"] or 0,
                "canceled_count": canceled_by_course.get(row["course__id"], {}).get(
                    "total_canceled", 0
                ),
                "canceled_rate": _rate(
                    canceled_by_course.get(row["course__id"], {}).get("total_canceled", 0),
                    canceled_by_course.get(row["course__id"], {}).get("total_all", 0),
                ),
                "excused_not_happened_count": excused_individual_by_course.get(row["course__id"], 0)
                + all_excused_grp_by_course.get(row["course__id"], 0),
            }
            for row in by_course_qs
            if row["total"] > 0
        ]

        # --- Žebříčky: nejvíce proběhlých lekcí (stejný rozsah jako effective_qs) ---
        _leaderboard_n = 10
        top_clients_raw = (
            Attendance.objects.filter(
                lecture__in=effective_qs,
                attendancestate__excused=False,
            )
            .values("client_id", "client__firstname", "client__surname")
            .annotate(lecture_count=Count("lecture", distinct=True))
            .order_by("-lecture_count", "client__surname", "client__firstname")[:_leaderboard_n]
        )
        top_clients = [
            {
                "id": row["client_id"],
                "firstname": row["client__firstname"],
                "surname": row["client__surname"],
                "lecture_count": row["lecture_count"],
            }
            for row in top_clients_raw
        ]
        top_groups_raw = (
            effective_qs.filter(group__isnull=False)
            .values("group_id", "group__name")
            .annotate(lecture_count=Count("id"))
            .order_by("-lecture_count", "group__name")[:_leaderboard_n]
        )
        top_groups = [
            {
                "id": row["group_id"],
                "name": row["group__name"],
                "lecture_count": row["lecture_count"],
            }
            for row in top_groups_raw
        ]

        # --- Rozklad po měsících (1–12): v roce = jen daný rok; Celkem = součty napříč všemi lety (sezónnost) ---
        _by_month_qs_base = effective_qs if selected_year else effective_all_qs
        _by_month_agg = (
            _by_month_qs_base.annotate(_month=ExtractMonth("start"))
            .values("_month")
            .annotate(total=Count("id"), total_minutes=Sum("duration"))
            .order_by("_month")
        )
        _by_month_stats = {
            row["_month"]: {"total": row["total"], "total_minutes": row["total_minutes"] or 0}
            for row in _by_month_agg
        }
        by_month = [
            {
                "month": m,
                "total": _by_month_stats.get(m, {}).get("total", 0),
                "total_minutes": _by_month_stats.get(m, {}).get("total_minutes", 0),
            }
            for m in range(1, 13)
        ]

        # --- Rozklad po letech (jen při pohledu na všechny roky) ---
        by_year = None
        if selected_year is None:
            canceled_by_year = {
                r["start__year"]: r
                for r in all_qs.values("start__year").annotate(
                    total_all=Count("id"), total_canceled=Count("id", filter=Q(canceled=True))
                )
            }
            excused_individual_by_year = {
                r["lecture__start__year"]: r["cnt"]
                for r in ind_att_global.values("lecture__start__year").annotate(cnt=Count("id"))
            }
            all_excused_grp_by_year = {
                r["start__year"]: r["cnt"]
                for r in all_excused_grp_all_years_qs.values("start__year").annotate(
                    cnt=Count("id")
                )
            }
            by_year_qs = (
                effective_all_qs.values("start__year")
                .annotate(
                    total=Count("id"),
                    individual=Count("id", filter=Q(group__isnull=True)),
                    group=Count("id", filter=Q(group__isnull=False)),
                    total_minutes=Sum("duration"),
                )
                .order_by("-start__year")
            )
            by_year = [
                {
                    "year": row["start__year"],
                    "total": row["total"],
                    "individual": row["individual"],
                    "group": row["group"],
                    "total_minutes": row["total_minutes"] or 0,
                    "canceled_count": canceled_by_year.get(row["start__year"], {}).get(
                        "total_canceled", 0
                    ),
                    "canceled_rate": _rate(
                        canceled_by_year.get(row["start__year"], {}).get("total_canceled", 0),
                        canceled_by_year.get(row["start__year"], {}).get("total_all", 0),
                    ),
                    "excused_not_happened_count": excused_individual_by_year.get(
                        row["start__year"], 0
                    )
                    + all_excused_grp_by_year.get(row["start__year"], 0),
                }
                for row in by_year_qs
            ]

            # --- Vývoj rozložení kurzů po letech ---
            by_year_course_qs = (
                effective_all_qs.values(
                    "start__year", "course__id", "course__name", "course__color"
                )
                .annotate(total=Count("id"))
                .order_by("start__year", "course__name")
            )
            by_year_course = [
                {
                    "year": row["start__year"],
                    "course_id": row["course__id"],
                    "course_name": row["course__name"],
                    "course_color": row["course__color"],
                    "total": row["total"],
                }
                for row in by_year_course_qs
            ]

        return Response(
            {
                "clients": {
                    "total": total_clients,
                    "active": active_clients,
                    "inactive": total_clients - active_clients,
                    "without_lectures": clients_without_lectures,
                },
                "groups": {
                    "total": total_groups,
                    "active": active_groups,
                    "inactive": total_groups - active_groups,
                },
                "lectures": {
                    "not_happened_count": not_happened_count,
                    "canceled_count": canceled_count,
                    "canceled_rate": canceled_rate,
                    "excused_not_happened_count": excused_not_happened_count,
                    "total": agg["total"],
                    "individual": agg["individual"],
                    "group": agg["group"],
                    "total_minutes": agg["total_minutes"] or 0,
                    "available_years": available_years,
                    "by_year": by_year,
                    "by_year_course": by_year_course if selected_year is None else None,
                    "by_course": by_course,
                    "top_clients": top_clients,
                    "top_groups": top_groups,
                    "by_month": by_month,
                },
            }
        )
