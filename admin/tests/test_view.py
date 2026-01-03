from django.test import SimpleTestCase


class IndexViewTest(SimpleTestCase):
    """
    Základní smoke test hlavního zobazení stránky od Djanga (nehledě na funkčnost JS).
    """

    def test_index_page_status_code(self) -> None:
        """
        Zkontroluje, zda se podařilo načíst úvodní stránku.
        """
        response = self.client.get("/", secure=True)
        self.assertEqual(response.status_code, 200)

    def test_index_uses_correct_template(self) -> None:
        """
        Zkontroluje, zda načtená stránka používá správnou šablonu.
        """
        response = self.client.get("/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "react-autogenerate.html")

    def test_index_content_type(self) -> None:
        """
        Zkontroluje, zda response má správný content-type.
        """
        response = self.client.get("/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response["Content-Type"])
