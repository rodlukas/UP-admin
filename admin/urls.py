from django.urls import path
from django.views.generic import TemplateView

from . import views
app_name = 'polls'
urlpatterns = [
    # ex: /polls/
    path('', TemplateView.as_view(template_name="index.html")),
]