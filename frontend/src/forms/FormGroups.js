import React, {Component} from "react"
import Select from "react-select"
import {Alert, Col, CustomInput, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader} from "reactstrap"
import ClientService from "../api/services/client"
import CourseService from "../api/services/course"
import GroupService from "../api/services/group"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Tooltip from "../components/Tooltip"
import {TEXTS} from "../global/constants"
import {alertRequired, clientName} from "../global/utils"
import "./forms.css"
import Or from "./helpers/Or"
import {selectStyles} from "./helpers/SelectCourseColors"
import ModalClients from "./ModalClients"

export default class FormGroups extends Component {
    constructor(props) {
        super(props)
        this.isGroup = Boolean(Object.keys(props.group).length)
        const {name, memberships, id, course, active} = props.group
        this.state = {
            id: id || '',
            name: name || '',
            active: this.isGroup ? active : true,
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
        CourseService.getVisible()
            .then(courses => this.setState({courses}))

    onSelectChange = (obj, name) => {
        // pri smazani vsech clenu React-select automaticky nastavi null, pro korektni fungovani (napr. push) je potreba udrzovat prazdne pole
        if (name === "memberships" && obj === null)
            obj = []
        this.setState({[name]: obj})
    }

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSubmit = e => {
        e.preventDefault()
        const {id, name, memberships, course, active} = this.state
        if(alertRequired("kurz", course))
            return
        const data = {id, name, memberships: this.prepareMembersForSubmit(memberships), course_id: course.id, active}
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

    getClientsAfterAddition = newClient =>
        ClientService.getAll()
            .then(clients => this.setState(prevState => {
                return {
                    clients,
                    memberships: [...prevState.memberships, newClient]
                }
            }))

    getClients = () =>
        ClientService.getAll()
            .then(clients => this.setState({clients}))

    componentDidMount() {
        this.getClients()
        this.getDataCourses()
    }

    render() {
        const {id, name, clients, memberships, courses, course, active} = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_group">
                <ModalHeader toggle={this.close}>{this.isGroup ? 'Úprava' : 'Přidání'} skupiny: {name}</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={2}>
                            Název
                        </Label>
                        <Col sm={10}>
                            <Input type="text" id="name" value={name} onChange={this.onChange} autoFocus
                                   data-qa="group_field_name" required spellCheck/>
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
                                styles={selectStyles}
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
                                getOptionLabel={option => clientName(option)}
                                getOptionValue={option => option.id}
                                isMulti
                                closeMenuOnSelect={false}
                                onChange={newValue => this.onSelectChange(newValue, "memberships")}
                                options={clients}
                                placeholder={"Vyberte členy z existujících klientů..."}
                                isClearable={false}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}/>
                            <Or content={<ModalClients refresh={this.getClientsAfterAddition} sendResult inSentence/>}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row className="align-items-center">
                        <Label for="active" sm={2} data-qa="group_label_active">
                            Aktivní
                        </Label>
                        <Col sm={10}>
                            <CustomInput type="checkbox" id="active" checked={active} label="Je aktivní"
                                         onChange={this.onChange} data-qa="group_checkbox_active"/>
                            {' '}
                            {!active &&
                            <Tooltip postfix="active"
                                     text="Neaktivním skupinám nelze vytvořit lekci."/>}
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
                                    data-qa="button_delete_group"
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
