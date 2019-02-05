from django.test import SimpleTestCase


class ViewTest(SimpleTestCase):
    """ Prubeh testu:
        - zkontroluje, zda se podarilo nacist uvodni stranku
        - zkontroluje, zda nactena stranka pouziva spravnou sablonu
    """
    def test_index_page_status_code(self):
        response = self.client.get('/', secure=True)
        self.assertEquals(response.status_code, 200)

    def test_view_uses_correct_template(self):
        response = self.client.get('/', secure=True)
        self.assertEquals(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')
