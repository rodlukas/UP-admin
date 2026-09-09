import * as React from "react"

import { useActiveClients } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { ClientActiveType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Data se úspěšně načetla. Prázdné pole při `false` znamená chybu, ne prázdný seznam. */
    isSuccess: boolean
    /** Pole s aktivními klienty. */
    clients: ClientActiveType[]
}

type ClientsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = React.createContext<ClientsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními klienty. */
export const ClientsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data: clients = [], isLoading, isSuccess } = useActiveClients(isAuth)

    return (
        <ClientsActiveContext.Provider
            value={{
                clients,
                isLoading,
                isSuccess,
            }}>
            {children}
        </ClientsActiveContext.Provider>
    )
}

export const useClientsActiveContext = (): Context => useContextWithProvider(ClientsActiveContext)

export { ClientsActiveContext }
