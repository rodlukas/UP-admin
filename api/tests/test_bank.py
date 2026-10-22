"""
Testy endpointu bankovního výpisu (GET /api/v1/bank/) s podvrženým Fio API.
"""

from unittest import mock

import requests
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from api.services import FIO_CACHE_KEY

from .fio import fio_response, fio_statement, fio_transaction

URL = "/api/v1/bank/"


@override_settings(BANK_ACTIVE=True, FIO_API_KEY="test-token", BANK_RENT_PRICE=8000)
class BankViewTest(TestCase):
    def setUp(self) -> None:
        user = get_user_model().objects.create_user(
            username="bank-test", email="bank-test@test.cz", password="test-password"
        )
        self.api = APIClient()
        self.api.force_authenticate(user=user)
        # uspesny vypis se cachuje - testy nesmi videt vypis z predchoziho testu
        cache.delete(FIO_CACHE_KEY)
        self.addCleanup(cache.delete, FIO_CACHE_KEY)
        patcher = mock.patch("api.services.requests.get")
        self.fio_get = patcher.start()
        self.addCleanup(patcher.stop)

    def statement(self) -> dict:
        return fio_statement(
            12000,
            [
                fio_transaction(1, 1500, "starší platba", "2026-10-01+0200"),
                fio_transaction(2, -300, "novější platba", "2026-10-02+0200"),
            ],
        )

    def test_unauthenticated_returns_401(self) -> None:
        response = APIClient().get(URL, secure=True)
        self.assertEqual(response.status_code, 401)
        self.fio_get.assert_not_called()

    @override_settings(BANK_ACTIVE=False)
    def test_disabled_bank_returns_error_without_calling_fio(self) -> None:
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertIn("zakázáno", response.json()["error_info"])
        self.fio_get.assert_not_called()

    def test_statement_is_returned_newest_first_with_rent_price(self) -> None:
        self.fio_get.return_value = fio_response(200, self.statement())
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        notes = [
            t["column25"]["value"]
            for t in data["accountStatement"]["transactionList"]["transaction"]
        ]
        self.assertEqual(notes, ["novější platba", "starší platba"])
        info = data["accountStatement"]["info"]
        self.assertEqual(info["closingBalance"], 12000)
        self.assertEqual(info["currency"], "CZK")
        for removed in ("yearList", "idList", "idFrom", "idTo", "idLastDownload"):
            self.assertNotIn(removed, info)
        self.assertEqual(data["rent_price"], 8000)
        self.assertIsInstance(data["fetch_timestamp"], int)

    def test_request_uses_api_key(self) -> None:
        self.fio_get.return_value = fio_response(200, self.statement())
        self.api.get(URL, secure=True)
        self.assertIn("/periods/test-token/", self.fio_get.call_args.args[0])

    def test_successful_statement_is_cached(self) -> None:
        self.fio_get.return_value = fio_response(200, self.statement())
        self.api.get(URL, secure=True)
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.fio_get.call_count, 1)

    def test_fio_error_is_reported_and_not_cached(self) -> None:
        self.fio_get.return_value = fio_response(409, b"")
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertIn("překročení intervalu pro dotazování", response.json()["error_info"])
        # chyba se necachuje - dalsi pozadavek se na Fio zepta znovu
        self.fio_get.return_value = fio_response(200, self.statement())
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.fio_get.call_count, 2)

    def test_unknown_fio_status_is_reported(self) -> None:
        self.fio_get.return_value = fio_response(418, b"")
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertIn("neznámá chyba Fio API", response.json()["error_info"])

    def test_timeout_is_reported_as_unavailable_api(self) -> None:
        self.fio_get.side_effect = requests.exceptions.Timeout
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertIn("API banky nefunguje", response.json()["error_info"])

    def test_unexpected_json_is_reported(self) -> None:
        self.fio_get.return_value = fio_response(200, {"neco": "jineho"})
        response = self.api.get(URL, secure=True)
        self.assertEqual(response.status_code, 500)
        self.assertIn("neočekávaná struktura JSONu", response.json()["error_info"])
