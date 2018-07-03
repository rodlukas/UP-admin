import React, {Component} from "react"
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from "reactstrap"
import ApplicationService from "../api/services/application"
import ClientName from "../components/ClientName"

export default class FormApplications extends Component {
    constructor(props) {
        super(props)
        this.isObject = Boolean(Object.keys(props.application).length)
        const {id, course, client, note} = props.application
        console.log(props.application)
        this.state = {
            id: id || '',
            course: course || {},
            client: client || {},
            note: note || '',
            courses: [],
            clients: []
        }
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, name, visible} = this.state
        const data = {id, name, visible}
        let request
        if (this.isObject)
            request = ApplicationService.update(data)
        else
            request = ApplicationService.create(data)
        request.then(() => {
            this.close()
            this.refresh()
        })
    }

    close = () => {
        this.props.funcClose()
    }

    refresh = () => {
        this.props.funcRefresh()
    }

    render() {
        const {client, course, note} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isObject ? 'Úprava' : 'Přidání'} zájemce:
                    {' '}
                    <ClientName client={client}/>
                    {' '}({course.name})
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={3}>
                            Klient
                        </Label>
                        <Col sm={9}>

                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            Kurz
                        </Col>
                        <Col sm={9}>

                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="note" sm={3}>
                            Poznámka
                        </Label>
                        <Col sm={9}>
                            <Input type="textarea" name="note" id="note" value={note} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>
                        Storno
                    </Button>
                    {' '}
                    <Button color="primary" type="submit">
                        {this.isObject ? 'Uložit' : 'Přidat'}
                    </Button>
                </ModalFooter>
            </Form>
        )
    }
}
