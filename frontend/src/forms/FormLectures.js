import React, {Component} from "react"
import {Col, Button, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {toISODate, toISOTime, prettyDateWithDay} from "../global/funcDateTime"
import LectureService from "../api/services/lecture"
import CourseService from "../api/services/course"
import {ATTENDANCESTATE_OK} from "../global/constants"

const DEFAULT_DURATION = 30

export default class FormLectures extends Component {
    constructor(props) {
        super(props)
        this.isLecture = Boolean(Object.keys(props.lecture).length)
        this.CLIENT = props.CLIENT
        const {id, start, course, duration} = props.lecture
        const {attendancestates} = props
        const isPrepaid = this.isLecture ? !Boolean(start) : false
        this.ATTENDANCESTATE_OK_INDEX = this.prepareStateIndex(attendancestates)
        this.members = []
        if (this.CLIENT)
            this.members = [props.object]
        else if (this.isLecture)
            this.members = this.getMembers(props.lecture.attendances)
        else
            this.members = this.getMembers(props.object.memberships)

        let date = new Date(start)
        this.state = {
            id: id || '',
            at_state: this.createAttendanceStateArray(),
            at_paid: this.createPaidArray(),
            at_note: this.createNoteArray(),
            prepaid: isPrepaid,
            date: (this.isLecture && !isPrepaid) ? toISODate(date) : '',
            time: (this.isLecture && !isPrepaid) ? toISOTime(date) : '',
            course_id: (this.isLecture ?
                course.id :
                (this.CLIENT ? "undef" : props.object.course.id)),
            duration: duration || DEFAULT_DURATION,
            attendancestates: attendancestates,
            courses: [],
            object: props.object
        }
    }

    prepareStateIndex(attendancestates) {
        return attendancestates ? attendancestates.find(function (el) {
            return el.name > ATTENDANCESTATE_OK
        }) : "undef"
    }

    createAttendanceStateArray() { // najdi index stavu OK
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.isLecture ? this.props.lecture.attendances[id].attendancestate.id : this.ATTENDANCESTATE_OK_INDEX)
        return array
    }

    componentWillReceiveProps(nextProps) {
        if(this.state.attendancestates !== nextProps.attendancestates)
        {
            this.ATTENDANCESTATE_OK_INDEX = this.prepareStateIndex(nextProps.attendancestates)
            this.setState({attendancestates: nextProps.attendancestates})
        }
    }

    getMembers(memberships) {
        let array = []
        memberships.map(member =>
            array.push(member.client))
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

    getCourses = () => {
        CourseService
            .getAll()
            .then((response) => {
                this.setState({courses: response})
            })
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onChangePrepaid = () => {
        let paid = this.state.at_paid
        this.members.map(member =>
            paid[member.id] = true)
        this.setState({date: '', time: '', at_paid: paid})
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, prepaid, course_id, time, date, duration, at_note, at_paid, at_state, object} = this.state
        let attendances = []
        const start = date + " " + time
        this.members.map(member =>
            attendances.push({
                client_id: member.id,
                attendancestate_id: at_state[member.id],
                paid: at_paid[member.id],
                note: at_note[member.id]
            }))
        let data = {id, attendances, course_id, duration}
        if(!this.CLIENT)
            data.group_id = object.id // API nechce pro klienta hodnotu null, doda ji samo ale pouze pokud je klic group_id nedefinovany
        if(!prepaid)
            data.start = start // stejny duvod viz. vyse
        let request
        if (this.isLecture)
            request = LectureService.update(data)
        else
            request = LectureService.create(data)
        request.then(() => {
            this.close()
            this.refresh()
        })
    }

    close = () => {
        this.props.funcClose()
    }

    refresh = () => {
        this.props.funcRefresh()
    }

    delete = (id) => {
        LectureService
            .remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })
    }

    componentDidMount() {
        this.getCourses()
    }

    render() {
        const {id, prepaid, course_id, date, time, duration, at_state, at_note, at_paid, object, attendancestates, courses} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.isLecture ? 'Úprava' : 'Přidání'} lekce {(this.CLIENT ? "klienta" : "skupiny")}: {(this.CLIENT ? (object.name + " " + object.surname) : object.name)}
                </ModalHeader>
                <ModalBody>
                    <FormGroup row>
                        <Col sm={3}>Naplánováno?</Col>
                        <Col sm={9} className="custom-control custom-checkbox">
                            <Input type="checkbox" className="custom-control-input" name="prepaid" id="prepaid"
                                   checked={prepaid} onChange={(e) => {this.onChange(e);this.onChangePrepaid()}}/>
                            <Label for="prepaid" className="custom-control-label">Nenaplánováno, ale předplaceno</Label>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="date" sm={3}>Datum</Label>
                        <Col sm={9}>
                            <Input type="date" name="date" id="date" value={date} disabled={prepaid}
                                   onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="time" sm={3}>Čas</Label>
                        <Col sm={9}>
                            <Input type="time" name="time" id="time" value={time} disabled={prepaid}
                                   onChange={this.onChange}/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="duration" sm={3}>Trvání</Label>
                        <Col sm={9}>
                            <Input type="number" name="duration" id="duration" value={duration} onChange={this.onChange} required="true"/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="course_id" sm={3}>Kurz</Label>
                        <Col sm={9}>
                            <Input type="select" bsSize="sm" name="course_id" id="course_id" value={course_id} onChange={this.onChange} disabled={!this.CLIENT && 'disabled'} required="true">
                                <option disabled value="undef">Vyberte kurz...</option>
                                {courses.map(course =>
                                    (course.visible || course.id === course_id) // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                    && <option key={course.id} value={course.id}>{course.name}</option>)}
                            </Input>
                        </Col>
                    </FormGroup>
                    <hr/>
                    {this.members.map(member =>
                    <div key={member.id}>
                        <h5>{!this.CLIENT && (member.name + " " + member.surname)}</h5>
                        <FormGroup row>
                            <Label for={"at_state" + member.id} sm={3}>Stav</Label>
                            <Col sm={9}>
                                <Input type="select" bsSize="sm" name="at_state" id={"at_state" + member.id} value={at_state[member.id]} onChange={this.onChangeMultiple} data-id={member.id} required="true">
                                    {attendancestates.map(attendancestate =>
                                        (attendancestate.visible || attendancestate.id === at_state[member.id]) // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                        && <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
                                </Input>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Col sm={3}>Platba</Col>
                            <Col sm={9} className="custom-control custom-checkbox">
                                <Input type="checkbox" className="custom-control-input" name="at_paid" id={"at_paid" + member.id} checked={at_paid[member.id]} onChange={this.onChangeMultiple} data-id={member.id}/>
                                <Label for={"at_paid" + member.id} className="custom-control-label">Placeno</Label>
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for={"at_note" + member.id} sm={3}>Poznámka</Label>
                            <Col sm={9}>
                                <Input type="text" name="at_note" id={"at_note" + member.id} value={at_note[member.id]} onChange={this.onChangeMultiple} data-id={member.id}/>
                            </Col>
                        </FormGroup>
                    </div>)}
                    {this.isLecture &&
                    <FormGroup row className="border-top pt-3">
                        <Label for="note" sm={3} className="text-muted">Smazání</Label>
                        <Col sm={9}>
                            <Button color="danger"
                                    onClick={() => {
                                        let msg = "Opravdu chcete smazat " + (prepaid ? 'předplacenou ' : '') + "lekci "
                                            + (this.CLIENT ? "klienta" : "skupiny") + " "
                                            + (this.CLIENT ? (object.name + " " + object.surname) : object.name)
                                            + (!prepaid ? (" v " + prettyDateWithDay(new Date(date)) + " " + time) : '') + '?'
                                        if (window.confirm(msg))
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
