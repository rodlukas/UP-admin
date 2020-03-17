import * as React from "react"
import ClientService, { ListWithActiveClients } from "../api/services/client"
import { clientName, noop } from "../global/utils"
import { ClientActiveType } from "../types/models"
import { fEmptyVoid, fFunction } from "../types/types"

type StateContext = {
    isLoaded: boolean
    clients: Array<ClientActiveType>
}

type State = StateContext & {
    loadRequested: boolean
}

type Context = StateContext & {
    funcRefresh: (callback?: fFunction) => void
    funcHardRefresh: fEmptyVoid
}

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = React.createContext<Context>({
    clients: [],
    funcRefresh: noop,
    funcHardRefresh: noop,
    isLoaded: false
})

export class ClientsActiveProvider extends React.Component<{}, State> {
    state: State = {
        loadRequested: false,
        isLoaded: false,
        clients: []
    }

    // odstraneni zvlastnich znaku pro vyhledavani (viz https://github.com/krisk/Fuse/issues/181)
    removeSpecialCharacters = (str: string): string => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    loadClients = (): Promise<ListWithActiveClients> => {
        return ClientService.getActive().then(clients => {
            // pridani klice se zjednodusenym jmenem klienta
            return clients.map(client => ({
                ...client,
                normalized: [clientName(client), this.removeSpecialCharacters(clientName(client))]
            }))
        })
    }

    getClients = (callback = noop): void => {
        // pokud jeste nikdo nepozadal o nacteni klientu, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () => {
                this.loadClients().then(clients => {
                    this.setState(
                        {
                            clients,
                            isLoaded: true
                        },
                        callback
                    )
                })
            })
    }

    hardRefreshClients = (): void => {
        // pokud uz je v pameti nactena stara verze klientu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () => {
                this.loadClients().then(clients =>
                    this.setState({
                        clients,
                        isLoaded: true
                    })
                )
            })
    }

    render = (): React.ReactNode => (
        <ClientsActiveContext.Provider
            value={{
                clients: this.state.clients,
                funcRefresh: this.getClients,
                funcHardRefresh: this.hardRefreshClients,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </ClientsActiveContext.Provider>
    )
}

export type ClientsActiveContextProps = {
    clientsActiveContext: Context
}

const WithClientsActiveContext = <P,>(
    WrappedComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof ClientsActiveContextProps>> => (props): React.ReactElement => (
    <ClientsActiveContext.Consumer>
        {(clientsActiveContext): React.ReactNode => (
            <WrappedComponent {...(props as P)} clientsActiveContext={clientsActiveContext} />
        )}
    </ClientsActiveContext.Consumer>
)

export { WithClientsActiveContext, ClientsActiveContext }
