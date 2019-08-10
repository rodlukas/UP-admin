import request from "../request"
import { API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.Bank.url

function get() {
    return request(
        {
            url: baseUrl,
            method: API_METHODS.get
        },
        true,
        false
    )
}

const BankService = {
    get
}

export default BankService
