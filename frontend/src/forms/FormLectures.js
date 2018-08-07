import React, {Component} from "react"
import {Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, CustomInput, InputGroup,
    InputGroupAddon, InputGroupText} from "reactstrap"
import {toISODate, toISOTime, prettyDateWithLongDayYear} from "../global/funcDateTime"
import LectureService from "../api/services/lecture"
import CourseService from "../api/services/course"
import ClientName from "../components/ClientName"
import "./FormLectures.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCalendarAlt, faClock, faHourglass, faClipboardList} from "@fortawesome/pro-solid-svg-icons"
import GroupName from "../components/GroupName"
import DeleteButton from "../components/buttons/DeleteButton"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Select from "react-select"
import {TEXTS} from "../global/constants"

const DEFAULT_DURATION = 30
const GROUP_DURATION = 45

export default class FormLectures extends Component {
    constructor(props) {
        super(props)
        this.IS_LECTURE = Boolean(Object.keys(props.lecture).length)
        this.IS_CLIENT = props.IS_CLIENT
        const {id, start, course, duration, attendances, canceled} = props.lecture
        const {attendancestates, object} = props
        const isPrepaid = this.IS_LECTURE ? !Boolean(start) : false
        this.members = []
        if (this.IS_CLIENT)
            this.members = [object]
        else if (this.IS_LECTURE)
            this.members = this.getMembers(attendances)
        else
            this.members = this.getMembers(object.memberships)

        let date = new Date(start)
        this.state = {
            STATE_DEFAULT_INDEX: this.getDefaultStateIndex(),
            lastAttendancestates: attendancestates,
            id: id || '',
            at_state: this.createAttendanceStateArray(),
            at_paid: this.createPaidArray(),
            at_note: this.createNoteArray(),
            prepaid: isPrepaid,
            canceled: canceled || false,
            date: (this.IS_LECTURE && !isPrepaid) ? toISODate(date) : '',
            time: (this.IS_LECTURE && !isPrepaid) ? toISOTime(date) : '',
            course: (this.IS_LECTURE ?
                course :
                (this.IS_CLIENT ? null : object.course)),
            duration: duration || (this.IS_CLIENT ? DEFAULT_DURATION : GROUP_DURATION),
            courses: [],
            object: object,
            prepaid_cnt: 1
        }
    }

    getDefaultStateIndex() {
        return FormLectures.prepareStateIndex(this.props.attendancestates)
    }

    static getDerivedStateFromProps(props, state) {
        if(state.lastAttendancestates !== props.attendancestates)
            return {
                STATE_DEFAULT_INDEX: FormLectures.prepareStateIndex(props.attendancestates),
                lastAttendancestates: props.attendancestates
            }
        return null
    }

    getMembers(memberships) {
        let members = []
        memberships.map(member =>
            members.push(member.client))
        return members
    }

    static prepareStateIndex(attendancestates) {
        if(attendancestates.length)
        {
            const res = attendancestates.find(elem => elem.default === true)
            if(res !== undefined)
                return res.id
            else
                return attendancestates[0].id // pokud pole neni prazdne, ale zadny stav neni vychozi, vrat prvni prvek
        }
        return undefined
    }

    createAttendanceStateArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.IS_LECTURE ? this.props.lecture.attendances[id].attendancestate.id : this.getDefaultStateIndex())
        return array
    }

    createPaidArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.IS_LECTURE ? this.props.lecture.attendances[id].paid : false)
        return array
    }

    createNoteArray() {
        let array = []
        this.members.map((client, id) =>
            array[client.id] = this.IS_LECTURE ? this.props.lecture.attendances[id].note : '')
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
        CourseService.getVisible()
            .then(courses => {
                this.setState({courses})
            })
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.id] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onSelectChange = (obj, name) => {
        const state = this.state
        state[name] = obj
        this.setState(state)
    }

    onChangePrepaid = () => {
        if (!this.state.prepaid)
        {
            let paid = this.state.at_paid
            this.members.map(member =>
                paid[member.id] = true)
            this.setState({date: '', time: '', at_paid: paid})
        }
    }

    onSubmit = (e) => {
        e.preventDefault()
        const {id, prepaid, canceled, course, time, date, duration, at_note, at_paid, at_state, object, prepaid_cnt} = this.state
        let attendances = []
        const start = date + " " + time
        this.members.map(member =>
            attendances.push({
                client_id: member.id,
                attendancestate_id: at_state[member.id],
                paid: at_paid[member.id],
                note: at_note[member.id]
            }))
        let data = {id, attendances, course_id: course.id, duration, canceled}
        if(!this.IS_CLIENT)
            data.group_id = object.id // API nechce pro klienta hodnotu null, doda ji samo ale pouze pokud je klic group_id nedefinovany
        if(!prepaid)
            data.start = start // stejny duvod viz. vyse

        let request
        if (this.IS_LECTURE)
            request = LectureService.update(data)
        else
        {
            // pridava se lekce
            // pokud je predplacena, vytvor pole s prislusnym poctem lekci a posli ho
            if(prepaid)
            {
                let data_array = []
                let tmp = prepaid_cnt
                while (tmp) {
                    data_array.push(data)
                    tmp--
                }
                request = LectureService.create(data_array)
            }
            else // jinak posli pouze lekci
                request = LectureService.create(data)
        }
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
        LectureService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })
    }

    componentDidMount() {
        this.getCourses()
    }

    render() {
        const {id, canceled, prepaid, course, date, time, duration, at_state, at_note, at_paid, object, lastAttendancestates, courses, prepaid_cnt} = this.state
        return (
            <Form onSubmit={this.onSubmit}>
                <ModalHeader toggle={this.close}>
                    {this.IS_LECTURE ? 'Úprava' : 'Přidání'} lekce {(this.IS_CLIENT ? "klienta" : "skupiny")}:
                    {' '}
                    {(this.IS_CLIENT ?
                        <ClientName client={object}/>
                        :
                        <GroupName group={object}/>)}
                </ModalHeader>
                <ModalBody>
                    <FormGroup row className="align-items-center">
                        <Col sm={4}>
                            <CustomInput type="checkbox" id="prepaid" label="Předplaceno" checked={prepaid}
                                         onChange={(e) => {
                                this.onChangePrepaid()
                                this.onChange(e)}}
                            />
                            {!this.IS_LECTURE &&
                                <Input type="number" className="FormLectures_prepaidLectureCnt" disabled={!prepaid}
                                       id="prepaid_cnt" value={prepaid_cnt} required={prepaid}
                                       onChange={this.onChange}/>}
                        </Col>
                        <Col sm={4}>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <FontAwesomeIcon icon={faCalendarAlt} fixedWidth/>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input type="date" id="date" value={date} disabled={prepaid} onChange={this.onChange}
                                       required={!prepaid} pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" max="2099-12-31"
                                       min="2013-01-01"/>
                            </InputGroup>
                        </Col>
                        <Col sm={4}>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <FontAwesomeIcon icon={faClock} fixedWidth/>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input type="time" id="time" value={time} disabled={prepaid} onChange={this.onChange}
                                       required={!prepaid}/>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row className="align-items-center">
                        <Col sm={4}>
                            <CustomInput type="checkbox" id="canceled" label="Zrušeno" checked={canceled}
                                         onChange={this.onChange}/>
                        </Col>
                        <Col sm={4}>
                            <Select
                                value={course}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.id}
                                onChange={newValue => this.onSelectChange(newValue, "course")}
                                options={courses}
                                placeholder={"Vyberte kurz..."}
                                noOptionsMessage={() => TEXTS.NO_RESULTS}
                                isDisabled={!this.IS_CLIENT}
                                required/>
                        </Col>
                        <Col sm={4}>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                        <FontAwesomeIcon icon={faHourglass} fixedWidth/>
                                    </InputGroupText>
                                </InputGroupAddon>
                                <Input type="number" id="duration" value={duration} onChange={this.onChange} required
                                       min="1"/>
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <hr/>
                    {this.members.map(member =>
                    <div key={member.id}>
                        <h5>
                            {!this.IS_CLIENT &&
                            <ClientName client={member}/>}
                        </h5>
                        <FormGroup row className="align-items-center">
                            <Col sm={4}>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">účast</InputGroupAddon>
                                    <CustomInput type="select" name="at_state" id={"at_state" + member.id}
                                                 value={at_state[member.id]} onChange={this.onChangeMultiple}
                                                 data-id={member.id} required>
                                        {lastAttendancestates.map(attendancestate =>
                                            // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                            (attendancestate.visible || attendancestate.id === at_state[member.id]) &&
                                            <option key={attendancestate.id} value={attendancestate.id}>
                                                {attendancestate.name}
                                            </option>)}
                                    </CustomInput>
                                </InputGroup>
                            </Col>
                            <Col sm={2} className="text-center">
                                <CustomInput type="checkbox" id={"at_paid" + member.id} name="at_paid"
                                             label="Platba" checked={at_paid[member.id]}
                                             disabled={prepaid}
                                             className={at_paid[member.id] ? "text-success" : "text-danger"}
                                             onChange={this.onChangeMultiple} data-id={member.id}/>
                            </Col>
                            <Col sm={6}>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <FontAwesomeIcon icon={faClipboardList} fixedWidth/>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input type="text" name="at_note" id={"at_note" + member.id}
                                           value={at_note[member.id]} onChange={this.onChangeMultiple}
                                           data-id={member.id}/>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                    </div>)}
                    {this.IS_LECTURE &&
                    <FormGroup row className="border-top pt-3 align-items-center">
                        <Label sm={3} className="text-muted">
                            Smazání
                        </Label>
                        <Col sm={9}>
                            <DeleteButton
                                title="lekci"
                                onClick={() => {
                                    let msg = "Opravdu chcete smazat " + (prepaid ? 'předplacenou ' : '') + "lekci "
                                        + (this.IS_CLIENT ? "klienta" : "skupiny") + " "
                                        + (this.IS_CLIENT ? (object.surname + " " + object.name) : object.name)
                                        + (!prepaid ? (" v " + prettyDateWithLongDayYear(new Date(date)) + " " + time) : '') + '?'
                                    if (window.confirm(msg))
                                        this.delete(id)}}
                            />
                        </Col>
                    </FormGroup>}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton title={this.IS_LECTURE ? 'Uložit' : 'Přidat'}/>
                </ModalFooter>
            </Form>
        )
    }
}
