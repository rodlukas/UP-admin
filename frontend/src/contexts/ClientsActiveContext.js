import React, {Component, createContext} from "react"
import ClientService from "../api/services/client"

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

    getClients = (callback = () => {}) => {
        // pokud jeste nikdo nepozadal o nacteni klientu, pozadej a nacti je
        if (!this.state.loadRequested)
            this.setState({loadRequested: true}, () =>
                ClientService.getActive()
                    .then(clients => this.setState({
                        clients,
                        isLoaded: true
                    }, callback)))
    }

    hardRefreshClients = () => {
        // pokud uz je v pameti nactena stara verze klientu, obnov je (pokud k nacteni jeste nedoslo, nic nedelej)
        if (this.state.loadRequested)
            this.setState({isLoaded: false}, () =>
                ClientService.getActive()
                    .then(clients => this.setState({
                        clients,
                        isLoaded: true
                    })))
    }

    render = () =>
        <ClientsActiveContext.Provider
            value={{
                clients: this.state.clients,
                funcRefresh: this.getClients,
                funcHardRefresh: this.hardRefreshClients,
                isLoaded: this.state.isLoaded
            }}>
            {this.props.children}
        </ClientsActiveContext.Provider>
}

const WithClientsActiveContext = WrappedComponent => props =>
    <ClientsActiveContext.Consumer>
        {clientsActiveContext => <WrappedComponent {...props} clientsActiveContext={clientsActiveContext}/>}
    </ClientsActiveContext.Consumer>


export {WithClientsActiveContext, ClientsActiveContext}
