from django.urls import include, path
from rest_framework import routers
from api import views


router = routers.DefaultRouter()
router.register('clients', views.ClientViewSet, 'clients')
router.register('groups', views.GroupViewSet, 'Group')
router.register('courses', views.CourseViewSet, 'Course')
router.register('lectures', views.LectureViewSet, 'Lecture')

urlpatterns = [
    path('', include(router.urls)),
]
