from admin.models import *
from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.validators import UniqueValidator, UniqueTogetherValidator
from django.db.models import F, ExpressionWrapper
from rest_framework.settings import api_settings
from datetime import timedelta
from django.db.models import Q
import re
from api import serializers_helpers


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

    def validate_phone(self, phone):
        if phone and (not re.match(r"[0-9\s]+$", phone) or sum(c.isdigit() for c in phone) is not 9):
            raise serializers.ValidationError("Telefonní číslo musí obsahovat 9 číslic")
        return phone


class CourseSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[UniqueValidator(queryset=Course.objects.all())])

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
    name = serializers.CharField(validators=[UniqueValidator(queryset=Group.objects.all())])
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
        instance.course = Course.objects.get(pk=validated_data.get('course', instance.course).pk)
        instance.save()
        # upravy clenstvi
        if 'memberships' in validated_data:
            memberships_data = validated_data['memberships']
            memberships = instance.memberships.all()
            # smaz z DB ty co tam nemaj byt
            current_members_ids = [membership.client.id for membership in memberships]
            new_members_ids = [membership_data['client'].pk for membership_data in memberships_data]
            memberships.exclude(client__pk__in=new_members_ids).delete()
            # dopln do DB zbyle
            for membership_data in memberships_data:
                client = Client.objects.get(pk=membership_data.pop('client').pk)
                if client.id not in current_members_ids:
                    Membership.objects.create(client=client, group=instance, **membership_data)
        return instance

    def validate_course_id(self, course):
        return serializers_helpers.validate_course_is_visible(course)


class AttendanceStateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[UniqueValidator(queryset=AttendanceState.objects.all())])

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
        validators = [
            UniqueTogetherValidator(
                queryset=Application.objects.all(),
                fields=('course', 'client'),
                message="Zájem klienta o zadaný kurz je již evidován."
            )
        ]

    def validate_course_id(self, course):
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
                # najdi clenstvi nalezici klientovi v teto skupine
                try:
                    membership = instance.lecture.group.memberships.get(client=instance.client)
                except ObjectDoesNotExist:
                    # pokud uz klient neni clenem skupiny, nic nedelej
                    pass
                else:
                    membership.prepaid_cnt = membership.prepaid_cnt + 1
                    membership.save()
            else:
                prepaid_lecture = Lecture.objects.create(course=instance.lecture.course, duration="30", canceled=False)
                Attendance.objects.create(paid=True, client=instance.client, lecture=prepaid_lecture,
                                          attendancestate=AttendanceState.objects.get(default=True),
                                          note=f"Náhrada lekce ({serializers_helpers.date_str(instance.lecture.start)})")
        # nastav lekci jako zrusenou pokud nikdo nema prijit
        if not instance.lecture.canceled:
            instance.lecture.canceled = self.should_be_canceled(instance.lecture.attendances.all())
            instance.lecture.save()
        return instance

    def validate(self, data):
        # u predplacene lekce nelze menit parametry platby
        if self.instance and self.instance.lecture.start is None:
            if 'paid' in data and not data['paid']:
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
        # najdi vsechny lekce klienta, ktere se tykaji prislusneho kurzu
        # a zjisti, zda existuje datumove po teto lekci dalsi zaplacena lekce
        res = Attendance.objects.filter(client=obj.client, lecture__course=obj.lecture.course, paid=True,
                                        lecture__group=obj.lecture.group, lecture__canceled=False)
        # ber v uvahu nejen budouci lekce ale take predplacene lekce
        res = res.filter(Q(lecture__start__gt=obj.lecture.start) | Q(lecture__start__isnull=True)).count()
        # pokud je pocet dalsich zaplacenych lekci 0, vrat True, jinak False
        return not bool(res)


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), source='course', write_only=True,
                                                   required=False, allow_null=True)
    group = GroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all(), source='group', write_only=True,
                                                  required=False, allow_null=True)
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
            cnt = Lecture.objects.filter(group=obj.group, start__isnull=False, start__lt=obj.start, canceled=False)
        else:
            try:
                attendancestate_default_pk = AttendanceState.objects.values('pk').get(default=True)['pk']
            except ObjectDoesNotExist:  # pokud neni zvoleny vychozi stav, vrat "??..."
                return "?? - je potřeba nastavit výchozí stav účasti"
            cnt = Attendance.objects.filter(client=obj.attendances.get().client.pk, lecture__course=obj.course,
                                            lecture__start__isnull=False, lecture__group__isnull=True,
                                            lecture__start__lt=obj.start, lecture__canceled=False,
                                            attendancestate=attendancestate_default_pk)
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
        group_data = validated_data.get('group', None)
        if group_data is not None:
            group = Group.objects.get(pk=group_data.pk)
        else:
            group = None
        if 'group' in validated_data:
            del validated_data['group']
        # pk kurzu vezmi z dat, pokud jde o skupinu tak primo z ni
        course_pk_obtain = validated_data.pop('course').pk if 'course' in validated_data else group.course.pk
        course = Course.objects.get(pk=course_pk_obtain)
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
                try:
                    membership = group.memberships.get(client=client)
                except ObjectDoesNotExist:
                    # pokud uz klient neni clenem skupiny, nic nedelej
                    pass
                else:
                    # kdyz ma dorazit, lekce neni zrusena a ma nejake predplacene lekce, odecti jednu
                    if not instance.canceled and attendance_data['attendancestate'].default:
                        if membership.prepaid_cnt > 0:
                            attendance_data.paid = True
                            membership.prepaid_cnt = membership.prepaid_cnt - 1
                            membership.save()
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance

    def update(self, instance, validated_data):
        prev_canceled = instance.canceled
        # uprava instance lekce
        instance.start = validated_data.get('start', instance.start)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.canceled = validated_data.get('canceled', instance.canceled)
        instance.course = Course.objects.get(pk=validated_data.get('course', instance.course).pk)
        group_data = validated_data.get('group', instance.group)
        if group_data is not None:
            instance.group = Group.objects.get(pk=group_data.pk)
        else:
            instance.group = None
        instance.save()
        if 'attendances' in validated_data:
            # upravy jednotlivych ucasti
            attendances_data = validated_data['attendances']
            attendances = instance.attendances.all()
            for attendance_data in attendances_data:
                attendance = attendances.get(pk=attendance_data['id'])
                prev_attendancestate = attendance.attendancestate
                # uprava ucasti
                attendance.paid = attendance_data['paid']
                attendance.client = Client.objects.get(pk=attendance_data['client'].pk)
                attendance.note = attendance_data['note']
                attendance.attendancestate = AttendanceState.objects.get(pk=attendance_data['attendancestate'].pk)
                attendance.save()
                # proved korekce poctu predplacenych lekci
                # kdyz se zmenil stav ucasti na OMLUVEN a ma zaplaceno
                # NEBO pokud se lekce prave RUCNE zrusila, ale mel dorazit a ma zaplaceno, pricti mu jednu lekci
                if (attendance.attendancestate.excused and not prev_attendancestate.excused and attendance.paid) \
                        or (not prev_canceled and instance.canceled
                            and attendance.attendancestate.default and attendance.paid):
                    if instance.group is not None:
                        # najdi clenstvi nalezici klientovi v teto skupine
                        try:
                            membership = instance.group.memberships.get(client=attendance.client)
                        except ObjectDoesNotExist:
                            # pokud uz klient neni clenem skupiny, nic nedelej
                            pass
                        else:
                            membership.prepaid_cnt = membership.prepaid_cnt + 1
                            membership.save()
                    else:
                        prepaid_lecture = Lecture.objects.create(course=instance.course, duration="30", canceled=False)
                        Attendance.objects.create(paid=True, client=attendance.client, lecture=prepaid_lecture,
                                                  attendancestate=AttendanceState.objects.get(default=True),
                                                  note=f"Náhrada lekce ({serializers_helpers.date_str(instance.start)})")
            # nastav lekci jako zrusenou pokud nikdo nema prijit
            if not instance.canceled:
                instance.canceled = self.should_be_canceled(attendances_data)
                instance.save()
        return instance

    def validate(self, data):
        # validace kurzu - pro skupiny nepovinny, pro jednotlivce povinny
        if not data.get('group', None) and 'course' not in data:
            raise serializers.ValidationError(
                {'course_id': "Není uveden kurz, pro lekce jednotlivců je to povinné."})
        elif data.get('group', None) and 'course' in data:
            raise serializers.ValidationError(
                {'course_id': "Pro skupiny se kurz neuvádí, protože se určí automaticky."})

        # pro zrusene lekce nic nekontroluj
        # tedy pokud je zaslana nova hodnota canceled a je True
        # NEBO pokud neni zaslana nova hodnota a aktualni je True
        if ('canceled' in data and data['canceled']) or ('canceled' not in data and self.instance.canceled):
            return data
        # pro nove predplacene lekce proved jednoduchou kontrolu (nelze menit parametry platby)
        if 'start' in data and data['start'] is None:
            attendances = data['attendances'] if ('attendances' in data) else self.instance.attendances
            for elem in attendances:
                if not elem['paid']:
                    raise serializers.ValidationError(
                        {api_settings.NON_FIELD_ERRORS_KEY: "U předplacené lekce nelze měnit parametry platby"})
            return data
        # pokud se meni duration/start, je potreba znat obe hodnoty, aby sel spocitat casovy konflikt
        if ('start' in data and 'duration' not in data) or ('start' not in data and 'duration' in data):
            raise serializers.ValidationError(
                {api_settings.NON_FIELD_ERRORS_KEY: "Změnu počátku lekce a trvání je potřeba provádět naráz"})
        # pokud se meni canceled, je potreba znat i attendances pro dopocteni should_be_canceled (metoda update)
        if 'canceled' in data and 'attendances' not in data:
            raise serializers.ValidationError(
                {api_settings.NON_FIELD_ERRORS_KEY: "Pro změnu zrušení lekce je potřeba zaslat zároveň i účasti"})
        # kontrola casoveho konfliktu
        elif 'start' in data and 'duration' in data:
            end = data['start'] + timedelta(minutes=data['duration'])
            # z atributu vytvor dotaz na end, pro funkcni operaci potreba pronasobit timedelta
            expression = F('start') + (timedelta(minutes=1) * F('duration'))
            # proved dotaz, vrat datetime
            end_db = ExpressionWrapper(expression, output_field=models.DateTimeField())
            # ke kazdemu zaznamu prirad hodnotu end_db ziskanou z vyrazu vyse a zjisti, zda existuji lekce v konfliktu
            qs = Lecture.objects.annotate(end_db=end_db).filter(start__lt=end, end_db__gt=data['start'])
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
                        err_obj = f"klient {client.surname} {client.name}"
                    error_msg = f"Časový konflikt s jinou lekcí: {err_obj} ({err_datetime}, trvání {err_duration} min.)"
                    raise serializers.ValidationError({api_settings.NON_FIELD_ERRORS_KEY: [error_msg]})
        return data
