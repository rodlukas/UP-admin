from up.settings import FIO_API_KEY
from datetime import datetime, timedelta
import requests


class Bank:
    FIO_API_URL = "https://www.fio.cz/ib_api/rest/"

    @staticmethod
    def get_bank_data():
        current_date_str = datetime.now().strftime("%Y-%m-%d")
        history_date_str = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")
        url = Bank.FIO_API_URL + "periods/" + FIO_API_KEY + "/" + history_date_str \
              + "/" + current_date_str + "/transactions.json"
        data = requests.get(url)
        try:
            json_data = data.json()
            # serad od nejnovejsich transakci
            transactions = list(json_data['accountStatement']['transactionList']['transaction'])
            transactions.reverse()
            # uloz nove hodnoty do puvodniho JSONu
            json_data['accountStatement']['transactionList']['transaction'] = transactions
            json_data['fetch_timestamp'] = int(datetime.now().timestamp() * 1000)  # prevod na milisekundy
        except ValueError:  # kdyz se nepovede dekodovat json
            json_data = {'status_code': data.status_code}
        return json_data
