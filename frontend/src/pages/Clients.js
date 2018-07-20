import React, {Component, Fragment} from "react"
import {Table, Modal, Container} from "reactstrap"
import FormClients from "../forms/FormClients"
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"
import Loading from "../api/Loading"
import Email from "../components/Email"
import Phone from "../components/Phone"
import Note from "../components/Note"
import EditButton from "../components/buttons/EditButton"
import AddButton from "../components/buttons/AddButton"
import Heading from "../components/Heading"

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            clients: [],
            IS_MODAL: false,
            currentClient: {},
            IS_LOADING: true
        }
    }

    toggle = (client = {}) => {
        this.setState({
            currentClient: client,
            IS_MODAL: !this.state.IS_MODAL
        })
    }

    getClients = () => {
        ClientService.getAll()
            .then(clients => this.setState({clients, IS_LOADING: false}))
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {clients, currentClient, IS_MODAL, IS_LOADING} = this.state
        const ClientTable = () =>
            <tbody>
            {clients.map(client =>
                <tr key={client.id}>
                    <td className="col-md-4 col-lg-2 col-xl-2">
                        <ClientName client={client} link/>
                    </td>
                    <td>
                        <Phone phone={client.phone}/>
                    </td>
                    <td>
                        <Email email={client.email}/>
                    </td>
                    <td>
                        <Note note={client.note}/>
                    </td>
                    <td className="col-md-4 col-lg-2 col-xl-2">
                        <EditButton onClick={() => this.toggle(client)}/>
                    </td>
                </tr>)}
            </tbody>
        const HeadingContent = () =>
            <Fragment>
                Klienti
                <AddButton title="Přidat klienta" onClick={() => this.toggle()}/>
            </Fragment>
        return (
            <div>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    <Table striped size="sm" responsive>
                        <thead className="thead-dark">
                        <tr>
                            <th>Příjmení a jméno</th>
                            <th>Telefon</th>
                            <th>E-mail</th>
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
                    <FormClients client={currentClient} funcClose={this.toggle} funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}
