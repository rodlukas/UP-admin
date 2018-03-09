import React, {Component} from "react"
import {Table, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import axios from "axios"
import FormEditClient from '../components/FormEditClient'

export default class ClientList extends Component {
    constructor(props) {
        super(props)
        this.title = "Klienti"
        this.state = {
            users: [],
            modal: false,
            currentuser: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(user) {
        this.setState({
            currentuser: user,
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
                <Button color="info" onClick={this.toggle}>Přidat klienta</Button>
                <Table>
                    <thead>
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
                                        <Button color="primary" onClick={() => this.toggle(user)}>Upravit</Button>
                                        &nbsp;<Button color="secondary" onClick={this.toggle}>Karta</Button>
                                        &nbsp;<Button color="info" onClick={this.toggle}>Přidat kurz</Button>
                                    </td>
                                </tr>)
                    }
                    </tbody>
                </Table>
                <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                    <ModalHeader toggle={this.toggle}>Modal title</ModalHeader>
                    <ModalBody>
                        <FormEditClient user={this.state.currentuser}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggle}>Do Something</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}
