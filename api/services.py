from datetime import datetime, timedelta
from typing import Tuple, Dict

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response


class Bank:
    """
    Zprostředkovává komunikaci s Fio API pro získání seznamu posledních transakcí.
    Postaveno na Fio API v1.6.21 (13. 2. 2020).
    Dokumentace Fio API: https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf
    """

    # URL adresa API Fio banky
    FIO_API_URL = "https://www.fio.cz/ib_api/rest/"
    # minimalni zustatek v Kc na Fio uctu (odcita se od aktualniho zustatku)
    FIO_MIN_BALANCE = 100
    # mozne chyby na Fio API a prislusne chybove hlasky
    FIO_API_ERRORS = {
        status.HTTP_409_CONFLICT: "překročení intervalu pro dotazování",
        status.HTTP_500_INTERNAL_SERVER_ERROR: "neexistující/neplatný token",
        status.HTTP_503_SERVICE_UNAVAILABLE: "API banky nefunguje",
        status.HTTP_404_NOT_FOUND: "špatně zaslaný dotaz na banku",
    }

    def get_transactions(self) -> Response:
        """
        Vrátí seznam bankovních transakcí v posledních 14 dnech (nebo případně info o příslušné chybě).
        V případě úspěšného požadavku na Fio API přidá do odpovědi také výši nájmu a timestamp dotazu.
        """
        if settings.BANK_ACTIVE:
            date_format = "%Y-%m-%d"
            current_date_str = datetime.now().strftime(date_format)
            history_date_str = (datetime.now() - timedelta(days=21)).strftime(date_format)
            url_secret = (
                f"{self.FIO_API_URL}periods/{settings.FIO_API_KEY}/"
                f"{history_date_str}/{current_date_str}/transactions.json"
            )
            output_data, output_status = self.perform_api_request(url_secret)
        else:
            output_data, output_status = self.generate_output_error(
                "propojení s bankou je pro tuto doménu administrátorem zakázáno"
            )
        return Response(output_data, status=output_status)

    def perform_api_request(self, url_secret: str) -> Tuple[dict, int]:
        """
        Provede požadavek na Fio API a zpracuje příchozí data nebo chybu.
        """
        try:
            input_data = requests.get(url_secret, timeout=25)
            input_data.raise_for_status()
        except requests.exceptions.Timeout:
            return self.process_error(503)
        except requests.exceptions.RequestException as e:
            return self.process_error(e.response.status_code)
        else:
            return self.process_data(input_data)

    def process_data(self, req: requests.Response) -> Tuple[dict, int]:
        """
        Zpracuje příchozí data z Fio API - dekóduje JSON a transformuje data pro výstup.
        """
        try:
            # dekoduj JSON
            output_data = req.json()
            # proved transformaci dat a vrat vysledek
            return self.transform_data(output_data), req.status_code
        except (ValueError, KeyError):
            # nastala chyba pri dekodovani nebo naslednem zpracovani JSONu
            return self.generate_output_error("neočekávaná struktura JSONu")

    def transform_data(self, output_data: dict) -> dict:
        """
        Transformuje JSON z Fio API do požadované výstupní struktury.
        """
        # serad od nejnovejsich transakci
        output_data["accountStatement"]["transactionList"]["transaction"].reverse()
        # pridani timestamp dotazu (s prevodem na milisekundy)
        output_data["fetch_timestamp"] = int(datetime.now().timestamp() * 1000)
        # pridani vyse najmu (Kc)
        output_data["rent_price"] = settings.BANK_RENT_PRICE
        # odstraneni nepotrebnych polozek z info o uctu
        info_remove = ["yearList", "idList", "idFrom", "idTo", "idLastDownload"]
        for key in info_remove:
            output_data["accountStatement"]["info"].pop(key)
        # vypocet realneho zustatku (po odecteni minimalniho zustatku na uctu)
        output_data["accountStatement"]["info"]["closingBalance"] -= self.FIO_MIN_BALANCE
        return output_data

    def process_error(self, status_code: int) -> Tuple[Dict[str, str], int]:
        """
        Zpracuje chybu při neúspěšném požadavku na Fio API.
        """
        if status_code in self.FIO_API_ERRORS:
            return self.generate_output_error(self.FIO_API_ERRORS[status_code])
        return self.generate_output_error("neznámá chyba Fio API")

    def generate_output_error(self, err_msg: str) -> Tuple[Dict[str, str], int]:
        """
        Generuje výstupní data o chybě.
        """
        output_data = {"status_info": f"Data se nepodařilo stáhnout – {err_msg}."}
        return output_data, status.HTTP_500_INTERNAL_SERVER_ERROR
