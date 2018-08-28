import React, {Component} from "react"
import {Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from "reactstrap"
import ApplicationService from "../api/services/application"
import Select from "react-select"
import ClientService from "../api/services/client"
import SubmitButton from "../components/buttons/SubmitButton"
import CancelButton from "../components/buttons/CancelButton"
import ClientName from "../components/ClientName"
import {TEXTS} from "../global/constants"

export default class FormApplications extends Component {
    constructor(props) {
        super(props)
        this.isObject = Boolean(Object.keys(props.application).length)
        const {id, course, client, note} = props.application
        this.state = {
            id: id || '',
            course: this.isObject ? course : null,
            client: this.isObject ? client : null,
            note: note || '',
            clients: []
        }
    }

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSelectChange = (obj, name) =>
        this.setState({[name]: obj})

    onSubmit = e => {
        e.preventDefault()
        const {id, course, client, note} = this.state
        const data = {id, course_id: course.id, client_id: client.id, note}
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

    close = () =>
        this.props.funcClose()

    refresh = () =>
        this.props.funcRefresh()

    getClients = () =>
        ClientService.getAll()
            .then(clients => this.setState({clients}))

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {client, clients, course, note} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isObject ? 'Úprava' : 'Přidání'} zájemce o kurz
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="client" sm={3}>
                            Klient
                        </Label>
                        <Col sm={9}>
                            <Select
                                inputId="client"
                                value={client}
                                getOptionLabel={option => <ClientName client={option}/>}
                                getOptionValue={option => option.id}
                                onChange={newValue => this.onSelectChange(newValue, "client")}
                                options={clients}
                                placeholder={"Vyberte klienta..."}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}
                                required/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col id="course" sm={3}>
                            Kurz
                        </Col>
                        <Col sm={9}>
                            <Select
                                inputId="course"
                                value={course}
                                getOptionLabel={option => option.name}
                                getOptionValue={option => option.id}
                                onChange={newValue => this.onSelectChange(newValue, "course")}
                                options={this.props.courses}
                                placeholder={"Vyberte kurz..."}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}
                                required/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="note" sm={3}>
                            Poznámka
                        </Label>
                        <Col sm={9}>
                            <Input type="textarea" id="note" value={note} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton content={this.isObject ? 'Uložit' : 'Přidat'}/>
                </ModalFooter>
            </Form>
        )
    }
}
