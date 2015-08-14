from rest_framework import serializers, status
from rest_framework.response import Response
from messierbingo.models import MessierObject, Proposal, APERTURES
from game.schedule import process_observation_request, request_format
from django.conf import settings

class ImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MessierObject
        fields = ('name','ra', 'dec', 'image','image_thumb','observer_name','avm_code')

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
    exp_time = serializers.FloatField()
    obs_filter = serializers.CharField(max_length=2)

    def save(self, *args, **kwargs):
        params = self.data
        obs_params = request_format(params['object_name'], params['object_ra'], params['object_dec'], params['exp_time'], params['start'], params['end'], params['obs_filter'], params['aperture'])
        sub_params = {'proposal': kwargs['proposal'], 'request_data':obs_params}
        resp_status, resp_msg = process_observation_request(params=sub_params, cookie_id=kwargs['cookie_id'])
        if resp_status:
            return Response('Success', status=status.HTTP_201_CREATED)
        else:
            return Response(resp_msg, status=status.HTTP_400_BAD_REQUEST)



