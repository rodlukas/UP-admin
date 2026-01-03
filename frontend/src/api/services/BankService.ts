import { BankType } from "../../types/models"
import { axiosRequestData } from "../axiosRequest"
import { API_METHODS, API_URLS } from "../urls"

const baseUrl = API_URLS.bank.url

/** Získá výpisy z banky. */
function getAll(): Promise<BankType> {
    return axiosRequestData<BankType>({
        url: baseUrl,
        method: API_METHODS.get,
    })
}

const BankService = {
    getAll,
}

export default BankService
