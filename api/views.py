from rest_framework import viewsets, mixins
from .serializers import *
from admin.models import *
from datetime import datetime
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer


class AttendanceViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class MembershipViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet):
    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer

    def get_queryset(self):
        qs = Group.objects.all()    # qs znaci queryset
        id_client = self.request.query_params.get('client')
        if id_client is not None:
            qs = qs.filter(memberships__client=id_client)
        return qs


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = 'visible',


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer


class LectureViewSet(viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    filter_backends = OrderingFilter, DjangoFilterBackend,
    ordering_fields = 'start',
    filterset_fields = 'group',

    def get_queryset(self):
        qs = Lecture.objects.order_by('-start')  # qs znaci queryset
        date = self.request.query_params.get('date')
        client_id = self.request.query_params.get('client')
        if date is not None:
            date = datetime.date(datetime.strptime(date, "%Y-%m-%d"))
            qs = qs.filter(start__contains=date)
        elif client_id is not None:
            qs = qs.filter(attendances__client=client_id, group__isnull=True)
        return qs

    def get_serializer(self, *args, **kwargs):
        # pokud prislo pole, nastav serializer na many=True
        if isinstance(kwargs.get('data', {}), list):
            kwargs['many'] = True
        return super(LectureViewSet, self).get_serializer(*args, **kwargs)
