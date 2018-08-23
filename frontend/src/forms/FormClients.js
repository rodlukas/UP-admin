import React, {Component} from "react"
import {Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert} from "reactstrap"
import ClientService from "../api/services/client"
import ClientName from "../components/ClientName"
import DeleteButton from "../components/buttons/DeleteButton"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"

export default class FormClients extends Component {
    constructor(props) {
        super(props)
        this.isClient = Boolean(Object.keys(props.client).length)
        const {id, name, surname, email, phone, note} = props.client
        this.state = {
            id: id || '',
            name: name || '',
            surname: surname || '',
            email: email || '',
            phone: phone || '',
            note: note || ''
        }
    }

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSubmit = e => {
        e.preventDefault()
        const {id, name, surname, email, phone, note} = this.state
        const data = {id, name, surname, email, phone, note}
        let request
        if (this.isClient)
            request = ClientService.update(data)
        else
            request = ClientService.create(data)
        request.then(() => {
            this.close()
            this.refresh()
        })
    }

    close = () =>
        this.props.funcClose()

    refresh = () =>
        this.props.funcRefresh()

    delete = id =>
        ClientService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })

    render() {
        const {id, name, surname, email, phone, note} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isClient ? 'Úprava' : 'Přidání'} klienta:
                    {' '}
                    <ClientName client={{name, surname}}/>
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={2}>
                            Jméno
                        </Label>
                        <Col sm={10}>
                            <Input type="text" id="name" value={name} onChange={this.onChange} required autoFocus/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="surname" sm={2}>
                            Příjmení
                        </Label>
                        <Col sm={10}>
                            <Input type="text" id="surname" value={surname} onChange={this.onChange} required/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="email" sm={2}>
                            Email
                        </Label>
                        <Col sm={10}>
                            <Input type="email" id="email" value={email} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="phone" sm={2}>
                            Telefon
                        </Label>
                        <Col sm={10}>
                            <Input type="tel" id="phone" value={phone} minLength="9" onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="note" sm={2}>
                            Poznámka
                        </Label>
                        <Col sm={10}>
                            <Input type="textarea" id="note" value={note} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    {this.isClient &&
                    <FormGroup row className="border-top pt-3">
                        <Label sm={2} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={10}>
                            <Alert color="warning">
                                <p>Klienta lze smazat pouze pokud nemá žádné lekce, smažou se také všechny jeho zájmy o kurzy</p>
                                <DeleteButton
                                    title="klienta"
                                    onClick={() => {
                                    if (window.confirm('Opravdu chcete smazat klienta ' + name + ' ' + surname + '?'))
                                        this.delete(id)}}
                                />
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton title={this.isClient ? 'Uložit' : 'Přidat'}/>
                </ModalFooter>
            </Form>
        )
    }
}
