import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { useActiveClients } from "../api/hooks"
import { useAuthContext } from "../auth/AuthContext"
import { getDisplayName } from "../global/utils"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { ClientActiveType } from "../types/models"
import { fEmptyVoid } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Probíhá první načítání dat (true) - data ještě nejsou načtená. */
    isLoading: boolean
    /** Probíhá načítání dat na pozadí (true). */
    isFetching: boolean
    /** Pole s aktivními klienty. */
    clients: ClientActiveType[]
}

type Context = StateContext & {
    /** Funkce pro obnovení dat v kontextu. */
    funcHardRefresh: fEmptyVoid
}

type ClientsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = React.createContext<ClientsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními klienty. */
export const ClientsActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuth } = useAuthContext()
    const { data: clients = [], isLoading, isFetching } = useActiveClients(isAuth)
    const queryClient = useQueryClient()

    const hardRefreshClients = React.useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["clients", { type: "active" }] })
    }, [queryClient])

    return (
        <ClientsActiveContext.Provider
            value={{
                clients,
                funcHardRefresh: hardRefreshClients,
                isLoaded: !isLoading && !isFetching,
                isLoading,
                isFetching,
            }}>
            {children}
        </ClientsActiveContext.Provider>
    )
}

/** Props kontextu s aktivními klienty při využití HOC. */
export type ClientsActiveContextProps = {
    /** Objekt kontextu s aktivními klienty. */
    clientsActiveContext: Context
}

/** Interně je v contextu hodnota nebo undefined, ošetřujeme to přes errory. */
type ClientsActiveContextPropsInternal = {
    clientsActiveContext: ClientsActiveContextInterface
}

type ComponentWithCoursesVisibleContextProps<P> = Omit<P, keyof ClientsActiveContextPropsInternal>

/** HOC komponenta pro kontext s aktivními klienty. */
const WithClientsActiveContext = <P,>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentType<ComponentWithCoursesVisibleContextProps<P>> => {
    const ComponentWithClientsActiveContext = (
        props: ComponentWithCoursesVisibleContextProps<P>,
    ) => (
        <ClientsActiveContext.Consumer>
            {(clientsActiveContext) => {
                if (clientsActiveContext === undefined) {
                    throw new Error(
                        "clientsActiveContext must be used within a ClientsActiveProvider",
                    )
                }
                return (
                    <WrappedComponent
                        {...(props as P)}
                        clientsActiveContext={clientsActiveContext}
                    />
                )
            }}
        </ClientsActiveContext.Consumer>
    )
    ComponentWithClientsActiveContext.displayName = `WithClientsActiveContext(${getDisplayName<P>(
        WrappedComponent,
    )})`
    return ComponentWithClientsActiveContext
}

export const useClientsActiveContext = (): Context => useContextWithProvider(ClientsActiveContext)

export { WithClientsActiveContext, ClientsActiveContext }
