import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"

import { BankErrorType, BankType } from "../../types/models"
import BankService from "../services/BankService"

/** Hook pro získání výpisů z banky. */
export function useBank() {
    return useQuery<BankType>({
        queryKey: ["bank"],
        queryFn: async () => {
            try {
                return await BankService.getAll()
            } catch (error) {
                if (error instanceof AxiosError && error.response?.data) {
                    const errorData = error.response.data
                    if (
                        typeof errorData === "object" &&
                        errorData !== null &&
                        "error_info" in errorData
                    ) {
                        return errorData as BankErrorType
                    }
                }
                return { error_info: "Neznámá chyba při získávání dat z banky." }
            }
        },
        meta: {
            skipErrorNotification: true,
        },
    })
}
