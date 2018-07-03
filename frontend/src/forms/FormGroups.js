import React, {Component} from "react"
import Select from "react-select"
import "react-select/dist/react-select.css"
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert, CustomInput} from "reactstrap"
import CourseService from "../api/services/course"
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"

const UNDEF = "undef"

export default class FormGroups extends Component {
    constructor(props) {
        super(props)
        this.isGroup = Boolean(Object.keys(props.group).length)
        const {name, memberships, id, course} = props.group
        this.state = {
            id: id || '',
            name: name || '',
            course_id: this.isGroup ? course.id : UNDEF,
            memberships: this.isGroup ? this.getMembersArray(memberships) : [],
            clients: [],
            courses: []
        }
    }

    // pripravi pole se cleny ve spravnem formatu, aby pak slo rovnou zaslat do API
    getMembersArray(memberships) {
        let arrayOfMembers = []
        memberships.map(membership => {
            return arrayOfMembers.push({
                client_id: membership.client.id,
                label: membership.client.surname + " " + membership.client.name})
        })
        return arrayOfMembers
    }

    getDataCourses = () => {
        CourseService.getAll()
            .then((response) => {
                this.setState({courses: response})
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
        const data = {id, name, memberships, course_id}
        let request
        if (this.isGroup)
            request = GroupService.update(data)
        else
            request = GroupService.create(data)
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

    delete = (id) => {
        GroupService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })
    }

    getClients = () => {
        ClientService.getAll()
            .then((response) => {
                let clients = []
                response.map(client => {
                    return clients.push({
                        client_id: client.id,
                        label: client.surname + " " + client.name})
                })
                this.setState({clients: clients})
            })
    }

    componentDidMount() {
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
                        <Label for="name" sm={2}>
                            Název
                        </Label>
                        <Col sm={10}>
                            <Input type="text" name="name" id="name" value={name} onChange={this.onChange} autoFocus/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course_id" sm={2}>
                            Kurz
                        </Label>
                        <Col sm={10}>
                            <CustomInput type="select" name="course_id" id="course_id" value={course_id} onChange={this.onChange} required>
                                <option disabled value={UNDEF}>
                                    Vyberte kurz...
                                </option>
                                {courses.map(course =>
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>)}
                            </CustomInput>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="surname" sm={2}>
                            Členové
                        </Label>
                        <Col sm={10}>
                            <Select
                                valueKey={'client_id'}
                                value={memberships}
                                multi={true}
                                onChange={this.handleChange}
                                options={clients}
                                placeholder={"Vyberte členy skupiny..."}
                                noResultsText={"Nic nenalezeno"}/>
                        </Col>
                    </FormGroup>
                    {this.isGroup &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={2} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={10}>
                            <Alert color="warning">
                                <p>Nenávratně smaže skupinu i s jejími lekcemi</p>
                                <Button color="danger"
                                        onClick={() => {
                                            if (window.confirm('Opravdu chcete smazat skupinu ' + name + '?'))
                                                this.delete(id)
                                        }}>Smazat skupinu</Button>
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>
                        Storno
                    </Button>
                    {' '}
                    <Button color="primary" type="submit">
                        {this.isGroup ? 'Uložit' : 'Přidat'}
                    </Button>
                </ModalFooter>
            </Form>
        )
    }
}
