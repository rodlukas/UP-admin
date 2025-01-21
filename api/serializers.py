"""
Serializery - převádějí modely/querysety do jednoduchých Python struktur (ty lze pak
převést např. na JSON) a naopak včetně validace.

Poznámka:
 U polí serializerů se zde často použije kombinace např. client a client_id.
 Toto umožňuje při čtení (GET) zasílat vnořené informace (např. client)
 a při zápisu (PUT/POST/PATCH) přijímat pouze id (např. client_id), ke kterému se
 ale na základě propojení přes source="client" DRF chová jako k příslušnému objektu.
 Viz:   https://stackoverflow.com/a/33048798,
        https://groups.google.com/d/msg/django-rest-framework/5twgbh427uQ/4oEra8ogBQAJ
"""

from typing import Union, cast

from django.core.exceptions import ObjectDoesNotExist
from django.core.validators import RegexValidator
from django.db.models import Q
from rest_framework import serializers
from rest_framework.validators import UniqueValidator, UniqueTogetherValidator

from admin.models import (
    Application,
    Attendance,
    AttendanceState,
    Course,
    Client,
    Group,
    Lecture,
    Membership,
)
from api.serializers_helpers import BaseUtils, LectureHelpers, BaseValidators


class ClientSerializer(serializers.ModelSerializer[Client]):
    """
    Serializer pro klienta lektorky.
    """

    class Meta:
        model = Client
        fields = "__all__"

    def to_internal_value(self, data: dict) -> dict:
        """
        Sjednotí formát hodnot klienta:
            - odstraní mezery z telefonního čísla,
            - OMEZENÍ O19: nastaví velké první písmeno křestního jména a příjmení klienta.
        """
        values = super().to_internal_value(data)
        values["firstname"] = values["firstname"].capitalize()
        values["surname"] = values["surname"].capitalize()
        values["phone"] = "".join(values["phone"].split())
        return values

    @staticmethod
    def validate_phone(phone: str) -> str:
        """
        Zvaliduje telefonní číslo klienta.
        """
        return BaseValidators.validate_phone(phone)


class CourseSerializer(serializers.ModelSerializer[Course]):
    """
    Serializer pro kurz, na který mohou klienti v rámci lekcí docházet.
    """

    # nazev kurzu (znovuuvedeni kvuli validaci unikatnosti)
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=Course.objects.all())],
        help_text=BaseUtils.get_help_text(Course, "name"),
    )  # OMEZENÍ O17
    # barva kurzu (znovuuvedeni kvuli validaci formatu)
    color = serializers.CharField(
        validators=[
            RegexValidator(regex="^#(?:[0-9a-fA-F]{3}){1,2}$", message="Barva není v HEX formátu")
        ],  # OMEZENÍ O18: regex viz https://stackoverflow.com/a/1636354
        help_text=BaseUtils.get_help_text(Course, "color"),
    )

    class Meta:
        model = Course
        fields = "__all__"

    def to_internal_value(self, data: dict) -> dict:
        """
        Sjednotí formát barvy - velká písmena, 6 čísel.
        """
        values = super().to_internal_value(data)
        # prevod barvy na velka pismena
        values["color"] = values["color"].upper()
        # barva se 3 cisly se prevede na 6 cisel
        if len(values["color"]) != 7:
            values["color"] = "#{}".format("".join(2 * c for c in values["color"].lstrip("#")))
        return values


class MembershipSerializer(serializers.ModelSerializer[Membership]):
    """
    Serializer pro členství klienta ve skupině - používá se pro vnořené členství ve skupině.
    """

    # vnorene informace o klientovi (jen pro cteni)
    client = ClientSerializer(
        read_only=True, help_text=BaseUtils.get_help_text(Membership, "client")
    )
    # ID klienta (jen pro zapis)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source="client",
        write_only=True,
        help_text=BaseUtils.get_help_text(Membership, "client"),
    )

    class Meta:
        model = Membership
        exclude = ("group",)


class MembershipPlainSerializer(serializers.ModelSerializer[Client]):
    """
    Serializer pro členství klienta ve skupině - používá se pro samostatné operace se členstvím.
    """

    class Meta:
        model = Membership
        exclude = ("group", "client")


