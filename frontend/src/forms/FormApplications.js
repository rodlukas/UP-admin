import React, { Component, Fragment } from "react"
import { Col, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import ApplicationService from "../api/services/application"
import ClientService from "../api/services/client"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Loading from "../components/Loading"
import { WithCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { alertRequired } from "../global/utils"
import "./forms.css"
import Or from "./helpers/Or"
import SelectClient from "./helpers/SelectClient"
import SelectCourse from "./helpers/SelectCourse"
import ModalClients from "./ModalClients"

class FormApplications extends Component {
    isObject = Boolean(Object.keys(this.props.application).length)

    state = {
        id: this.props.application.id || "",
        course: this.isObject ? this.props.application.course : null,
        client: this.isObject ? this.props.application.client : null,
        note: this.props.application.note || "",
        clients: [],
        IS_LOADING: true
    }

    onChange = e => {
        const target = e.target
        const value = target.type === "checkbox" ? target.checked : target.value
        this.setState({ [target.id]: value })
    }

    onSelectChange = (obj, name) => this.setState({ [name]: obj })

    onSubmit = e => {
        e.preventDefault()
        const { id, course, client, note } = this.state
        if (alertRequired("kurz nebo klient", course, client)) return
        const data = { id, course_id: course.id, client_id: client.id, note }
        let request
        if (this.isObject) request = ApplicationService.update(data)
        else request = ApplicationService.create(data)
        request.then(() => {
            this.close()
            this.refresh()
        })
    }

    close = () => this.props.funcClose()

    refresh = () => this.props.funcRefresh()

    getClientsAfterAddition = newClient => {
        this.setState({ IS_LOADING: true }, () => {
            ClientService.getAll().then(clients =>
                this.setState({
                    clients,
                    client: newClient,
                    IS_LOADING: false
                })
            )
        })
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
        const { client, clients, course, note } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_application">
                <ModalHeader toggle={this.close}>
                    {this.isObject ? "Úprava" : "Přidání"} zájemce o kurz
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded || this.state.IS_LOADING ? (
                        <Loading />
                    ) : (
                        <Fragment>
                            <FormGroup row>
                                <Label for="client" sm={3}>
                                    Klient
                                </Label>
                                <Col sm={9}>
                                    <SelectClient
                                        value={client}
                                        options={clients}
                                        onChangeCallback={this.onSelectChange}
                                    />
                                    <Or
                                        content={
                                            <ModalClients
                                                refresh={this.getClientsAfterAddition}
                                                sendResult
                                                inSentence
                                            />
                                        }
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="course" sm={3}>
                                    Kurz
                                </Label>
                                <Col sm={9}>
                                    <SelectCourse
                                        value={course}
                                        onChangeCallback={this.onSelectChange}
                                        options={this.props.coursesVisibleContext.courses}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="note" sm={3}>
                                    Poznámka
                                </Label>
                                <Col sm={9}>
                                    <Input
                                        type="textarea"
                                        id="note"
                                        value={note}
                                        onChange={this.onChange}
                                        data-qa="application_field_note"
                                        spellCheck
                                    />
                                </Col>
                            </FormGroup>
                        </Fragment>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        data-qa="button_submit_application"
                        content={this.isObject ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}

export default WithCoursesVisibleContext(FormApplications)
