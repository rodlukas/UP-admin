from up.settings import FIO_API_KEY
from datetime import datetime, timedelta
from rest_framework import status
import requests


class Bank:
    FIO_API_URL = "https://www.fio.cz/ib_api/rest/"

    @staticmethod
    def get_bank_data():
        current_date_str = datetime.now().strftime("%Y-%m-%d")
        history_date_str = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
        url_secret = f"{Bank.FIO_API_URL}periods/{FIO_API_KEY}/{history_date_str}/{current_date_str}/transactions.json"
        data = requests.get(url_secret)
        # dekoduj JSON
        try:
            json_data = data.json()
        except ValueError:  # kdyz se nepovede dekodovat JSON
            if data.status_code == status.HTTP_409_CONFLICT:
                status_info = "překročení intervalu pro dotazování"
            elif data.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
                status_info = "neexistující/neplatný token"
            elif data.status_code == status.HTTP_404_NOT_FOUND:
                status_info = "špatně zaslaný dotaz na banku"
            else:
                status_info = "neznámá chyba"
            json_data = {'status_info': f"Data se nepodařilo stáhnout - {status_info}"}
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        else:
            # serad od nejnovejsich transakci
            json_data['accountStatement']['transactionList']['transaction'].reverse()
            # timestamp dotazu (s prevodem na milisekundy)
            json_data['fetch_timestamp'] = int(datetime.now().timestamp() * 1000)
            status_code = status.HTTP_200_OK
        return status_code, json_data
