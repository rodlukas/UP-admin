from up.settings import FIO_API_KEY
from datetime import datetime, timedelta
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
            json_data = {'status_code': data.status_code}
        else:
            # serad od nejnovejsich transakci
            json_data['accountStatement']['transactionList']['transaction'].reverse()
            # timestamp dotazu (s prevodem na milisekundy)
            json_data['fetch_timestamp'] = int(datetime.now().timestamp() * 1000)
        return json_data
