import re
from datetime import datetime, timedelta
from typing import Union, Optional, List

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, ExpressionWrapper, DateTimeField
from django.utils import timezone
from rest_framework import serializers
from rest_framework.settings import api_settings

from admin.models import Attendance, AttendanceState, Lecture, Course, Client, Group


class BaseValidators:
    """
    Základní validátory používané v serializerech pro metody validate_<field_name>.
    """

    @staticmethod
    def validate_phone(phone: str) -> str:
        """
        Ověří, že je telefonní číslo ve správném formátu, jinak vyhodí výjimku.
        """
        if phone and (not re.match(r"[0-9\s]+$", phone) or sum(c.isdigit() for c in phone) != 9):
            raise serializers.ValidationError("Telefonní číslo musí obsahovat 9 číslic")
        return phone

    @staticmethod
    def validate_course_is_visible(course: Course) -> Course:
        """
        Ověří, že je kurz viditelný, jinak vyhodí výjimku.
        """
        if not course.visible:
            raise serializers.ValidationError(
                "Zadaný kurz není viditelný. Buď jej nastavte jako viditelný, nebo vyberte jiný viditelný kurz."
            )
        return course

    @staticmethod
    def validate_client_is_active(client: Client) -> Client:
        """
        Ověří, že je klient aktivní, jinak vyhodí výjimku.
        """
        if not client.active:
            raise serializers.ValidationError(
                f"Zadaný klient ({client.surname} {client.firstname}) není aktivní, "
                "pro další akce je potřeba nastavit jej jako aktivního."
            )
        return client

    @staticmethod
    def validate_group_is_active(group: Group) -> Group:
        """
        Ověří, že je skupina aktivní, jinak vyhodí výjimku.
        """
        if not group.active:
            raise serializers.ValidationError(
                "Zadaná skupina není aktivní, pro další akce je potřeba nastavit ji jako aktivní."
            )
        return group


class BaseHelpers:
    """
    Základní pomocné funkce používané v serializerech.
    """

    @staticmethod
    def datetime_zone(datetime_obj: Union[datetime, None]) -> datetime:
        """
        Převede datum a čas na výchozí časovou zónu v nastavení Djanga.
        """
        return timezone.localtime(datetime_obj)

    @staticmethod
    def datetime_str(datetime_obj: datetime) -> str:
        """
        Vrátí řetězec se srozumitelným formátem datumu a času.
        """
        dt = BaseHelpers.datetime_zone(datetime_obj)
        return f"{dt.day}. {dt.month}. {dt.year} – {dt.hour}:{dt.minute:02}"

    @staticmethod
    def date_str(datetime_obj: Union[datetime, None]) -> str:
        """
        Vrátí řetězec se srozumitelným formátem datumu.
        """
        dt = BaseHelpers.datetime_zone(datetime_obj)
        return f"{dt.day}. {dt.month}. {dt.year}"


