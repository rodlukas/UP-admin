from django.test import SimpleTestCase


class ViewTest(SimpleTestCase):
    """
    Základní smoke test hlavního zobazení stránky od Djanga (nehledě na funkčnost JS).
    """

    def test_index_page_status_code(self) -> None:
        """
        Zkontroluje, zda se podařilo načíst úvodní stránku (neřeší funkčnost JS).
        """
        response = self.client.get("/", secure=True)
        self.assertEquals(response.status_code, 200)

    def test_view_uses_correct_template(self) -> None:
        """
        Zkontroluje, zda načtená stránka používá správnou šablonu.
        """
        response = self.client.get("/", secure=True)
        self.assertEquals(response.status_code, 200)
        self.assertTemplateUsed(response, "react-autogenerate.html")
