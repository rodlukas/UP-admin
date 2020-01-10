import re
from datetime import timedelta

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, ExpressionWrapper, Q, DateTimeField
from rest_framework import serializers
from rest_framework.settings import api_settings
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
from api import serializers_helpers


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"

    @staticmethod
    def validate_phone(phone):
        if phone and (not re.match(r"[0-9\s]+$", phone) or sum(c.isdigit() for c in phone) != 9):
            raise serializers.ValidationError("Telefonní číslo musí obsahovat 9 číslic")
        return phone


class CourseSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[UniqueValidator(queryset=Course.objects.all())])

    class Meta:
        model = Course
        fields = "__all__"


class MembershipSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source="client", write_only=True
    )

    class Meta:
        model = Membership
        exclude = ("group",)


class GroupSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[UniqueValidator(queryset=Group.objects.all())])
    memberships = MembershipSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = Group
        fields = "__all__"

    def create(self, validated_data):
        memberships_data = validated_data.pop("memberships")
        instance = Group.objects.create(**validated_data)
        for membership_data in memberships_data:
            Membership.objects.create(
                client=membership_data.pop("client"), group=instance, **membership_data
            )
        return instance

    def update(self, instance, validated_data):
        # vytvoreni instance skupiny
        instance.name = validated_data.get("name", instance.name)
        instance.course = validated_data.get("course", instance.course)
        instance.active = validated_data.get("active", instance.active)
        instance.save()
        # upravy clenstvi
        if "memberships" in validated_data:
            memberships_data = validated_data["memberships"]
            memberships = instance.memberships.all()
            # smaz z DB ty co tam nemaj byt
            current_members_ids = [membership.client.pk for membership in memberships]
            new_members_ids = [membership_data["client"].pk for membership_data in memberships_data]
            memberships.exclude(client__pk__in=new_members_ids).delete()
            # dopln do DB zbyle
            for membership_data in memberships_data:
                client = membership_data.pop("client")
                if client.pk not in current_members_ids:
                    Membership.objects.create(client=client, group=instance, **membership_data)
        return instance

    @staticmethod
    def validate_course_id(course):
        return serializers_helpers.validate_course_is_visible(course)


class AttendanceStateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        validators=[UniqueValidator(queryset=AttendanceState.objects.all())]
    )

    class Meta:
        model = AttendanceState
        fields = "__all__"


class ApplicationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source="client", write_only=True
    )
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = Application
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=Application.objects.all(),
                fields=("course", "client"),
                message="Zájem klienta o zadaný kurz je již evidován.",
            )
        ]

    @staticmethod
    def validate_course_id(course):
        return serializers_helpers.validate_course_is_visible(course)


