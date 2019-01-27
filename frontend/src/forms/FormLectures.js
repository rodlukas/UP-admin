import React, {Component, Fragment} from "react"
import {UncontrolledTooltip, Col, Form, FormGroup, Label, Input, ModalHeader, ModalBody, ModalFooter, CustomInput,
    InputGroup, InputGroupAddon} from "reactstrap"
import {toISODate, toISOTime, prettyDateWithLongDayYear} from "../global/funcDateTime"
import LectureService from "../api/services/lecture"
import CourseService from "../api/services/course"
import ClientName from "../components/ClientName"
import "./FormLectures.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faCalendarAlt, faClock, faHourglass, faClipboardList, faInfoCircle} from "@fortawesome/pro-solid-svg-icons"
import GroupName from "../components/GroupName"
import DeleteButton from "../components/buttons/DeleteButton"
import CancelButton from "../components/buttons/CancelButton"
import SubmitButton from "../components/buttons/SubmitButton"
import Select from "react-select"
import {TEXTS} from "../global/constants"
import {WithAttendanceStatesContext} from "../contexts/AttendanceStateContext"
import {alertRequired} from "../global/utils"
import Loading from "../components/Loading"
import {DEFAULT_DURATION} from "../global/constants"

const GROUP_DURATION = 45

class FormLectures extends Component {
    constructor(props) {
        super(props)
        this.IS_LECTURE = Boolean(Object.keys(props.lecture).length)
        this.IS_CLIENT = props.IS_CLIENT
        const {id, start, course, duration, attendances, canceled} = props.lecture
        const {object} = props
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
            id: id || '',
            at_state: this.createAttendanceStateObjects(),
            at_paid: this.createPaidObjects(object),
            at_note: this.createNoteObjects(),
            prepaid: isPrepaid,
            canceled: canceled || false,
            canceled_previous: undefined,
            date: (this.IS_LECTURE && !isPrepaid) ? toISODate(date) : '',
            time: (this.IS_LECTURE && !isPrepaid) ? toISOTime(date) : '',
            course:
                (this.IS_LECTURE ?
                    course :
                    (this.IS_CLIENT ?
                        this.props.defaultCourse :
                        object.course)),
            duration: duration || this.computeDuration(),
            courses: [],
            object: object,
            prepaid_cnt: 1,
            canceled_disabled: false,
            IS_LOADING: true
        }
    }

    computeDuration = () => {
        // pokud je to klient a mame vypocitany nejpravdepodobnejsi kurz, pouzij ho, jinak default
        if (this.IS_CLIENT)
            return this.props.defaultCourse ? this.props.defaultCourse.duration : DEFAULT_DURATION
        // je to skupina
        return GROUP_DURATION
    }

    getAttendanceStatesData = () =>
        this.props.attendanceStatesContext.attendancestates

    getDefaultStateIndex() {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.default === true)
            if (res !== undefined)
                return res.id
            else
                return this.getAttendanceStatesData()[0].id // pokud pole neni prazdne, ale zadny stav neni vychozi, vrat prvni prvek
        }
        return undefined
    }

    getExcusedStateIndex() {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.excused === true)
            if (res !== undefined)
                return res.id
        }
        return undefined
    }

    componentDidUpdate(prevProps) {
        if (this.getAttendanceStatesData() !== prevProps.attendanceStatesContext.attendancestates)
            this.setState({at_state: this.createAttendanceStateObjects()})
    }

    // zaridi, ze se nastavi disabled checkbox Zruseno pokud jsou vsichni omluveni a pripadne zpet vrati puvodni hodnotu
    checkDisabledCanceled = () => {
        const client_cnt = Object.keys(this.state.at_state).length
        let excused_cnt = 0
        const excused_id = this.getExcusedStateIndex()
        Object.keys(this.state.at_state).forEach(elem => {
            if(Number(this.state.at_state[elem]) === excused_id) // ve state je String
                excused_cnt++
        })
        if(client_cnt === excused_cnt) // vsichni jsou omluveni, lekce nejde zrusit
            this.setState({
                canceled_previous: this.state.canceled,
                canceled: true,
                canceled_disabled: true})
        else
        {
            if (this.state.canceled_disabled) // vsichni uz nejsou omluveni (ale byli), hodnotu checkboxu vrat na puvodni
                this.setState({
                    canceled: this.state.canceled_previous,
                    canceled_previous: undefined
                })
            this.setState({canceled_disabled: false}) // uz neni potreba aby byl checkbox Zruseno disabled
        }
    }

    getMembers(memberships) {
        let members = []
        memberships.map(member =>
            members.push(member.client))
        return members
    }

    createAttendanceStateObjects() {
        let objects = {}
        const defaultStateIndex = this.getDefaultStateIndex()
        this.members.map((client, id) =>
            objects[client.id] = this.IS_LECTURE ? this.props.lecture.attendances[id].attendancestate : defaultStateIndex)
        return objects
    }

    createPaidObjects(object) {
        let objects = {}
        this.members.forEach((client, id) => {
            if(this.IS_LECTURE)
                objects[client.id] = this.props.lecture.attendances[id].paid
            else
            {
                objects[client.id] = false
                if (!this.IS_CLIENT) {
                    const membership = object.memberships.find(elem => elem.client.id === client.id)
                    if (membership !== undefined && membership.prepaid_cnt > 0)
                        objects[client.id] = true
                }
            }
        })
        return objects
    }

    createNoteObjects() {
        let objects = {}
        this.members.map((client, id) =>
            objects[client.id] = this.IS_LECTURE ? this.props.lecture.attendances[id].note : '')
        return objects
    }

    onChangeMultiple = e => {
        const target = e.target
        const id = target.dataset.id
        const value = target.type === 'checkbox' ? target.checked : target.value
        const stateVal = this.state[target.name]
        console.log(stateVal, value, target)
        stateVal[id] = value
        this.setState({[target.name]: stateVal})
        if(target.name === "at_state")
            this.checkDisabledCanceled()
    }

    getCourses = () =>
        CourseService.getVisible()
            .then(courses => this.setState({
                courses,
                IS_LOADING: false}))

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSelectChange = (obj, name) =>
        this.setState({[name]: obj, duration: obj.duration})

    onChangePrepaid = () => {
        if (!this.state.prepaid)
        {
            let paid = this.state.at_paid
            this.members.map(member =>
                paid[member.id] = true)
            this.setState({date: '', time: '', at_paid: paid})
        }
    }

    onSubmit = e => {
        e.preventDefault()
        const {id, prepaid, canceled, course, time, date, duration, at_note, at_paid, at_state, object, prepaid_cnt} = this.state
        if(alertRequired("kurz", course))
            return
        let attendances = []
        const start = date + " " + time
        this.members.forEach(member =>
        {
            let attendances_data = {
                client_id: member.id,
                attendancestate: at_state[member.id],
                paid: at_paid[member.id],
                note: at_note[member.id]
            }
            if(this.IS_LECTURE)
                attendances_data.id = this.props.lecture.attendances.find(elem => elem.client.id === member.id).id
            attendances.push(attendances_data)
        })
        let data = {
            id,
            attendances,
            course_id: course.id,
            duration,
            canceled,
            group_id: !this.IS_CLIENT ? object.id : null,
            start: prepaid ? null : start}

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

    close = () =>
        this.props.funcClose()

    refresh = () =>
        this.props.funcRefresh()

    delete = id =>
        LectureService.remove(id)
            .then(() => {
                this.close()
                this.refresh()
            })

    componentDidMount() {
        this.getCourses()
        this.checkDisabledCanceled()
    }

    render() {
        const {IS_LOADING, id, canceled, prepaid, canceled_disabled, course, date, time, duration, at_state, at_note, at_paid, object, courses, prepaid_cnt} = this.state
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
                    {IS_LOADING ?
                    <Loading/> :
                    <Fragment>
                        <FormGroup row className="align-items-center">
                            <Col sm={4}>
                                {this.IS_CLIENT &&
                                <Fragment>
                                    <CustomInput type="checkbox" id="prepaid" label="Předplaceno" checked={prepaid}
                                                 onChange={e => {
                                                     this.onChangePrepaid()
                                                     this.onChange(e)
                                                 }}
                                    />
                                    {!this.IS_LECTURE &&
                                    <Input type="number" className="FormLectures_prepaidLectureCnt" disabled={!prepaid}
                                           id="prepaid_cnt" value={prepaid_cnt} required={prepaid}
                                           onChange={this.onChange}/>}
                                </Fragment>}
                            </Col>
                            <Col sm={4}>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Label className="input-group-text" for="date">
                                            <FontAwesomeIcon icon={faCalendarAlt} fixedWidth/>
                                        </Label>
                                    </InputGroupAddon>
                                    <Input type="date" id="date" value={date} disabled={prepaid}
                                           onChange={this.onChange}
                                           required={!prepaid} pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" max="2099-12-31"
                                           min="2013-01-01" placeholder="yyyy-mm-dd"/>
                                </InputGroup>
                            </Col>
                            <Col sm={4}>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Label className="input-group-text" for="time">
                                            <FontAwesomeIcon icon={faClock} fixedWidth/>
                                        </Label>
                                    </InputGroupAddon>
                                    <Input type="time" id="time" value={time} disabled={prepaid}
                                           onChange={this.onChange}
                                           required={!prepaid} placeholder="hh:mm"/>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup row className="align-items-center">
                            <Col sm={4}>
                                <CustomInput type="checkbox" id="canceled" label="Zrušeno" checked={canceled}
                                             onChange={this.onChange} disabled={canceled_disabled}/>
                                {' '}
                                {canceled_disabled &&
                                <Fragment>
                                    <UncontrolledTooltip placement="bottom" target="tooltip_canceled">
                                        Na tuto lekci nikdo nemá přijít, proto je evidována jako zrušená.
                                        Parametr zrušení lze upravit jen když má alespoň jeden klient přijít.
                                    </UncontrolledTooltip>
                                    <FontAwesomeIcon icon={faInfoCircle} className="text-warning" size="lg"
                                                     id="tooltip_canceled"/>
                                </Fragment>}
                            </Col>
                            <Col sm={4}>
                                <Select
                                    value={course}
                                    getOptionLabel={option => option.name}
                                    getOptionValue={option => option.id}
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
                                        <Label className="input-group-text" for="duration">
                                            <FontAwesomeIcon icon={faHourglass} fixedWidth/>
                                        </Label>
                                    </InputGroupAddon>
                                    <Input type="number" id="duration" value={duration} onChange={this.onChange}
                                           required
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
                                            <InputGroupAddon addonType="prepend">
                                                <Label className="input-group-text" for={"at_state" + member.id}>
                                                    účast
                                                </Label>
                                            </InputGroupAddon>
                                            <CustomInput type="select" name="at_state" id={"at_state" + member.id}
                                                         value={at_state[member.id]} onChange={this.onChangeMultiple}
                                                         data-id={member.id} required>
                                                {this.getAttendanceStatesData().map(attendancestate =>
                                                    // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                                    (attendancestate.visible || attendancestate.id === at_state[member.id]) &&
                                                    <option key={attendancestate.id}
                                                            value={attendancestate.id.toString()}>
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
                                        {' '}
                                        {prepaid &&
                                        <Fragment>
                                            <UncontrolledTooltip placement="bottom" target="tooltip_prepaid">
                                                Předplacená lekce je automaticky zaplacená.
                                            </UncontrolledTooltip>
                                            <FontAwesomeIcon icon={faInfoCircle} className="text-warning" size="lg"
                                                             id="tooltip_prepaid"/>
                                        </Fragment>}
                                    </Col>
                                    <Col sm={6}>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <Label className="input-group-text" for={"at_note" + member.id}>
                                                    <FontAwesomeIcon icon={faClipboardList} fixedWidth/>
                                                </Label>
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
                                    content="lekci"
                                    onClick={() => {
                                        let msg = "Opravdu chcete smazat " + (prepaid ? 'předplacenou ' : '') + "lekci "
                                            + (this.IS_CLIENT ? "klienta" : "skupiny") + " "
                                            + (this.IS_CLIENT ? (object.surname + " " + object.name) : object.name)
                                            + (!prepaid ? (" v " + prettyDateWithLongDayYear(new Date(date)) + " " + time) : '') + '?'
                                        if (window.confirm(msg))
                                            this.delete(id)
                                    }}
                                />
                            </Col>
                        </FormGroup>}
                    </Fragment>}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close}/>
                    {' '}
                    <SubmitButton content={this.IS_LECTURE ? 'Uložit' : 'Přidat'} disabled={IS_LOADING}/>
                </ModalFooter>
            </Form>
        )
    }
}

export default WithAttendanceStatesContext(FormLectures)
