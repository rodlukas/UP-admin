from django.urls import include, path
from rest_framework import routers
from api import views
from rest_framework_simplejwt.views import TokenObtainSlidingView, TokenRefreshSlidingView


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
    path('jwt-auth/', TokenObtainSlidingView.as_view(), name='token_obtain'),
    path('jwt-refresh/', TokenRefreshSlidingView.as_view(), name='token_refresh'),
]
