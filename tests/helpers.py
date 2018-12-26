
WAIT_TIME = 10
WAIT_TIME_SHORT = 3


def api_url(url):
    return "/api/v1" + url


def frontend_empty_str(text):
    return "---" if text == "" else text


def shrink_str(phone):
    return phone.replace(" ", "")
