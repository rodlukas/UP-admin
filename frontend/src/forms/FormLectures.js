import React, {Component} from "react"
import axios from 'axios'
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {toISODate, toISOTime} from "../components/FuncDateTime"
import AuthService from "../Auth/AuthService"
import {API_URL} from "../components/GlobalConstants"

export default class FormLectures extends Component {
    constructor(props) {
        super(props)
        this.isLecture = Boolean(Object.keys(props.lecture).length)
        this.CLIENT = props.CLIENT
        const {id, start, course, duration} = props.lecture
        this.members = this.CLIENT ? [props.object] : this.createArrayOfMembers(props.object.memberships)
        let date = new Date(start)
        this.state = {
            id: id || '',
            at_state: this.createAttendanceStateArray(),
            at_paid: this.createPaidArray(),
            at_note: this.createNoteArray(),
            date: this.isLecture ? toISODate(date) : '',
            time: this.isLecture ? toISOTime(date) : '',
            course_id: (this.isLecture ?
                course.id :
                (this.CLIENT ? "undef" : props.object.course.id)),
            duration: duration || 30,
            attendancestates: props.attendancestates,
            courses: [],
            object: props.object
        }
    }

    createArrayOfMembers(memberships) {
        let array = []
        memberships.map(member =>
            array.push(member.client))
        return array
    }

    createAttendanceStateArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.isLecture ? this.props.lecture.attendances[id].attendancestate.id : 5)
        return array
    }

    createPaidArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.isLecture ? this.props.lecture.attendances[id].paid : false)
        return array
    }

    createNoteArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.isLecture ? this.props.lecture.attendances[id].note : '')
        return array
    }

    onChangeMultiple = (e) => {
        const target = e.target
        const id = target.dataset.id
        const state = this.state
        state[target.name][id] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    getDataCourses = () => {
        axios.get(API_URL + 'courses/', AuthService.getHeaders())
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
        const {id, course_id, time, date, duration, at_note, at_paid, at_state, object} = this.state
        let attendances = []
        const start = date + " " + time
        this.members.map(member =>
            attendances.push({
                client_id: member.id,
                attendancestate_id: at_state[member.id],
                paid: at_paid[member.id],
                note: at_note[member.id]
            }))
        let data = {attendances, course_id, start, duration}
        if(!this.CLIENT)
            data.group_id = object.id // API nechce pro klienta hodnotu null, doda ji samo ale pouze pokud je klic group_id nedefinovany
        let request
        if (this.isLecture)
            request = axios.put(API_URL + 'lectures/' + id + '/', data, AuthService.getHeaders())
        else
            request = axios.post(API_URL + 'lectures/', data, AuthService.getHeaders())
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
        axios.delete(API_URL + 'lectures/' + id + '/', AuthService.getHeaders())
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
        const {id, course_id, date, time, duration, at_state, at_note, at_paid, object, attendancestates, courses} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isLecture ? 'Úprava' : 'Přidání'} lekce {(this.CLIENT ? "klienta" : "skupiny")}: {(this.CLIENT ? (object.name + " " + object.surname) : object.name)}
                </ModalHeader>
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
                            <Input type="number" name="duration" id="duration" value={duration} onChange={this.onChange} required="true"/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course_id" sm={2}>Kurz</Label>
                        <Col sm={10}>
                            <Input type="select" bsSize="sm" name="course_id" id="course_id" value={course_id} onChange={this.onChange} disabled={!this.CLIENT && 'disabled'} required="true">
                                <option disabled value="undef">Vyberte kurz...</option>
                                {courses.map(course =>
                                    <option key={course.id} value={course.id}>{course.name}</option>)}
                            </Input>
                        </Col>
                    </FormGroup>
                    <hr/>
                    {this.members.map(member =>
                    <div key={member.id}>
                        <h5>{!this.CLIENT && (member.name + " " + member.surname)}</h5>
                        <FormGroup row>
                            <Label for={"at_state" + member.id} sm={2}>Stav</Label>
                            <Col sm={10}>
                                <Input type="select" bsSize="sm" name="at_state" id={"at_state" + member.id} value={at_state[member.id]} onChange={this.onChangeMultiple} data-id={member.id} required="true">
                                    {attendancestates.map(attendancestate =>
                                        <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for={"at_paid" + member.id} sm={2}>Placeno</Label>
                            <Col sm={10}>
                                <Input type="checkbox" bsSize="sm" name="at_paid" id={"at_paid" + member.id} defaultChecked={at_paid[member.id]} onClick={this.onChangeMultiple} data-id={member.id}/>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for={"at_note" + member.id} sm={2}>Poznámka</Label>
                            <Col sm={10}>
                                <Input type="text" name="at_note" id={"at_note" + member.id} value={at_note[member.id]} onChange={this.onChangeMultiple} data-id={member.id}/>
                            </Col>
                        </FormGroup>
                    </div>
                    )}
                    {this.isLecture &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={2} className="text-muted">Smazání</Label>
                        <Col sm={10}>
                            <Button color="danger"
                                    onClick={() => {
                                        if (window.confirm('Opravdu chcete smazat lekci ' + (this.CLIENT ? "klienta" : "skupiny") + (this.CLIENT ? (object.name + " " + object.surname) : object.name) + " v " + date + " " + time + '?'))
                                            this.delete(id)}}>
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
