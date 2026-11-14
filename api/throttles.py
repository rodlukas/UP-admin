"""
Omezení počtu požadavků (throttling) pro API.
"""

import os

from rest_framework.request import Request
from rest_framework.throttling import ScopedRateThrottle

FLY_CLIENT_IP_HEADER = "HTTP_FLY_CLIENT_IP"


class ClientIpScopedRateThrottle(ScopedRateThrottle):
    """
    `ScopedRateThrottle`, který klienta pozná podle IP adresy, jak ji vidí Fly Proxy.

    Na Fly.io je `REMOTE_ADDR` adresa proxy a pravá (poslední) položka `X-Forwarded-For`
    je adresa aplikace, takže výchozí `get_ident` DRF by všechny klienty slil do jednoho
    počítadla. Fly Proxy posílá adresu klienta v hlavičce `Fly-Client-IP`
    (https://docs.fly.io/networking/request-headers).

    Hlavičku si ale může poslat kdokoli sám, takže se jí věří jen tam, kde požadavek
    určitě prošel Fly Proxy - na Fly Machine, kterou pozná podle `FLY_APP_NAME` (Fly ji
    nastavuje každé Machine). Jinde (lokálně, docker-compose) platí výchozí `get_ident`.
    """

    def get_ident(self, request: Request) -> str:
        if os.environ.get("FLY_APP_NAME"):
            fly_client_ip = request.META.get(FLY_CLIENT_IP_HEADER, "").strip()
            if fly_client_ip:
                return fly_client_ip
        return super().get_ident(request)
