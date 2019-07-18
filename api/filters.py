"""
Vlastni filtry pro API - umozni nam (krome zakladniho filtrovani):
1. filtrovat dle related poli, kde si ale urcime obvykle jednodussi URL parametr, nez konkretni cestu
 k related_field (xxx__yyy)
2. filtrovani provadet nad rucne vytvorenym querysetem
"""
from django_filters import rest_framework as filters

from admin.models import Lecture, Group


class LectureFilter(filters.FilterSet):
    date = filters.DateFilter(field_name="start__date")
    client = filters.NumberFilter(field_name="attendances__client", method="filter_client")

    def filter_client(self, queryset, name, value):
        # aby bylo mozne rozsirit filtr na group__isnull, sami si praci s filtrem nad querysetem obstarame
        # (name a value reprezentuji aktualni filtrovane pole a jeho hodnotu)
        return queryset.filter(**{name: value}, group__isnull=True)

    class Meta:
        model = Lecture
        fields = 'date', 'group',


class GroupFilter(filters.FilterSet):
    client = filters.NumberFilter(field_name="memberships__client__pk")

    class Meta:
        model = Group
        fields = 'client', 'active'