class AttendanceSerializer(serializers.ModelSerializer):
    # client - pro GET, vypise vsechny informace o klientovi
    # client_id - pro PUT/POST
    #   -   source='client' spolu s queryset zarizuje, ze staci zaslat v pozadavku "client_id" : <id> a
    #       serializer se bude k tomuto udaji chovat jako k objektu client (jako o radek vyse) bez nutnosti
    #       jakkoliv prepisovat serializer a upravovat client na client_id apod.
    #   -   podle:  https://stackoverflow.com/a/33048798,
    #               https://groups.google.com/d/msg/django-rest-framework/5twgbh427uQ/4oEra8ogBQAJ
    id = serializers.IntegerField(required=False)  # aby slo poslat pri updatu i ID attendance
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(), source="client", write_only=True
    )
    remind_pay = serializers.SerializerMethodField(read_only=True)

    # + attendancestate vraci jen ID

    class Meta:
        model = Attendance
        exclude = ("lecture",)  # ochrana proti cykleni

    def update(self, instance, validated_data):
        prev_attendancestate = instance.attendancestate
        prev_canceled = instance.lecture.canceled
        # uprava ucasti
        instance.client = validated_data.get("client", instance.client)
        instance.lecture = validated_data.get("lecture", instance.lecture)
        instance.attendancestate = validated_data.get("attendancestate", instance.attendancestate)
        instance.paid = validated_data.get("paid", instance.paid)
        instance.note = validated_data.get("note", instance.note)
        instance.save()
        # proved korekce poctu predplacenych lekci
        serializers_helpers.lecture_corrections(
            instance.lecture, instance, prev_canceled, prev_attendancestate
        )
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        serializers_helpers.lecture_cancellability(instance.lecture)
        return instance

    def validate(self, data):
        # u predplacene lekce nelze menit parametry platby
        if self.instance and self.instance.lecture.start is None:
            serializers_helpers.validate_prepaid_non_changable_paid_state(data)
        return data

    @staticmethod
    def get_remind_pay(obj):
        # o predplacene a nezaplacene lekce se nezajimej
        if obj.lecture.start is None or obj.paid is False:
            return False
        if obj.lecture.group is not None:
            try:
                prepaid_cnt = obj.lecture.group.memberships.values("prepaid_cnt").get(
                    client=obj.client
                )["prepaid_cnt"]
            except ObjectDoesNotExist:
                pass
            else:
                if prepaid_cnt > 0:
                    return False
        # najdi vsechny lekce klienta, ktere se tykaji prislusneho kurzu
        # a zjisti, zda existuje datumove po teto lekci dalsi zaplacena lekce
        res = Attendance.objects.filter(
            client=obj.client,
            lecture__course=obj.lecture.course,
            paid=True,
            lecture__group=obj.lecture.group,
            lecture__canceled=False,
        )
        # ber v uvahu nejen budouci lekce ale take predplacene lekce
        res = res.filter(
            Q(lecture__start__gt=obj.lecture.start) | Q(lecture__start__isnull=True)
        ).count()
        # pokud je pocet dalsich zaplacenych lekci 0, vrat True, jinak False
        return not bool(res)


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True, required=False
    )
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        source="group",
        write_only=True,
        required=False,
        allow_null=True,
    )
    count = serializers.SerializerMethodField(read_only=True)
    refresh_clients = serializers.BooleanField(
        write_only=True, default=False
    )  # pro aktualizaci ucastniku dane lekce vzhledem k aktualnim clenum skupiny

    class Meta:
        model = Lecture
        fields = "__all__"

    @staticmethod
    def get_count(obj):
        # vrat null pokud se jedna o predplacenou lekci
        if obj.start is None:
            return None
        if obj.group is not None:
            cnt = Lecture.objects.filter(
                group=obj.group, start__isnull=False, start__lt=obj.start, canceled=False
            )
        else:
            try:
                attendancestate_default_pk = AttendanceState.objects.values("pk").get(default=True)[
                    "pk"
                ]
            except ObjectDoesNotExist:  # pokud neni zvoleny vychozi stav, vrat upozorneni
                return "⚠ není zvolen výchozí stav účasti – vizte nastavení"
            cnt = Attendance.objects.filter(
                client=obj.attendances.get().client_id,
                lecture__course=obj.course,
                lecture__start__isnull=False,
                lecture__group__isnull=True,
                lecture__start__lt=obj.start,
                lecture__canceled=False,
                attendancestate=attendancestate_default_pk,
            )
        return cnt.count() + 1  # +1 aby prvni kurz nebyl jako 0.

    def create(self, validated_data):
        validated_data.pop("refresh_clients", None)  # pro create se tento klic nepouziva
        # vytvoreni instance lekce
        attendances_data = validated_data.pop("attendances")
        group = validated_data.pop("group", None)
        # kurz vezmi z dat, pokud jde o skupinu tak primo z ni
        course = validated_data.pop("course") if "course" in validated_data else group.course
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not validated_data["canceled"]:
            validated_data["canceled"] = serializers_helpers.should_be_canceled(attendances_data)
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        # vytvoreni jednotlivych ucasti
        for attendance_data in attendances_data:
            client = attendance_data.pop("client")
            # pokud se jedna o skupinu, proved korekce poctu predplacenych lekci
            if group is not None:
                # najdi clenstvi nalezici klientovi v teto skupine
                try:
                    membership = group.memberships.get(client=client)
                except ObjectDoesNotExist:
                    # pokud uz klient neni clenem skupiny, nic nedelej
                    pass
                else:
                    # kdyz ma dorazit, lekce neni zrusena a ma nejake predplacene lekce, odecti jednu
                    if (
                        not instance.canceled
                        and attendance_data["attendancestate"].default
                        and membership.prepaid_cnt > 0
                    ):
                        attendance_data.paid = True
                        membership.prepaid_cnt = membership.prepaid_cnt - 1
                        membership.save()
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance

    def update(self, instance, validated_data):
        prev_canceled = instance.canceled
        # uprava instance lekce
        instance.start = validated_data.get("start", instance.start)
        instance.duration = validated_data.get("duration", instance.duration)
        instance.canceled = validated_data.get("canceled", instance.canceled)
        instance.course = validated_data.get("course", instance.course)
        instance.group = validated_data.get("group", instance.group)
        instance.save()

        if "attendances" in validated_data:
            # upravy jednotlivych ucasti
            attendances_data = validated_data["attendances"]
            attendances = instance.attendances.all()
            refresh_clients = validated_data.get("refresh_clients")
            for attendance_data in attendances_data:
                attendance = attendances.get(pk=attendance_data["id"])
                # projeveni zmen klientu skupiny (smazani)
                if instance.group and refresh_clients:
                    # pokud ucastnik uz neni clenem skupiny, smaz jeho ucast a prejdi na dalsiho ucastnika
                    try:
                        instance.group.memberships.get(client=attendance.client)
                    except ObjectDoesNotExist:
                        attendance.delete()
                        continue
                # jedna se stale o clena skupiny (nebo neni pozadovano projeveni zmen klientu), proved prislusne upravy
                prev_attendancestate = attendance.attendancestate
                # uprava ucasti
                attendance.paid = attendance_data["paid"]
                attendance.client = attendance_data["client"]
                attendance.note = attendance_data["note"]
                attendance.attendancestate = attendance_data["attendancestate"]
                attendance.save()
                # proved korekce poctu predplacenych lekci
                serializers_helpers.lecture_corrections(
                    instance, attendance, prev_canceled, prev_attendancestate
                )
            # projeveni zmen klientu skupiny (pridani)
            if instance.group and refresh_clients:
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
            # nastav lekci jako zrusenou pokud nikdo nema prijit
            serializers_helpers.lecture_cancellability(instance)
        return instance

    def validate_attendances(self, attendances):
        # vsichni klienti musi byt aktivni, platne pouze pro vytvareni lekci
        if not self.instance:
            for attendance in attendances:
                serializers_helpers.validate_client_is_active(attendance["client"])
        return attendances

    @staticmethod
    def validate_group_id(group):
        # pokud je zaslana skupina, zvaliduj ji
        if group:
            serializers_helpers.validate_group_is_active(group)
        return group

    def validate(self, data):
        # validujeme neco, co ma byt skupina?
        # zkontrolujeme pritomnost atributu group a jeho hodnotu (bud neni, je None nebo obsahuje ID skupiny)
        is_group = bool(data.get("group", False))
        # pro skupiny nemusime ID skupiny pri uprave uvest, priznak skupiny tedy muzeme nastavit dle stavajicich dat
        #   v DB prave tehdy, kdyz probiha uprava a nezasilame atribut group
        if self.instance and not is_group and "group" not in data:
            is_group = self.instance.group is not None

        # validace kurzu - pro skupiny nezasilat, pro jednotlivce povinny
        if not is_group and "course" not in data:
            raise serializers.ValidationError(
                {"course_id": "Není uveden kurz, pro lekce jednotlivců je to povinné."}
            )
        elif is_group and "course" in data:
            raise serializers.ValidationError(
                {"course_id": "Pro skupiny se kurz neuvádí, protože se určí automaticky."}
            )

        # single lekce musi mit jen jednoho ucastnika
        if not is_group and "attendances" in data and len(data["attendances"]) != 1:
            raise serializers.ValidationError(
                {"attendances": "Lekce pro jednotlivce musí mít jen jednoho účastníka."}
            )

        # pro zrusene lekce nic nekontroluj
        # tedy pokud je zaslana nova hodnota canceled a je True
        # NEBO pokud neni zaslana nova hodnota a aktualni je True
        if ("canceled" in data and data["canceled"]) or (
            "canceled" not in data and self.instance.canceled
        ):
            return data
        # pro nove predplacene lekce proved jednoduchou kontrolu (nelze menit parametry platby)
        if "start" in data and data["start"] is None:
            attendances = (
                data["attendances"] if ("attendances" in data) else self.instance.attendances
            )
            for attendance in attendances:
                serializers_helpers.validate_prepaid_non_changable_paid_state(attendance)
            return data
        # pokud se meni duration/start, je potreba znat obe hodnoty, aby sel spocitat casovy konflikt
        if ("start" in data and "duration" not in data) or (
            "start" not in data and "duration" in data
        ):
            raise serializers.ValidationError(
                {
                    api_settings.NON_FIELD_ERRORS_KEY: "Změnu počátku lekce a trvání je potřeba provádět naráz"
                }
            )
        # pokud se meni canceled, je potreba znat i attendances pro dopocteni should_be_canceled (metoda update)
        if "canceled" in data and "attendances" not in data:
            raise serializers.ValidationError(
                {
                    api_settings.NON_FIELD_ERRORS_KEY: "Pro změnu zrušení lekce je potřeba zaslat zároveň i účasti"
                }
            )
        # kontrola casoveho konfliktu
        elif "start" in data and "duration" in data:
            end = data["start"] + timedelta(minutes=data["duration"])
            # z atributu vytvor dotaz na end, pro funkcni operaci potreba pronasobit timedelta
            expression = F("start") + (timedelta(minutes=1) * F("duration"))
            # proved dotaz, vrat datetime
            end_db = ExpressionWrapper(expression, output_field=DateTimeField())
            # ke kazdemu zaznamu prirad hodnotu end_db ziskanou z vyrazu vyse a zjisti, zda existuji lekce v konfliktu
            qs = Lecture.objects.annotate(end_db=end_db).filter(
                start__lt=end, end_db__gt=data["start"]
            )
            # pokud updatuju, proveruji pouze ostatni lekce
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                for elem in list(qs):
                    # do konfliktu nezapocitavej zrusene lekce
                    if elem.canceled:
                        continue
                    # tvorba errormsg
                    err_datetime = serializers_helpers.datetime_str(elem.start)
                    err_duration = str(elem.duration)
                    if elem.group is not None:
                        err_obj = f"skupina {elem.group.name}"
                    else:
                        client = elem.attendances.get().client
                        err_obj = f"klient {client.surname} {client.firstname}"
                    error_msg = f"Časový konflikt s jinou lekcí: {err_obj} ({err_datetime}, trvání {err_duration} min.). Upravte datum a čas konání."
                    raise serializers.ValidationError(
                        {api_settings.NON_FIELD_ERRORS_KEY: [error_msg]}
                    )
        return data
