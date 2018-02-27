from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from admin.models import Client
from api.serializers import ClientSerializer


class ClientList(APIView):
    def get(self, request, format=None):
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)