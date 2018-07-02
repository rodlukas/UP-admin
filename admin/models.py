from django.db import models


class AttendanceState(models.Model):
    name = models.TextField()
    visible = models.BooleanField()
    default = models.BooleanField(default=False)    # metoda save() osetruje, aby bylo jen jedno True v DB

    class Meta:
        ordering = ['name']

    # pokud je default False, nastav ho na None, vsechny zaznamy budou tedy NULL nebo True (True diky unique jen jeden)
    def save(self, *args, **kwargs):
        if self.default:
            # vyber ostatni polozky s default=True
            qs = AttendanceState.objects.filter(default=True)
            # krome self (pokud self existuje)
            if self.pk:
                qs = qs.exclude(pk=self.pk)
            # a nastav jim default=False
            qs.update(default=False)
        super(AttendanceState, self).save(*args, **kwargs)


class Client(models.Model):
    name = models.TextField()
    surname = models.TextField()
    phone = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['surname', 'name']


class Course(models.Model):
    name = models.TextField()
    visible = models.BooleanField()

    class Meta:
        ordering = ['name']


class Group(models.Model):
    name = models.TextField(blank=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)

    class Meta:
        ordering = ['name']


class Lecture(models.Model):
    start = models.DateTimeField(null=True)
    canceled = models.BooleanField()
    duration = models.PositiveIntegerField()
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    group = models.ForeignKey(Group, related_name='lectures', on_delete=models.CASCADE, null=True)


class Attendance(models.Model):
    paid = models.BooleanField()
    note = models.TextField(blank=True)
    client = models.ForeignKey(Client, related_name='attendances', on_delete=models.PROTECT)  # tedy lze smazat pouze klienta co nema zadne attendances
    lecture = models.ForeignKey(Lecture, related_name='attendances', on_delete=models.CASCADE)
    attendancestate = models.ForeignKey(AttendanceState, on_delete=models.PROTECT)

    class Meta:
        ordering = ['client__surname', 'client__name']


class Membership(models.Model):
    # start = models.DateTimeField(auto_now_add=True)
    # end = models.DateTimeField(null=True)
    client = models.ForeignKey(Client, related_name='memberships', on_delete=models.CASCADE)
    group = models.ForeignKey(Group, related_name='memberships', on_delete=models.CASCADE)
