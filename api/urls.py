from django.urls import include, path
from rest_framework import routers
from api import views


router = routers.DefaultRouter()
router.register(r'clients', views.ClientViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'attendance_states', views.AttendanceStateViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'lectures', views.LectureViewSet)
router.register(r'attendances', views.AttendanceViewSet)
router.register(r'member_of', views.MemberOfViewSet)

urlpatterns = router.urls
# [path('', include(router.urls))]
