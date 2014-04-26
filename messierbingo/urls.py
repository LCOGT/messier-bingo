from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^test/$','messierbingo.views.test_pdf'),
    url(r'^$', 'messierbingo.views.home', name='home'),
    # url(r'^messierbingo/', include('messierbingo.foo.urls')),
    # url(r'^admin/', include(admin.site.urls)),
)
