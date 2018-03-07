from admin.models import *
from rest_framework import serializers
import json


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


#class MemberOfSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = MemberOf
#        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    #memberof = MemberOfSerializer(many=True)

    class Meta:
        model = Group
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class AttendanceStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceState
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        exclude = 'lecture',


class LectureSerializer(serializers.ModelSerializer):
    attendances = AttendanceSerializer(many=True)

    class Meta:
        model = Lecture
        fields = '__all__'

    def create(self, validated_data):
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').id)
        #for k, v in validated_data.items():
        #    print(k, v)
        group = Group.objects.get(pk=validated_data.pop('group').id)
        instance = Lecture.objects.create(course=course, group=group, **validated_data)
        for attendance_data in attendances_data:
            client = Client.objects.get(pk=attendance_data.pop('client').id)
            Attendance.objects.create(client=client, lecture=instance, **attendance_data)
        return instance

    def update(self, instance, validated_data):
        attendances_data = validated_data.pop('attendances')
        course = Course.objects.get(pk=validated_data.pop('course').id)
        group = Group.objects.get(pk=validated_data.pop('group').id)

        attendances = (instance.attendances).all()
        attendances = list(attendances)
        instance.start = validated_data.get('start', instance.start)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.course = course
        instance.group = group
        instance.save()

        for attendance_data in attendances_data:
            attendance = attendances.pop(0)
            attendance.paid = attendance_data.get('paid', attendance.paid)
            client = Client.objects.get(pk=attendance_data.pop('paid'))
            attendance.client = client
            attendance.note = attendance_data.get('note', attendance.note)
            attendancestate = AttendanceState.objects.get(pk=attendance.attendancestate_id)
            attendance.attendancestate = attendancestate
            attendance.save()

        return instance
