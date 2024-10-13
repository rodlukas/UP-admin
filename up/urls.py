"""
Definice mapování URL na jednotlivá view.
"""

from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from rest_framework.schemas import get_schema_view

urlpatterns = [
    # API mapovani
    path("api/v1/", include("api.urls")),
    # favicona pro starsi prohlizece
    path("favicon.ico", RedirectView.as_view(url=staticfiles_storage.url("admin/favicon.ico"))),
    # dynamicke OpenAPI schema
    path(
        "api/open-api/",
        get_schema_view(
            title="ÚPadmin API",
            description="Dokumentace *REST API* pro aplikaci **ÚPadmin**. **[Přejít do aplikace](/)**",
            version="1.0.0",
            urlconf="api.urls",
        ),
        name="openapi-schema",
    ),
    # Swagger UI dokumentace API
    path("api/docs/", TemplateView.as_view(template_name="swagger-ui.html"), name="swagger-ui"),
    # vychozi stranka (serviruje React aplikaci)
    re_path(r"^", TemplateView.as_view(template_name="react-autogenerate.html")),
]

# povoleni django-debug-toolbar stranek
if settings.DEBUG or settings.MANUAL_PRODUCTION:
    import debug_toolbar

    urlpatterns.insert(0, re_path(r"^__debug__/", include(debug_toolbar.urls)))
