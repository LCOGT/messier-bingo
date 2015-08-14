from messierbingo.models import MessierObject, Telescope
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from django.shortcuts import render
from django.conf import settings
from .serializers import ImageSerializer, RequestSerializer
import requests
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


class ScheduleView(APIView):
    """
    Schedule observations on LCOGT given a full set of observing parameters
    """
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer)

    def post(self, request, format=None):
        ser = RequestSerializer(data=request.data)
        if not ser.is_valid(raise_exception=True):
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            cookie_id=request.session.get('odin.sessionid', False)
            if not cookie_id:
                return Response("Not authenticated with ODIN.", status=status.HTTP_400_BAD_REQUEST)
            proposal = request.session.get('proposal_code', False)
            if not proposal:
                return Response("No proposal have been registered.", status=status.HTTP_400_BAD_REQUEST)
            resp = ser.save(cookie_id=cookie_id, proposal=proposal)
            return resp