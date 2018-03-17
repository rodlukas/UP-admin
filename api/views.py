from rest_framework import viewsets
from .serializers import *
from admin.models import *
from datetime import datetime


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.order_by('surname', 'name')
    serializer_class = ClientSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet):
    queryset = AttendanceState.objects.order_by('name')
    serializer_class = AttendanceStateSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = Group.objects.order_by('name')
        id_client = self.request.query_params.get('client', None)
        if id_client is not None:
            queryset = queryset.filter(memberof__client=id_client)
        return queryset


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.order_by('name')
    serializer_class = CourseSerializer


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer

    def get_queryset(self):
        queryset = Lecture.objects.order_by('-start')
        date = self.request.query_params.get('date', None)
        client_id = self.request.query_params.get('client', None)
        group_id = self.request.query_params.get('group', None)
        if date is not None:
            date = datetime.date(datetime.strptime(date, "%Y-%m-%d"))
            queryset = queryset.filter(start__contains=date)
        elif client_id is not None:
            queryset = queryset.filter(attendances__client=client_id, group__isnull=True)
        elif group_id is not None:
            queryset = queryset.filter(group=group_id)
        return queryset
