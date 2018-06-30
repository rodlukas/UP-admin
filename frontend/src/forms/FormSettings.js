import React, {Component} from "react"
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert, CustomInput} from 'reactstrap'
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"

export default class FormSettings extends Component {
    constructor(props) {
        super(props)
        this.isObject = Boolean(Object.keys(props.object).length)
        this.TYPE = props.TYPE
        const {id, name, visible} = props.object
        this.state = {
            id: id || '',
            name: name || '',
            visible: this.isObject ? visible : true,
            object: props.object
        }
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onSubmit = (e) => {
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

    close = () => {
        this.props.funcClose()
    }

    refresh = (type) => {
        this.props.funcRefresh(type)
    }

    delete = (id) => {
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
                        <Label for="name" sm={3}>Název</Label>
                        <Col sm={9}>
                            <Input type="text" name="name" id="name" value={name} onChange={this.onChange} required autoFocus/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>Viditelnost</Col>
                        <Col sm={9}>
                            <CustomInput type="checkbox" id="visible" name="visible"
                                         label="Bude zobrazováno"
                                         checked={visible} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    {this.isObject &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={3} className="text-muted">Smazání</Label>
                        <Col sm={9}>
                            <Alert color="warning">
                                <p>Lze smazat pouze když žádný klient nemá příšlušný {type} přiřazen</p>
                                <Button color="danger"
                                        onClick={() => {
                                            let msg = "Opravdu chcete smazat "
                                                + type + " " + name + '?'
                                            if (window.confirm(msg))
                                                this.delete(id)
                                        }}>Smazat {type}</Button>
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>Storno</Button>{' '}
                    <Button color="primary" type="submit">{this.isObject ? 'Uložit' : 'Přidat'}</Button>
                </ModalFooter>
            </Form>
        )
    }
}
