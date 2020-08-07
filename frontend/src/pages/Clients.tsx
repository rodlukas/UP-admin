import * as React from "react"
import { Badge, Container, Table } from "reactstrap"
import ClientService from "../api/services/ClientService"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import {
    ClientsActiveContextProps,
    WithClientsActiveContext,
} from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps & ClientsActiveContextProps

type State = {
    /** Pole klientů. */
    clients: Array<ClientType>
    /** Je vybráno zobrazení aktivních klientů (true). */
    active: boolean
    /** Probíhá načítání (true). */
    isLoading: boolean
}

/** Stránka s klienty. */
class Clients extends React.Component<Props, State> {
    state: State = {
        clients: [],
        isLoading: true,
        active: true,
    }

    isLoading = (): boolean =>
        this.state.active ? !this.props.clientsActiveContext.isLoaded : this.state.isLoading

    getClientsData = (): Array<ClientType> =>
        this.state.active ? this.props.clientsActiveContext.clients : this.state.clients

    refreshFromModal = (data: ModalClientsData): void => {
        data && this.refresh(data.active)
    }

    refresh = (active = this.state.active, ignoreActiveRefresh = false): void => {
        if (active && ignoreActiveRefresh) {
            this.setState({ active: active })
        } else {
            this.setState({ isLoading: true, active: active }, () => this.getClients(active, true))
        }
    }

    getClients = (active = this.state.active, callFromRefresh = false): void => {
        if (active && !callFromRefresh) {
            this.props.clientsActiveContext.funcRefresh()
        } else if (!active) {
            ClientService.getInactive().then((clients) =>
                this.setState({ clients, isLoading: false })
            )
        }
    }

    componentDidMount(): void {
        this.getClients()
    }

    render(): React.ReactNode {
        return (
            <Container>
                <Heading
                    title={
                        <>
                            {APP_URLS.klienti.title}{" "}
                            {!this.isLoading() && (
                                <Badge color="secondary" pill>
                                    {this.getClientsData().length}
                                </Badge>
                            )}
                        </>
                    }
                    buttons={
                        <>
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                            <ModalClients refresh={this.refreshFromModal} />
                        </>
                    }
                />
                <Table striped size="sm" responsive className="table-custom">
                    <thead className="thead-light">
                        <tr>
                            <th>Příjmení a jméno</th>
                            <th className="d-none d-md-table-cell">Telefon</th>
                            <th
                                style={{ wordBreak: "keep-all" }}
                                className="d-none d-md-table-cell">
                                E-mail
                            </th>
                            <th className="d-none d-sm-table-cell">Poznámka</th>
                            <th className="text-right text-md-right">Akce</th>
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
                                {this.getClientsData().map((client) => (
                                    <tr key={client.id} data-qa="client">
                                        <td style={{ minWidth: "13em", width: "13em" }}>
                                            <ClientName client={client} link />
                                        </td>
                                        <td
                                            style={{ minWidth: "7em" }}
                                            className="d-none d-md-table-cell">
                                            <ClientPhone phone={client.phone} />
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            <ClientEmail email={client.email} />
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <ClientNote note={client.note} />
                                        </td>
                                        <td className="text-right text-md-right">
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
