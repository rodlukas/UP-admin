import { AxiosPromise } from "axios"

import { BankType } from "../../types/models"
import axiosRequest from "../axiosRequest"
import { API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.bank.url

/** Získá výpisy z banky. */
function getAll(): AxiosPromise<BankType> {
    return axiosRequest<BankType>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

const BankService = {
    getAll,
}

export default BankService
