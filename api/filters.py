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

    client = filters.NumberFilter()
    onlyPast = filters.BooleanFilter()

    def filter_queryset(self, queryset: QuerySet) -> QuerySet:
        client_id = self.form.cleaned_data.get("client")
        only_past = self.form.cleaned_data.get("onlyPast")
        active = self.form.cleaned_data.get("active")

        if client_id is not None:
            if only_past:
                queryset = (
                    queryset
                    .filter(lectures__attendances__client=client_id)
                    .exclude(memberships__client__pk=client_id)
                    .distinct()
                )
            else:
                queryset = queryset.filter(memberships__client__pk=client_id)

        if active is not None:
            queryset = queryset.filter(active=active)

        return queryset

    class Meta:
        model = Group
        fields = "client", "onlyPast", "active"
