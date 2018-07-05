from admin.models import *
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F, ExpressionWrapper
from rest_framework.settings import api_settings
from datetime import timedelta
from django.utils import timezone


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
        # vytvoreni jednotlivych clenstvi
        memberships_data = validated_data.pop('memberships')
        memberships = list(instance.memberships.all())
        for membership_data in memberships_data:
            client = Client.objects.get(pk=membership_data.pop('client').pk)
            # pokud jeste zbyvaji clenstvi, uprav je, jinak vytvor nove
            if len(list(memberships)):
                membership = memberships.pop(0)
                membership.client = client
                membership.save()
            else:
                Membership.objects.create(client=client, group=instance, **membership_data)
        # smazani zbylych clenstvi
        for membership in memberships:
            membership.delete()
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
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)
    attendancestate = AttendanceStateSerializer(read_only=True)
    attendancestate_id = serializers.PrimaryKeyRelatedField(queryset=AttendanceState.objects.all(), source='attendancestate', write_only=True)
    count = serializers.SerializerMethodField(read_only=True)
    remind_pay = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Attendance
        exclude = 'lecture',  # ochrana proti cykleni

    @staticmethod
    def get_count(obj):
        # vrat null pokud se jedna o predplacenou lekci
        if obj.lecture.start is None:
            return None
        if obj.lecture.group is not None:
            cnt = Lecture.objects.filter(group=obj.lecture.group, start__isnull=False,
                                         start__lt=obj.lecture.start, canceled=False)
        else:
            try:
                default_state_id = AttendanceState.objects.get(default=True)
            except ObjectDoesNotExist:  # pokud neni zvoleny vychozi stav, vrat "??"
                return "?? - je potřeba nastavit výchozí stav účasti"
            default_state_id = default_state_id.pk  # pamatuj si pouze id vychoziho stavu
            cnt = Attendance.objects.filter(client=obj.client.pk, lecture__course=obj.lecture.course,
                                            lecture__start__isnull=False, lecture__group__isnull=True,
                                            lecture__start__lt=obj.lecture.start,
                                            attendancestate__pk=default_state_id, lecture__canceled=False)
        return cnt.count()+1  # +1 aby prvni kurz nebyl jako 0.

    @staticmethod
    def get_remind_pay(obj):
        # o predplacene a nezaplacene lekce se nezajimej
        if obj.lecture.start is None or obj.paid is False:
            return False
        # najdi vsechny lekce klienta, ktere se tykaji prislusneho kurzu a zjisti, zda existuje datumove po teto lekci dalsi zaplacena lekce
        res = Attendance.objects.filter(client=obj.client.pk, lecture__course=obj.lecture.course,
                                        lecture__group=obj.lecture.group, lecture__start__gt=obj.lecture.start,
                                        paid=True, lecture__canceled=False).count()
        # pokud je pocet dalsich zaplacenych lekci 0, vrat True, jinak False
        return not bool(res)


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True)
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), source='group', write_only=True, required=False)

    class Meta:
        model = Lecture
        fields = '__all__'

    def create(self, validated_data):
        # vytvoreni instance lekce
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').pk)
        group = None
        if 'group' in validated_data:
            group = Group.objects.get(pk=validated_data.pop('group').pk)
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        # vytvoreni jednotlivych ucasti
        for attendance_data in attendances_data:
            client = Client.objects.get(pk=attendance_data.pop('client').pk)
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance
        # vypis: for k, v in validated_data.items(): print(k, v)

    def update(self, instance, validated_data):
        # uprava instance lekce
        group = None
        if 'group' in validated_data:
            group = Group.objects.get(pk=validated_data.pop('group').pk)
        instance.start = validated_data.get('start')
        instance.duration = validated_data.get('duration', instance.duration)
        instance.canceled = validated_data.get('canceled', instance.canceled)
        instance.course = Course.objects.get(pk=validated_data.pop('course').pk)
        instance.group = group
        instance.save()
        # upravy jednotlivych ucasti
        attendances_data = validated_data.pop('attendances')
        attendances = list(instance.attendances.all())
        for attendance_data in attendances_data:
            attendance = attendances.pop(0)
            attendance.paid = attendance_data.get('paid', attendance.paid)
            attendance.client = Client.objects.get(pk=attendance_data.pop('client').pk)
            attendance.note = attendance_data.get('note', attendance.note)
            attendance.attendancestate = AttendanceState.objects.get(pk=attendance_data.pop('attendancestate').pk)
            attendance.save()
        return instance

    def validate(self, data):
        # pro predplacene lekce nic nekontroluj
        if 'start' not in data:
            return data
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
            elem = list(qs).pop(0)
            # prevod na spravnou TZ
            local_dt = timezone.localtime(elem.start)
            # tvorba errormsg
            err_datetime = local_dt.strftime("%d. %m. %Y - %H:%M")
            err_duration = str(elem.duration)
            err = 'Časový konflikt s jinou lekcí (' + err_datetime + ', trvání ' + err_duration + ' min.)'
            raise serializers.ValidationError({api_settings.NON_FIELD_ERRORS_KEY: [err]})
        return data
