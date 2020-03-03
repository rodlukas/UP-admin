import * as React from "react"
import { Container, Table } from "reactstrap"
import ClientService from "../api/services/client"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientName from "../components/ClientName"
import Email from "../components/Email"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Note from "../components/Note"
import Phone from "../components/Phone"
import {
    ClientsActiveContextProps,
    WithClientsActiveContext
} from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"
import APP_URLS from "../urls"

type Props = CustomRouteComponentProps & ClientsActiveContextProps

type State = {
    clients: Array<ClientType>
    active: boolean
    isLoading: boolean
}

/** Stránka s klienty. */
class Clients extends React.Component<Props, State> {
    state: State = {
        clients: [],
        isLoading: true,
        active: true
    }

    isLoading = (): boolean =>
        this.state.active ? !this.props.clientsActiveContext.isLoaded : this.state.isLoading

    getClientsData = (): Array<ClientType> =>
        this.state.active ? this.props.clientsActiveContext.clients : this.state.clients

    refreshFromModal = (data: ModalClientsData): void => {
        data && this.refresh(data.active)
    }

    refresh = (active = this.state.active, ignoreActiveRefresh = false): void => {
        if (active && ignoreActiveRefresh) this.setState({ active: active })
        else this.setState({ isLoading: true, active: active }, () => this.getClients(active, true))
    }

    getClients = (active = this.state.active, callFromRefresh = false): void => {
        if (active && !callFromRefresh) this.props.clientsActiveContext.funcRefresh()
        else if (!active)
            ClientService.getInactive().then(clients =>
                this.setState({ clients, isLoading: false })
            )
    }

    componentDidMount(): void {
        this.getClients()
    }

    render(): React.ReactNode {
        return (
            <Container>
                <Heading
                    content={
                        <>
                            {APP_URLS.klienti.title}
                            <ModalClients refresh={this.refreshFromModal} />
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                        </>
                    }
                />
                <Table striped size="sm" responsive className="pageContent">
                    <thead className="thead-dark">
                        <tr>
                            <th>Příjmení a jméno</th>
                            <th>Telefon</th>
                            <th style={{ wordBreak: "keep-all" }}>E-mail</th>
                            <th>Poznámka</th>
                            <th>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.isLoading() ? (
                            <tr>
                                <td colSpan={5}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <>
                                {this.getClientsData().map(client => (
                                    <tr key={client.id} data-qa="client">
                                        <td style={{ minWidth: "13em", width: "13em" }}>
                                            <ClientName client={client} link />
                                        </td>
                                        <td style={{ minWidth: "7em" }}>
                                            <Phone phone={client.phone} />
                                        </td>
                                        <td>
                                            <Email email={client.email} />
                                        </td>
                                        <td>
                                            <Note note={client.note} />
                                        </td>
                                        <td>
                                            <ModalClients
                                                currentClient={client}
                                                refresh={this.refreshFromModal}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </Table>
                {this.getClientsData().length === 0 && !this.isLoading() && (
                    <p className="text-muted text-center">Žádní klienti</p>
                )}
            </Container>
        )
    }
}

export default WithClientsActiveContext(Clients)
