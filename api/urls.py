from django.urls import include, path
from rest_framework import routers
from api import views


router = routers.DefaultRouter()
router.register(r'clients', views.ClientViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'attendancestates', views.AttendanceStateViewSet)
router.register(r'courses', views.CourseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
