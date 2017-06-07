from rest_framework import serializers, status
from rest_framework.response import Response
from game.models import MessierObject, Proposal, Telescope, APERTURES
from game.schedule import process_observation_request, request_format
from django.conf import settings

class ScopeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Telescope
        fields = ('name','aperture')

class ImageSerializer(serializers.ModelSerializer):
    telescope = ScopeSerializer()
    class Meta:
        model = MessierObject
        fields = ('name','ra', 'dec', 'image','image_thumb','observer_name','avm_code','telescope')

class RequestSerializer(serializers.Serializer):
    """
    This serializer POSTing parameters to the scheduler the api.
    """
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    aperture = serializers.ChoiceField(choices=APERTURES)
    object_name = serializers.CharField()
    object_ra = serializers.FloatField()
    object_dec = serializers.FloatField()
    obs_filter = serializers.JSONField()

    def save(self, *args, **kwargs):
        params = self.data
        obs_params = request_format(params['object_name'], params['object_ra'], params['object_dec'], params['start'], params['end'], params['obs_filter'], kwargs['proposal'], params['aperture'])
        resp_status, resp_msg = process_observation_request(params=obs_params, token=kwargs['token'])
        if resp_status:
            return Response('Success', status=status.HTTP_201_CREATED)
        else:
            return Response(resp_msg, status=status.HTTP_400_BAD_REQUEST)