class GroupSerializer(serializers.ModelSerializer[Group]):
    """
    Serializer skupiny klientů nějakého kurzu.
    """

    # nazev skupiny (znovuuvedeni kvuli validaci unikatnosti)
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=Group.objects.all())],
        help_text=BaseUtils.get_help_text(Group, "name"),
    )  # OMEZENÍ O17
    # vnorene informace o clenstvich
    memberships = MembershipSerializer(many=True, help_text="Členství jednotlivých členů skupiny")
    # vnorene informace o kurzu (jen pro cteni)
    course = CourseSerializer(
        read_only=True,
        help_text=BaseUtils.get_help_text(Group, "course"),
    )
    # ID kurzu (jen pro zapis)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source="course",
        write_only=True,
        help_text=BaseUtils.get_help_text(Group, "course"),
    )

    class Meta:
        model = Group
        fields = "__all__"

    def create(self, validated_data: dict) -> Group:
        """
        Vytvoří skupinu a k ní příslušející členství klientů.
        """
        memberships_data = validated_data.pop("memberships")
        instance = super().create(validated_data)
        for membership_data in memberships_data:
            Membership.objects.create(group=instance, **membership_data)
        return instance

    def update(self, instance: Group, validated_data: dict) -> Group:
        """
        Upraví skupinu a k ní příslušející členství klientů.
        """
        memberships_data = validated_data.pop("memberships", None)
        # uprava instance skupiny
        instance = super().update(instance, validated_data)
        # upravy clenstvi
        if memberships_data is not None:
            memberships = instance.memberships.all()
            # smaz z DB clenstvi, ktera tam nemaji byt
            members_ids_old = [membership.client.pk for membership in memberships]
            members_ids_new = [membership_data["client"].pk for membership_data in memberships_data]
            memberships.exclude(client__pk__in=members_ids_new).delete()
            # dopln do DB zbyla clenstvi
            for membership_data in memberships_data:
                client = membership_data.pop("client")
                if client.pk not in members_ids_old:
                    Membership.objects.create(client=client, group=instance, **membership_data)
        return instance

    @staticmethod
    def validate_course_id(course: Course) -> Course:
        """
        Ověří, že je kurz viditelný.
        """
        return BaseValidators.validate_course_is_visible(course)


class AttendanceStateSerializer(serializers.ModelSerializer[AttendanceState]):
    """
    Serializer stavu účasti klienta na lekci.
    """

    # nazev stavu ucasti (znovuuvedeni kvuli validaci unikatnosti)
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=AttendanceState.objects.all())],  # OMEZENÍ O17
        help_text=BaseUtils.get_help_text(AttendanceState, "name"),
    )

    class Meta:
        model = AttendanceState
        fields = "__all__"


class ApplicationSerializer(serializers.ModelSerializer[Application]):
    """
    Serializer žádosti reprezentující zájem klienta o kurz.
    """

    # vnorene informace o klientovi (jen pro cteni)
    client = ClientSerializer(
        read_only=True, help_text=BaseUtils.get_help_text(Application, "client")
    )
    # ID klienta (jen pro zapis)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source="client",
        write_only=True,
        help_text=BaseUtils.get_help_text(Application, "client"),
    )
    # vnorene informace o kurzu (jen pro cteni)
    course = CourseSerializer(
        read_only=True, help_text=BaseUtils.get_help_text(Application, "course")
    )
    # ID kurzu (jen pro zapis)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source="course",
        write_only=True,
        help_text=BaseUtils.get_help_text(Application, "course"),
    )

    class Meta:
        model = Application
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=Application.objects.all(),
                fields=("course", "client"),
                message="Zájem klienta o zadaný kurz je již evidován.",
            )  # OMEZENÍ O17
        ]

    @staticmethod
    def validate_course_id(course: Course) -> Course:
        """
        Ověří, že je kurz viditelný.
        """
        return BaseValidators.validate_course_is_visible(course)


