import { Group, Modal, Textarea, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import * as React from "react"

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

import * as baseStyles from "./FormBase.css"
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

    const form = useForm<{
        course: ApplicationPostApiDummy["course"]
        client: ApplicationPostApiDummy["client"]
        note: ApplicationPostApiDummy["note"]
    }>({
        initialValues: {
            course: props.application.course,
            client: props.application.client,
            note: props.application.note,
        },
        onValuesChange: () => props.setFormDirty(),
    })

    const onSelectChange = (
        name: "course" | "client",
        obj?: CourseType | ClientType | null,
    ): void => {
        if (obj === undefined) {
            obj = null
        }
        if (name === "course") {
            form.setFieldValue("course", obj as CourseType | null)
        } else if (name === "client") {
            form.setFieldValue("client", obj as ClientType | null)
        }
    }

    const isApplicationValue = isApplication(props.application)

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            e.preventDefault()
            const courseId = form.values.course!.id
            const clientId = form.values.client!.id
            const dataPost: ApplicationPostApi = {
                course_id: courseId,
                client_id: clientId,
                note: form.values.note,
            }

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
        [form.values, props, createApplication, updateApplication],
    )

    const close = (): void => {
        props.funcClose()
    }

    const processAdditionOfClient = (newClient: ClientType): void => {
        form.setFieldValue("client", newClient)
    }

    const isLoading = clientsLoading || coursesVisibleContext.isLoading
    const isSubmit = createApplication.isPending || updateApplication.isPending

    return (
        <form onSubmit={onSubmit} data-qa="form_application">
            <Modal.Header>
                <Modal.Title>
                    {isApplicationValue ? "Úprava" : "Přidání"} zájemce o kurz
                </Modal.Title>
                <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className={baseStyles.formContent}>
                        <div className={baseStyles.formSection}>
                            <Title order={6} className={baseStyles.formSectionTitle}>Základní údaje</Title>
                            <div className={baseStyles.fieldStack}>
                                <div className={baseStyles.fieldBlock}>
                                    <label htmlFor="client" className={baseStyles.fieldLabel}>
                                        Klient
                                    </label>
                                    <SelectClient
                                        required
                                        value={form.values.client}
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
                                </div>
                                <div className={baseStyles.fieldBlock}>
                                    <label htmlFor="course" className={baseStyles.fieldLabel}>
                                        Kurz
                                    </label>
                                    <SelectCourse
                                        required
                                        value={form.values.course}
                                        onChangeCallback={onSelectChange}
                                        options={coursesVisibleContext.courses}
                                    />
                                </div>
                                <div className={baseStyles.fieldBlock}>
                                    <Textarea
                                        id="note"
                                        {...form.getInputProps("note")}
                                        label="Poznámka"
                                        data-qa="application_field_note"
                                        spellCheck
                                        minRows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Group justify="flex-end" px="md" pb="md" className={baseStyles.modalActions}>
                <CancelButton onClick={close} />
                <SubmitButton
                    loading={isSubmit}
                    disabled={isLoading}
                    data-qa="button_submit_application"
                    content={isApplicationValue ? "Uložit" : "Přidat"}
                />
            </Group>
        </form>
    )
}

export default FormApplications
