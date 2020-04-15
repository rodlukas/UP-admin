import * as React from "react"
import { Col, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import ApplicationService from "../api/services/ApplicationService"
import ClientService from "../api/services/ClientService"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Loading from "../components/Loading"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext,
} from "../contexts/CoursesVisibleContext"
import { alertRequired } from "../global/utils"
import {
    ApplicationPostApi,
    ApplicationPostApiDummy,
    ApplicationPutApi,
    ApplicationType,
    ClientType,
    CourseType,
} from "../types/models"
import { fEmptyVoid } from "../types/types"
import Or from "./helpers/Or"
import SelectClient from "./helpers/SelectClient"
import SelectCourse from "./helpers/SelectCourse"
import ModalClients from "./ModalClients"

type Props = CoursesVisibleContextProps & {
    /** Zájemce o kurz. */
    application: ApplicationType | ApplicationPostApiDummy
    /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
    funcClose: () => boolean
    /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
    funcForceClose: (modalSubmitted?: boolean, data?: never) => boolean
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
}

type State = {
    /** Kurz. */
    course: ApplicationPostApiDummy["course"]
    /** Klient. */
    client: ApplicationPostApiDummy["client"]
    /** Poznámka k zájemci o kurz. */
    note: ApplicationPostApiDummy["note"]
    /** Pole klientů. */
    clients: Array<ClientType>
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** Formulář byl odeslán (true). */
    isSubmit: boolean
}

/** Formulář pro zájemce o kurzy. */
class FormApplications extends React.Component<Props, State> {
    isApplication = (application: Props["application"]): application is ApplicationType =>
        "id" in application

    state: State = {
        course: this.props.application.course,
        client: this.props.application.client,
        note: this.props.application.note,
        clients: [],
        isLoading: true,
        isSubmit: false,
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState((prevState) => ({
            ...prevState,
            [target.id]: value,
        }))
    }

    onSelectChange = (name: "course" | "client", obj?: CourseType | ClientType | null): void => {
        this.props.setFormDirty()
        if (obj === undefined) {
            obj = null
        }
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState((prevState) => ({
            ...prevState,
            [name]: obj,
        }))
    }

    onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        const { course, client, note } = this.state
        if (alertRequired("kurz nebo klient", course, client)) {
            return
        }
        const courseId = (course as ApplicationType["course"]).id
        const clientId = (client as ApplicationType["client"]).id
        let request: Promise<ApplicationType>
        const dataPost: ApplicationPostApi = { course_id: courseId, client_id: clientId, note }
        if (this.isApplication(this.props.application)) {
            const dataPut: ApplicationPutApi = { ...dataPost, id: this.props.application.id }
            request = ApplicationService.update(dataPut)
        } else {
            request = ApplicationService.create(dataPost)
        }
        this.setState({ isSubmit: true }, () => {
            request
                .then(() => this.props.funcForceClose())
                .catch(() => this.setState({ isSubmit: false }))
        })
    }

    close = (): void => {
        this.props.funcClose()
    }

    processAdditionOfClient = (newClient: ClientType): void => {
        this.props.setFormDirty()
        this.setState({
            client: newClient,
        })
    }

    getClientsAfterAddition = (): void => {
        this.setState({ isLoading: true }, this.getClients)
    }

    getClients = (): void => {
        ClientService.getAll().then((clients) =>
            this.setState({
                clients,
                isLoading: false,
            })
        )
    }

    componentDidMount(): void {
        this.getClients()
        this.props.coursesVisibleContext.funcRefresh()
    }

    render(): React.ReactNode {
        const { client, clients, course, note } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_application">
                <ModalHeader toggle={this.close}>
                    {this.isApplication(this.props.application) ? "Úprava" : "Přidání"} zájemce o
                    kurz
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded || this.state.isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <FormGroup row className="required">
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
                                                processAdditionOfClient={
                                                    this.processAdditionOfClient
                                                }
                                                withOr
                                            />
                                        }
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row className="required">
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
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        loading={this.state.isSubmit}
                        data-qa="button_submit_application"
                        content={this.isApplication(this.props.application) ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}

export default WithCoursesVisibleContext(FormApplications)
