import React, {Component} from "react"
import {Table, Button, Modal} from 'reactstrap'
import axios from "axios"
import FormEditClient from '../components/FormEditClient'

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            users: [],
            modal: false,
            currentUser: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(user = []) {
        this.setState({
            currentUser: user,
            modal: !this.state.modal
        })
    }

    getUsers = () => {
        axios.get('/api/v1/clients/')
            .then((response) => {
                this.setState({users: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getUsers()
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
                        this.state.users.map(
                            user =>
                                <tr key={user.id.toString()}>
                                    <td>{user.surname} {user.name}</td>
                                    <td><a href={'tel:' + user.phone}>{user.phone}</a></td>
                                    <td><a href={'mailto:' + user.email}>{user.email}</a></td>
                                    <td>{user.note}</td>
                                    <td>
                                        <Button color="primary" onClick={() => this.toggle(user)}>Upravit</Button>{' '}
                                        <Button color="secondary">Karta</Button>{' '}
                                        <Button color="info">Přidat kurz</Button>
                                    </td>
                                </tr>)
                    }
                    </tbody>
                </Table>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <FormEditClient user={this.state.currentUser} funcClose={this.toggle} funcRefresh={this.getUsers}/>
                </Modal>
            </div>
        )
    }
}
