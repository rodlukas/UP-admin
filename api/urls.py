from django.urls import include, path
from rest_framework import routers
#from rest_framework_nested import routers
from api import views


router = routers.DefaultRouter()

router.register('lectures', views.LectureViewSet, 'Lecture')
router.register('clients', views.ClientViewSet, 'Client')

#nested_router = routers.NestedSimpleRouter(router, 'clients', lookup='client')
#nested_router.register('lectures', views.TestViewSet, base_name='domain-nameservers')

urlpatterns = [
    path('lectures-day/<str:date>/', views.LecturesOnDay.as_view()),
    path('', include(router.urls)),
]
