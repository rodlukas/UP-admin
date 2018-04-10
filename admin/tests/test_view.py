from django.test import SimpleTestCase


class ViewTest(SimpleTestCase):
    """ Prubeh testu:
        - zkontroluje, zda se podarilo nacist uvodni stranku
        - zkontroluje, zda nactena stranka pouziva spravnou sablonu
        - zkontroluje, zda nactena stranka obsahuje spravny obsah
    """
    def test_index_page_status_code(self):
        response = self.client.get('/', secure=True)
        self.assertEquals(response.status_code, 200)

    def test_view_uses_correct_template(self):
        response = self.client.get('/', secure=True)
        self.assertEquals(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html')

    def test_index_page_contains_correct_html(self):
        response = self.client.get('/', secure=True)
        self.assertContains(response, '<h2>Načítání....</h2>')
