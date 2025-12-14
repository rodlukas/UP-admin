import { useQuery } from "@tanstack/react-query"

import { BankType } from "../../types/models"
import BankService from "../services/BankService"

export const bankDataApiInit: BankType = {
    accountStatement: {
        info: {
            closingBalance: null,
            dateStart: undefined,
        },
        transactionList: {
            transaction: [],
        },
    },
    fetch_timestamp: null,
    rent_price: null,
    status_info: undefined,
}

/** Hook pro získání výpisů z banky. */
export function useBank() {
    return useQuery<BankType>({
        queryKey: ["bank"],
        queryFn: async () => {
            const response = await BankService.getAll()
            if (response.status !== 200) {
                // z API dorazi jen status_info, provedeme merge se zbytkem init hodnot
                return Object.assign({ ...bankDataApiInit }, response.data)
            }
            return response.data
        },
    })
}
