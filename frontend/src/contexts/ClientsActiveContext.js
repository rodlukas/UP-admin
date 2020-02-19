import React, { Component, createContext } from "react"
import ClientService from "../api/services/client"
import { clientName } from "../global/utils"

/** Context pro přístup a práci s aktivními klienty. */
const ClientsActiveContext = createContext({
    clients: [],
    funcRefresh: () => {},
    funcHardRefresh: () => {},
    isLoaded: false
})

export class ClientsActiveProvider extends Component {
    state = {
        loadRequested: false,
        isLoaded: false,
        clients: []
    }

    // odstraneni zvlastnich znaku pro vyhledavani (viz https://github.com/krisk/Fuse/issues/181)
    removeSpecialCharacters = str => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    loadClients = () => {
        return ClientService.getActive().then(clients => {
            // pridani klice se zjednodusenym jmenem klienta
            return clients.map(client => ({
                ...client,
                normalized: [clientName(client), this.removeSpecialCharacters(clientName(client))]
            }))
        })
    }

    getClients = (callback = () => {}) => {
        // pokud jeste nikdo nepozadal o nacteni klientu, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({ loadRequested: true }, () =>
                this.loadClients().then(clients => {
                    this.setState(
                        {
                            clients,
                            isLoaded: true
                        },
                        callback
                    )
                })
            )
    }

    hardRefreshClients = () => {
        // pokud uz je v pameti nactena stara verze klientu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({ isLoaded: false }, () =>
                this.loadClients().then(clients =>
                    this.setState({
                        clients,
                        isLoaded: true
                    })
                )
            )
    }

    render = () => (
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

const WithClientsActiveContext = WrappedComponent => props => (
    <ClientsActiveContext.Consumer>
        {clientsActiveContext => (
            <WrappedComponent {...props} clientsActiveContext={clientsActiveContext} />
        )}
    </ClientsActiveContext.Consumer>
)

export { WithClientsActiveContext, ClientsActiveContext }
