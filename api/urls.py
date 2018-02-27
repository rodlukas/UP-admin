from django.urls import path
from . import views

urlpatterns = [
    path('clients/', views.ClientList.as_view()),
]