class AttendanceSerializer(serializers.ModelSerializer[Attendance]):
    """
    Serializer pro účast klienta na nějaké lekci.
    """

    # ID attendance - aby slo poslat pri updatu a dale s nim pracovat
    # (viz: https://stackoverflow.com/a/46525126/10045971)
    id = serializers.IntegerField(required=False)
    # vnorene informace o klientovi (jen pro cteni)
    client = ClientSerializer(
        read_only=True, help_text=BaseUtils.get_help_text(Attendance, "client")
    )
    # ID klienta (jen pro zapis)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source="client",
        write_only=True,
        help_text=BaseUtils.get_help_text(Attendance, "client"),
    )
    # info, zda je potreba pripomenout klientovi platbu priste (jen pro cteni)
    remind_pay = serializers.SerializerMethodField(
        help_text="Indikátor připomenutí platby za příští lekci"
    )
    # cislo lekce pro klienty skupiny
    number = serializers.SerializerMethodField(
        help_text="Číslo lekce daného klienta v rámci skupiny"
    )
    # + attendancestate vraci jen ID

    class Meta:
        model = Attendance
        exclude = ("lecture",)  # ochrana proti cykleni

    def to_representation(self, instance: Attendance) -> dict:
        """
        Při serializaci odstraní "number" pro lekce jednotlivců (využívá se jen pro skupiny).
        """
        ret = super().to_representation(instance)
        if not instance.lecture.group:
            ret.pop("number")
        return ret

    def update(self, instance: Attendance, validated_data: dict) -> Attendance:
        """
        Upraví účast a provede další nutné transformace dat.
        """
        attendancestate_old = instance.attendancestate
        canceled_old = instance.lecture.canceled
        # uprava instance ucasti
        instance = super().update(instance, validated_data)
        # proved korekce poctu predplacenych lekci
        LectureHelpers.lecture_corrections(
            instance.lecture, instance, canceled_old, attendancestate_old
        )
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        LectureHelpers.cancel_lecture_if_nobody_arrives(instance.lecture)
        return instance

    def validate(self, data: dict) -> dict:
        """
        Zvaliduje účast.
        """
        # u predplacene lekce nelze menit parametry platby
        if self.instance and self.instance.lecture.start is None:
            LectureHelpers.validate_prepaid_non_changable_paid_state(data)
        return data

    @staticmethod
    def get_number(obj: Attendance) -> Union[int, str, None]:
        """
        Vypočítá pořadové číslo lekce pro daného klienta skupiny.
        Pro jednotlivce se pole nezobrazuje, tedy neni treba nic pocitat.
        Pokud se nedá číslo dopočítat kvůli chybějícímu výchozímu stavu účasti, vrátí upozornění.
        """
        # pro lekce jednotlivcu pole neukazujeme, tedy nic neni treba pocitat
        if not obj.lecture.group:
            return None
        # proved vypocet poradoveho cisla pro ucastnika skupinove lekce
        try:
            # je potreba najit vychozi stav
            attendancestate_default_pk = LectureHelpers.find_default_state()
        except ObjectDoesNotExist:
            # pokud neni vychozi stav zvoleny, vrat misto toho upozorneni
            return LectureHelpers.DEFAULT_STATE_MISSING
        prev_lectures_cnt = Attendance.objects.filter(
            client=obj.client,
            lecture__course=obj.lecture.course,
            lecture__group=obj.lecture.group,
            lecture__start__lt=obj.lecture.start,
            lecture__canceled=False,
            attendancestate=attendancestate_default_pk,
        ).count()

        # vrat poradove cislo aktualni lekce (tedy +1 k poctu minulych lekci)
        return prev_lectures_cnt + 1

    @staticmethod
    def get_remind_pay(obj: Attendance) -> bool:
        """
        Vypočítá, zda je potřeba připomenout klientovi platbu příště.
        """
        # o predplacene a nezaplacene lekce se nezajimej
        if obj.lecture.start is None or obj.paid is False:
            return False
        # v pripade skupiny zkus vyuzit pocitadla predplacenych lekci
        if obj.lecture.group is not None:
            try:
                prepaid_cnt = cast(
                    int,
                    obj.lecture.group.memberships.values("prepaid_cnt").get(client=obj.client)[
                        "prepaid_cnt"
                    ],
                )
            except ObjectDoesNotExist:
                # klient uz neni clenem skupiny, pocitadlo predplacenych lekci nelze vyuzit
                pass
            else:
                # klient uz ma neco predplaceno, nic nepripominat
                if prepaid_cnt > 0:
                    return False
        # najdi pocet lekci pro kurz daneho klienta, ktere se konaji po teto lekci a jsou zaplacene
        res = (
            Attendance.objects.filter(
                client=obj.client,
                lecture__course=obj.lecture.course,
                paid=True,
                lecture__group=obj.lecture.group,
                lecture__canceled=False,
            )
            .filter(
                # ber v uvahu nejen budouci lekce ale take predplacene lekce
                Q(lecture__start__gt=obj.lecture.start)
                | Q(lecture__start__isnull=True)
            )
            .count()
        )
        # pokud je pocet dalsich zaplacenych lekci 0, vrat True, jinak False
        return not bool(res)


