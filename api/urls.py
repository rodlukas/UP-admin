from django.urls import include, path
from rest_framework import routers
from api import views
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

router = routers.DefaultRouter()
router.register('clients', views.ClientViewSet)
router.register('groups', views.GroupViewSet, 'groups')  # base_name musi byt uvedeno, protoze neni default queryset
router.register('courses', views.CourseViewSet)
router.register('lectures', views.LectureViewSet, 'lectures')
router.register('attendances', views.AttendanceViewSet)
router.register('attendancestates', views.AttendanceStateViewSet)
router.register('applications', views.ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('jwt-auth/', obtain_jwt_token),
    path('jwt-refresh/', refresh_jwt_token),
]
