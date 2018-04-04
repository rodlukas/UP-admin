import React, {Component} from "react"
import {Table, Button, Modal, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import FormClients from '../forms/FormClients'
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            clients: [],
            modal: false,
            currentClient: {}
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
                this.setState({clients: response})
            })
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {clients, currentClient} = this.state
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
                        <tbody>
                        {clients.map(client =>
                            <tr key={client.id}>
                                <td><ClientName name={client.surname} surname={client.name}/></td>
                                <td><a href={'tel:' + client.phone}>{client.phone}</a></td>
                                <td><a href={'mailto:' + client.email}>{client.email}</a></td>
                                <td>{client.note}</td>
                                <td>
                                    <Button color="primary"
                                            onClick={() => this.toggle(client)}>Upravit</Button>{' '}
                                    <Link to={"/klienti/" + client.id}>
                                        <Button color="secondary">Karta</Button></Link>
                                </td>
                            </tr>)}
                        </tbody>
                    </Table>
                    {!Boolean(clients.length) &&
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
