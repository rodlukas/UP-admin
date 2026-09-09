"""
Testy filtru lekcí (client, includeGroup) endpointu /api/v1/lectures/.
"""

from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import make_aware
from rest_framework.test import APIClient

from admin.models import Attendance, AttendanceState, Client, Course, Group, Lecture, Membership
from api.views import LectureViewSet

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

        # Lekce A — individualni lekce ciloveho klienta (group=null)
        self.lecture_individual = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=None
        )
        Attendance.objects.create(
            client=self.client_target,
            lecture=self.lecture_individual,
            paid=True,
            attendancestate=state_ok,
        )

        # Lekce B — skupinova lekce ciloveho klienta (group!=null)
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

        # Lekce C — individualni lekce jineho klienta (kontrolni)
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


class LectureLimitTest(TestCase):
    """
    Parametr `limit` bez explicitního `ordering` musí vracet N NEJBLIŽŠÍCH lekcí (vzestupně
    dle startu), ne N nejvzdálenějších — queryset je jinak defaultně řazen sestupně.
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="lectures-limit-test",
            email="lectures-limit-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        course = Course.objects.create(name="Test", duration=60)
        # tri lekce v ruznem poradi vytvoreni, ale znamem poradi startu
        self.lecture_earliest = Lecture.objects.create(
            start=make_aware(datetime(2026, 1, 10, 10, 0)),
            canceled=False,
            duration=60,
            course=course,
            group=None,
        )
        self.lecture_middle = Lecture.objects.create(
            start=make_aware(datetime(2026, 2, 10, 10, 0)),
            canceled=False,
            duration=60,
            course=course,
            group=None,
        )
        self.lecture_latest = Lecture.objects.create(
            start=make_aware(datetime(2026, 3, 10, 10, 0)),
            canceled=False,
            duration=60,
            course=course,
            group=None,
        )

    def test_limit_without_explicit_ordering_returns_nearest_lectures(self) -> None:
        response = self.api.get("/api/v1/lectures/?limit=2", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_earliest.pk, self.lecture_middle.pk})

    def test_limit_with_explicit_descending_ordering_returns_latest_lectures(self) -> None:
        response = self.api.get("/api/v1/lectures/?limit=2&ordering=-start", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_middle.pk, self.lecture_latest.pk})

    def test_limit_with_descending_ordering_excludes_dateless_lectures(self) -> None:
        # `start` je nullable (predplacene lekce bez terminu) a PostgreSQL radi NULL
        # hodnoty u `ORDER BY start DESC` JAKO PRVNI — bez explicitniho filtru by
        # `?limit=N&ordering=-start` vratil N predplacenych lekci bez data misto
        # N nejnovejsich (presny opak ucelu parametru `limit`).
        Lecture.objects.create(
            start=None,
            canceled=False,
            duration=60,
            course=self.lecture_earliest.course,
            group=None,
        )
        response = self.api.get("/api/v1/lectures/?limit=2&ordering=-start", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_middle.pk, self.lecture_latest.pk})

    def test_limit_with_empty_ordering_still_returns_nearest_lectures(self) -> None:
        # `?ordering=` je prazdny, ne chybejici parametr - DRF ho vyhodnoti stejne jako
        # kdyby chybel (viz OrderingFilter.get_ordering), takze fallback na vzestupne
        # razeni se musi uplatnit i tady
        response = self.api.get("/api/v1/lectures/?limit=2&ordering=", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_earliest.pk, self.lecture_middle.pk})

    def test_limit_with_invalid_ordering_field_still_returns_nearest_lectures(self) -> None:
        # neplatne pole se pro OrderingFilter chova stejne jako chybejici parametr
        response = self.api.get("/api/v1/lectures/?limit=2&ordering=neexistujici_pole", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_earliest.pk, self.lecture_middle.pk})

    def test_limit_zero_returns_400(self) -> None:
        response = self.api.get("/api/v1/lectures/?limit=0", secure=True)
        self.assertEqual(response.status_code, 400)

    def test_limit_at_max_returns_200(self) -> None:
        response = self.api.get(f"/api/v1/lectures/?limit={LectureViewSet.MAX_LIMIT}", secure=True)
        self.assertEqual(response.status_code, 200)

    def test_limit_above_max_returns_400(self) -> None:
        response = self.api.get(
            f"/api/v1/lectures/?limit={LectureViewSet.MAX_LIMIT + 1}", secure=True
        )
        self.assertEqual(response.status_code, 400)

    def test_limit_not_a_number_returns_400(self) -> None:
        response = self.api.get("/api/v1/lectures/?limit=abc", secure=True)
        self.assertEqual(response.status_code, 400)


class LectureCanceledFilterTest(TestCase):
    """
    Filtr `canceled` musí selhávat ZAVŘENĚ: neplatná hodnota (cokoliv mimo
    `true`/`false`/`1`/`0`) skončí 400, ne tichým přeskočením filtru (přehled by jinak
    mohl zrušenou lekci nabídnout jako „nejbližší příští", viz docstring `LectureFilter`).
    """

    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="lectures-canceled-filter-test",
            email="lectures-canceled-filter-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)

        course = Course.objects.create(name="Test", duration=60)
        start = make_aware(datetime(2026, 1, 10, 10, 0))
        self.lecture_active = Lecture.objects.create(
            start=start, canceled=False, duration=60, course=course, group=None
        )
        self.lecture_canceled = Lecture.objects.create(
            start=start, canceled=True, duration=60, course=course, group=None
        )

    def test_canceled_false_excludes_canceled_lectures(self) -> None:
        response = self.api.get("/api/v1/lectures/?canceled=false", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_active.pk})

    def test_canceled_true_returns_only_canceled_lectures(self) -> None:
        response = self.api.get("/api/v1/lectures/?canceled=true", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(_ids(response.json()), {self.lecture_canceled.pk})

    def test_canceled_invalid_value_returns_400(self) -> None:
        # drivejsi `BooleanFilter` neznamy token tise preskocil (vratil vsechny lekce
        # vcetne zrusenych misto chyby) - musi vratit 400, stejne jako `limit`
        response = self.api.get("/api/v1/lectures/?canceled=no", secure=True)
        self.assertEqual(response.status_code, 400)
