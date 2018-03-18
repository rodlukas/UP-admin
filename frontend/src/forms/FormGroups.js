import React, {Component} from "react"
import axios from 'axios'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Badge} from 'reactstrap'
import AuthService from "../Auth/AuthService"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"

export default class FormGroups extends Component {
    constructor(props) {
        super(props)
        this.isGroup = Boolean(Object.keys(props.group).length)
        const {name, memberships, id, course} = props.group
        this.state = {
            id: id || '',
            name: name || '',
            course_id: this.isGroup ? course.id : "undef",
            memberships: this.isGroup ? this.getMembersArray(memberships) : [],
            clients: [],
            courses: []
        }
    }

    getMembersArray(memberships) {
        // pripravi pole se cleny ve spravnem formatu, aby pak slo rovnou zaslat do API
        let arrayOfMembers = []
        memberships.map(membership => {
            return arrayOfMembers.push({
                client_id: membership.client.id,
                label: membership.client.name + " " + membership.client.surname
            })
        })
        return arrayOfMembers
    }

    getDataCourses = () => {
        axios.get(API_URL + 'courses/', AuthService.getHeaders())
            .then((response) => {
                this.setState({courses: response.data})
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR_LOADING, NOTIFY_LEVEL.ERROR)
            })
    }

    handleChange = (memberships) => {
        this.setState({memberships})
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, name, memberships, course_id} = this.state
        const data = {name, memberships, course_id}
        let request
        if (this.isGroup)
            request = axios.put(API_URL + 'groups/' + id + '/', data, AuthService.getHeaders())
        else
            request = axios.post(API_URL + 'groups/', data, AuthService.getHeaders())
        request.then(() => {
            this.close()
            this.refresh()
            this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
        })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
            })
    }

    close = () => {
        this.props.funcClose()
    }

    refresh = () => {
        this.props.funcRefresh()
    }

    delete = (id) => {
        axios.delete(API_URL + 'groups/' + id + '/', AuthService.getHeaders())
            .then(() => {
                this.close()
                this.refresh()
                this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
            })
    }

    getClients = () => {
        axios.get(API_URL + 'clients/', AuthService.getHeaders())
            .then((response) => {
                let clients = []
                response.data.map(client => {
                    return clients.push({
                        client_id: client.id,
                        label: client.name + " " + client.surname})
                })
                this.setState({clients: clients})
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR_LOADING, NOTIFY_LEVEL.ERROR)
            })
    }

    componentWillMount() {
        this.getClients()
        this.getDataCourses()
    }

    render() {
        const {id, name, clients, memberships, courses, course_id} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>{this.isGroup ? 'Úprava' : 'Přidání'} skupiny: {name}</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={2}>Název</Label>
                        <Col sm={10}>
                            <Input type="text" name="name" id="name" value={name} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course_id" sm={2}>Kurz</Label>
                        <Col sm={10}>
                            <Input type="select" bsSize="sm" name="course_id" id="course_id" value={course_id} onChange={this.onChange} required="true">
                                <option disabled value="undef">Vyberte kurz...</option>
                                {courses.map(course =>
                                    <option key={course.id} value={course.id}>{course.name}</option>)}
                            </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="surname" sm={2}>Členové</Label>
                        <Col sm={10}>
                            <Select
                                name="form-field-name"
                                valueKey={'client_id'}
                                value={memberships}
                                multi={true}
                                onChange={this.handleChange}
                                options={clients}
                                placeholder={"Vyberte členy skupiny..."}
                                noResultsText={"Nic nenalezeno"}
                            />
                        </Col>
                    </FormGroup>
                    {this.isGroup &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={2} className="text-muted">Smazání</Label>
                        <Col sm={10}>
                            <Button color="danger"
                                    onClick={() => {
                                        if (window.confirm('Opravdu chcete smazat skupinu ' + name + '?'))
                                            this.delete(id)}}>
                                Smazat skupinu</Button>{' '}
                            <Badge color="warning" pill>Nevratně smaže skupinu i s jejími lekcemi</Badge>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>Zrušit</Button>{' '}
                    <Button color="primary" type="submit">{this.isGroup ? 'Uložit' : 'Přidat'}</Button>
                </ModalFooter>
            </Form>
        )
    }
}
