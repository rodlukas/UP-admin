from rest_framework import viewsets
from .serializers import *
from admin.models import *


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet):
    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
