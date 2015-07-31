from messierbingo.models import MessierObject, Telescope
from rest_framework import viewsets
from .serializers import ImageSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows images of Messier catalogue objects to be shared with the Messier Bingo game.
    """
    queryset = MessierObject.objects.all()
    serializer_class = ImageSerializer

    def get_object(self):
        mobj = MessierObject.objects.get(name=self.kwargs['slug'])
        return mobj
