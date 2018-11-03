from django.urls import include, path
from rest_framework import routers
from api import views
from rest_framework_jwt.views import obtain_jwt_token, refresh_jwt_token

router = routers.DefaultRouter()
router.register('clients', views.ClientViewSet)
router.register('groups', views.GroupViewSet, basename='groups')  # basename musi byt uvedeno, protoze neni default queryset
router.register('courses', views.CourseViewSet)
router.register('lectures', views.LectureViewSet, basename='lectures')
router.register('attendances', views.AttendanceViewSet)
router.register('memberships', views.MembershipViewSet)
router.register('attendancestates', views.AttendanceStateViewSet)
router.register('applications', views.ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('bank/', views.BankView.as_view()),
    path('jwt-auth/', obtain_jwt_token),
    path('jwt-refresh/', refresh_jwt_token),
]
