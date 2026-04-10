"""
Testy endpointu statistik aplikace.
"""

from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils.timezone import make_aware
from rest_framework.test import APIClient

from admin.models import Attendance, AttendanceState, Client, Course, Group, Lecture, Membership


class StatisticsViewTest(TestCase):
    """
    GET /api/v1/stats/ — struktura odpovědi a filtr roku.
    """

    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="stats-test",
            email="stats-test@test.cz",
            password="test-password",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_stats_unauthenticated_returns_401(self) -> None:
        anonymous = APIClient()
        response = anonymous.get("/api/v1/stats/", secure=True)
        self.assertEqual(response.status_code, 401)

    def test_stats_authenticated_returns_expected_keys(self) -> None:
        response = self.client.get("/api/v1/stats/", secure=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("clients", data)
        self.assertIn("groups", data)
        self.assertIn("lectures", data)

        lectures = data["lectures"]
        for key in (
            "not_happened_count",
            "canceled_count",
            "canceled_rate",
            "excused_not_happened_count",
            "total",
            "individual",
            "group",
            "total_minutes",
            "available_years",
            "by_year",
            "by_year_course",
            "by_course",
            "top_clients",
            "top_groups",
            "by_month",
        ):
            self.assertIn(key, lectures, msg=f"chybí lectures.{key}")

        self.assertIsInstance(lectures["by_year"], list)
        self.assertIsInstance(lectures["by_year_course"], list)
        self.assertIsInstance(lectures["by_course"], list)
        self.assertIsInstance(lectures["top_clients"], list)
        self.assertIsInstance(lectures["top_groups"], list)
        self.assertIsInstance(lectures["by_month"], list)
        self.assertEqual(len(lectures["by_month"]), 12)
        self.assertIn("total_minutes", lectures["by_month"][0])

    def test_stats_year_filter_omits_yearly_breakdowns(self) -> None:
        response = self.client.get("/api/v1/stats/?year=2099", secure=True)
        self.assertEqual(response.status_code, 200)
        lectures = response.json()["lectures"]
        self.assertIsNone(lectures["by_year"])
        self.assertIsNone(lectures["by_year_course"])


class StatisticsCountsTest(TestCase):
    """
    Ověření výpočtu canceled_count, not_happened_count, excused_not_happened_count a total.
    """

    #
    # Scénáře (všechny lekce v roce 2020, start v minulosti):
    #
    # A – individuální, nekancelovaná                       → efektivní (proběhlá)
    # B – individuální, cancelovaná, bez omluvy             → canceled, not_happened
    # C – individuální, cancelovaná, attendancestate=excused → canceled, not_happened, excused_not_happened
    # D – skupinová, nekancelovaná, oba účastníci OK        → efektivní (proběhlá)
    # E – skupinová, nekancelovaná, oba účastníci omluveni  → not_happened, excused_not_happened (all_excused_grp)
    # F – skupinová, nekancelovaná, jeden excused, jeden OK → efektivní (proběhlá – nepočítá se jako all_excused_grp)
    #
    # Očekávané hodnoty (celkem / bez filtru roku):
    #   total_in_scope = 6
    #   canceled_count = 2  (B, C)
    #   all_excused_grp_count = 1  (E)
    #   not_happened_count = 3  (B + C + E)
    #   excused_individual_count = 1  (C)
    #   excused_not_happened_count = 2  (C + E)
    #   effective total = 3  (A, D, F)
    #   individual = 1  (A)
    #   group = 2  (D, F)
    #   total_minutes = 30 + 45 + 60 = 135
    #

    def setUp(self) -> None:
        self.user = get_user_model().objects.create_user(
            username="counts-test",
            email="counts-test@test.cz",
            password="test-password",
        )
        self.api = APIClient()
        self.api.force_authenticate(user=self.user)

        state_ok = AttendanceState.objects.create(name="OK", visible=True, default=True)
        state_excused = AttendanceState.objects.create(name="Omluven", visible=True, excused=True)

        course = Course.objects.create(name="Testovací kurz", duration=60)
        client_a = Client.objects.create(firstname="Alice", surname="Test")
        client_b = Client.objects.create(firstname="Bob", surname="Test")

        group = Group.objects.create(name="Testovací skupina", course=course)
        Membership.objects.create(client=client_a, group=group)
        Membership.objects.create(client=client_b, group=group)

        past = make_aware(datetime(2020, 6, 15, 10, 0))

        # A – individuální, nekancelovaná, duration=30
        lec_a = Lecture.objects.create(start=past, canceled=False, duration=30, course=course)
        Attendance.objects.create(
            client=client_a, lecture=lec_a, paid=True, attendancestate=state_ok
        )

        # B – individuální, cancelovaná, bez omluvy
        lec_b = Lecture.objects.create(start=past, canceled=True, duration=30, course=course)
        Attendance.objects.create(
            client=client_a, lecture=lec_b, paid=False, attendancestate=state_ok
        )

        # C – individuální, cancelovaná, excused
        lec_c = Lecture.objects.create(start=past, canceled=True, duration=30, course=course)
        Attendance.objects.create(
            client=client_a, lecture=lec_c, paid=False, attendancestate=state_excused
        )

        # D – skupinová, nekancelovaná, oba OK, duration=45
        lec_d = Lecture.objects.create(
            start=past, canceled=False, duration=45, course=course, group=group
        )
        Attendance.objects.create(
            client=client_a, lecture=lec_d, paid=True, attendancestate=state_ok
        )
        Attendance.objects.create(
            client=client_b, lecture=lec_d, paid=True, attendancestate=state_ok
        )

        # E – skupinová, nekancelovaná, oba excused (all_excused_grp)
        lec_e = Lecture.objects.create(
            start=past, canceled=False, duration=45, course=course, group=group
        )
        Attendance.objects.create(
            client=client_a, lecture=lec_e, paid=False, attendancestate=state_excused
        )
        Attendance.objects.create(
            client=client_b, lecture=lec_e, paid=False, attendancestate=state_excused
        )

        # F – skupinová, nekancelovaná, jeden excused + jeden OK, duration=60
        lec_f = Lecture.objects.create(
            start=past, canceled=False, duration=60, course=course, group=group
        )
        Attendance.objects.create(
            client=client_a, lecture=lec_f, paid=False, attendancestate=state_excused
        )
        Attendance.objects.create(
            client=client_b, lecture=lec_f, paid=True, attendancestate=state_ok
        )

    def _lectures(self, year: int | None = None) -> dict:
        url = f"/api/v1/stats/?year={year}" if year else "/api/v1/stats/"
        response = self.api.get(url, secure=True)
        self.assertEqual(response.status_code, 200)
        return response.json()["lectures"]

    def test_canceled_count(self) -> None:
        lectures = self._lectures()
        self.assertEqual(lectures["canceled_count"], 2, "B + C")

    def test_not_happened_count(self) -> None:
        lectures = self._lectures()
        self.assertEqual(lectures["not_happened_count"], 3, "B + C + E")

    def test_excused_not_happened_count(self) -> None:
        lectures = self._lectures()
        self.assertEqual(lectures["excused_not_happened_count"], 2, "C + E")

    def test_excused_not_happened_is_subset_of_not_happened(self) -> None:
        lectures = self._lectures()
        self.assertLessEqual(lectures["excused_not_happened_count"], lectures["not_happened_count"])

    def test_effective_totals(self) -> None:
        lectures = self._lectures()
        self.assertEqual(lectures["total"], 3, "A + D + F")
        self.assertEqual(lectures["individual"], 1, "jen A")
        self.assertEqual(lectures["group"], 2, "D + F")

    def test_total_minutes_only_counts_happened(self) -> None:
        lectures = self._lectures()
        # A(30) + D(45) + F(60) = 135 minut
        self.assertEqual(lectures["total_minutes"], 135)

    def test_canceled_rate(self) -> None:
        lectures = self._lectures()
        # 2 canceled z 6 celkem → 33.3 %
        self.assertAlmostEqual(lectures["canceled_rate"], 33.3, places=1)

    def test_by_month_has_12_entries(self) -> None:
        lectures = self._lectures()
        self.assertEqual(len(lectures["by_month"]), 12)

    def test_by_month_june_totals(self) -> None:
        """
        Červen (měsíc 6) musí odpovídat efektivním lekcím scénářů A, D, F.
        """
        lectures = self._lectures()
        june = next(m for m in lectures["by_month"] if m["month"] == 6)
        self.assertEqual(june["total"], 3)
        self.assertEqual(june["total_minutes"], 135)

    def test_year_filter_excludes_other_years(self) -> None:
        """
        Filtr na jiný rok vrátí nulové počty.
        """
        lectures = self._lectures(year=1999)
        self.assertEqual(lectures["total"], 0)
        self.assertEqual(lectures["canceled_count"], 0)
        self.assertEqual(lectures["not_happened_count"], 0)
        self.assertEqual(lectures["excused_not_happened_count"], 0)

    def test_year_filter_2020_matches_all_fixtures(self) -> None:
        """
        Filtr na rok 2020 vrátí stejné výsledky jako celkový pohled.
        """
        all_stats = self._lectures()
        year_stats = self._lectures(year=2020)
        for key in (
            "total",
            "canceled_count",
            "not_happened_count",
            "excused_not_happened_count",
            "total_minutes",
        ):
            self.assertEqual(year_stats[key], all_stats[key], msg=f"lectures.{key} nesouhlasí")
