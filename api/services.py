from datetime import datetime, timedelta
from typing import Tuple, Dict

import requests
from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, F, Q, QuerySet, Sum
from django.db.models.functions import ExtractMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response

from admin.models import Attendance, Client, Group, Lecture

# Cache klíč a timeout pro výpis bankovních transakcí.
FIO_CACHE_KEY = "fio_transactions"
FIO_CACHE_TIMEOUT_SECONDS = 60


class Bank:
    """
    Zprostředkovává komunikaci s Fio API pro získání seznamu posledních transakcí.
    Postaveno na Fio API v1.9 (15.10.2025).
    Dokumentace Fio API: https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf
    """

    # URL adresa API Fio banky
    FIO_API_URL = "https://fioapi.fio.cz/ib_api/rest/"
    # minimalni zustatek v Kc na Fio uctu (odcita se od aktualniho zustatku)
    FIO_MIN_BALANCE = 0
    # mozne chyby na Fio API a prislusne chybove hlasky
    FIO_API_ERRORS = {
        status.HTTP_409_CONFLICT: "překročení intervalu pro dotazování",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "neexistující/neplatný token",
        status.HTTP_503_SERVICE_UNAVAILABLE: "API banky nefunguje",
        status.HTTP_404_NOT_FOUND: "špatně zaslaný dotaz na banku",
        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: "příliš mnoho transakcí",
    }

    def get_transactions(self) -> Response:
        """
        Vrátí seznam bankovních transakcí v posledních 30 dnech (nebo případně info o příslušné chybě).
        V případě úspěšného požadavku na Fio API přidá do odpovědi také výši nájmu a timestamp dotazu.
        Úspěšné odpovědi jsou cachovány po dobu FIO_CACHE_TIMEOUT sekund; chybové nikoli.
        """
        if settings.BANK_ACTIVE:
            cached = cache.get(FIO_CACHE_KEY)
            if cached is not None:
                return Response(cached, status=status.HTTP_200_OK)

            date_format = "%Y-%m-%d"
            current_date_str = datetime.now().strftime(date_format)
            history_date_str = (datetime.now() - timedelta(days=30)).strftime(date_format)
            url_secret = (
                f"{self.FIO_API_URL}periods/{settings.FIO_API_KEY}/"
                f"{history_date_str}/{current_date_str}/transactions.json"
            )
            output_data, output_status = self.perform_api_request(url_secret)
            if output_status == status.HTTP_200_OK:
                cache.set(FIO_CACHE_KEY, output_data, FIO_CACHE_TIMEOUT_SECONDS)
        else:
            output_data, output_status = self.generate_output_error(
                "propojení s bankou je pro tuto doménu administrátorem zakázáno"
            )
        return Response(output_data, status=output_status)

    def perform_api_request(self, url_secret: str) -> Tuple[dict, int]:
        """
        Provede požadavek na Fio API a zpracuje příchozí data nebo chybu.
        """
        try:
            input_data = requests.get(url_secret, timeout=25)
            input_data.raise_for_status()
        except requests.exceptions.Timeout:
            return self.process_error(status.HTTP_503_SERVICE_UNAVAILABLE)
        except requests.exceptions.RequestException as e:
            status_code = getattr(e.response, "status_code", status.HTTP_500_INTERNAL_SERVER_ERROR)
            return self.process_error(status_code)
        else:
            return self.process_data(input_data)

    def process_data(self, req: requests.Response) -> Tuple[dict, int]:
        """
        Zpracuje příchozí data z Fio API - dekóduje JSON a transformuje data pro výstup.
        """
        try:
            # dekoduj JSON
            output_data = req.json()
            # proved transformaci dat a vrat vysledek
            return self.transform_data(output_data), req.status_code
        except (ValueError, KeyError):
            # nastala chyba pri dekodovani nebo naslednem zpracovani JSONu
            return self.generate_output_error("neočekávaná struktura JSONu")

    def transform_data(self, output_data: dict) -> dict:
        """
        Transformuje JSON z Fio API do požadované výstupní struktury.
        """
        # serad od nejnovejsich transakci
        output_data["accountStatement"]["transactionList"]["transaction"].reverse()
        # pridani timestamp dotazu (s prevodem na milisekundy)
        output_data["fetch_timestamp"] = int(datetime.now().timestamp() * 1000)
        # pridani vyse najmu (Kc)
        output_data["rent_price"] = settings.BANK_RENT_PRICE
        # odstraneni nepotrebnych polozek z info o uctu
        info_remove = ["yearList", "idList", "idFrom", "idTo", "idLastDownload"]
        for key in info_remove:
            output_data["accountStatement"]["info"].pop(key)
        # vypocet realneho zustatku (po odecteni minimalniho zustatku na uctu)
        output_data["accountStatement"]["info"]["closingBalance"] -= self.FIO_MIN_BALANCE
        return output_data

    def process_error(self, status_code: int) -> Tuple[Dict[str, str], int]:
        """
        Zpracuje chybu při neúspěšném požadavku na Fio API.
        """
        err_msg = self.FIO_API_ERRORS.get(status_code, "neznámá chyba Fio API")
        return self.generate_output_error(err_msg)

    def generate_output_error(self, err_msg: str) -> Tuple[Dict[str, str], int]:
        """
        Generuje výstupní data o chybě.
        """
        output_data = {"error_info": f"Data se nepodařilo stáhnout – {err_msg}."}
        return output_data, status.HTTP_500_INTERNAL_SERVER_ERROR


