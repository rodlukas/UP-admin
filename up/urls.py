from django.urls import include, path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('api/v1/', include('api.urls')),
    re_path(r'^', TemplateView.as_view(template_name="index.html")),
]
