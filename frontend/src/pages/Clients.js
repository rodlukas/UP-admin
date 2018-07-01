import React, {Component} from "react"
import {Table, Button, Modal, Container} from 'reactstrap'
import {Link} from 'react-router-dom'
import FormClients from '../forms/FormClients'
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"
import Loading from "../api/Loading"
import APP_URLS from "../urls"

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
            .then((response) => {
                this.setState({clients: response, IS_LOADING: false})
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
                    <td className="col-md-4 col-lg-2 col-xl-2"><ClientName name={client.surname} surname={client.name}/></td>
                    <td><a href={'tel:' + client.phone}>{client.phone}</a></td>
                    <td><a href={'mailto:' + client.email}>{client.email}</a></td>
                    <td>{client.note}</td>
                    <td className="col-md-4 col-lg-2 col-xl-2">
                        <Button color="primary"
                                onClick={() => this.toggle(client)}>Upravit</Button>{' '}
                        <Link to={APP_URLS.klienti + "/" + client.id}>
                            <Button color="secondary">Karta</Button></Link>
                    </td>
                </tr>)}
            </tbody>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        Klienti
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
                        {this.state.IS_LOADING ?
                            <tbody><tr><td colSpan="5"><Loading/></td></tr></tbody> :
                            <ClientTable/>}
                    </Table>
                    {!Boolean(clients.length) && !this.state.IS_LOADING &&
                    <p className="text-muted text-center">
                        Žádní klienti
                    </p>}
                </Container>
                <Modal isOpen={this.state.IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormClients client={currentClient} funcClose={this.toggle} funcRefresh={this.getClients}/>
                </Modal>
            </div>
        )
    }
}
