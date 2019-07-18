from datetime import datetime, timedelta

import requests
from django.conf import settings
from rest_framework import status


class Bank:
    FIO_API_URL = "https://www.fio.cz/ib_api/rest/"
    data = None
    json_data = None

    def prepare_response(self):
        # dekoduj JSON
        try:
            self.json_data = self.data.json()
        except ValueError:  # kdyz se nepovede dekodovat JSON
            return self.generate_error()
        else:
            return self.generate_data()

    def generate_data(self):
        # serad od nejnovejsich transakci
        self.json_data['accountStatement']['transactionList']['transaction'].reverse()
        # timestamp dotazu (s prevodem na milisekundy)
        self.json_data['fetch_timestamp'] = int(datetime.now().timestamp() * 1000)
        status_code = status.HTTP_200_OK
        return status_code

    def generate_error(self):
        if self.data.status_code == status.HTTP_409_CONFLICT:
            status_info = "překročení intervalu pro dotazování"
        elif self.data.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            status_info = "neexistující/neplatný token"
        elif self.data.status_code == status.HTTP_404_NOT_FOUND:
            status_info = "špatně zaslaný dotaz na banku"
        else:
            status_info = "neznámá chyba"
        self.json_data = {'status_info': f"Data se nepodařilo stáhnout – {status_info}"}
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return status_code

    def generate_error_blocked(self):
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        self.json_data = {'status_info': "Propojení s bankou je v této instanci aplikace administrátorem zakázáno."}
        return status_code

    def get_transactions(self):
        # pokud je povolena prace s bankou, proved pozadavek
        if settings.BANK_ACTIVE:
            current_date_str = datetime.now().strftime("%Y-%m-%d")
            history_date_str = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
            url_secret = f"{self.FIO_API_URL}periods/{settings.FIO_API_KEY}/{history_date_str}/{current_date_str}/transactions.json"
            self.data = requests.get(url_secret)
            # priprav odpoved
            status_code = self.prepare_response()
        else:
            status_code = self.generate_error_blocked()
        return status_code, self.json_data
