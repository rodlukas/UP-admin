import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHourglass } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { useColor } from "react-color-palette"
import { toast } from "react-toastify"
import {
    Alert,
    Col,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap"

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

import * as styles from "./FormSettings.css"
import ColorPicker, { COLOR_PICKER_VALIDATION_TOAST_ID } from "./helpers/ColorPicker"

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

    /** Název kurzu/stavu účasti. */
    const [name, setName] = React.useState(props.object.name)
    /** Kurz/stav účasti je viditelný (true). */
    const [visible, setVisible] = React.useState(props.object.visible)
    /** Trvání kurzu. */
    const [duration, setDuration] = React.useState<number | undefined>(
        isCourse(props.object) ? props.object.duration : undefined,
    )
    /** Barva kurzu. */
    const [color, setColor] = useColor(isCourse(props.object) ? props.object.color : "#000000")

    const onChangeColor = React.useCallback(
        (newColor: ReturnType<typeof useColor>[0]): void => {
            props.setFormDirty()
            setColor(newColor)
        },
        [props, setColor],
    )

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        if (target.id === "name") {
            setName(value as string)
        } else if (target.id === "visible") {
            setVisible(value as boolean)
        } else if (target.id === "duration") {
            setDuration(value === "" ? undefined : Number(value))
        }
    }

    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>): void => {
            e.preventDefault()

            if (isCourse(props.object)) {
                const durationCourse = duration!
                const colorCourse = color
                const dataPost: CoursePostApi = {
                    name,
                    visible,
                    duration: durationCourse,
                    color: colorCourse.hex,
                }
                if (isObject(props.object)) {
                    const dataPut: CoursePutApi = {
                        ...dataPost,
                        id: props.object.id,
                    }
                    updateCourse.mutate(dataPut, {
                        onSuccess: () => {
                            toast.dismiss(COLOR_PICKER_VALIDATION_TOAST_ID)
                            props.funcForceClose()
                        },
                    })
                } else {
                    createCourse.mutate(dataPost, {
                        onSuccess: () => {
                            toast.dismiss(COLOR_PICKER_VALIDATION_TOAST_ID)
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
                            props.funcForceClose()
                        },
                    })
                } else {
                    createAttendanceState.mutate(dataPost, {
                        onSuccess: () => {
                            props.funcForceClose()
                        },
                    })
                }
            }
        },
        [
            name,
            visible,
            duration,
            color,
            props,
            createCourse,
            updateCourse,
            createAttendanceState,
            updateAttendanceState,
        ],
    )

    const close = (): void => {
        toast.dismiss(COLOR_PICKER_VALIDATION_TOAST_ID)
        props.funcClose()
    }

    const handleDelete = React.useCallback(
        (id: Model["id"]): void => {
            if (isCourse(props.object)) {
                deleteCourse.mutate(id, {
                    onSuccess: () => {
                        props.funcForceClose()
                    },
                })
            } else {
                deleteAttendanceState.mutate(id, {
                    onSuccess: () => {
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
        <Form onSubmit={onSubmit} data-qa="form_settings">
            <ModalHeader toggle={close}>
                {isObject(props.object) ? "Úprava" : "Přidání"} {type}u: {name}
            </ModalHeader>
            <ModalBody>
                <FormGroup row className="form-group-required">
                    <Label for="name" sm={3}>
                        Název
                    </Label>
                    <Col sm={9}>
                        <Input
                            type="text"
                            id="name"
                            value={name}
                            onChange={onChange}
                            required
                            autoFocus
                            data-qa="settings_field_name"
                            spellCheck
                        />
                    </Col>
                </FormGroup>
                <FormGroup row className="align-items-center">
                    <Label for="visible" sm={3} data-qa="settings_label_visible">
                        Viditelnost
                    </Label>
                    <Col sm={9}>
                        <Input
                            type="checkbox"
                            id="visible"
                            checked={visible}
                            onChange={onChange}
                            data-qa="settings_checkbox_visible"
                        />
                        <Label for="visible" check>
                            Bude zobrazováno
                        </Label>
                    </Col>
                </FormGroup>
                {isCourse(props.object) && (
                    <>
                        <FormGroup row className="align-items-center form-group-required">
                            <Label for="duration" sm={3} className={styles.labelDuration}>
                                Trvání (min.){" "}
                                <small className="text-secondary text-nowrap">
                                    (pro jednotlivce)
                                </small>
                            </Label>
                            <Col sm={9}>
                                <InputGroup>
                                    <InputGroupText>
                                        <Label for="duration">
                                            <FontAwesomeIcon icon={faHourglass} fixedWidth />
                                        </Label>
                                    </InputGroupText>
                                    <Input
                                        type="number"
                                        id="duration"
                                        value={duration ?? ""}
                                        onChange={onChange}
                                        required
                                        min="1"
                                        data-qa="settings_field_duration"
                                    />
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <ColorPicker color={color} onChange={onChangeColor} />
                    </>
                )}
                {isObject(props.object) && (
                    <>
                        <hr />
                        <FormGroup row>
                            <Label sm={3} className="text-muted">
                                Smazání
                            </Label>
                            <Col sm={9}>
                                <Alert color="warning">
                                    <p>
                                        Lze smazat pouze pokud není příslušný {type} použit u žádné
                                        lekce
                                        {isCourse(props.object) &&
                                            ", smažou se také všichni zájemci o tento kurz"}
                                    </p>
                                    <DeleteButton
                                        content={type}
                                        onClick={(): void => {
                                            if (
                                                isObject(props.object) &&
                                                globalThis.confirm(
                                                    `Opravdu chcete smazat ${type} ${name}?`,
                                                )
                                            ) {
                                                handleDelete(props.object.id)
                                            }
                                        }}
                                        data-qa="settings_button_delete"
                                    />
                                </Alert>
                            </Col>
                        </FormGroup>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={close} />{" "}
                <SubmitButton
                    loading={isSubmit}
                    data-qa="button_submit_settings"
                    content={isObject(props.object) ? "Uložit" : "Přidat"}
                />
            </ModalFooter>
        </Form>
    )
}

export default FormSettings
