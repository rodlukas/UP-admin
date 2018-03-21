import React, {Component} from "react"
import axios from 'axios'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import AuthService from "../Auth/AuthService"
import {API_URL, EDIT_TYPE, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"

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
        const apiTarget = (this.TYPE === EDIT_TYPE.COURSE ? 'courses' : 'attendancestates')
        if (this.isObject)
            request = axios.put(API_URL + apiTarget + '/' + id + '/', data, AuthService.getHeaders())
        else
            request = axios.post(API_URL + apiTarget + '/' , data, AuthService.getHeaders())
        request.then(() => {
            this.close()
            this.refresh(this.TYPE)
            this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
        })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
            })
    }

    close = () => {
        this.props.funcClose()
    }

    refresh = (type) => {
        this.props.funcRefresh(type)
    }

    delete = (id) => {
        const apiTarget = (this.TYPE === EDIT_TYPE.COURSE ? 'courses' : 'attendancestates')
        axios.delete(API_URL + apiTarget + '/' + id + '/', AuthService.getHeaders())
            .then(() => {
                this.close()
                this.refresh(this.TYPE)
                this.props.notify(NOTIFY_TEXT.SUCCESS, NOTIFY_LEVEL.SUCCESS)
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR, NOTIFY_LEVEL.ERROR)
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
                        <Label for="name" sm={3}>Jméno</Label>
                        <Col sm={9}>
                            <Input type="text" name="name" id="name" value={name} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={3}>Viditelnost</Col>
                        <Col sm={9} className="custom-control custom-checkbox">
                            <Input type="checkbox" className="custom-control-input" name="visible"
                                   id="visible" checked={visible} onChange={this.onChange}/>
                            <Label for="visible" className="custom-control-label">Bude zobrazováno</Label>
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
                                                + type + " "
                                                + name + '?'
                                            if (window.confirm(msg))
                                                this.delete(id)
                                        }}>Smazat {type}</Button>
                            </Alert>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>Zrušit</Button>{' '}
                    <Button color="primary" type="submit">{this.isObject ? 'Uložit' : 'Přidat'}</Button>
                </ModalFooter>
            </Form>
        )
    }
}
