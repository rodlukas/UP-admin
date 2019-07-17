from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView
from django.conf import settings
from rest_framework.schemas import get_schema_view
from rest_framework import authentication

urlpatterns = [
    path('api/v1/', include('api.urls')),
    # favicona pro starsi prohlizece
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('admin/favicon.ico'))),
    path('open-api/', get_schema_view(
        title="ÚPadmin API",
        description="...",
        url='/api/v1',  # todo - zatim drf neimplementuje
        authentication_classes=[authentication.BasicAuthentication]
    ), name='openapi-schema'),
    path('docs/', TemplateView.as_view(
        template_name='swagger-ui.html',
        extra_context={'schema_url': 'openapi-schema'}
    ), name='swagger-ui'),
    re_path(r'^', TemplateView.as_view(template_name="react-autogenerate.html")),
]

if settings.DEBUG or settings.MANUAL_PRODUCTION:
    import debug_toolbar
    urlpatterns = [
        re_path(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
