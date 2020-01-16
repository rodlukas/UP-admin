"""
Definice mapování URL na jednotlivá view pro API.
"""
from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshSlidingView

from api import views
from .tokens import MyTokenObtainSlidingView

# DRF router pro namapovani viewsets na mnozinu URL adres
router = routers.DefaultRouter()
router.register("clients", views.ClientViewSet)
router.register(
    "groups", views.GroupViewSet, basename="groups"
)  # basename musi byt uvedeno, protoze neni default queryset
router.register("courses", views.CourseViewSet)
router.register("lectures", views.LectureViewSet, basename="lectures")
router.register("attendances", views.AttendanceViewSet)
router.register("memberships", views.MembershipViewSet)
router.register("attendancestates", views.AttendanceStateViewSet)
router.register("applications", views.ApplicationViewSet)

urlpatterns = [
    # URL z DRF routeru
    path("", include(router.urls)),
    # dalsi URL mimo DRF
    path("bank/", views.BankView.as_view()),
    path("jwt-auth/", MyTokenObtainSlidingView.as_view(), name="token_obtain"),
    path("jwt-refresh/", TokenRefreshSlidingView.as_view(), name="token_refresh"),
]
