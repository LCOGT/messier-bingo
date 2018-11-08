from game.models import MessierObject, Telescope, Proposal
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from django.shortcuts import render
from django.conf import settings
from .serializers import ImageSerializer, RequestSerializer
import requests
from django.contrib.auth.forms import AuthenticationForm
import logging
import json

logger = logging.getLogger(__name__)


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows images of Messier catalogue objects to be shared with the Messier Bingo game.
    """
    queryset = MessierObject.objects.filter(enabled=True)
    serializer_class = ImageSerializer

    def get_object(self):
        mobj = MessierObject.objects.get(name=self.kwargs['slug'])
        return mobj

def home(request):
    proposals = json.dumps([str(p['code']) for p in Proposal.objects.all().values('code')])
    return render(request,'index.html',{'proposals':proposals})


class ScheduleView(APIView):
    """
    Schedule observations on LCO given a full set of observing parameters
    """
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer)

    def post(self, request, format=None):
        ser = RequestSerializer(data=request.data)
        token = ser['token']
        proposal = ser['proposal']
        if not ser.is_valid(raise_exception=True):
            logger.error('Request was not valid')
            return Response(ser.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            if not token:
                return Response("Not authenticated with LCO.", status=status.HTTP_401_UNAUTHORIZED)
            if not proposal:
                return Response("No proposals have been registered.", status=status.HTTP_403_FORBIDDEN)
            resp = ser.save(proposal=proposal, token=token)
            return resp
