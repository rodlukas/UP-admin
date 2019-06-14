from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.contrib.staticfiles.storage import staticfiles_storage
from django.views.generic.base import RedirectView
from django.conf import settings

urlpatterns = [
    path('api/v1/', include('api.urls')),
    # favicona pro starsi prohlizece
    path('favicon.ico', RedirectView.as_view(url=staticfiles_storage.url('admin/favicon.ico'))),
    re_path(r'^robots\.txt$', TemplateView.as_view(template_name="robots.txt", content_type='text/plain')),
    re_path(r'^', TemplateView.as_view(template_name="react-autogenerate.html")),
]

if settings.DEBUG or settings.MANUAL_PRODUCTION:
    import debug_toolbar
    urlpatterns = [
        re_path(r'^__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
