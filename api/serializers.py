from admin.models import *
from rest_framework import serializers


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class MembershipSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)

    class Meta:
        model = Membership
        exclude = 'group',


class GroupSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True)

    class Meta:
        model = Group
        fields = '__all__'

    def create(self, validated_data):
        memberships_data = validated_data.pop('memberships')
        instance = Group.objects.create(**validated_data)
        for membership_data in memberships_data:
            client = Client.objects.get(pk=membership_data.pop('client').id)
            Membership.objects.create(client=client, group=instance, **membership_data)
        return instance

    def update(self, instance, validated_data):
        memberships_data = validated_data.pop('memberships')
        memberships = instance.memberships.all()
        memberships = list(memberships)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        for membership_data in memberships_data:
            client = Client.objects.get(pk=membership_data.pop('client').id)
            # pokud jeste zbyvaji clenstvi, uprav je, jinak vytvor nove
            if len(list(memberships)):
                membership = memberships.pop(0)
                membership.client = client
                membership.start = membership_data.get('start', membership.start)
                membership.end = membership_data.get('end', membership.end)
                membership.save()
            else:
                Membership.objects.create(client=client, group=instance, **membership_data)
        # smazani zbylych clenstvi
        for membership in memberships:
            membership.delete()
        return instance


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    # client - pro GET, vypise vsechny informace o klientovi
    # client_id - pro PUT/POST
    #           - source='client' spolu s queryset zarizuje, ze staci zaslat v pozadavku "client_id" : <id> a
    #             serializer se bude k tomuto udaji chovat jako k objektu client (jako o radek vyse) bez nutnosti
    #             jakkoliv prepisovat serializer a upravovat client na client_id apod.
    #           - podle https://stackoverflow.com/a/33048798
    #                   https://groups.google.com/d/msg/django-rest-framework/5twgbh427uQ/4oEra8ogBQAJ
    client = ClientSerializer(read_only=True)
    client_id = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), source='client', write_only=True)
    attendancestate = AttendanceStateSerializer(read_only=True)
    attendancestate_id = serializers.PrimaryKeyRelatedField(queryset=AttendanceState.objects.all(), source='attendancestate', write_only=True)

    class Meta:
        model = Attendance
        exclude = 'lecture',


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
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').id)
        # for k, v in validated_data.items():
        #    print(k, v)
        group = None
        if group in validated_data:
            group = Group.objects.get(pk=group.id)
            validated_data.pop('group')
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        for attendance_data in attendances_data:
            client = Client.objects.get(pk=attendance_data.pop('client').id)
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance

    def update(self, instance, validated_data):
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').id)
        group = None
        if group in validated_data:
            group = Group.objects.get(pk=group.id)
            validated_data.pop('group')

        attendances = instance.attendances.all()
        attendances = list(attendances)
        instance.start = validated_data.get('start', instance.start)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.course = course
        instance.group = group
        instance.save()

        for attendance_data in attendances_data:
            attendance = attendances.pop(0)
            attendance.paid = attendance_data.get('paid', attendance.paid)
            client = Client.objects.get(pk=attendance_data.pop('client').id)
            attendance.client = client
            attendance.note = attendance_data.get('note', attendance.note)
            attendancestate = AttendanceState.objects.get(pk=attendance_data.pop('attendancestate').id)
            attendance.attendancestate = attendancestate
            attendance.save()
        return instance
