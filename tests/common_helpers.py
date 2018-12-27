def shrink_str(phone):
    return phone.replace(" ", "")


def client_full_name(name, surname):
    return f"{surname} {name}"


def filter_empty_strings_from_list(src_list):
    return list(filter(None, src_list))
