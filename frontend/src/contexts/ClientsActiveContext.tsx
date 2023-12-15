import * as React from "react"

import ClientService, { ListWithActiveClients } from "../api/services/ClientService"
import { getDisplayName, noop } from "../global/utils"
import { useContextWithProvider } from "../hooks/useContextWithProvider"
import { ClientActiveType } from "../types/models"
import { fEmptyVoid, fFunction } from "../types/types"

type StateContext = {
    /** Data v kontextu jsou načtená (true). */
    isLoaded: boolean
    /** Pole s aktivními klienty. */
    clients: ClientActiveType[]
}

type State = StateContext & {
    /** Načtení dat do kontextu už bylo vyžádáno (true). */
    loadRequested: boolean
}

type Context = StateContext & {
    /** Funkce pro načtení dat do kontextu, pokud ještě o načtení nikdo nepožádal. */
    funcRefresh: (callback?: fFunction) => void
    /** Funkce pro obnovení již načtených dat v kontextu. */
    funcHardRefresh: fEmptyVoid
}

type ClientsActiveContextInterface = Context | undefined

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = React.createContext<ClientsActiveContextInterface>(undefined)

/** Provider kontextu s aktivními klienty. */
export class ClientsActiveProvider extends React.Component<{}, State> {
    state: State = {
        loadRequested: false,
        isLoaded: false,
        clients: [],
    }

    // odstraneni zvlastnich znaku pro vyhledavani (viz https://github.com/krisk/Fuse/issues/181)
    removeSpecialCharacters = (str: string): string => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    loadClients = (): Promise<ListWithActiveClients> => {
        return ClientService.getActive().then((clients) => {
            // pridani klice s krestnim jmenem a prijmenim klienta bez diakritiky
            return clients.map((client) => ({
                ...client,
                normalized: [
                    this.removeSpecialCharacters(client.firstname),
                    this.removeSpecialCharacters(client.surname),
                ],
            }))
        })
    }

    getClients = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni klientu, pozadej a nacti je
        if (!this.state.loadRequested) {
            this.setState({ loadRequested: true }, () => {
                this.loadClients().then((clients) => {
                    this.setState(
                        {
                            clients,
                            isLoaded: true,
                        },
                        callback,
                    )
                })
            })
        }
    }

    hardRefreshClients = (): void => {
        // pokud uz je v pameti nactena stara verze klientu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested) {
            this.setState({ isLoaded: false }, () => {
                this.loadClients().then((clients) =>
                    this.setState({
                        clients,
                        isLoaded: true,
                    }),
                )
            })
        }
    }

    render = (): React.ReactNode => (
        <ClientsActiveContext.Provider
            value={{
                clients: this.state.clients,
                funcRefresh: this.getClients,
                funcHardRefresh: this.hardRefreshClients,
                isLoaded: this.state.isLoaded,
            }}>
            {this.props.children}
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
