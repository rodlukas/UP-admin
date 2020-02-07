import React, { Component, Fragment } from "react"
import { Container, Table } from "reactstrap"
import ClientService from "../api/services/client"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientName from "../components/ClientName"
import Email from "../components/Email"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Note from "../components/Note"
import Phone from "../components/Phone"
import { WithClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import APP_URLS from "../urls"

class Clients extends Component {
    state = {
        clients: [],
        IS_LOADING: true,
        active: true
    }

    isLoading = () =>
        this.state.active ? !this.props.clientsActiveContext.isLoaded : this.state.IS_LOADING

    getClientsData = () =>
        this.state.active ? this.props.clientsActiveContext.clients : this.state.clients

    refreshFromModal = data => {
        this.refresh(data.active)
    }

    refresh = (active = this.state.active, ignoreActiveRefresh = false) => {
        if (active && ignoreActiveRefresh) this.setState({ active: active })
        else
            this.setState({ IS_LOADING: true, active: active }, () => this.getClients(active, true))
    }

    getClients = (active = this.state.active, callFromRefresh = false) => {
        if (active && !callFromRefresh) this.props.clientsActiveContext.funcRefresh()
        else if (!active)
            ClientService.getInactive().then(clients =>
                this.setState({ clients, IS_LOADING: false })
            )
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        return (
            <Container>
                <Heading
                    content={
                        <Fragment>
                            {APP_URLS.klienti.title}
                            <ModalClients refresh={this.refreshFromModal} />
                            <ActiveSwitcher onChange={this.refresh} active={this.state.active} />
                        </Fragment>
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
                                <td colSpan="5">
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <Fragment>
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
                            </Fragment>
                        )}
                    </tbody>
                </Table>
                {!Boolean(this.getClientsData().length) && !this.isLoading() && (
                    <p className="text-muted text-center">Žádní klienti</p>
                )}
            </Container>
        )
    }
}

export default WithClientsActiveContext(Clients)
