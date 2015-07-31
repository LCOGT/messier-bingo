from rest_framework import serializers
from messierbingo.models import MessierObject

class ImageSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MessierObject
        fields = ('name','ra', 'dec', 'image','image_thumb','observer_name','avm_code')