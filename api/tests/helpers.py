def ids(response_data: list[dict]) -> set[int]:
    return {item["id"] for item in response_data}
