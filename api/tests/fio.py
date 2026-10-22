"""
Falešné odpovědi Fio API pro testy (struktura podle Fio API v1.9, viz `api/services.py`).
Používají je unit testy i E2E kroky banky (`tests/common_steps/bank.py`).
"""

import json

import requests


def fio_transaction(transaction_id: int, amount: float, note: str, date: str) -> dict:
    """Jeden pohyb na účtu (`date` ve tvaru rrrr-mm-dd+hhmm, např. 2026-10-01+0200)."""
    return {
        "column0": {"value": date},
        "column1": {"value": amount},
        "column10": None,
        "column16": None,
        "column22": {"value": transaction_id},
        "column25": {"value": note},
    }


def fio_statement(balance: float, transactions: list[dict]) -> dict:
    """Výpis tak, jak ho Fio vrací - pohyby od nejstaršího, s položkami, které služba maže."""
    return {
        "accountStatement": {
            "info": {
                "accountId": "2000000000",
                "bankId": "2010",
                "currency": "CZK",
                "iban": "CZ0000000000000000000000",
                "bic": "FIOBCZPPXXX",
                "openingBalance": balance,
                "closingBalance": balance,
                "dateStart": "2026-09-20+0200",
                "dateEnd": "2026-10-20+0200",
                "yearList": None,
                "idList": None,
                "idFrom": 1,
                "idTo": 2,
                "idLastDownload": None,
            },
            "transactionList": {"transaction": transactions},
        }
    }


def fio_response(status_code: int, content: bytes | dict) -> requests.Response:
    """Odpověď `requests.get` s daným stavem a tělem (slovník se převede na JSON)."""
    response = requests.Response()
    response.status_code = status_code
    response._content = json.dumps(content).encode() if isinstance(content, dict) else content
    response.encoding = "utf-8"
    return response
