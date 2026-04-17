"""
Testy filtru skupin (client, onlyPast, active) endpointu /api/v1/groups/.
"""

from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import make_aware
from rest_framework.test import APIClient

from admin.models import Attendance, AttendanceState, Client, Course, Group, Lecture, Membership


def _ids(response_data: list[dict]) -> set[int]:
    return {item["id"] for item in response_data}


class GroupClientFilterTest(TestCase):
    """
    Filtr `client` vrací skupiny, kde je klient aktuálně členem.
    Filtr `client` + `onlyPast=true` vrací skupiny, kde klient má účast na lekci,
    ale už není členem (opustil je).
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="groups-client-filter-test",
            email="groups-client-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        state_ok = AttendanceState.objects.create(name="OK", visible=True, default=True)
        course = Course.objects.create(name="Test", duration=60)
        start = make_aware(datetime(2026, 1, 10, 10, 0))

        self.client_target = Client.objects.create(firstname="Alice", surname="T")
        self.client_other = Client.objects.create(firstname="Bob", surname="T")

        # Skupina A — klient je aktuální člen, má v ní účast na lekci
        self.group_current = Group.objects.create(name="Current", course=course)
        Membership.objects.create(client=self.client_target, group=self.group_current)
        lecture_current = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=self.group_current
        )
        Attendance.objects.create(
            client=self.client_target, lecture=lecture_current, paid=True, attendancestate=state_ok
        )

        # Skupina B — klient v ní měl lekci, ale už není členem (opustil)
        self.group_past = Group.objects.create(name="Past", course=course)
        lecture_past = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=self.group_past
        )
        Attendance.objects.create(
            client=self.client_target, lecture=lecture_past, paid=True, attendancestate=state_ok
        )
        # aktuálně tam má členství jen jiný klient
        Membership.objects.create(client=self.client_other, group=self.group_past)

        # Skupina C — klient nikdy neúčastnil, nemá tam členství (kontrolní)
        self.group_unrelated = Group.objects.create(name="Unrelated", course=course)
        Membership.objects.create(client=self.client_other, group=self.group_unrelated)

    def test_client_filter_returns_current_memberships(self) -> None:
        response = self.api.get(
            f"/api/v1/groups/?client={self.client_target.pk}", secure=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.group_current.pk})

    def test_client_with_only_past_returns_left_groups(self) -> None:
        response = self.api.get(
            f"/api/v1/groups/?client={self.client_target.pk}&onlyPast=true", secure=True
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.group_past.pk})

    def test_only_past_without_client_is_noop(self) -> None:
        response = self.api.get("/api/v1/groups/?onlyPast=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            _ids(response.json()),
            {self.group_current.pk, self.group_past.pk, self.group_unrelated.pk},
        )


class GroupActiveFilterTest(TestCase):
    """Filtr `active` vrací jen aktivní nebo jen neaktivní skupiny."""

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="groups-active-filter-test",
            email="groups-active-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        course = Course.objects.create(name="Test", duration=60)
        self.group_active = Group.objects.create(name="Active", course=course, active=True)
        self.group_inactive = Group.objects.create(name="Inactive", course=course, active=False)

    def test_active_true_returns_only_active_groups(self) -> None:
        response = self.api.get("/api/v1/groups/?active=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.group_active.pk})

    def test_active_false_returns_only_inactive_groups(self) -> None:
        response = self.api.get("/api/v1/groups/?active=false", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.group_inactive.pk})
