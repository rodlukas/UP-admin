import React, { Component, Fragment } from "react"
import { Alert, Col, CustomInput, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import GroupName from "../components/GroupName"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import { WithCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { alertRequired, clientName } from "../global/utils"
import "./forms.css"
import CustomReactSelect from "./helpers/CustomReactSelect"
import { react_select_ids } from "./helpers/func"
import Or from "./helpers/Or"
import SelectCourse from "./helpers/SelectCourse"
import ModalClients from "./ModalClients"

class FormGroups extends Component {
    isGroup = Boolean(Object.keys(this.props.group).length)

    state = {
        id: this.props.group.id || "",
        name: this.props.group.name || "",
        active: this.isGroup ? this.props.group.active : true,
        course: this.isGroup ? this.props.group.course : null,
        memberships: this.isGroup ? this.getMembers(this.props.group.memberships) : [],
        clients: [],
        IS_LOADING: true,
        IS_SUBMIT: false
    }

    // pripravi pole se cleny ve spravnem formatu, aby fungoval react-select
    getMembers(memberships) {
        let members = []
        memberships.map(membership => members.push(membership.client))
        return members
    }

    // pripravi pole se cleny ve spravnem formatu, aby slo poslat do API
    prepareMembersForSubmit(memberships) {
        let members = []
        memberships.map(membership => members.push({ client_id: membership.id }))
        return members
    }

    onSelectChange = (obj, name) => {
        this.props.setFormDirty()
        // pri smazani vsech clenu React-select automaticky nastavi null, pro korektni fungovani (napr. push) je potreba udrzovat prazdne pole
        if (name === "memberships" && obj === null) obj = []
        this.setState({ [name]: obj })
    }

    onChange = e => {
        this.props.setFormDirty()
        const target = e.target
        const value = target.type === "checkbox" ? target.checked : target.value
        this.setState({ [target.id]: value })
    }

    onSubmit = e => {
        e.preventDefault()
        const { id, name, memberships, course, active } = this.state
        if (alertRequired("kurz", course)) return
        const data = {
            id,
            name,
            memberships: this.prepareMembersForSubmit(memberships),
            course_id: course.id,
            active
        }
        let request
        if (this.isGroup) request = GroupService.update(data)
        else request = GroupService.create(data)
        this.setState({ IS_SUBMIT: true }, () =>
            request
                .then(response => {
                    this.props.sendResult && this.props.funcProcessAdditionOfGroup(response)
                    this.props.funcForceClose(true, { active: response.active, isDeleted: false })
                })
                .catch(() => {
                    this.setState({ IS_SUBMIT: false })
                })
        )
    }

    close = () => this.props.funcClose()

    delete = id =>
        GroupService.remove(id).then(() =>
            this.props.funcForceClose(true, { active: this.state.active, isDeleted: true })
        )

    processAdditionOfClient = newClient => {
        this.props.setFormDirty()
        this.setState(prevState => {
            return {
                memberships: [...prevState.memberships, newClient]
            }
        })
    }

    getClientsAfterAddition = () => {
        this.setState({ IS_LOADING: true }, this.getClients)
    }

    getClients = () =>
        ClientService.getAll().then(clients =>
            this.setState({
                clients,
                IS_LOADING: false
            })
        )

    componentDidMount() {
        this.getClients()
        this.props.coursesVisibleContext.funcRefresh()
    }

    render() {
        const { id, name, clients, memberships, course, active } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_group">
                <ModalHeader toggle={this.close}>
                    {this.isGroup ? "Úprava" : "Přidání"} skupiny:{" "}
                    <GroupName group={{ name }} bold />
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded || this.state.IS_LOADING ? (
                        <Loading />
                    ) : (
                        <Fragment>
                            <FormGroup row className="required">
                                <Label for="name" sm={2}>
                                    Název
                                </Label>
                                <Col sm={10}>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={this.onChange}
                                        autoFocus
                                        data-qa="group_field_name"
                                        required
                                        spellCheck
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row className="required">
                                <Label for="course" sm={2}>
                                    Kurz
                                </Label>
                                <Col sm={10}>
                                    <SelectCourse
                                        value={course}
                                        onChangeCallback={this.onSelectChange}
                                        options={this.props.coursesVisibleContext.courses}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="memberships" sm={2}>
                                    Členové
                                </Label>
                                <Col sm={10}>
                                    <CustomReactSelect
                                        {...react_select_ids("memberships")}
                                        value={memberships}
                                        getOptionLabel={option => clientName(option)}
                                        getOptionValue={option => option.id}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        onChange={newValue =>
                                            this.onSelectChange(newValue, "memberships")
                                        }
                                        options={clients}
                                        placeholder={"Vyberte členy z existujících klientů..."}
                                        isClearable={false}
                                    />
                                    <Or
                                        content={
                                            <ModalClients
                                                refresh={this.getClientsAfterAddition}
                                                processAdditionOfClient={
                                                    this.processAdditionOfClient
                                                }
                                                sendResult
                                                inSentence
                                            />
                                        }
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row className="align-items-center">
                                <Label for="active" sm={2} data-qa="group_label_active">
                                    Aktivní
                                </Label>
                                <Col sm={10}>
                                    <CustomInput
                                        type="checkbox"
                                        id="active"
                                        checked={active}
                                        label="Je aktivní"
                                        onChange={this.onChange}
                                        data-qa="group_checkbox_active"
                                    />{" "}
                                    {!active && (
                                        <Tooltip
                                            postfix="active"
                                            text="Neaktivním skupinám nelze vytvořit lekci."
                                        />
                                    )}
                                </Col>
                            </FormGroup>
                            {this.isGroup && (
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
                                                    if (
                                                        window.confirm(
                                                            `Opravdu chcete smazat skupinu ${name}?`
                                                        )
                                                    )
                                                        this.delete(id)
                                                }}
                                                data-qa="button_delete_group"
                                            />
                                        </Alert>
                                    </Col>
                                </FormGroup>
                            )}
                        </Fragment>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        disabled={this.state.IS_LOADING}
                        loading={this.state.IS_SUBMIT}
                        data-qa="button_submit_group"
                        content={this.isGroup ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}

export default WithCoursesVisibleContext(FormGroups)
