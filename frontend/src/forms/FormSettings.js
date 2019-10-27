import { faHourglass } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Component, Fragment } from "react"
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
    ModalHeader
} from "reactstrap"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import { DEFAULT_COLOR, DEFAULT_DURATION, EDIT_TYPE } from "../global/constants"
import "./FormSettings.css"
import ColorPicker from "./helpers/ColorPicker"

export default class FormSettings extends Component {
    isObject = Boolean(Object.keys(this.props.object).length)

    state = {
        id: this.props.object.id || "",
        name: this.props.object.name || "",
        visible: this.isObject ? this.props.object.visible : true,
        duration: this.props.object.duration || DEFAULT_DURATION,
        color: this.props.object.color || DEFAULT_COLOR,
        IS_SUBMIT: false
    }

    onChange = e => {
        const target = e.target
        const value = target.type === "checkbox" ? target.checked : target.value
        this.setState({ [target.id]: value })
    }

    onChangeColor = newColor => this.setState({ color: newColor })

    onSubmit = e => {
        e.preventDefault()
        const { id, name, visible, duration, color } = this.state
        let request, service, data
        if (this.props.TYPE === EDIT_TYPE.COURSE) {
            service = CourseService
            data = { id, name, visible, duration, color }
        } else {
            service = AttendanceStateService
            data = { id, name, visible }
        }
        if (this.isObject) request = service.update(data)
        else request = service.create(data)
        this.setState({ IS_SUBMIT: true }, () =>
            request
                .then(() => {
                    // ulozeni hodnoty TYPE, protoze close ji smaze
                    const curType = this.props.TYPE
                    this.close()
                    this.refresh(curType)
                })
                .catch(() => {
                    this.setState({ IS_SUBMIT: false })
                })
        )
    }

    close = () => this.props.funcClose()

    refresh = type => this.props.funcRefresh(type)

    delete = id => {
        let service = this.props.TYPE === EDIT_TYPE.COURSE ? CourseService : AttendanceStateService
        service.remove(id).then(() => {
            // ulozeni hodnoty TYPE, protoze close ji smaze
            const curType = this.props.TYPE
            this.close()
            this.refresh(curType)
        })
    }

    render() {
        const { id, name, visible, duration, color } = this.state
        const type = this.props.TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav"
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_settings">
                <ModalHeader toggle={this.close}>
                    {this.isObject ? "Úprava" : "Přidání"} {type}u: {name}
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
                    {this.props.TYPE === EDIT_TYPE.COURSE && (
                        <Fragment>
                            <FormGroup row className="align-items-center required">
                                <Label for="duration" sm={3} className="FormSettings_labelDuration">
                                    Trvání (min.){" "}
                                    <small className="text-secondary text-nowrap">
                                        (pro jednotlivce)
                                    </small>
                                </Label>
                                <Col sm={9}>
                                    <InputGroup title="Trvání (min.)">
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
                                <ColorPicker color={color} onChange={this.onChangeColor} />
                            </FormGroup>
                        </Fragment>
                    )}
                    {this.isObject && (
                        <FormGroup row className="border-top pt-3">
                            <Label sm={3} className="text-muted">
                                Smazání
                            </Label>
                            <Col sm={9}>
                                <Alert color="warning">
                                    <p>
                                        Lze smazat pouze pokud není příslušný {type} použit u žádné
                                        lekce
                                        {this.props.TYPE === EDIT_TYPE.COURSE &&
                                            ", smažou se také všichni zájemci o tento kurz"}
                                    </p>
                                    <DeleteButton
                                        content={type}
                                        onClick={() => {
                                            if (
                                                window.confirm(
                                                    `Opravdu chcete smazat ${type} ${name}?`
                                                )
                                            )
                                                this.delete(id)
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
                        loading={this.state.IS_SUBMIT}
                        data-qa="button_submit_settings"
                        content={this.isObject ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}
