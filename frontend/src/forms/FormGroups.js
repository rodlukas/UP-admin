import React, {Component} from "react"
import Select from "react-select"
import {Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert} from "reactstrap"
import CourseService from "../api/services/course"
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"
import DeleteButton from "../components/buttons/DeleteButton"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import ClientName from "../components/ClientName"
import {TEXTS} from "../global/constants"
import {alertRequired} from "../global/utils"

export default class FormGroups extends Component {
    constructor(props) {
        super(props)
        this.isGroup = Boolean(Object.keys(props.group).length)
        const {name, memberships, id, course} = props.group
        this.state = {
            id: id || '',
            name: name || '',
            course: this.isGroup ? course : null,
            memberships: this.isGroup ? this.getMembers(memberships) : [],
            clients: [],
            courses: []
        }
    }

    // pripravi pole se cleny ve spravnem formatu, aby fungoval react-select
    getMembers(memberships) {
        let members = []
        memberships.map(membership =>
            members.push(membership.client))
        return members
    }

    // pripravi pole se cleny ve spravnem formatu, aby slo poslat do API
    prepareMembersForSubmit(memberships) {
        let members = []
        memberships.map(membership =>
            members.push({client_id: membership.id}))
        return members
    }

    getDataCourses = () =>
        CourseService.getAll()
            .then(courses => this.setState({courses}))

    onSelectChange = (obj, name) =>
        this.setState({[name]: obj})

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSubmit = e => {
        e.preventDefault()
        const {id, name, memberships, course} = this.state
        alertRequired("kurz", course)
        const data = {id, name, memberships: this.prepareMembersForSubmit(memberships), course_id: course.id}
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

    close = () =>
        this.props.funcClose()

    refresh = () =>
        this.props.funcRefresh()

    delete = id =>
        GroupService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })

    getClients = () =>
        ClientService.getAll()
            .then(clients => this.setState({clients}))

    componentDidMount() {
        this.getClients()
        this.getDataCourses()
    }

    render() {
        const {id, name, clients, memberships, courses, course} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>{this.isGroup ? 'Úprava' : 'Přidání'} skupiny: {name}</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={2}>
                            Název
                        </Label>
                        <Col sm={10}>
                            <Input type="text" id="name" value={name} onChange={this.onChange} autoFocus/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course" sm={2}>
                            Kurz
                        </Label>
                        <Col sm={10}>
                            <Select
                                inputId="course"
                                value={course}
                                getOptionLabel={option => option.name}
                                getOptionValue={option => option.id}
                                onChange={newValue => this.onSelectChange(newValue, "course")}
                                options={courses}
                                placeholder={"Vyberte kurz..."}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}
                                required/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="memberships" sm={2}>
                            Členové
                        </Label>
                        <Col sm={10}>
                            <Select
                                inputId="memberships"
                                value={memberships}
                                getOptionLabel={option => <ClientName client={option}/>}
                                getOptionValue={option => option.id}
                                isMulti
                                closeMenuOnSelect={false}
                                onChange={newValue => this.onSelectChange(newValue, "memberships")}
                                options={clients}
                                placeholder={"Vyberte členy skupiny..."}
                                isClearable={false}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}/>
                        </Col>
                    </FormGroup>
                    {this.isGroup &&
                    <FormGroup row className="border-top pt-3">
                        <Label sm={2} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={10}>
                            <Alert color="warning">
                                <p>Nenávratně smaže skupinu i s jejími lekcemi</p>
                                <DeleteButton
                                    content="skupinu"
                                    onClick={() => {
                                        if (window.confirm('Opravdu chcete smazat skupinu ' + name + '?'))
                                            this.delete(id)}}
                                />
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton content={this.isGroup ? 'Uložit' : 'Přidat'}/>
                </ModalFooter>
            </Form>
        )
    }
}
