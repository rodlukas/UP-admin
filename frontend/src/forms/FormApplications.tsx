import * as React from "react"
import { Col, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from "reactstrap"

import { trackEvent } from "../analytics"
import { useClients, useCreateApplication, useUpdateApplication } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Loading from "../components/Loading"
import { useCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
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

type Props = {
    /** Zájemce o kurz. */
    application: ApplicationType | ApplicationPostApiDummy
    /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
    funcClose: () => boolean
    /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
    funcForceClose: () => boolean
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
}

/** Formulář pro zájemce o kurzy. */
const FormApplications: React.FC<Props> = (props) => {
    const coursesVisibleContext = useCoursesVisibleContext()
    const isApplication = (application: Props["application"]): application is ApplicationType =>
        "id" in application

    const { data: clientsData = [], isLoading: clientsLoading } = useClients()
    const createApplication = useCreateApplication()
    const updateApplication = useUpdateApplication()

    /** Kurz zájemce. */
    const [course, setCourse] = React.useState<ApplicationPostApiDummy["course"]>(
        props.application.course,
    )
    /** Klient. */
    const [client, setClient] = React.useState<ApplicationPostApiDummy["client"]>(
        props.application.client,
    )
    /** Poznámka k zájemci o kurz. */
    const [note, setNote] = React.useState<ApplicationPostApiDummy["note"]>(props.application.note)

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        if (target.id === "note") {
            setNote(value as string)
        }
    }

    const onSelectChange = (
        name: "course" | "client",
        obj?: CourseType | ClientType | null,
    ): void => {
        props.setFormDirty()
        if (obj === undefined) {
            obj = null
        }
        if (name === "course") {
            setCourse(obj as CourseType | null)
        } else if (name === "client") {
            setClient(obj as ClientType | null)
        }
    }

    const isApplicationValue = isApplication(props.application)

    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>): void => {
            e.preventDefault()
            const courseId = course!.id
            const clientId = client!.id
            const dataPost: ApplicationPostApi = { course_id: courseId, client_id: clientId, note }

            if (isApplication(props.application)) {
                const dataPut: ApplicationPutApi = { ...dataPost, id: props.application.id }
                updateApplication.mutate(dataPut, {
                    onSuccess: () => {
                        trackEvent("application_updated", { source: "applications_form" })
                        props.funcForceClose()
                    },
                })
            } else {
                createApplication.mutate(dataPost, {
                    onSuccess: () => {
                        trackEvent("application_created", { source: "applications_form" })
                        props.funcForceClose()
                    },
                })
            }
        },
        [course, client, note, props, createApplication, updateApplication],
    )

    const close = (): void => {
        props.funcClose()
    }

    const processAdditionOfClient = (newClient: ClientType): void => {
        props.setFormDirty()
        setClient(newClient)
    }

    const isLoading = clientsLoading || coursesVisibleContext.isLoading
    const isSubmit = createApplication.isPending || updateApplication.isPending

    return (
        <Form onSubmit={onSubmit} data-qa="form_application">
            <ModalHeader toggle={close}>
                {isApplicationValue ? "Úprava" : "Přidání"} zájemce o kurz
            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <Loading />
                ) : (
                    <>
                        <FormGroup row className="form-group-required">
                            <Label for="client" sm={3}>
                                Klient
                            </Label>
                            <Col sm={9}>
                                <SelectClient
                                    required
                                    value={client}
                                    options={clientsData}
                                    onChangeCallback={onSelectChange}
                                />
                                <Or
                                    content={
                                        <ModalClients
                                            processAdditionOfClient={processAdditionOfClient}
                                            withOr
                                            source="applications_form"
                                        />
                                    }
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup row className="form-group-required">
                            <Label for="course" sm={3}>
                                Kurz
                            </Label>
                            <Col sm={9}>
                                <SelectCourse
                                    required
                                    value={course}
                                    onChangeCallback={onSelectChange}
                                    options={coursesVisibleContext.courses}
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
                                    onChange={onChange}
                                    data-qa="application_field_note"
                                    spellCheck
                                />
                            </Col>
                        </FormGroup>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={close} />{" "}
                <SubmitButton
                    loading={isSubmit}
                    data-qa="button_submit_application"
                    content={isApplicationValue ? "Uložit" : "Přidat"}
                />
            </ModalFooter>
        </Form>
    )
}

export default FormApplications
