import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Checkbox, Group, Modal, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { faHourglass } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { trackEvent } from "../analytics"
import {
    useCreateAttendanceState,
    useCreateCourse,
    useDeleteAttendanceState,
    useDeleteCourse,
    useUpdateAttendanceState,
    useUpdateCourse,
} from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import {
    AttendanceStatePostApi,
    AttendanceStatePostApiDummy,
    AttendanceStatePutApi,
    AttendanceStateType,
    CoursePostApi,
    CoursePostApiDummy,
    CoursePutApi,
    CourseType,
} from "../types/models"
import { fEmptyVoid, Model } from "../types/types"

import * as baseStyles from "./FormBase.css"
import ColorPicker from "./helpers/ColorPicker"

type Props = {
    /** Kurz/stav účasti. */
    object: CourseType | AttendanceStateType | CoursePostApiDummy | AttendanceStatePostApiDummy
    /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
    funcClose: () => boolean
    /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
    funcForceClose: () => boolean
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
}

const FormSettings: React.FC<Props> = (props) => {
    const isObject = (object: Props["object"]): object is CourseType | AttendanceStateType =>
        "id" in object

    const isCourse = (object: Props["object"]): object is CourseType | CoursePostApiDummy =>
        "duration" in object

    const createCourse = useCreateCourse()
    const updateCourse = useUpdateCourse()
    const deleteCourse = useDeleteCourse()
    const createAttendanceState = useCreateAttendanceState()
    const updateAttendanceState = useUpdateAttendanceState()
    const deleteAttendanceState = useDeleteAttendanceState()

    const form = useForm({
        initialValues: {
            name: props.object.name,
            visible: props.object.visible,
            duration: isCourse(props.object)
                ? props.object.duration
                : (undefined as number | undefined),
            color: isCourse(props.object) ? props.object.color : "#000000",
        },
        validate: {
            // ColorInput propaguje onChange i rozepsaný text ("#D2") — Enter uprostřed
            // psaní by bez validace odeslal nevalidní hex, API ho odmítne 400 a modal
            // by zůstal otevřený bez viditelné chyby; regex shodný s api/serializers.py
            color: (value) =>
                /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value) ? null : "Barva není v HEX formátu",
        },
        onValuesChange: () => props.setFormDirty(),
    })

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            e.preventDefault()
            if (form.validate().hasErrors) {
                return
            }
            const { name, visible, duration, color } = form.getValues()

            if (isCourse(props.object)) {
                if (duration === undefined) {
                    return
                }
                const dataPost: CoursePostApi = {
                    name,
                    visible,
                    duration,
                    color,
                }
                if (isObject(props.object)) {
                    const dataPut: CoursePutApi = {
                        ...dataPost,
                        id: props.object.id,
                    }
                    updateCourse.mutate(dataPut, {
                        onSuccess: () => {
                            trackEvent("course_updated", { source: "settings_page" })
                            props.funcForceClose()
                        },
                    })
                } else {
                    createCourse.mutate(dataPost, {
                        onSuccess: () => {
                            trackEvent("course_created", { source: "settings_page" })
                            props.funcForceClose()
                        },
                    })
                }
            } else {
                const dataPost: AttendanceStatePostApi = { name, visible }
                if (isObject(props.object)) {
                    const dataPut: AttendanceStatePutApi = {
                        ...dataPost,
                        id: props.object.id,
                    }
                    updateAttendanceState.mutate(dataPut, {
                        onSuccess: () => {
                            trackEvent("attendance_state_updated", { source: "settings_page" })
                            props.funcForceClose()
                        },
                    })
                } else {
                    createAttendanceState.mutate(dataPost, {
                        onSuccess: () => {
                            trackEvent("attendance_state_created", { source: "settings_page" })
                            props.funcForceClose()
                        },
                    })
                }
            }
        },
        [props, form, createCourse, updateCourse, createAttendanceState, updateAttendanceState],
    )

    const close = (): void => {
        props.funcClose()
    }

    const handleDelete = React.useCallback(
        (id: Model["id"]): void => {
            if (isCourse(props.object)) {
                deleteCourse.mutate(id, {
                    onSuccess: () => {
                        trackEvent("course_deleted", { source: "settings_page" })
                        props.funcForceClose()
                    },
                })
            } else {
                deleteAttendanceState.mutate(id, {
                    onSuccess: () => {
                        trackEvent("attendance_state_deleted", { source: "settings_page" })
                        props.funcForceClose()
                    },
                })
            }
        },
        [props, deleteCourse, deleteAttendanceState],
    )

    const type = isCourse(props.object) ? "kurz" : "stav"
    const isSubmit =
        createCourse.isPending ||
        updateCourse.isPending ||
        createAttendanceState.isPending ||
        updateAttendanceState.isPending

    return (
        <form onSubmit={onSubmit} data-qa="form_settings">
            <Modal.Header>
                <Modal.Title>
                    {isObject(props.object)
                        ? `Úprava ${type}u: ${form.values.name}`
                        : `Přidání ${type}u`}
                </Modal.Title>
                <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
                <div className={baseStyles.formContent}>
                    <div className={baseStyles.formSection}>
                        <Title order={6} className={baseStyles.formSectionTitle}>
                            Základní údaje
                        </Title>
                        <div className={baseStyles.fieldStack}>
                            <div className={baseStyles.fieldBlock}>
                                <TextInput
                                    id="name"
                                    {...form.getInputProps("name")}
                                    label="Název"
                                    required
                                    withAsterisk
                                    data-autofocus
                                    data-qa="settings_field_name"
                                    spellCheck
                                />
                            </div>
                            <div className={baseStyles.fieldBlock}>
                                <label
                                    htmlFor="visible"
                                    data-qa="settings_label_visible"
                                    className={baseStyles.fieldLabel}>
                                    Viditelnost
                                </label>
                                <div className={baseStyles.inlineCheckboxRow}>
                                    <Checkbox
                                        id="visible"
                                        checked={form.values.visible}
                                        onChange={(e) =>
                                            form.setFieldValue("visible", e.currentTarget.checked)
                                        }
                                        data-qa="settings_checkbox_visible"
                                        label="Bude zobrazováno"
                                    />
                                </div>
                            </div>
                            {isCourse(props.object) && (
                                <>
                                    <div className={baseStyles.fieldBlock}>
                                        <TextInput
                                            type="number"
                                            id="duration"
                                            value={form.values.duration ?? ""}
                                            onChange={(e) => {
                                                const v = e.currentTarget.value
                                                form.setFieldValue(
                                                    "duration",
                                                    v === "" ? undefined : Number(v),
                                                )
                                            }}
                                            label="Trvání (min.)"
                                            description="pro jednotlivce"
                                            required
                                            withAsterisk
                                            min="1"
                                            data-qa="settings_field_duration"
                                            leftSection={
                                                <FontAwesomeIcon icon={faHourglass} fixedWidth />
                                            }
                                        />
                                    </div>
                                    <ColorPicker
                                        value={form.values.color}
                                        onChange={(hex) => form.setFieldValue("color", hex)}
                                        error={form.errors.color}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    {isObject(props.object) && (
                        <div
                            className={`${baseStyles.formSection} ${baseStyles.formSectionDanger}`}>
                            <Title order={6} className={baseStyles.formSectionTitle}>
                                Smazání
                            </Title>
                            <div className={baseStyles.deleteAlertText}>
                                <p>
                                    Lze smazat pouze pokud není příslušný {type} použit u žádné
                                    lekce
                                    {isCourse(props.object) &&
                                        ", smažou se také všichni zájemci o tento kurz"}
                                </p>
                                <DeleteButton
                                    size="sm"
                                    content={type}
                                    onClick={(): void => {
                                        if (
                                            isObject(props.object) &&
                                            globalThis.confirm(
                                                `Opravdu chcete smazat ${type} ${form.values.name}?`,
                                            )
                                        ) {
                                            handleDelete(props.object.id)
                                        }
                                    }}
                                    data-qa="settings_button_delete"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Group justify="flex-end" px="md" pb="md" className={baseStyles.modalActions}>
                <CancelButton onClick={close} />
                <SubmitButton
                    loading={isSubmit}
                    data-qa="button_submit_settings"
                    content={isObject(props.object) ? "Uložit" : "Přidat"}
                />
            </Group>
        </form>
    )
}

export default FormSettings
