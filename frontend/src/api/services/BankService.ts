import { AxiosPromise } from "axios"

import { BankType } from "../../types/models"
import { request } from "../request"
import { API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.bank.url

/** Získá výpisy z banky. */
function getAll(): AxiosPromise<BankType> {
    return request<BankType>(
        {
            url: baseUrl,
            method: API_METHODS.get,
        },
        true
    )
}

const BankService = {
    getAll,
}

export default BankService
