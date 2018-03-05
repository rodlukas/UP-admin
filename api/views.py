from rest_framework import viewsets
from .serializers import *
from admin.models import *
from rest_framework import generics
from datetime import datetime


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.all()
    serializer_class = LectureSerializer


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer


class LecturesOnDay(generics.ListAPIView):
    serializer_class = LectureSerializer

    def get_queryset(self):
        date = datetime.date(datetime.strptime(self.kwargs['date'], "%Y-%m-%d"))
        return Lecture.objects.filter(start__contains=date)
