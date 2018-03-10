import React, {Component} from "react"
import axios from 'axios'
import Select from 'react-select';
import 'react-select/dist/react-select.css'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

export default class FormEditGroup extends Component {
    constructor(props) {
        super(props)
        this.isGroup = false
        const {name, memberships, id} = props.group

        let memberships_tmp = []
        if (props.group.length !== 0)
        {
            this.isGroup = true
            memberships.map(membership => {
                return memberships_tmp.push({
                    client_id: membership.client.id,
                    label: membership.client.name + " " + membership.client.surname
                })
            })
        }

        this.state = {
            id: id || '',
            name: name || '',
            memberships: memberships_tmp,
            clients: []
        }
    }

    handleChange = (memberships) => {
        this.setState({memberships});
        //selectedOptions.forEach(selectedOption => console.log(`Selected: ${selectedOption.label}`));
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, name, memberships} = this.state
        let request
        if (this.isGroup)
            request = axios.put('/api/v1/groups/' + id + '/', {id, name, memberships})
        else
            request = axios.post('/api/v1/groups/', {name, memberships})
        request.then(() => {
            this.close()
            this.refresh()
        })
            .catch((error) => {
                console.log(error)
            })
    }

    close = () => {
        this.props.funcClose();
    }

    refresh = () => {
        this.props.funcRefresh();
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

    componentWillMount() {
        this.getClients()
    }

    render() {
        let clients = []
        this.state.clients.map(client => {
            return clients.push({client_id: client.id, label: client.name + " " + client.surname})
        })
        const {name} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>{this.isGroup ? 'Úprava' : 'Přidání'} skupiny</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={2}>Název</Label>
                        <Col sm={10}>
                            <Input type="text" name="name" id="name" value={name} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="surname" sm={2}>Členové</Label>
                        <Col sm={10}>
                            <Select
                                name="form-field-name"
                                closeOnSelect={false}
                                valueKey={'client_id'}
                                value={this.state.memberships}
                                multi={true}
                                onChange={this.handleChange}
                                options={clients}
                                placeholder={"Vyberte členy skupiny..."}
                                noResultsText={"Nic nenalezeno"}
                            />
                        </Col>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="submit">{this.isGroup ? 'Uložit' : 'Přidat'}</Button>{' '}
                    <Button color="secondary" onClick={this.close}>Zrušit</Button>
                </ModalFooter>
            </Form>
        )
    }
}
