import React, {Component} from "react"
import {Table, Button, Modal, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import FormClients from '../forms/FormClients'
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"
import Loading from "../api/Loading"

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            clients: [],
            modal: false,
            currentClient: {},
            loading: true
        }
    }

    toggle = (client = {}) => {
        this.setState({
            currentClient: client,
            modal: !this.state.modal
        })
    }

    getClients = () => {
        ClientService
            .getAll()
            .then((response) => {
                this.setState({clients: response, loading: false})
            })
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {clients, currentClient} = this.state
        const ClientTable = () =>
            <tbody>
            {clients.map(client =>
                <tr key={client.id}>
                    <td className="col-2"><ClientName name={client.surname} surname={client.name}/></td>
                    <td><a href={'tel:' + client.phone}>{client.phone}</a></td>
                    <td><a href={'mailto:' + client.email}>{client.email}</a></td>
                    <td>{client.note}</td>
                    <td className="col-2">
                        <Button color="primary"
                                onClick={() => this.toggle(client)}>Upravit</Button>{' '}
                        <Link to={"/klienti/" + client.id}>
                            <Button color="secondary">Karta</Button></Link>
                    </td>
                </tr>)}
            </tbody>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        {this.title}
                        <Button color="info" className="addBtn" onClick={() => this.toggle()}>Přidat klienta</Button>
                    </h1>
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
                        {this.state.loading ?
                            <tbody><tr><td colSpan="5"><Loading/></td></tr></tbody> :
                            <ClientTable/>}
                    </Table>
                    {!Boolean(clients.length) && !this.state.loading &&
                    <p className="text-muted text-center">
                        Žádní klienti
                    </p>}
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} autoFocus={false}>
                    <FormClients client={currentClient} funcClose={this.toggle} funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}
