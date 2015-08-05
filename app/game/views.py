from messierbingo.models import MessierObject, Telescope
from rest_framework import viewsets
from django.shortcuts import render
from .serializers import ImageSerializer
#from reqdb.client import SchedulerClient
#from reqdb.requests import Request, UserRequest
from django.contrib.auth.forms import AuthenticationForm


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows images of Messier catalogue objects to be shared with the Messier Bingo game.
    """
    queryset = MessierObject.objects.all()
    serializer_class = ImageSerializer

    def get_object(self):
        mobj = MessierObject.objects.get(name=self.kwargs['slug'])
        return mobj

def home(request):
    form = AuthenticationForm()
    return render(request,'index.html',{'login_form':form})
