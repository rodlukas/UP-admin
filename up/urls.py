"""
Definice mapování URL na jednotlivá view.
"""

from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from copy import deepcopy

from django.utils.csp import CSP
from django.views.decorators.csp import csp_override
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# CSP pro cdn.jsdelivr.net (openapi docs)
CSPURL_JSDELIVR_NET = "https://cdn.jsdelivr.net"

swagger_csp = deepcopy(settings.SECURE_CSP)
swagger_csp["script-src"] = [
    *swagger_csp.get("script-src", []),
    CSPURL_JSDELIVR_NET,
    CSP.UNSAFE_INLINE,
]
swagger_csp["connect-src"] = [
    *swagger_csp.get("connect-src", []),
    CSPURL_JSDELIVR_NET,
]
swagger_csp["style-src"] = [
    *swagger_csp.get("style-src", []),
    CSPURL_JSDELIVR_NET,
]


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
        csp_override(swagger_csp)(SpectacularSwaggerView.as_view(url_name="schema")),
        name="swagger-ui",
    ),
    # vychozi stranka (serviruje React aplikaci)
    re_path(r"^", TemplateView.as_view(template_name="react-autogenerate.html")),
]

# povoleni django-debug-toolbar stranek
if settings.DEBUG or settings.MANUAL_PRODUCTION:
    import debug_toolbar

    urlpatterns.insert(0, re_path(r"^__debug__/", include(debug_toolbar.urls)))
