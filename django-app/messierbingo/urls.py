from django.conf.urls import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^randompdf/$','messierbingo.views.output_card'),
    # url(r'^$', 'messierbingo.views.home', name='home'),
    # url(r'^messierbingo/', include('messierbingo.foo.urls')),
    # url(r'^admin/', include(admin.site.urls)),
)

if not settings.PRODUCTION:
    urlpatterns += patterns('',
        url(r"^static/(?P<path>.*)$", "django.views.static.serve", {"document_root": settings.STATIC_ROOT, 'show_indexes': True})
    )
