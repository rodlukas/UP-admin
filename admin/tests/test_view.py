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
        self.assertEqual(response.status_code, 200)

    def test_view_uses_correct_template(self) -> None:
        """
        Zkontroluje, zda načtená stránka používá správnou šablonu.
        """
        response = self.client.get("/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "react-autogenerate.html")

    def test_openapi_schema_status_code(self) -> None:
        """
        Zkontroluje, zda je dostupná OpenAPI schema.
        """
        response = self.client.get("/api/open-api/", secure=True)
        self.assertEqual(response.status_code, 200)
        # zkontroluj, ze response obsahuje JSON s OpenAPI schema
        self.assertIn("openapi", response.json())

    def test_swagger_ui_status_code(self) -> None:
        """
        Zkontroluje, zda je dostupná Swagger UI dokumentace.
        """
        response = self.client.get("/api/docs/", secure=True)
        self.assertEqual(response.status_code, 200)
