"""
Testy filtru klientů (active) endpointu /api/v1/clients/.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from admin.models import Client

from .helpers import ids as _ids


class ClientActiveFilterTest(TestCase):
    """
    Filtr `active` vrací jen aktivní nebo jen neaktivní klienty. Neplatná hodnota
    (cokoliv mimo `true`/`false`/`1`/`0`) skončí 400, ne tichým přeskočením filtru.
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="clients-active-filter-test",
            email="clients-active-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        self.client_active = Client.objects.create(firstname="Alice", surname="Active", active=True)
        self.client_inactive = Client.objects.create(
            firstname="Bob", surname="Inactive", active=False
        )

    def test_active_true_returns_only_active_clients(self) -> None:
        response = self.api.get("/api/v1/clients/?active=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.client_active.pk})

    def test_active_false_returns_only_inactive_clients(self) -> None:
        response = self.api.get("/api/v1/clients/?active=false", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.client_inactive.pk})

    def test_active_invalid_value_returns_400(self) -> None:
        response = self.api.get("/api/v1/clients/?active=no", secure=True)
        self.assertEqual(response.status_code, 400)

    def test_active_empty_value_returns_400(self) -> None:
        # prazdny retezec (napr. rozbity klient) nesmi tise spadnout na "bez filtru"
        response = self.api.get("/api/v1/clients/?active=", secure=True)
        self.assertEqual(response.status_code, 400)
