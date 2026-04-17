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
    Filtr klienta ve výchozím stavu vrátí jen individuální lekce (group__isnull=True).
    Parametr includeGroup=true přidá i skupinové lekce klienta (group__isnull=False).
    """

    date = filters.DateFilter(field_name="start__date")
    client = filters.NumberFilter(field_name="attendances__client", method="filter_client")
    includeGroup = filters.BooleanFilter(method="filter_include_group")

    def filter_client(self, queryset: QuerySet, name: str, value: int) -> QuerySet:
        # parametr includeGroup se zpracovava spolecne s filtrem client
        include_group = self.form.cleaned_data.get("includeGroup")
        q = queryset.filter(**{name: value})
        if not include_group:
            q = q.filter(group__isnull=True)
        return q

    def filter_include_group(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        # samostatny includeGroup (bez client) nema efekt; zpracovani probiha ve filter_client
        return queryset

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
