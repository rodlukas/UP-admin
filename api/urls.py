from django.urls import include, path
from rest_framework import routers
from api import views


router = routers.DefaultRouter()
router.register('clients', views.ClientViewSet, 'clients')
router.register('groups', views.GroupViewSet, 'groups')
router.register('courses', views.CourseViewSet, 'courses')
router.register('lectures', views.LectureViewSet, 'lectures')
router.register('attendancestates', views.AttendanceStateViewSet, 'attendancestates')

urlpatterns = [
    path('', include(router.urls)),
]
