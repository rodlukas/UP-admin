import * as React from "react"

import { useActiveClients } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { type ClientActiveType } from "../types/models"

type Context = {
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Data se úspěšně načetla (`status === "success"`). */
    isSuccess: boolean
    /**
     * Data už někdy dorazila ze serveru — i prázdná. `false` znamená „zatím nenačteno"
     * (první načítání, chyba, offline), takže prázdné pole v takovém případě NENÍ prázdný
     * seznam. Na rozdíl od `isSuccess` přežije selhaný refetch: TanStack Query si při něm
     * data z cache nechá, jen překlopí `status` na „error".
     */
    hasData: boolean
    /** Pole s aktivními klienty. */
    clients: ClientActiveType[]
}

type ClientsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = React.createContext<ClientsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními klienty. */
export const ClientsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data, isLoading, isSuccess } = useActiveClients(isAuth)
    // `useMemo`: bez nej je `data ?? []` pri kazdem renderu NOVE pole, takze memoizace
    // u konzumentu (`useDataTable` na stránce Klienti a `data` memo v SelectClient) nikdy netrefi
    const clients = React.useMemo(() => data ?? [], [data])

    return (
        <ClientsActiveContext.Provider
            value={{
                clients,
                isLoading,
                isSuccess,
                hasData: data !== undefined,
            }}>
            {children}
        </ClientsActiveContext.Provider>
    )
}

export const useClientsActiveContext = (): Context => useContextWithProvider(ClientsActiveContext)

export { ClientsActiveContext }
