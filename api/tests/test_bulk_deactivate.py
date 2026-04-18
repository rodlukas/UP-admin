"""
Testy hromadné deaktivace klientů a skupin.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from admin.models import Client, Course, Group


class BulkDeactivateClientsTest(TestCase):
    """PATCH /api/v1/clients/deactivate-bulk/ deaktivuje vybrané klienty."""

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="clients-deactivate-bulk-test",
            email="clients-deactivate-bulk-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        self.client_target_1 = Client.objects.create(firstname="Alice", surname="T", active=True)
        self.client_target_2 = Client.objects.create(firstname="Bob", surname="T", active=True)
        self.client_untouched = Client.objects.create(firstname="Carol", surname="T", active=True)

    def test_deactivate_bulk_marks_selected_clients_inactive(self) -> None:
        response = self.api.patch(
            "/api/v1/clients/deactivate-bulk/",
            {"ids": [self.client_target_1.pk, self.client_target_2.pk]},
            format="json",
            secure=True,
        )

        self.assertEqual(response.status_code, 204)

        self.client_target_1.refresh_from_db()
        self.client_target_2.refresh_from_db()
        self.client_untouched.refresh_from_db()
        self.assertFalse(self.client_target_1.active)
        self.assertFalse(self.client_target_2.active)
        self.assertTrue(self.client_untouched.active)

    def test_deactivate_bulk_with_non_list_ids_returns_400(self) -> None:
        response = self.api.patch(
            "/api/v1/clients/deactivate-bulk/",
            {"ids": "not-a-list"},
            format="json",
            secure=True,
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"ids": "Musí být seznam."})


class BulkDeactivateGroupsTest(TestCase):
    """PATCH /api/v1/groups/deactivate-bulk/ deaktivuje vybrané skupiny."""

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="groups-deactivate-bulk-test",
            email="groups-deactivate-bulk-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        course = Course.objects.create(name="Test", duration=60)
        self.group_target_1 = Group.objects.create(name="Alpha", course=course, active=True)
        self.group_target_2 = Group.objects.create(name="Beta", course=course, active=True)
        self.group_untouched = Group.objects.create(name="Gamma", course=course, active=True)

    def test_deactivate_bulk_marks_selected_groups_inactive(self) -> None:
        response = self.api.patch(
            "/api/v1/groups/deactivate-bulk/",
            {"ids": [self.group_target_1.pk, self.group_target_2.pk]},
            format="json",
            secure=True,
        )

        self.assertEqual(response.status_code, 204)

        self.group_target_1.refresh_from_db()
        self.group_target_2.refresh_from_db()
        self.group_untouched.refresh_from_db()
        self.assertFalse(self.group_target_1.active)
        self.assertFalse(self.group_target_2.active)
        self.assertTrue(self.group_untouched.active)

    def test_deactivate_bulk_with_non_list_ids_returns_400(self) -> None:
        response = self.api.patch(
            "/api/v1/groups/deactivate-bulk/",
            {"ids": "not-a-list"},
            format="json",
            secure=True,
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"ids": "Musí být seznam."})