class Statistics:
    """
    Sestavuje statistiky aplikace z databáze.
    """

    LEADERBOARD_N = 10

    def get_statistics(self, year: int | None) -> dict:
        """
        Sestaví a vrátí slovník se statistikami aplikace pro daný rok (nebo všechny roky).

        Agregace proběhlých lekcí vycházejí z nezrušených lekcí (canceled=False) a vylučují
        skupinové lekce kde mají všichni účastníci omluveno. Počty zrušení počítají ze všech
        lekcí v rozsahu filtru (včetně canceled=True).
        """
        now = timezone.now()

        # klienti
        total_clients = Client.objects.count()
        active_clients = Client.objects.filter(active=True).count()
        clients_without_lectures = Client.objects.filter(attendances__isnull=True).count()

        # skupiny
        total_groups = Group.objects.count()
        active_groups = Group.objects.filter(active=True).count()

        # dostupne roky (nezavisle na filtru year)
        available_years = list(
            Lecture.objects.filter(start__isnull=False, start__lte=now)
            .values_list("start__year", flat=True)
            .distinct()
            .order_by("-start__year")
        )

        # zakladni querysets
        all_lectures = Lecture.objects.filter(start__isnull=False, start__lte=now)
        noncanceled_all_lectures = all_lectures.filter(canceled=False)
        all_scoped_lectures = all_lectures.filter(start__year=year) if year else all_lectures
        noncanceled_lectures = noncanceled_all_lectures.filter(start__year=year) if year else noncanceled_all_lectures

        # zrusene lekce
        total_in_scope = all_scoped_lectures.count()
        canceled_count = all_scoped_lectures.filter(canceled=True).count()
        canceled_rate = self._rate(canceled_count, total_in_scope)

        # individualni omluvene lekce (vzdy canceled=True, podmnozina canceled_count)
        excused_individual_attendance_all = Attendance.objects.filter(
            lecture__start__isnull=False,
            lecture__start__lte=now,
            lecture__group__isnull=True,
            attendancestate__excused=True,
        )
        excused_individual_attendance = (
            excused_individual_attendance_all.filter(lecture__start__year=year) if year else excused_individual_attendance_all
        )
        excused_individual_count = excused_individual_attendance.count()

        # skupinove lekce kde vsichni ucastnici omluveni
        excused_group_lectures = self._excused_group_lectures(noncanceled_lectures)
        excused_group_count = excused_group_lectures.count()

        excused_not_happened_count = excused_individual_count + excused_group_count
        not_happened_count = canceled_count + excused_group_count

        # efektivni queryset: probehle lekce (bez zrusenych a skupinovych kde vsichni omluveni)
        effective_lectures = noncanceled_lectures.exclude(pk__in=excused_group_lectures.values("pk"))
        excused_group_all_lectures = self._excused_group_lectures(noncanceled_all_lectures)
        effective_all_lectures = noncanceled_all_lectures.exclude(pk__in=excused_group_all_lectures.values("pk"))

        # agregace probehlych lekci
        totals = effective_lectures.aggregate(
            total=Count("id"),
            individual=Count("id", filter=Q(group__isnull=True)),
            group=Count("id", filter=Q(group__isnull=False)),
            total_minutes=Sum("duration"),
        )

        # per-course doplnkove statistiky
        canceled_by_course = {
            row["course__id"]: row
            for row in all_scoped_lectures.values("course__id").annotate(
                total_all=Count("id"), total_canceled=Count("id", filter=Q(canceled=True))
            )
        }
        excused_individual_by_course = {
            row["lecture__course_id"]: row["count"]
            for row in excused_individual_attendance.values("lecture__course_id").annotate(count=Count("id"))
        }
        excused_group_by_course = {
            row["course_id"]: row["count"]
            for row in excused_group_lectures.values("course_id").annotate(count=Count("id"))
        }

        # rozklad po kurzech
        by_course_lectures = (
            effective_lectures.values("course__id", "course__name", "course__color")
            .annotate(
                total=Count("id"),
                individual=Count("id", filter=Q(group__isnull=True)),
                group=Count("id", filter=Q(group__isnull=False)),
                total_minutes=Sum("duration"),
            )
            .order_by("-total")
        )
        by_course = [
            {
                "course_id": row["course__id"],
                "course_name": row["course__name"],
                "course_color": row["course__color"],
                "total": row["total"],
                "individual": row["individual"],
                "group": row["group"],
                "total_minutes": row["total_minutes"] or 0,
                "canceled_count": canceled_by_course.get(row["course__id"], {}).get(
                    "total_canceled", 0
                ),
                "canceled_rate": self._rate(
                    canceled_by_course.get(row["course__id"], {}).get("total_canceled", 0),
                    canceled_by_course.get(row["course__id"], {}).get("total_all", 0),
                ),
                "excused_not_happened_count": excused_individual_by_course.get(row["course__id"], 0)
                + excused_group_by_course.get(row["course__id"], 0),
            }
            for row in by_course_lectures
            if row["total"] > 0
        ]

        # zebricky
        top_clients_raw = (
            Attendance.objects.filter(lecture__in=effective_lectures, attendancestate__excused=False)
            .values("client_id", "client__firstname", "client__surname")
            .annotate(lecture_count=Count("lecture", distinct=True))
            .order_by("-lecture_count", "client__surname", "client__firstname")[: self.LEADERBOARD_N]
        )
        top_clients = [
            {
                "id": row["client_id"],
                "firstname": row["client__firstname"],
                "surname": row["client__surname"],
                "lecture_count": row["lecture_count"],
            }
            for row in top_clients_raw
        ]
        top_groups_raw = (
            effective_lectures.filter(group__isnull=False)
            .values("group_id", "group__name")
            .annotate(lecture_count=Count("id"))
            .order_by("-lecture_count", "group__name")[: self.LEADERBOARD_N]
        )
        top_groups = [
            {
                "id": row["group_id"],
                "name": row["group__name"],
                "lecture_count": row["lecture_count"],
            }
            for row in top_groups_raw
        ]

        # rozklad po mesicich (1-12)
        by_month_lectures = effective_lectures if year else effective_all_lectures
        by_month_aggregated = (
            by_month_lectures.annotate(_month=ExtractMonth("start"))
            .values("_month")
            .annotate(total=Count("id"), total_minutes=Sum("duration"))
            .order_by("_month")
        )
        by_month_stats = {
            row["_month"]: {"total": row["total"], "total_minutes": row["total_minutes"] or 0}
            for row in by_month_aggregated
        }
        by_month = [
            {
                "month": m,
                "total": by_month_stats.get(m, {}).get("total", 0),
                "total_minutes": by_month_stats.get(m, {}).get("total_minutes", 0),
            }
            for m in range(1, 13)
        ]

        # rozklad po letech a vyvoj po kurzech (jen pri pohledu na vsechny roky)
        by_year = None
        by_year_course = None
        if year is None:
            canceled_by_year = {
                row["start__year"]: row
                for row in all_lectures.values("start__year").annotate(
                    total_all=Count("id"), total_canceled=Count("id", filter=Q(canceled=True))
                )
            }
            excused_individual_by_year = {
                row["lecture__start__year"]: row["count"]
                for row in excused_individual_attendance_all.values("lecture__start__year").annotate(count=Count("id"))
            }
            excused_group_by_year = {
                row["start__year"]: row["count"]
                for row in excused_group_all_lectures.values("start__year").annotate(
                    count=Count("id")
                )
            }
            by_year_lectures = (
                effective_all_lectures.values("start__year")
                .annotate(
                    total=Count("id"),
                    individual=Count("id", filter=Q(group__isnull=True)),
                    group=Count("id", filter=Q(group__isnull=False)),
                    total_minutes=Sum("duration"),
                )
                .order_by("-start__year")
            )
            by_year = [
                {
                    "year": row["start__year"],
                    "total": row["total"],
                    "individual": row["individual"],
                    "group": row["group"],
                    "total_minutes": row["total_minutes"] or 0,
                    "canceled_count": canceled_by_year.get(row["start__year"], {}).get(
                        "total_canceled", 0
                    ),
                    "canceled_rate": self._rate(
                        canceled_by_year.get(row["start__year"], {}).get("total_canceled", 0),
                        canceled_by_year.get(row["start__year"], {}).get("total_all", 0),
                    ),
                    "excused_not_happened_count": excused_individual_by_year.get(
                        row["start__year"], 0
                    )
                    + excused_group_by_year.get(row["start__year"], 0),
                }
                for row in by_year_lectures
            ]
            by_year_course_lectures = (
                effective_all_lectures.values(
                    "start__year", "course__id", "course__name", "course__color"
                )
                .annotate(total=Count("id"))
                .order_by("start__year", "course__name")
            )
            by_year_course = [
                {
                    "year": row["start__year"],
                    "course_id": row["course__id"],
                    "course_name": row["course__name"],
                    "course_color": row["course__color"],
                    "total": row["total"],
                }
                for row in by_year_course_lectures
            ]

        return {
            "clients": {
                "total": total_clients,
                "active": active_clients,
                "inactive": total_clients - active_clients,
                "without_lectures": clients_without_lectures,
            },
            "groups": {
                "total": total_groups,
                "active": active_groups,
                "inactive": total_groups - active_groups,
            },
            "lectures": {
                "not_happened_count": not_happened_count,
                "canceled_count": canceled_count,
                "canceled_rate": canceled_rate,
                "excused_not_happened_count": excused_not_happened_count,
                "total": totals["total"],
                "individual": totals["individual"],
                "group": totals["group"],
                "total_minutes": totals["total_minutes"] or 0,
                "available_years": available_years,
                "by_year": by_year,
                "by_year_course": by_year_course,
                "by_course": by_course,
                "top_clients": top_clients,
                "top_groups": top_groups,
                "by_month": by_month,
            },
        }

    def _excused_group_lectures(self, lectures: QuerySet) -> QuerySet:
        """
        Skupinové lekce kde všichni účastníci mají omluveno (fakticky neproběhly).
        """
        return (
            lectures.filter(group__isnull=False)
            .annotate(
                total_attendances=Count("attendances"),
                excused_attendances=Count(
                    "attendances", filter=Q(attendances__attendancestate__excused=True)
                ),
            )
            .filter(total_attendances__gt=0, total_attendances=F("excused_attendances"))
        )

    def _rate(self, numerator: int, denominator: int) -> float:
        """
        Míra v procentech (1 desetinné místo); 0.0 pokud je jmenovatel nulový.
        """
        return round(numerator / denominator * 100, 1) if denominator else 0.0
