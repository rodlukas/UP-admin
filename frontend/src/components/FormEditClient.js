import React, {Component} from "react"
import axios from 'axios'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

export default class FormEditClient extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: props.user.id,
            name: props.user.name,
            surname: props.user.surname,
            email: props.user.email,
            phone: props.user.phone,
            note: props.user.note
        }
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        // get our form data out of state
        const {name, surname, email, phone, note, id} = this.state

        axios.put('/api/v1/clients/' + id + '/', {id, name, surname, email, phone, note})
            .then((response) => {
                this.setState({users: response.data})
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
                <ModalHeader toggle={this.toggle}>Úprava klienta</ModalHeader>
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
                            <Label for="note" sm={2}>Poznámka</Label>
                            <Col sm={10}>
                                <Input type="text" name="note" id="note" value={note} onChange={this.onChange}/>
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

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" type="submit">Uložit</Button>{' '}
                    <Button color="secondary" onClick={this.toggle}>Zrušit</Button>
                </ModalFooter>
            </Form>
        )
    }
}
