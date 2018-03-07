from rest_framework import viewsets
from .serializers import *
from admin.models import *
from datetime import datetime


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet):
    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_queryset(self):
        queryset = Group.objects.all()
        id_client = self.request.query_params.get('client', None)
        if id_client is not None:
            queryset = queryset.filter(memberof__client=id_client)
        return queryset


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer

    def get_queryset(self):
        queryset = Lecture.objects.all()
        date = self.request.query_params.get('date', None)
        id_client = self.request.query_params.get('client', None)
        if date is not None:
            date = datetime.date(datetime.strptime(date, "%Y-%m-%d"))
            queryset = queryset.filter(start__contains=date)
        elif id_client is not None:
            queryset = queryset.filter(attendances__client=id_client)
        return queryset
