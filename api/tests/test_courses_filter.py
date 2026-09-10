"""
Testy filtru kurzů (visible) endpointu /api/v1/courses/.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from admin.models import Course

from .helpers import ids as _ids


class CourseVisibleFilterTest(TestCase):
    """
    Filtr `visible` vrací jen viditelné nebo jen skryté kurzy. Neplatná hodnota
    (cokoliv mimo `true`/`false`/`1`/`0`) skončí 400, ne tichým přeskočením filtru.
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="courses-visible-filter-test",
            email="courses-visible-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        self.course_visible = Course.objects.create(name="Visible", duration=60, visible=True)
        self.course_hidden = Course.objects.create(name="Hidden", duration=60, visible=False)

    def test_visible_true_returns_only_visible_courses(self) -> None:
        response = self.api.get("/api/v1/courses/?visible=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.course_visible.pk})

    def test_visible_false_returns_only_hidden_courses(self) -> None:
        response = self.api.get("/api/v1/courses/?visible=false", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.course_hidden.pk})

    def test_visible_invalid_value_returns_400(self) -> None:
        response = self.api.get("/api/v1/courses/?visible=no", secure=True)
        self.assertEqual(response.status_code, 400)

    def test_visible_empty_value_returns_400(self) -> None:
        # prazdny retezec (napr. rozbity klient) nesmi tise spadnout na "bez filtru"
        response = self.api.get("/api/v1/courses/?visible=", secure=True)
        self.assertEqual(response.status_code, 400)
