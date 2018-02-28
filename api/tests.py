from django.test import TestCase
from admin.models import Client


class ModelTestCase(TestCase):
    def setUp(self):
        self.clientlist_name = "Josef"
        self.clientlist_surname = "Voříšek"
        self.clientlist = Client(name=self.clientlist_name, surname=self.clientlist_surname)

    def test_model_can_create_a_client(self):
        old_count = Client.objects.count()
        self.clientlist.save()
        new_count = Client.objects.count()
        self.assertNotEqual(old_count, new_count)
