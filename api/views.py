from rest_framework import viewsets, mixins
from .serializers import *
from admin.models import *
from datetime import datetime
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.order_by('surname', 'name')
    serializer_class = ClientSerializer


class AttendanceViewSet(mixins.UpdateModelMixin,
                        viewsets.GenericViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet):
    queryset = AttendanceState.objects.order_by('name')
    serializer_class = AttendanceStateSerializer


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = Group.objects.order_by('name')
        id_client = self.request.query_params.get('client', None)
        if id_client is not None:
            queryset = queryset.filter(memberships__client=id_client)
        return queryset


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.order_by('name')
    serializer_class = CourseSerializer


class LectureViewSet(viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    filter_backends = OrderingFilter, DjangoFilterBackend,
    ordering_fields = 'start',
    filter_fields = 'group',

    def get_queryset(self):
        queryset = Lecture.objects.order_by('-start')
        date = self.request.query_params.get('date', None)
        client_id = self.request.query_params.get('client', None)
        if date is not None:
            date = datetime.date(datetime.strptime(date, "%Y-%m-%d"))
            queryset = queryset.filter(start__contains=date, canceled=False)
        elif client_id is not None:
            queryset = queryset.filter(attendances__client=client_id, group__isnull=True)
        return queryset
