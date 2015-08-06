from django.conf.urls import patterns, include, url
from django.conf import settings
from django.contrib.staticfiles import views
from django.contrib.auth.views import login, logout


from django.contrib import admin
admin.autodiscover()

from rest_framework import routers
from game.views import ImageViewSet

#router = routers.DefaultRouter()
#router.register(r'db', ImageViewSet)

urlpatterns = patterns('',
    # Examples:
    url(r'^randompdf/$','messierbingo.views.output_card'),
    url(r'^$', 'game.views.home', name='home'),
    #url(r'^', include(router.urls)),
    url(r'^db/(?P<slug>[a-zA-Z0-9-]+)/$', ImageViewSet.as_view({'get': 'retrieve'}), name='db'),
    url(r'^db/$', ImageViewSet.as_view({'get': 'list'}), name='db'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', login, {'template_name': 'login.html'}, name='auth_login'),
    url(r'^logout', logout, {'template_name': 'logout.html'}, name='auth_logout'),
)

if not settings.PRODUCTION:
    urlpatterns += [
        url(r'^static/(?P<path>.*)$', views.serve),
    ]
