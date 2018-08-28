import React, {Component} from "react"
import {Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert, CustomInput} from "reactstrap"
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import DeleteButton from "../components/buttons/DeleteButton"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"

export default class FormSettings extends Component {
    constructor(props) {
        super(props)
        this.isObject = Boolean(Object.keys(props.object).length)
        this.TYPE = props.TYPE
        const {id, name, visible} = props.object
        this.state = {
            id: id || '',
            name: name || '',
            visible: this.isObject ? visible : true
        }
    }

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSubmit = e => {
        e.preventDefault()
        const {id, name, visible} = this.state
        const data = {id, name, visible}
        let request
        let service = (this.TYPE === EDIT_TYPE.COURSE ? CourseService : AttendanceStateService)
        if (this.isObject)
            request = service.update(data)
        else
            request = service.create(data)
        request.then(() => {
            this.close()
            this.refresh(this.TYPE)
        })
    }

    close = () =>
        this.props.funcClose()

    refresh = type =>
        this.props.funcRefresh(type)

    delete = id => {
        let service = (this.TYPE === EDIT_TYPE.COURSE ? CourseService : AttendanceStateService)
        service.remove(id)
            .then(() => {
                this.close()
                this.refresh(this.TYPE)
            })
    }

    render() {
        const {id, name, visible} = this.state
        const type = (this.TYPE === EDIT_TYPE.COURSE ? "kurz" : "stav")
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isObject ? 'Úprava' : 'Přidání'} {type}u: {name}
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="name" sm={3}>
                            Název
                        </Label>
                        <Col sm={9}>
                            <Input type="text" id="name" value={name} onChange={this.onChange} required autoFocus/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="visible" sm={3}>
                            Viditelnost
                        </Label>
                        <Col sm={9}>
                            <CustomInput type="checkbox" id="visible" label="Bude zobrazováno" checked={visible}
                                         onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    {this.isObject &&
                    <FormGroup row className="border-top pt-3">
                        <Label sm={3} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={9}>
                            <Alert color="warning">
                                <p>
                                    Lze smazat pouze pokud není příslušný {type} použit u žádné lekce
                                    {this.TYPE === EDIT_TYPE.COURSE && ", smažou se také všichni zájemci o tento kurz"}
                                </p>
                                <DeleteButton
                                    content={type}
                                    onClick={() => {
                                        let msg = "Opravdu chcete smazat "
                                            + type + " " + name + '?'
                                        if (window.confirm(msg))
                                            this.delete(id)}}
                                />
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton content={this.isObject ? 'Uložit' : 'Přidat'}/>
                </ModalFooter>
            </Form>
        )
    }
}