class LectureHelpers:
    """
    Pomocné funkce pro lekce a účasti na lekcích používané v serializerech.
    """

    @staticmethod
    def find_if_lecture_should_be_canceled(attendances: Union[dict, List[Attendance]]) -> bool:
        """
        Zjistí, zda má být lekce zrušená.
        Lekce má být zrušená pokud jsou všichni omluveni.
        Lekce bez účastníků zrušená není.
        """
        client_cnt = len(attendances)
        if client_cnt == 0:
            return False
        excused_cnt = 0
        for attendance in attendances:
            # muze prijit queryset i slovnik
            # pokud attendancestate znamena omluven, pricti jednicku k poctu omluvenych
            if (isinstance(attendance, dict) and attendance["attendancestate"].excused) or (
                isinstance(attendance, Attendance) and attendance.attendancestate.excused
            ):
                excused_cnt += 1
        return client_cnt == excused_cnt

    @staticmethod
    def lecture_corrections(
        lecture: Lecture,
        attendance: Attendance,
        prev_canceled: bool,
        prev_attendancestate: AttendanceState,
    ) -> None:
        """
        Zařídí vyrovnání předplacených lekcí vzhledem k platbám při omluvě/zrušení lekce ze strny lektorky.
        Pro skupinu se lekce přičítají k počítadlům předplacených lekcí,
        pro single lekce se vytváří speciální náhradní předplacená lekce.
        """
        # kdyz se zmenil stav ucasti na OMLUVEN a ma zaplaceno
        # NEBO pokud se lekce prave RUCNE zrusila, ale mel dorazit a ma zaplaceno, pricti mu jednu lekci
        if (
            attendance.attendancestate.excused
            and not prev_attendancestate.excused
            and attendance.paid
        ) or (
            not prev_canceled
            and lecture.canceled
            and attendance.attendancestate.default
            and attendance.paid
        ):
            if lecture.group is not None:
                # najdi clenstvi nalezici klientovi v teto skupine
                try:
                    membership = lecture.group.memberships.get(client=attendance.client)
                except ObjectDoesNotExist:
                    # pokud uz klient neni clenem skupiny, nic nedelej
                    pass
                else:
                    membership.prepaid_cnt = membership.prepaid_cnt + 1
                    membership.save()
            else:
                prepaid_lecture = Lecture.objects.create(
                    course=lecture.course, duration=lecture.course.duration, canceled=False
                )
                Attendance.objects.create(
                    paid=True,
                    client=attendance.client,
                    lecture=prepaid_lecture,
                    attendancestate=AttendanceState.objects.get(default=True),
                    note=f"Náhrada lekce ({BaseHelpers.date_str(lecture.start)})",
                )

    @staticmethod
    def refresh_clients_add(instance: Lecture, attendances_data: dict) -> None:
        """
        Projeví změny v klientech skupiny - přidá jim účasti.
        To znamená, že pokud do skupiny přibyl člen, který se ale nějaké lekce neúčastní,
        bude mu tato účast vytvořena.
        """
        if not instance.group:
            return
        # clenove skupiny, kteri nemaji u teto lekce ucast
        memberships = instance.group.memberships.exclude(
            client__pk__in=[client["client"].pk for client in attendances_data]
        )
        attendancestate_default = AttendanceState.objects.get(default=True)
        for membership in memberships:
            lecture_paid = False
            # kdyz lekce neni zrusena a ma nejake predplacene lekce, odecti jednu
            if not instance.canceled and membership.prepaid_cnt > 0:
                lecture_paid = True
                membership.prepaid_cnt = membership.prepaid_cnt - 1
                membership.save()
            Attendance.objects.create(
                client=membership.client,
                lecture=instance,
                paid=lecture_paid,
                attendancestate=attendancestate_default,
            )

    @staticmethod
    def is_group(data: dict, lecture: Optional[Lecture]) -> bool:
        """
        Zjistí, zda se jedná o skupinovou lekci.
        Vzhledem k tomu, že ID skupiny nemusí být udáno je potřeba jej případně dohledat v DB.
        """
        # zkontrolujeme pritomnost atributu group a jeho hodnotu (bud neni, je None nebo obsahuje ID skupiny)
        is_group = bool(data.get("group", False))
        # pro skupiny nemusime ID skupiny pri uprave uvest, priznak skupiny tedy muzeme nastavit dle stavajicich dat
        #   v DB prave tehdy, kdyz probiha uprava a nezasilame atribut group
        if lecture and not is_group and "group" not in data:
            is_group = lecture.group is not None
        return is_group

    @staticmethod
    def cancel_lecture_if_nobody_arrives(lecture: Lecture) -> None:
        """
        Nastaví lekci jako zrušenou pokud nikdo nemá přijít.
        Netýká se lekce bez účastníků.
        """
        # probihaly upravy na relational fields (attendances), je tedy potreba nacist znovu
        lecture.refresh_from_db()
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not lecture.canceled:
            lecture.canceled = LectureHelpers.find_if_lecture_should_be_canceled(
                list(lecture.attendances.all())
            )
            lecture.save()

    @staticmethod
    def validate_prepaid_non_changable_paid_state(attendance: dict) -> None:
        """
        Ověří, že se v účasti nemění platba na nezaplaceno.
        Používá se pro předplacené lekce.
        """
        if "paid" in attendance and not attendance["paid"]:
            raise serializers.ValidationError(
                {
                    api_settings.NON_FIELD_ERRORS_KEY: "Předplacenou lekci nelze nastavit jako nezaplacenou."
                }
            )

    @staticmethod
    def validate_course_presence(data: dict, lecture: Optional[Lecture], is_group: bool) -> None:
        """
        Ověří, že pro skupinovou lekci není zadaný nový kurz v datech, respektive pro single lekci
        je buď zadaný nový kurz, nebo už nějaký v DB je.
        Jinak vyhodí výjimku.
        """
        if not is_group and "course" not in data and not lecture:
            raise serializers.ValidationError(
                {"course_id": "Není uveden kurz, pro lekce jednotlivců je to povinné."}
            )
        elif is_group and "course" in data:
            raise serializers.ValidationError(
                {"course_id": "Pro skupiny se kurz neuvádí, protože se určí automaticky."}
            )

    @staticmethod
    def validate_attendants_count(data: dict, is_group: bool) -> None:
        """
        Zvaliduje počet účastníků lekce.
        """
        # single lekce musi mit jen jednoho ucastnika
        if not is_group and "attendances" in data and len(data["attendances"]) != 1:
            raise serializers.ValidationError(
                {"attendances": "Lekce pro jednotlivce musí mít jen jednoho účastníka."}
            )

    @staticmethod
    def validate_start_duration(data: dict) -> None:
        """
        Ověří, že se neposílá začátek lekce bez trvání lekce nebo naopak.
        Je potřeba mít oba údaje naráz pro výpočet časového konfliktu.
        """
        if ("start" in data and "duration" not in data) or (
            "start" not in data and "duration" in data
        ):
            raise serializers.ValidationError(
                {
                    api_settings.NON_FIELD_ERRORS_KEY: "Změnu počátku lekce a trvání je potřeba provádět naráz."
                }
            )

    @staticmethod
    def validate_canceled_attendances(data: dict) -> None:
        """
        Ověří, že se canceled vyskytuje spolu s attendances.
        Toto je potřeba pro dopočtení cancel_lecture_if_nobody_arrives při update.
        """
        if "canceled" in data and "attendances" not in data:
            raise serializers.ValidationError(
                {
                    api_settings.NON_FIELD_ERRORS_KEY: "Pro změnu zrušení lekce je potřeba zaslat zároveň i účasti."
                }
            )

    @staticmethod
    def validate_lecture_collision(data: dict, lecture: Optional[Lecture]) -> None:
        """
        Ověří, že lekce není v časovém konfliktu s ostatními lekcemi.
        Časový konflikt mezi lekcí v DB (lekce "A") a přidávanou novou lekcí (lekce "B") znamená:
            1) A začíná před koncem B a zároveň
            2) B začíná před koncem A.
        Při časovém konfliktu nebereme v úvahu zrušené lekce.

        Algoritmus vychází z: https://makandracards.com/makandra/984-test-if-two-date-ranges-overlap-in-ruby-or-rails.
        """
        # kdyz neni zacatek lekce a trvani NEBO se jedna o zrusenou lekci, casovy konflikt neresime
        if not ("start" in data and "duration" in data) or (
            ("canceled" in data and data["canceled"])
            or ("canceled" not in data and lecture and lecture.canceled)
        ):
            return

        # cas konce lekce
        end = data["start"] + timedelta(minutes=data["duration"])
        # z atributu vytvor dotaz na end, pro funkcni operaci potreba pronasobit timedelta
        expression = F("start") + (timedelta(minutes=1) * F("duration"))  # type: ignore
        # proved dotaz, vrat datetime
        end_db = ExpressionWrapper(expression, output_field=DateTimeField())
        # ke kazdemu zaznamu prirad hodnotu end_db ziskanou z vyrazu vyse a zjisti, zda existuji lekce v konfliktu
        qs = Lecture.objects.annotate(end_db=end_db).filter(
            start__lt=end, end_db__gt=data["start"], canceled=False
        )
        # pokud updatuju, pro hledani konfliktu ignoruju sam sebe
        if lecture:
            qs = qs.exclude(pk=lecture.pk)
        # pokud jsou nejake konflikty
        if qs.exists():
            for elem in list(qs):
                # tvorba errormsg
                err_datetime = BaseHelpers.datetime_str(elem.start)
                err_duration = str(elem.duration)
                if elem.group is not None:
                    err_obj = f"skupina {elem.group.name}"
                else:
                    client = elem.attendances.get().client
                    err_obj = f"klient {client.surname} {client.firstname}"
                raise serializers.ValidationError(
                    {
                        api_settings.NON_FIELD_ERRORS_KEY: (
                            "Časový konflikt s jinou lekcí: "
                            f"{err_obj} ({err_datetime}, trvání {err_duration} min.). Upravte datum a čas konání."
                        )
                    }
                )
