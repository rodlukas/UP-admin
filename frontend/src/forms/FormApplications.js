import React, {Component} from "react"
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from "reactstrap"
import ApplicationService from "../api/services/application"
import Select from "react-select"
import ClientService from "../api/services/client"

export default class FormApplications extends Component {
    constructor(props) {
        super(props)
        this.isObject = Boolean(Object.keys(props.application).length)
        const {id, course, client, note} = props.application
        console.log(props.application)
        this.state = {
            id: id || '',
            course_id: this.isObject ? course.id : null,
            client_id: this.isObject ? client.id : null,
            note: note || '',
            clients: []
        }
        this.courses = this.getCoursesArray(props.courses)
    }

    // pripravi pole s kurzy ve spravnem formatu, aby pak slo rovnou zaslat do API
    getCoursesArray(courses) {
        let arrayOfCourses = []
        courses.map(course => {
            return arrayOfCourses.push({
                course_id: course.id,
                label: course.name
            })
        })
        return arrayOfCourses
    }

    // pripravi pole s klienty ve spravnem formatu, aby pak slo rovnou zaslat do API
    getClientsArray(clients) {
        let arrayOfClients = []
        clients.map(client => {
            return arrayOfClients.push({
                client_id: client.id,
                label: client.surname + " " + client.name
            })
        })
        return arrayOfClients
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    handleChange = (obj) => {
        const state = this.state
        // first_key je client_id/course_id
        const first_key = Object.keys(obj)[0]
        state[first_key] = obj[first_key]
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, course_id, client_id, note} = this.state
        const data = {id, course_id, client_id, note}
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

    getClients = () => {
        ClientService.getAll()
            .then((response) => {
                this.setState({clients: this.getClientsArray(response)})
            })
    }

    componentDidMount() {
        this.getClients()
    }

    render() {
        const {client_id, clients, course_id, note} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isObject ? 'Úprava' : 'Přidání'} zájemce o kurz
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={3}>
                            Klient
                        </Label>
                        <Col sm={9}>
                            <Select
                                valueKey={'client_id'}
                                value={client_id}
                                onChange={this.handleChange}
                                options={clients}
                                placeholder={"Vyberte klienta..."}
                                noResultsText={"Nic nenalezeno"}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>
                            Kurz
                        </Col>
                        <Col sm={9}>
                            <Select
                                valueKey={'course_id'}
                                value={course_id}
                                onChange={this.handleChange}
                                options={this.courses}
                                placeholder={"Vyberte kurz..."}
                                noResultsText={"Nic nenalezeno"}/>
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
