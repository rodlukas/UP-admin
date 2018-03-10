import React, {Component} from "react"
import {Table, Button, Modal} from 'reactstrap'
import axios from "axios"
import FormEditClient from '../components/FormEditClient'

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            clients: [],
            modal: false,
            currentClient: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(client = []) {
        this.setState({
            currentClient: client,
            modal: !this.state.modal
        })
    }

    getClients = () => {
        axios.get('/api/v1/clients/')
            .then((response) => {
                this.setState({clients: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Button color="info" onClick={() => this.toggle()}>Přidat klienta</Button>
                <Table striped size="sm">
                    <thead className="thead-dark">
                    <tr>
                        <th>Jméno</th>
                        <th>Telefon</th>
                        <th>E-mail</th>
                        <th>Poznámka</th>
                        <th>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.clients.map(
                            client =>
                                <tr key={client.id.toString()}>
                                    <td>{client.surname} {client.name}</td>
                                    <td><a href={'tel:' + client.phone}>{client.phone}</a></td>
                                    <td><a href={'mailto:' + client.email}>{client.email}</a></td>
                                    <td>{client.note}</td>
                                    <td>
                                        <Button color="primary" onClick={() => this.toggle(client)}>Upravit</Button>{' '}
                                        <Button color="secondary">Karta</Button>
                                    </td>
                                </tr>)
                    }
                    </tbody>
                </Table>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormEditClient client={this.state.currentClient} funcClose={this.toggle} funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}
