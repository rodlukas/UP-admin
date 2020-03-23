import { faHourglass } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import {
    Alert,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap"
import AttendanceStateService from "../api/services/AttendanceStateService"
import CourseService from "../api/services/CourseService"
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
import "./FormSettings.css"
import ColorPicker from "./helpers/ColorPicker"

type Props = {
    object: CourseType | AttendanceStateType | CoursePostApiDummy | AttendanceStatePostApiDummy
    funcClose: () => boolean
    funcForceClose: (modalSubmitted?: boolean, data?: never) => boolean
    setFormDirty: fEmptyVoid
}

type State = {
    name: CoursePostApiDummy["name"] | AttendanceStatePostApiDummy["name"]
    visible: CoursePostApiDummy["visible"] | AttendanceStatePostApiDummy["visible"]
    duration?: CoursePostApiDummy["duration"]
    color?: CoursePostApiDummy["color"]
    isSubmit: boolean
}

export default class FormSettings extends React.Component<Props, State> {
    isObject = (object: Props["object"]): object is CourseType | AttendanceStateType =>
        "id" in object

    isCourse = (object: Props["object"]): object is CourseType | CoursePostApiDummy =>
        "duration" in object

    state: State = {
        name: this.props.object.name,
        visible: this.props.object.visible,
        duration: this.isCourse(this.props.object) ? this.props.object.duration : undefined,
        color: this.isCourse(this.props.object) ? this.props.object.color : undefined,
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

    onChangeColor = (newColor: string): void => this.setState({ color: newColor })

    onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        const { name, visible, duration, color } = this.state
        let request: Promise<CourseType | AttendanceStateType>
        if (this.isCourse(this.props.object)) {
            const durationCourse = duration as CourseType["duration"]
            const colorCourse = color as CourseType["color"]
            const dataPost: CoursePostApi = {
                name,
                visible,
                duration: durationCourse,
                color: colorCourse,
            }
            if (this.isObject(this.props.object)) {
                const dataPut: CoursePutApi = { ...dataPost, id: this.props.object.id }
                request = CourseService.update(dataPut)
            } else {
                request = CourseService.create(dataPost)
            }
        } else {
            const dataPost: AttendanceStatePostApi = { name, visible }
            if (this.isObject(this.props.object)) {
                const dataPut: AttendanceStatePutApi = { ...dataPost, id: this.props.object.id }
                request = AttendanceStateService.update(dataPut)
            } else {
                request = AttendanceStateService.create(dataPost)
            }
        }
        this.setState({ isSubmit: true }, (): void => {
            request
                .then(() => this.props.funcForceClose())
                .catch(() => this.setState({ isSubmit: false }))
        })
    }

    close = (): void => {
        this.props.funcClose()
    }

    delete = (id: Model["id"]): void => {
        const service = this.isCourse(this.props.object) ? CourseService : AttendanceStateService
        const request: Promise<CourseType | AttendanceStateType> = service.remove(id)
        request.then(() => this.props.funcForceClose())
    }

    render(): React.ReactNode {
        const { name, visible, duration, color } = this.state
        const type = this.isCourse(this.props.object) ? "kurz" : "stav"
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_settings">
                <ModalHeader toggle={this.close}>
                    {this.isObject(this.props.object) ? "Úprava" : "Přidání"} {type}u: {name}
                </ModalHeader>
                <ModalBody>
                    <FormGroup row className="required">
                        <Label for="name" sm={3}>
                            Název
                        </Label>
                        <Col sm={9}>
                            <Input
                                type="text"
                                id="name"
                                value={name}
                                onChange={this.onChange}
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
                            <CustomInput
                                type="checkbox"
                                id="visible"
                                label="Bude zobrazováno"
                                checked={visible}
                                onChange={this.onChange}
                                data-qa="settings_checkbox_visible"
                            />
                        </Col>
                    </FormGroup>
                    {this.isCourse(this.props.object) && (
                        <>
                            <FormGroup row className="align-items-center required">
                                <Label for="duration" sm={3} className="FormSettings_labelDuration">
                                    Trvání (min.){" "}
                                    <small className="text-secondary text-nowrap">
                                        (pro jednotlivce)
                                    </small>
                                </Label>
                                <Col sm={9}>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            <Label className="input-group-text" for="duration">
                                                <FontAwesomeIcon icon={faHourglass} fixedWidth />
                                            </Label>
                                        </InputGroupAddon>
                                        <Input
                                            type="number"
                                            id="duration"
                                            value={duration}
                                            onChange={this.onChange}
                                            required
                                            min="1"
                                            data-qa="settings_field_duration"
                                        />
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                            <FormGroup row className="align-items-center required">
                                <ColorPicker
                                    color={color as CourseType["color"]}
                                    onChange={this.onChangeColor}
                                />
                            </FormGroup>
                        </>
                    )}
                    {this.isObject(this.props.object) && (
                        <FormGroup row className="border-top pt-3">
                            <Label sm={3} className="text-muted">
                                Smazání
                            </Label>
                            <Col sm={9}>
                                <Alert color="warning">
                                    <p>
                                        Lze smazat pouze pokud není příslušný {type} použit u žádné
                                        lekce
                                        {this.isCourse(this.props.object) &&
                                            ", smažou se také všichni zájemci o tento kurz"}
                                    </p>
                                    <DeleteButton
                                        content={type}
                                        onClick={(): void => {
                                            if (
                                                this.isObject(this.props.object) &&
                                                window.confirm(
                                                    `Opravdu chcete smazat ${type} ${name}?`
                                                )
                                            ) {
                                                this.delete(this.props.object.id)
                                            }
                                        }}
                                        data-qa="settings_button_delete"
                                    />
                                </Alert>
                            </Col>
                        </FormGroup>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        loading={this.state.isSubmit}
                        data-qa="button_submit_settings"
                        content={this.isObject(this.props.object) ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}
