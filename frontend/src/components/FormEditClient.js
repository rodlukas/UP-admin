import React, {Component} from "react"
import axios from 'axios'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

export default class FormEditClient extends Component {
    constructor(props) {
        super(props)
        this.isClient = false
        const {id, name, surname, email, phone, note} = props.client
        this.state = {
            id: id || '',
            name: name || '',
            surname: surname || '',
            email: email || '',
            phone: phone || '',
            note: note || ''
        }
        if(props.client.length !== 0)
            this.isClient = true
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, name, surname, email, phone, note} = this.state
        let request
        if(this.isClient)
            request = axios.put('/api/v1/clients/' + id + '/', {id, name, surname, email, phone, note})
        else
            request = axios.post('/api/v1/clients/', {name, surname, email, phone, note})
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

    render() {
        const {name, surname, email, phone, note} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>{this.isClient ? 'Úprava' : 'Přidání'} klienta</ModalHeader>
                <ModalBody>
                        <FormGroup row>
                            <Label for="name" sm={2}>Jméno</Label>
                            <Col sm={10}>
                                <Input type="text" name="name" id="name" value={name} onChange={this.onChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="surname" sm={2}>Příjmení</Label>
                            <Col sm={10}>
                                <Input type="text" name="surname" id="surname" value={surname} onChange={this.onChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="email" sm={2}>Email</Label>
                            <Col sm={10}>
                                <Input type="email" name="email" id="email" value={email} onChange={this.onChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="phone" sm={2}>Telefon</Label>
                            <Col sm={10}>
                                <Input type="tel" name="phone" id="phone" value={phone} onChange={this.onChange}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="note" sm={2}>Poznámka</Label>
                            <Col sm={10}>
                                <Input type="text" name="note" id="note" value={note} onChange={this.onChange}/>
                            </Col>
                        </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="submit">{this.isClient ? 'Uložit' : 'Přidat'}</Button>{' '}
                    <Button color="secondary" onClick={this.close}>Zrušit</Button>
                </ModalFooter>
            </Form>
        )
    }
}
