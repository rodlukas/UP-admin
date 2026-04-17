"""
Filtry pro pokročilé filtrování ve views.
"""

from django.db.models.query import QuerySet
from django_filters import rest_framework as filters

from admin.models import Lecture, Group


class LectureFilter(filters.FilterSet):
    """
    Filtr lekcí podle startu (date), skupiny (group) a klienta (client).
    Filtr skupiny je základní.
    Filtr startu a klienta umožňuje filtrovat jednodušším URL parametrem, než konkrétní cestou k related_field (xx_yy).
    Filtr klienta navíc odstraní z výsledku skupinové lekce.
    """

    date = filters.DateFilter(field_name="start__date")
    client = filters.NumberFilter(field_name="attendances__client", method="filter_client")

    def filter_client(self, queryset: QuerySet, name: str, value: int) -> QuerySet:
        """
        Filtr podle klienta, kde name je aktuální filtrované pole (klient),
        value je jeho hodnota (ID klienta).
        """
        # aby bylo mozne rozsirit filtr na group__isnull, sami si praci s filtrem nad querysetem obstarame
        return queryset.filter(**{name: value}, group__isnull=True)

    class Meta:
        model = Lecture
        fields = "date", "group"


class GroupFilter(filters.FilterSet):
    """
    Filtr skupin podle klienta (client) a aktivity skupiny (active).
    Filtr aktivity je základní.
    Filtr klienta umožňuje filtrovat jednodušším URL parametrem, než konkrétní cestou k related_field (xx_yy).
    Parametr onlyPast=true vrátí jen skupiny, které klient opustil (má tam účast na lekci, ale již není členem).
    """

    client = filters.NumberFilter(method="filter_client")
    onlyPast = filters.BooleanFilter(method="filter_only_past")

    def filter_client(self, queryset: QuerySet, name: str, value: int) -> QuerySet:
        # parametr onlyPast se zpracovává společně s filtrem client
        only_past = self.form.cleaned_data.get("onlyPast")
        if only_past:
            return (
                queryset.filter(lectures__attendances__client=value)
                .exclude(memberships__client__pk=value)
                .distinct()
            )
        return queryset.filter(memberships__client__pk=value)

    def filter_only_past(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        # samostatny onlyPast (bez client) nema efekt; filtrovani probiha ve filter_client
        return queryset

    class Meta:
        model = Group
        fields = "client", "onlyPast", "active"
