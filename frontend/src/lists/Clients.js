import React, {Component} from "react"
import {Table, Button, Modal} from 'reactstrap'
import {Link} from 'react-router-dom'
import axios from "axios"
import FormClients from '../forms/FormClients'

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
        const ClientName = ({name, surname}) => <span>{surname} {name}</span>
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
                    {this.state.clients.map(client =>
                        <tr key={client.id}>
                            <td><ClientName name={client.name} surname={client.surname}/></td>
                            <td><a href={'tel:' + client.phone}>{client.phone}</a></td>
                            <td><a href={'mailto:' + client.email}>{client.email}</a></td>
                            <td>{client.note}</td>
                            <td>
                                <Button color="primary"
                                        onClick={() => this.toggle(client)}>Upravit</Button>{' '}
                                <Link to={"/klienti/" + client.id}>
                                    <Button color="secondary">Karta</Button></Link>
                            </td>
                        </tr>)
                    }
                    </tbody>
                </Table>
                {!Boolean(this.state.clients.length) &&
                <p className="text-muted text-center">
                    Žádní klienti
                </p>}
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormClients client={this.state.currentClient} funcClose={this.toggle}
                                    funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}