"""
Definice mapování URL na jednotlivá view.
"""

from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from csp.decorators import csp_update

# CSP pro cdn.jsdelivr.net (openapi docs)
CSPURL_JSDELIVR_NET = "https://cdn.jsdelivr.net"


urlpatterns = [
    # API mapovani
    path("api/v1/", include("api.urls")),
    # favicona pro starsi prohlizece
    path("favicon.ico", RedirectView.as_view(url=staticfiles_storage.url("admin/favicon.ico"))),
    # OpenAPI schema
    path("api/open-api/", SpectacularAPIView.as_view(), name="schema"),
    # Swagger UI dokumentace API (CSP úprava jen pro tuto view)
    path(
        "api/docs/",
        csp_update(
            script_src=(
                CSPURL_JSDELIVR_NET, "'unsafe-inline'",
            ),
            connect_src=(
                CSPURL_JSDELIVR_NET,
            ),
            style_src=(
                CSPURL_JSDELIVR_NET,
            ),
        )(SpectacularSwaggerView.as_view(url_name="schema")),
        name="swagger-ui",
    ),
    # vychozi stranka (serviruje React aplikaci)
    re_path(r"^", TemplateView.as_view(template_name="react-autogenerate.html")),
]

# povoleni django-debug-toolbar stranek
if settings.DEBUG or settings.MANUAL_PRODUCTION:
    import debug_toolbar

    urlpatterns.insert(0, re_path(r"^__debug__/", include(debug_toolbar.urls)))
