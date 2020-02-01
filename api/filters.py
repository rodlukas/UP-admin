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
    """

    client = filters.NumberFilter(field_name="memberships__client__pk")

    class Meta:
        model = Group
        fields = "client", "active"