class LectureSerializer(serializers.ModelSerializer[Lecture]):
    """
    Serializer pro lekci klienta či skupiny náležící nějakému kurzu.
    """

    # vnorene informace o ucastech na lekci
    attendances = AttendanceSerializer(many=True, help_text="Účasti jednotlivých klientů na lekci")
    # vnorene informace o kurzu (jen pro cteni)
    course = CourseSerializer(read_only=True, help_text=BaseUtils.get_help_text(Lecture, "course"))
    # ID kurzu (jen pro zapis)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        source="course",
        write_only=True,
        required=False,
        help_text=BaseUtils.get_help_text(Lecture, "course"),
    )
    # vnorene informace o skupine (jen pro cteni)
    group = GroupSerializer(read_only=True, help_text=BaseUtils.get_help_text(Lecture, "group"))
    # ID skupiny (jen pro zapis)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source="group",
        write_only=True,
        required=False,
        allow_null=True,
        help_text=BaseUtils.get_help_text(Lecture, "group"),
    )
    # poradove cislo lekce (jen pro cteni)
    number = serializers.SerializerMethodField(help_text="Pořadové číslo lekce")
    # indikator, zda aktualizovat ucastniky dane lekce na (pouze) aktualni cleny skupiny
    refresh_clients = serializers.BooleanField(
        write_only=True,
        default=False,
        help_text="Indikátor, zda aktualizovat účastníky dané lekce jen na aktuální členy skupiny",
    )

    class Meta:
        model = Lecture
        fields = "__all__"

    @staticmethod
    def get_number(obj: Lecture) -> Union[int, str, None]:
        """
        Vypočítá pořadové číslo lekce.
        Pokud se jedná o předplacenou lekci, vrátí None.
        Pokud se nedá číslo dopočítat kvůli chybějícímu výchozímu stavu účasti, vrátí upozornění.
        """
        # vrat null pokud se jedna o predplacenou lekci
        if obj.start is None:
            return None
        # proved jednoduchy vypocet poradoveho cisla pro skupinu
        if obj.group is not None:
            prev_lectures_cnt = Lecture.objects.filter(
                group=obj.group, start__isnull=False, start__lt=obj.start, canceled=False
            ).count()
        else:
            # proved vypocet poradoveho cisla pro jednotlivce
            try:
                # je potreba najit vychozi stav
                attendancestate_default_pk = LectureHelpers.find_default_state()
            except ObjectDoesNotExist:
                # pokud neni vychozi stav zvoleny, vrat misto toho upozorneni
                return LectureHelpers.DEFAULT_STATE_MISSING
            prev_lectures_cnt = Attendance.objects.filter(
                client=obj.attendances.get().client_id,
                lecture__course=obj.course,
                lecture__start__isnull=False,
                lecture__group__isnull=True,
                lecture__start__lt=obj.start,
                lecture__canceled=False,
                attendancestate=attendancestate_default_pk,
            ).count()
        # vrat poradove cislo aktualni lekce (tedy +1 k poctu minulych lekci)
        return prev_lectures_cnt + 1

    def create(self, validated_data: dict) -> Lecture:
        """
        Vytvoří lekci a k ní příslušející účasti klientů, provede další nutné transformace.
        """
        # pro create se refresh_clients nepouziva, muzeme smazat
        validated_data.pop("refresh_clients")
        # vytvoreni instance lekce
        attendances_data = validated_data.pop("attendances")
        group = validated_data.pop("group", None)
        # kurz vezmi z dat, v pripade skupiny primo z ni
        course = validated_data.pop("course") if "course" in validated_data else group.course
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not validated_data["canceled"]:
            validated_data["canceled"] = LectureHelpers.find_if_lecture_should_be_canceled(
                attendances_data
            )
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        # vytvoreni jednotlivych ucasti
        for attendance_data in attendances_data:
            client = attendance_data.pop("client")
            # OMEZENÍ O8: pokud klient neni aktivni, nastav ho jako aktivniho
            if not client.active:
                client.active = True
                client.save()
            # OMEZENÍ O7: pokud se jedna o skupinu, proved korekce poctu predplacenych lekci
            if group is not None:
                # najdi clenstvi nalezici klientovi v teto skupine
                try:
                    membership = group.memberships.get(client=client)
                except ObjectDoesNotExist:
                    # pokud uz klient neni clenem skupiny, nic nedelej
                    pass
                else:
                    # pokud ma dorazit, lekce neni zrusena a ma nejake predplacene lekce, odecti jednu
                    if (
                        not instance.canceled
                        and attendance_data["attendancestate"].default
                        and membership.prepaid_cnt > 0
                    ):
                        attendance_data["paid"] = True
                        membership.prepaid_cnt = membership.prepaid_cnt - 1
                        membership.save()
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance

    def update(self, instance: Lecture, validated_data: dict) -> Lecture:
        """
        Upraví lekci a k ní příslušející účasti klientů, provede další nutné transformace.
        """
        canceled_old = instance.canceled
        attendances_data = validated_data.pop("attendances", None)
        # uprava instance lekce
        instance = super().update(instance, validated_data)
        # pokud nejsou zaslany ucasti, update konci
        if not attendances_data:
            return instance
        # upravy jednotlivych ucasti
        attendances = instance.attendances.all()
        refresh_clients = validated_data["refresh_clients"]
        for attendance_data in attendances_data:
            # najdi prislusnou ucast
            attendance = attendances.get(pk=attendance_data["id"])
            # projeveni zmen klientu skupiny (smazani ucasti)
            if instance.group and refresh_clients:
                # pokud ucastnik uz neni clenem skupiny, smaz jeho ucast a prejdi na dalsiho ucastnika
                try:
                    instance.group.memberships.get(client=attendance.client)
                except ObjectDoesNotExist:
                    attendance.delete()
                    continue
            # jedna se stale o clena skupiny (nebo neni pozadovano projeveni zmen klientu), proved prislusne upravy
            attendancestate_old = attendance.attendancestate
            # uprava ucasti
            attendance = super().update(attendance, attendance_data)
            # proved korekce poctu predplacenych lekci
            LectureHelpers.lecture_corrections(
                instance, attendance, canceled_old, attendancestate_old
            )
        # projeveni zmen klientu skupiny (pridani ucasti)
        if instance.group and refresh_clients:
            LectureHelpers.refresh_clients_add(instance, attendances_data)
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        LectureHelpers.cancel_lecture_if_nobody_arrives(instance)
        return instance

    @staticmethod
    def validate_group_id(group: Group) -> Group:
        """
        Ověří, že v případě skupinové lekce je skupina aktivní.
        """
        if group:
            BaseValidators.validate_group_is_active(group)
        return group

    def validate(self, data: dict) -> dict:
        """
        Zvaliduje lekci.
        """
        # skupina, ktere patri tato lekce
        is_group = LectureHelpers.is_group(data, self.instance)
        # validace kurzu
        LectureHelpers.validate_course_presence(data, self.instance, is_group)
        # validace poctu ucastniku lekce
        LectureHelpers.validate_attendants_count(data, is_group)
        # validace start & duration
        LectureHelpers.validate_start_duration(data, is_group)

        # pro nove predplacene lekce proved jen jednoduchou kontrolu (nelze menit parametry platby)
        if "start" in data and data["start"] is None:
            attendances = []
            if "attendances" in data:
                attendances = data["attendances"]
            elif self.instance:
                attendances = self.instance.attendances
            for attendance in attendances:
                LectureHelpers.validate_prepaid_non_changable_paid_state(attendance)
            return data

        # kontrola casoveho konfliktu
        LectureHelpers.validate_lecture_collision(data, self.instance)
        return data
