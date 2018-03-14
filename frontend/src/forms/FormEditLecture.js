import React, {Component} from "react"
import axios from 'axios'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {toISODate, toISOTime} from "../components/FuncDateTime"

export default class FormEditLecture extends Component {
    constructor(props) {
        super(props)
        this.isLecture = Boolean(Object.keys(props.lecture).length)
        const {id, attendances, start, course, duration} = props.lecture
        let date = new Date(start)
        this.state = {
            id: id || '',
            at_state: this.isLecture ? attendances[0].attendancestate.id : 5,
            at_paid: this.isLecture ? attendances[0].paid : false,
            at_note: this.isLecture ? attendances[0].note : '',
            date: this.isLecture ? toISODate(date) : '',
            time: this.isLecture ? toISOTime(date) : '',
            course_id: this.isLecture ? course.id : 1,
            duration: duration || '',
            attendancestates: props.attendancestates,
            courses: [],
            client: props.client
        }
    }

    getDataCourses = () => {
        axios.get('/api/v1/courses/')
            .then((response) => {
                this.setState({courses: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, course_id, time, date, duration, at_note, at_paid, at_state} = this.state
        let attendances = []
        const start = date + " " + time
        attendances.push({
            client_id: this.state.client.id,
            attendancestate_id: at_state,
            paid: at_paid,
            note: at_note
        })
        const data = {attendances, course_id, start, duration}
        let request
        if (this.isLecture)
            request = axios.put('/api/v1/lectures/' + id + '/', data)
        else
            request = axios.post('/api/v1/lectures/', data)
        request.then(() => {
            this.close()
            this.refresh()
        })
            .catch((error) => {
                console.log(error)
            })
    }

    close = () => {
        this.props.funcClose()
    }

    refresh = () => {
        this.props.funcRefresh()
    }

    delete = (id) => {
        axios.delete('/api/v1/lectures/' + id + '/')
            .then(() => {
                this.close()
                this.refresh()
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getDataCourses()
    }

    render() {
        const {id, course_id, date, time, duration, at_state, at_note, at_paid, client, attendancestates, courses} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>{this.isLecture ? 'Úprava' : 'Přidání'} lekce klienta</ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Label for="date" sm={2}>Datum</Label>
                        <Col sm={10}>
                            <Input type="date" name="date" id="date" value={date} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="time" sm={2}>Čas</Label>
                        <Col sm={10}>
                            <Input type="time" name="time" id="time" value={time} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="duration" sm={2}>Trvání</Label>
                        <Col sm={10}>
                            <Input type="number" name="duration" id="duration" value={duration} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="at_state" sm={2}>Stav</Label>
                        <Col sm={10}>
                            <Input type="select" bsSize="sm" name="at_state" id="at_state" value={at_state} onChange={this.onChange}>
                                {attendancestates.map(attendancestate =>
                                    <option key={attendancestate.id}
                                            value={attendancestate.id}>{attendancestate.name}</option>)
                                }
                            </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course_id" sm={2}>Kurz</Label>
                        <Col sm={10}>
                            <Input type="select" bsSize="sm" name="course_id" id="course_id" value={course_id} onChange={this.onChange}>
                                {courses.map(course =>
                                    <option key={course.id}
                                            value={course.id}>{course.name}</option>)
                                }
                            </Input>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="at_paid" sm={2}>Placeno</Label>
                        <Col sm={10}>
                            <Input type="checkbox" bsSize="sm" name="at_paid" id="at_paid" defaultChecked={at_paid} onClick={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="at_note" sm={2}>Poznámka</Label>
                        <Col sm={10}>
                            <Input type="text" name="at_note" id="at_note" value={at_note} onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    {this.isLecture &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={2} className="text-muted">Smazání</Label>
                        <Col sm={10}>
                            <Button color="danger"
                                    onClick={() => {
                                        if (window.confirm('Opravdu chcete smazat lekci klienta ' + client.name + " " + client.surname + " v " + date + " " + time + '?'))
                                            this.delete(id)
                                    }}>
                                Smazat lekci</Button>
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={this.close}>Zrušit</Button>{' '}
                    <Button color="primary" type="submit">{this.isLecture ? 'Uložit' : 'Přidat'}</Button>
                </ModalFooter>
            </Form>
        )
    }
}
