from admin.models import *
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, ExpressionWrapper
from rest_framework.settings import api_settings
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class MembershipSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)

    class Meta:
        model = Membership
        exclude = 'group',


class GroupSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)

    class Meta:
        model = Group
        fields = '__all__'

    def create(self, validated_data):
        memberships_data = validated_data.pop('memberships')
        instance = Group.objects.create(**validated_data)
        for membership_data in memberships_data:
            client = Client.objects.get(pk=membership_data.pop('client').pk)
            Membership.objects.create(client=client, group=instance, **membership_data)
        return instance

    def update(self, instance, validated_data):
        # vytvoreni instance skupiny
        instance.name = validated_data.get('name', instance.name)
        instance.course = Course.objects.get(pk=validated_data.pop('course').pk)
        instance.save()
        # upravy clenstvi
        memberships_data = validated_data.pop('memberships')
        memberships = instance.memberships.all()
        # smaz z DB ty co tam nemaj byt
        current_clients = []
        for membership in memberships:
            current_clients.append(membership.client.id)
        new_clients = []
        for membership_data in memberships_data:
            new_clients.append(membership_data.get('client').pk)
        memberships.exclude(client__pk__in=new_clients).delete()
        # dopln do DB zbyle
        for membership_data in memberships_data:
            client = Client.objects.get(pk=membership_data.pop('client').pk)
            try:
                memberships.get(client=client)
            except ObjectDoesNotExist:
                Membership.objects.create(client=client, group=instance, **membership_data)
        return instance


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class ApplicationSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)

    class Meta:
        model = Application
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    """ client - pro GET, vypise vsechny informace o klientovi
     client_id - pro PUT/POST
               - source='client' spolu s queryset zarizuje, ze staci zaslat v pozadavku "client_id" : <id> a
                 serializer se bude k tomuto udaji chovat jako k objektu client (jako o radek vyse) bez nutnosti
                 jakkoliv prepisovat serializer a upravovat client na client_id apod.
               - podle https://stackoverflow.com/a/33048798
                       https://groups.google.com/d/msg/django-rest-framework/5twgbh427uQ/4oEra8ogBQAJ"""
    id = serializers.IntegerField(required=False)  # aby slo poslat pri updatu i ID attendance
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)
    remind_pay = serializers.SerializerMethodField(read_only=True)
    # + attendancestate vraci jen ID

    class Meta:
        model = Attendance
        exclude = 'lecture',  # ochrana proti cykleni

    # zaridi, ze lekce bude zrusena pokud jsou vsichni omluveni
    @staticmethod
    def should_be_canceled(attendances):
        client_cnt = len(attendances)
        excused_cnt = 0
        for attendance in attendances:
            if attendance.attendancestate.excused:
                excused_cnt += 1
        return client_cnt == excused_cnt

    def update(self, instance, validated_data):
        prev_attendancestate = instance.attendancestate
        prev_canceled = instance.lecture.canceled
        instance.client = Client.objects.get(pk=validated_data.get('client', instance.client).pk)
        instance.lecture = Lecture.objects.get(pk=validated_data.get('lecture', instance.lecture).pk)
        instance.attendancestate = AttendanceState.objects.get(
            pk=validated_data.get('attendancestate', instance.attendancestate).pk)
        instance.paid = validated_data.get('paid', instance.paid)
        instance.note = validated_data.get('note', instance.note)
        instance.save()
        # proved korekce poctu predplacenych lekci
        # kdyz se zmenil stav ucasti na OMLUVEN a ma zaplaceno
        # NEBO pokud se lekce prave RUCNE zrusila, ale mel dorazit a ma zaplaceno, pricti mu jednu lekci
        if (instance.attendancestate.excused and not prev_attendancestate.excused and instance.paid) \
                or (not prev_canceled and instance.lecture.canceled
                    and instance.attendancestate.default and instance.paid):
            if instance.lecture.group is not None:
                membership = instance.lecture.group.memberships.get(client=instance.client)
                membership.prepaid_cnt = membership.prepaid_cnt + 1
                membership.save()
            else:
                prepaid_lecture = Lecture.objects.create(course=instance.lecture.course,
                                                         duration="30", canceled=False)
                Attendance.objects.create(paid=True, client=instance.client, lecture=prepaid_lecture,
                                          attendancestate=AttendanceState.objects.get(default=True),
                                          note="Náhrada lekce")
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not instance.lecture.canceled:
            instance.lecture.canceled = self.should_be_canceled(instance.lecture.attendances.all())
            instance.lecture.save()
        return instance

    def validate(self, data):
        # u predplacene lekce nelze menit parametry platby
        if self.instance and self.instance.lecture.start is None:
            if data['paid'] is False:
                raise serializers.ValidationError(
                    {api_settings.NON_FIELD_ERRORS_KEY: "U předplacené lekce nelze měnit parametry platby"})
        return data

    @staticmethod
    def get_remind_pay(obj):
        # o predplacene a nezaplacene lekce se nezajimej
        if obj.lecture.start is None or obj.paid is False:
            return False
        if obj.lecture.group is not None:
            try:
                prepaid_cnt = obj.lecture.group.memberships.values('prepaid_cnt').get(client=obj.client)['prepaid_cnt']
            except ObjectDoesNotExist:
                pass
            else:
                if prepaid_cnt > 0:
                    return False
        # najdi vsechny lekce klienta, ktere se tykaji prislusneho kurzu a zjisti, zda existuje datumove po teto lekci dalsi zaplacena lekce
        res = Attendance.objects.filter(client=obj.client, lecture__course=obj.lecture.course,
                                        lecture__group=obj.lecture.group, paid=True, lecture__canceled=False)
        # ber v uvahu nejen budouci lekce ale take predplacene lekce
        res = res.filter(Q(lecture__start__gt=obj.lecture.start) | Q(lecture__start__isnull=True)).count()
        # pokud je pocet dalsich zaplacenych lekci 0, vrat True, jinak False
        return not bool(res)


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), source='group', write_only=True,
                                                  required=False)
    count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lecture
        fields = '__all__'

    @staticmethod
    def get_count(obj):
        # vrat null pokud se jedna o predplacenou lekci
        if obj.start is None:
            return None
        if obj.group is not None:
            cnt = Lecture.objects.filter(group=obj.group, start__isnull=False,
                                         start__lt=obj.start, canceled=False)
        else:
            try:
                attendancestate_default_pk = AttendanceState.objects.values('pk').get(default=True)['pk']
            except ObjectDoesNotExist:  # pokud neni zvoleny vychozi stav, vrat "??..."
                return "?? - je potřeba nastavit výchozí stav účasti"
            else:
                cnt = Attendance.objects.filter(client=obj.attendances.get().client.pk, lecture__course=obj.course,
                                                lecture__start__isnull=False, lecture__group__isnull=True,
                                                lecture__start__lt=obj.start,
                                                attendancestate=attendancestate_default_pk, lecture__canceled=False)
        return cnt.count() + 1  # +1 aby prvni kurz nebyl jako 0.

    # zaridi, ze lekce bude zrusena pokud jsou vsichni omluveni
    # (z frontendu by jiz melo prijit pripravene, ale pro konzistenci je kontrola radeji i zde)
    @staticmethod
    def should_be_canceled(attendances_data):
        client_cnt = len(attendances_data)
        excused_cnt = 0
        for attendance in attendances_data:
            if attendance.get('attendancestate').excused:
                excused_cnt += 1
        return client_cnt == excused_cnt

    def create(self, validated_data):
        # vytvoreni instance lekce
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').pk)
        group = None
        if 'group' in validated_data:
            group = Group.objects.get(pk=validated_data.pop('group').pk)
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not validated_data['canceled']:
            validated_data['canceled'] = self.should_be_canceled(attendances_data)
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        # vytvoreni jednotlivych ucasti
        for attendance_data in attendances_data:
            client = Client.objects.get(pk=attendance_data.pop('client').pk)
            # pokud se jedna o skupinu, proved korekce poctu predplacenych lekci
            if group is not None:
                # najdi clenstvi nalezici klientovi v teto skupine
                membership = group.memberships.get(client=client)
                # kdyz ma dorazit, lekce neni zrusena a ma nejake predplacene lekce, odecti jednu
                if not instance.canceled and attendance_data['attendancestate'].default:
                    if membership.prepaid_cnt > 0:
                        attendance_data.paid = True
                        membership.prepaid_cnt = membership.prepaid_cnt - 1
                        membership.save()
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance
        # vypis: for k, v in validated_data.items(): print(k, v)

    def update(self, instance, validated_data):
        attendances_data = validated_data.pop('attendances')
        # uprava instance lekce
        group = None
        if 'group' in validated_data:
            group = Group.objects.get(pk=validated_data.pop('group').pk)
        prev_canceled = instance.canceled
        instance.start = validated_data.get('start')
        instance.duration = validated_data.get('duration', instance.duration)
        instance.canceled = validated_data.get('canceled', instance.canceled)
        instance.course = Course.objects.get(pk=validated_data.pop('course').pk)
        instance.group = group
        instance.save()
        # upravy jednotlivych ucasti
        attendances = instance.attendances.all()
        for attendance_data in attendances_data:
            attendance = attendances.get(pk=attendance_data['id'])
            prev_attendancestate = attendance.attendancestate
            attendance.paid = attendance_data.get('paid', attendance.paid)
            attendance.client = Client.objects.get(pk=attendance_data['client'].pk)
            attendance.note = attendance_data.get('note', attendance.note)
            attendance.attendancestate = AttendanceState.objects.get(pk=attendance_data['attendancestate'].pk)
            attendance.save()
            # proved korekce poctu predplacenych lekci
            # kdyz se zmenil stav ucasti na OMLUVEN a ma zaplaceno
            # NEBO pokud se lekce prave RUCNE zrusila, ale mel dorazit a ma zaplaceno, pricti mu jednu lekci
            if (attendance.attendancestate.excused and not prev_attendancestate.excused and attendance.paid) \
                    or (not prev_canceled and instance.canceled
                        and attendance.attendancestate.default and attendance.paid):
                if group is not None:
                    # najdi clenstvi nalezici klientovi v teto skupine
                    membership = group.memberships.get(client=attendance.client)
                    membership.prepaid_cnt = membership.prepaid_cnt + 1
                    membership.save()
                else:
                    prepaid_lecture = Lecture.objects.create(course=instance.course,
                                                             duration="30", canceled=False)
                    Attendance.objects.create(paid=True, client=attendance.client, lecture=prepaid_lecture,
                                              attendancestate=AttendanceState.objects.get(default=True),
                                              note="Náhrada lekce")
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not instance.canceled:
            instance.canceled = self.should_be_canceled(attendances_data)
            instance.save()
        return instance

    def validate(self, data):
        # pro zrusene lekce nic nekontroluj
        if data['canceled']:
            return data
        # pro predplacene lekce proved jednoduchou kontrolu (nelze menit parametry platby)
        if 'start' not in data:
            for elem in data['attendances']:
                if elem['paid'] is False:
                    raise serializers.ValidationError(
                        {api_settings.NON_FIELD_ERRORS_KEY: "U předplacené lekce nelze měnit parametry platby"})
            return data
        # kontrola casoveho konfliktu
        end = data['start'] + timedelta(minutes=data['duration'])
        # z atributu vytvor dotaz na end, pro funkcni operaci potreba pronasobit timedelta
        expression = F('start') + (timedelta(minutes=1) * F('duration'))
        # proved dotaz, vrat datetime
        end_db = ExpressionWrapper(expression, output_field=models.DateTimeField())
        # ke kazdemu zaznamu prirad hodnotu end_db ziskanou diky vyrazum vyse,
        #   zjisti, zda existuji lekce v konfliktu
        qs = Lecture.objects \
            .annotate(end_db=end_db) \
            .filter(start__lt=end, end_db__gt=data['start'])
        if self.instance:  # pokud updatuju, proveruji pouze ostatni lekce
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            for elem in list(qs):
                # do konfliktu nezapocitavej zrusene lekce
                if elem.canceled:
                    continue
                # prevod na spravnou TZ
                local_dt = timezone.localtime(elem.start)
                # tvorba errormsg
                err_datetime = local_dt.strftime("%d. %m. %Y - %H:%M")
                err_duration = str(elem.duration)
                err = 'Časový konflikt s jinou lekcí (' + err_datetime + ', trvání ' + err_duration + ' min.), '
                if elem.group is not None:
                    err += 'skupina ' + elem.group.name
                else:
                    client = elem.attendances.get().client
                    err += 'klient ' + client.surname + ' ' + client.name
                raise serializers.ValidationError({api_settings.NON_FIELD_ERRORS_KEY: [err]})
        return data
