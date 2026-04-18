"""
Testy filtru lekcí (client, includeGroup) endpointu /api/v1/lectures/.
"""

from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import make_aware
from rest_framework.test import APIClient

from admin.models import Attendance, AttendanceState, Client, Course, Group, Lecture, Membership

from .helpers import ids as _ids


class LectureClientFilterTest(TestCase):
    """
    Filtr `client` vrací jen individuální lekce klienta (group=null).
    Filtr `client` + `includeGroup=true` vrací i skupinové lekce klienta.
    Samotný `includeGroup=true` (bez client) nemá efekt.
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="lectures-client-filter-test",
            email="lectures-client-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        state_ok = AttendanceState.objects.create(name="OK", visible=True, default=True)
        course = Course.objects.create(name="Test", duration=60)
        start = make_aware(datetime(2026, 1, 10, 10, 0))

        self.client_target = Client.objects.create(firstname="Alice", surname="T")
        self.client_other = Client.objects.create(firstname="Bob", surname="T")

        # Lekce A — individuální lekce cílového klienta (group=null)
        self.lecture_individual = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=None
        )
        Attendance.objects.create(
            client=self.client_target,
            lecture=self.lecture_individual,
            paid=True,
            attendancestate=state_ok,
        )

        # Lekce B — skupinová lekce cílového klienta (group!=null)
        group = Group.objects.create(name="Skupina", course=course)
        Membership.objects.create(client=self.client_target, group=group)
        self.lecture_group = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=group
        )
        Attendance.objects.create(
            client=self.client_target,
            lecture=self.lecture_group,
            paid=True,
            attendancestate=state_ok,
        )

        # Lekce C — individuální lekce jiného klienta (kontrolní)
        self.lecture_other = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=None
        )
        Attendance.objects.create(
            client=self.client_other,
            lecture=self.lecture_other,
            paid=True,
            attendancestate=state_ok,
        )

    def test_client_filter_returns_only_individual_lectures(self) -> None:
        response = self.api.get(
            f"/api/v1/lectures/?client={self.client_target.pk}", secure=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_individual.pk})

    def test_client_with_include_group_returns_all_client_lectures(self) -> None:
        response = self.api.get(
            f"/api/v1/lectures/?client={self.client_target.pk}&includeGroup=true", secure=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            _ids(response.json()), {self.lecture_individual.pk, self.lecture_group.pk}
        )

    def test_include_group_without_client_is_noop(self) -> None:
        response = self.api.get("/api/v1/lectures/?includeGroup=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            _ids(response.json()),
            {self.lecture_individual.pk, self.lecture_group.pk, self.lecture_other.pk},
        )
