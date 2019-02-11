import React, {Component, Fragment} from "react"
import {Table, Modal, Container} from "reactstrap"
import FormClients from "../forms/FormClients"
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"
import Loading from "../components/Loading"
import Email from "../components/Email"
import Phone from "../components/Phone"
import Note from "../components/Note"
import EditButton from "../components/buttons/EditButton"
import AddButton from "../components/buttons/AddButton"
import Heading from "../components/Heading"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            clients: [],
            IS_MODAL: false,
            currentClient: {},
            IS_LOADING: true,
            active: true
        }
    }

    toggle = (client = {}) =>
        this.setState({
            currentClient: client,
            IS_MODAL: !this.state.IS_MODAL
        })

    refresh = (active = this.state.active) => {
        this.setState({IS_LOADING: true, active: active}, () => this.getClients(active))
    }

    getClients = (active = this.state.active) => {
        const request = active ? ClientService.getActive() : ClientService.getInactive()
        request.then(clients => this.setState({clients, IS_LOADING: false}))
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {clients, currentClient, IS_MODAL, IS_LOADING} = this.state
        const ClientTable = () =>
            <tbody>
            {clients.map(client =>
                <tr key={client.id} data-qa="client">
                    <td style={{minWidth: '13em', width: '13em'}}>
                        <ClientName client={client} link/>
                    </td>
                    <td style={{minWidth: '7em'}}>
                        <Phone phone={client.phone}/>
                    </td>
                    <td>
                        <Email email={client.email}/>
                    </td>
                    <td>
                        <Note note={client.note}/>
                    </td>
                    <td>
                        <EditButton onClick={() => this.toggle(client)} data-qa="button_edit_client"/>
                    </td>
                </tr>)}
            </tbody>
        const HeadingContent = () =>
            <Fragment>
                Klienti
                <AddButton content="Přidat klienta" onClick={() => this.toggle()} data-qa="button_add_client"/>
                <ActiveSwitcher onChange={this.refresh} active={this.state.active}/>
            </Fragment>
        return (
            <div>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    <Table striped size="sm" responsive className="pageContent">
                        <thead className="thead-dark">
                        <tr>
                            <th>Příjmení a jméno</th>
                            <th>Telefon</th>
                            <th style={{wordBreak: 'keep-all'}}>E-mail</th>
                            <th>Poznámka</th>
                            <th>Akce</th>
                        </tr>
                        </thead>
                        {IS_LOADING ?
                            <tbody>
                                <tr>
                                    <td colSpan="5">
                                        <Loading/>
                                    </td>
                                </tr>
                            </tbody> :
                            <ClientTable/>}
                    </Table>
                    {!Boolean(clients.length) && !IS_LOADING &&
                    <p className="text-muted text-center">
                        Žádní klienti
                    </p>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormClients client={currentClient} funcClose={this.toggle} funcRefresh={this.refresh}/>
                </Modal>
            </div>
        )
    }
}
