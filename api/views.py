from rest_framework import viewsets, mixins
from .serializers import *
from admin.models import *
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .services import Bank
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.db.models import Prefetch
from django.db.models.deletion import ProtectedError
from .mixins import ProtectedErrorMixin
from django_filters import rest_framework as filters
from . import filters as custom_filters


class ClientViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    filterset_fields = 'active',

    def destroy(self, request, *args, **kwargs):
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result("Klienta lze smazat jen pokud nemá žádné lekce.")
        return result


class AttendanceViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


class MembershipViewSet(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer


class AttendanceStateViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    queryset = AttendanceState.objects.all()
    serializer_class = AttendanceStateSerializer

    def destroy(self, request, *args, **kwargs):
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            result = super().get_result("Stav účasti lze smazat jen pokud se nikde nepoužívá.")
        return result


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.select_related('course') \
        .prefetch_related(Prefetch('memberships', queryset=Membership.objects.select_related('client')))
    serializer_class = GroupSerializer
    filter_backends = filters.DjangoFilterBackend,
    filterset_class = custom_filters.GroupFilter


class CourseViewSet(viewsets.ModelViewSet, ProtectedErrorMixin):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_fields = 'visible',

    def destroy(self, request, *args, **kwargs):
        try:
            result = super().destroy(request, *args, **kwargs)
        except ProtectedError:
            msg = "Kurz lze smazat jen pokud se nikde nepoužívá (neexistuje žádná lekce kurzu ani skupina patřící k danému kurzu."
            result = super().get_result(msg)
        return result


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related('course', 'client')
    serializer_class = ApplicationSerializer


class LectureViewSet(viewsets.ModelViewSet):
    queryset = Lecture.objects.order_by('-start') \
        .select_related('group__course', 'course') \
        .prefetch_related(Prefetch('attendances', queryset=Attendance.objects.select_related('client')),
                          Prefetch('group__memberships', queryset=Membership.objects.select_related('client')))
    serializer_class = LectureSerializer
    filter_backends = OrderingFilter, DjangoFilterBackend,
    filterset_class = custom_filters.LectureFilter
    ordering_fields = 'start',

    def get_serializer(self, *args, **kwargs):
        # pokud prislo pole, nastav serializer na many=True
        if isinstance(kwargs.get('data', {}), list):
            kwargs['many'] = True
        return super(LectureViewSet, self).get_serializer(*args, **kwargs)


class BankView(APIView):
    @method_decorator(cache_page(60))
    def get(self, request, format=None):
        status_code, json = Bank().get_transactions()
        return JsonResponse(json, status=status_code)
