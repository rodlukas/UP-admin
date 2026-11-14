from django.test import SimpleTestCase


class OpenAPIDocumentationTest(SimpleTestCase):
    """
    Testy pro OpenAPI dokumentaci.
    """

    def test_openapi_schema_status_code(self) -> None:
        """
        Zkontroluje, zda je dostupná OpenAPI schema.
        """
        response = self.client.get("/api/open-api/", secure=True)
        self.assertEqual(response.status_code, 200)

    def test_openapi_schema_content_type(self) -> None:
        """
        Zkontroluje, zda OpenAPI schema má správný content-type.
        """
        response = self.client.get("/api/open-api/", secure=True)
        self.assertEqual(response.status_code, 200)
        content_type = response["Content-Type"]
        # OpenAPI schema může být v YAML nebo JSON formátu
        self.assertIn(
            content_type,
            (
                "application/vnd.oai.openapi; charset=utf-8",
                "application/vnd.oai.openapi+json; charset=utf-8",
            ),
        )

    def test_openapi_schema_content(self) -> None:
        """
        Zkontroluje, zda OpenAPI schema obsahuje očekávané klíče.
        """
        response = self.client.get("/api/open-api/", secure=True)
        self.assertEqual(response.status_code, 200)
        response_content = response.content.decode("utf-8")
        # Zkontroluj základní strukturu OpenAPI schema
        self.assertIn("openapi", response_content)
        self.assertIn("info", response_content)
        self.assertIn("paths", response_content)

    def test_swagger_ui_status_code(self) -> None:
        """
        Zkontroluje, zda je dostupná Swagger UI dokumentace.
        """
        response = self.client.get("/api/docs/", secure=True)
        self.assertEqual(response.status_code, 200)

    def test_swagger_ui_content_type(self) -> None:
        """
        Zkontroluje, zda Swagger UI má správný content-type.
        """
        response = self.client.get("/api/docs/", secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response["Content-Type"])

    def test_swagger_ui_follows_system_color_scheme(self) -> None:
        """
        Zkontroluje, zda Swagger UI přepíná tmavý motiv podle systémového nastavení.
        """
        response = self.client.get("/api/docs/", secure=True)
        self.assertEqual(response.status_code, 200)
        response_content = response.content.decode("utf-8")
        self.assertIn("prefers-color-scheme: dark", response_content)
        self.assertIn('classList.toggle("dark-mode"', response_content)
        # sablona dedi vychozi sablonu drf-spectacular, Swagger UI se tedy dal nacita
        self.assertIn('id="swagger-ui"', response_content)

    def test_schema_offers_only_jwt_auth(self) -> None:
        """
        Zkontroluje, že se Swagger přihlašuje jen JWT tokenem - basic auth API nepřijímá.
        """
        response = self.client.get("/api/open-api/?format=json", secure=True)
        self.assertEqual(response.status_code, 200)
        schemes = response.json()["components"]["securitySchemes"]
        self.assertEqual(set(schemes), {"jwtAuth"})
        self.assertEqual(schemes["jwtAuth"]["scheme"], "bearer")

    def test_swagger_ui_reuses_app_token(self) -> None:
        """
        Zkontroluje, že Swagger UI po načtení převezme JWT token přihlášené aplikace.
        """
        response = self.client.get("/api/docs/", secure=True)
        self.assertEqual(response.status_code, 200)
        response_content = response.content.decode("utf-8")
        self.assertIn('localStorage.getItem("jwt")', response_content)
        self.assertIn('ui.preauthorizeApiKey("jwtAuth", token)', response_content)

    def test_schema_ignores_anonymous_version_parameter(self) -> None:
        """
        Zkontroluje, že schéma nebere libovolný `?version=` (ALLOWED_VERSIONS).

        drf-spectacular by hodnotu dosadil do `info.version` i do hlavičky
        `Content-Disposition`: CR/LF končí chybou 500, uvozovky přidávají parametry hlavičky.
        """
        for version in ("x\r\nSet-Cookie: a=b", "x\"; filename*=UTF-8''evil.html; a=\""):
            with self.subTest(version=version):
                response = self.client.get(
                    "/api/open-api/", {"format": "json", "version": version}, secure=True
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json()["info"]["version"], "1.0.0")
                self.assertNotIn("x", response["Content-Disposition"].split("ÚPadmin API")[1])
                self.assertNotIn("Set-Cookie", response)
