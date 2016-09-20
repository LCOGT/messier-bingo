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
import logging

logger = logging.getLogger(__name__)


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
    proposal = request.session.get('proposal_code', False)
    return render(request,'index.html',{'login_form':form,'prefix':settings.PREFIX,'proposal':proposal})


class ScheduleView(APIView):
    """
    Schedule observations on LCOGT given a full set of observing parameters
    """
    renderer_classes = (JSONRenderer, BrowsableAPIRenderer)

    def post(self, request, format=None):
        ser = RequestSerializer(data=request.data)
        if not ser.is_valid(raise_exception=True):
            logger.error('Request was not valid')
            return Response(ser.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            bearer_token = request.session.get('bearer_token', False)
            if not bearer_token:
                return Response("Not authenticated with ODIN.", status=status.HTTP_401_UNAUTHORIZED)
            proposal = request.session.get('proposal_code', False)
            if not proposal:
                return Response("No proposals have been registered.", status=status.HTTP_403_FORBIDDEN)
            resp = ser.save(proposal=proposal, bearer_token=bearer_token)
            return resp
