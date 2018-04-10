from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory
from django.contrib.auth import get_user_model
import json
from api import views


class TestApiClients(APITestCase):
    """ Prubeh testu:
        - vytvoreni testovaciho uzivatele, ziskani tokenu
        - pridani klienta pres API (s autentikaci)
        - zkontroluje, zda byl klient pridan
    """
    def setUp(self):
        self.factory = APIRequestFactory()
        self.view = views.ClientViewSet.as_view({'get': 'list'})
        self.uri = '/api/v1/clients/'
        self.user = self.setup_user()
        self.token = self.get_token(self)

    @staticmethod
    def setup_user():
        user = get_user_model()
        return user.objects.create_user(
            username='test',
            email='testuser@test.cz',
            password='test'
        )

    @staticmethod
    def get_token(self):
        response = self.client.post("/api/v1/jwt-auth/", {"username": "test", "password": "test"}, secure=True)
        self.assertEqual(response.status_code, 200, "Token se nepovedlo ziskat")
        response_content = json.loads(response.content.decode('utf-8'))
        return response_content["token"]

    def get_header(self):
        return 'JWT ' + self.token

    def test_list(self):
        self.client.post(self.uri, {'name': 'Josef', 'surname': 'Novák'}, HTTP_AUTHORIZATION=self.get_header(),
                         secure=True)
        response = self.client.get(self.uri, {}, HTTP_AUTHORIZATION=self.get_header(), secure=True)
        response_content = json.loads(response.content.decode('utf-8'))

        self.assertEqual(len(response_content), 1, 'Klient nebyl pridan')
        self.assertEqual(response.status_code, 200, 'Get na klienty nefunguje')
