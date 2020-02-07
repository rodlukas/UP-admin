import { faCalendarAlt, faClipboardList, faClock, faHourglass } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Component, Fragment } from "react"
import {
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
import LectureService from "../api/services/lecture"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import ClientName from "../components/ClientName"
import GroupName from "../components/GroupName"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import { WithAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { WithCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { DEFAULT_DURATION } from "../global/constants"
import { prettyDateWithLongDayYear, toISODate, toISOTime } from "../global/funcDateTime"
import { alertRequired } from "../global/utils"
import "./FormLectures.css"
import CustomCustomInput from "./helpers/CustomCustomInput"
import SelectCourse from "./helpers/SelectCourse"

const GROUP_DURATION = 45

class FormLectures extends Component {
    IS_LECTURE = Boolean(Object.keys(this.props.lecture).length)

    isPrepaid = this.IS_LECTURE ? !Boolean(this.props.lecture.start) : false

    members = this.props.IS_CLIENT
        ? [this.props.object]
        : this.IS_LECTURE
        ? this.getMembers(this.props.lecture.attendances)
        : this.getMembers(this.props.object.memberships)

    getAttendanceStatesData = () => this.props.attendanceStatesContext.attendancestates

    state = {
        id: this.props.lecture.id || "",
        at_state: this.createAttendanceStateObjects(),
        at_paid: this.createPaidObjects(this.props.object),
        at_note: this.createNoteObjects(),
        prepaid: this.isPrepaid,
        canceled: this.props.lecture.canceled || false,
        canceled_previous: undefined,
        date:
            this.IS_LECTURE && !this.isPrepaid
                ? toISODate(new Date(this.props.lecture.start))
                : this.props.date !== ""
                ? this.props.date
                : this.props.defaultValuesForLecture &&
                  this.props.defaultValuesForLecture.start !== ""
                ? toISODate(this.props.defaultValuesForLecture.start)
                : "",
        time:
            this.IS_LECTURE && !this.isPrepaid
                ? toISOTime(new Date(this.props.lecture.start))
                : this.props.defaultValuesForLecture &&
                  this.props.defaultValuesForLecture.start !== ""
                ? toISOTime(this.props.defaultValuesForLecture.start)
                : "",
        course: this.IS_LECTURE
            ? this.props.lecture.course
            : this.props.IS_CLIENT
            ? this.props.defaultValuesForLecture.course
            : this.props.object.course,
        duration: this.props.lecture.duration || this.computeDuration(),
        object: this.props.object,
        prepaid_cnt: 1,
        canceled_disabled: false,
        IS_SUBMIT: false
    }

    areAttendantsEqualToMembers() {
        const idsAttendants = this.props.lecture.attendances.map(x => x.client.id)
        const idsMembers = this.props.object.memberships.map(x => x.client.id)
        return (
            idsAttendants.length === idsMembers.length &&
            idsAttendants.every(val => idsMembers.includes(val))
        )
    }

    computeDuration() {
        // pokud je to klient a mame vypocitany nejpravdepodobnejsi kurz, pouzij ho, jinak default
        if (this.props.IS_CLIENT)
            return this.props.defaultValuesForLecture.course
                ? this.props.defaultValuesForLecture.course.duration
                : DEFAULT_DURATION
        // je to skupina
        return GROUP_DURATION
    }

    getDefaultStateIndex() {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.default === true)
            if (res !== undefined) return res.id
            else return this.getAttendanceStatesData()[0].id // pokud pole neni prazdne, ale zadny stav neni vychozi, vrat prvni prvek
        }
        return undefined
    }

    getExcusedStateIndex() {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.excused === true)
            if (res !== undefined) return res.id
        }
        return undefined
    }

    componentDidUpdate(prevProps) {
        if (this.getAttendanceStatesData() !== prevProps.attendanceStatesContext.attendancestates)
            this.setState({ at_state: this.createAttendanceStateObjects() })
    }

    // zaridi, ze se nastavi disabled checkbox Zruseno pokud jsou vsichni omluveni a pripadne zpet vrati puvodni hodnotu
    checkDisabledCanceled = () => {
        const client_cnt = Object.keys(this.state.at_state).length
        if (client_cnt === 0) return
        let excused_cnt = 0
        const excused_id = this.getExcusedStateIndex()
        Object.keys(this.state.at_state).forEach(elem => {
            if (this.state.at_state[elem] === excused_id)
                // ve state je String
                excused_cnt++
        })
        if (client_cnt === excused_cnt)
            // vsichni jsou omluveni, lekce nejde zrusit
            this.setState(prevState => ({
                canceled_previous: prevState.canceled,
                canceled: true,
                canceled_disabled: true
            }))
        else {
            if (this.state.canceled_disabled)
                // vsichni uz nejsou omluveni (ale byli), hodnotu checkboxu vrat na puvodni
                this.setState(prevState => ({
                    canceled: prevState.canceled_previous,
                    canceled_previous: undefined
                }))
            this.setState({ canceled_disabled: false }) // uz neni potreba aby byl checkbox Zruseno disabled
        }
    }

    getMembers(memberships) {
        let members = []
        memberships.map(member => members.push(member.client))
        return members
    }

    createAttendanceStateObjects() {
        let objects = {}
        const defaultStateIndex = this.getDefaultStateIndex()
        this.members.map(
            (client, id) =>
                (objects[client.id] = this.IS_LECTURE
                    ? this.props.lecture.attendances[id].attendancestate
                    : defaultStateIndex)
        )
        return objects
    }

    createPaidObjects(object) {
        let objects = {}
        this.members.forEach((client, id) => {
            if (this.IS_LECTURE) objects[client.id] = this.props.lecture.attendances[id].paid
            else {
                objects[client.id] = false
                if (!this.props.IS_CLIENT) {
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
        this.members.map(
            (client, id) =>
                (objects[client.id] = this.IS_LECTURE
                    ? this.props.lecture.attendances[id].note
                    : "")
        )
        return objects
    }

    onChangeMultiple = e => {
        this.props.setFormDirty()
        const target = e.target
        const id = target.dataset.id
        let value = target.type === "checkbox" ? target.checked : target.value
        if (target.name === "at_state") value = Number(value)
        this.setState(
            prevState => {
                const newStateVal = { ...prevState[target.name] }
                newStateVal[id] = value
                return { [target.name]: newStateVal }
            },
            () => {
                if (target.name === "at_state") this.checkDisabledCanceled()
            }
        )
    }

    onChange = e => {
        this.props.setFormDirty()
        const target = e.target
        const value = target.type === "checkbox" ? target.checked : target.value
        this.setState({ [target.id]: value })
    }

    onSelectChange = (obj, name) => {
        this.props.setFormDirty()
        this.setState({ [name]: obj, duration: obj.duration })
    }

    onChangePrepaid = () => {
        if (!this.state.prepaid) {
            let paid = this.state.at_paid
            this.members.map(member => (paid[member.id] = true))
            this.setState({ date: "", time: "", at_paid: paid })
        }
    }

    onSubmit = (e, refresh_clients = false) => {
        e.preventDefault()
        const {
            id,
            prepaid,
            canceled,
            course,
            time,
            date,
            duration,
            at_note,
            at_paid,
            at_state,
            object,
            prepaid_cnt
        } = this.state
        if (alertRequired("kurz", course)) return
        let attendances = []
        const start = date + " " + time
        this.members.forEach(member => {
            let attendances_data = {
                client_id: member.id,
                attendancestate: at_state[member.id],
                paid: at_paid[member.id],
                note: at_note[member.id]
            }
            if (this.IS_LECTURE)
                attendances_data.id = this.props.lecture.attendances.find(
                    elem => elem.client.id === member.id
                ).id
            attendances.push(attendances_data)
        })
        let data = {
            id,
            attendances,
            duration,
            canceled,
            group_id: !this.props.IS_CLIENT ? object.id : null,
            start: prepaid ? null : start,
            refresh_clients
        }
        if (this.props.IS_CLIENT) {
            data = { ...data, course_id: course.id }
        }

        let request
        if (this.IS_LECTURE) request = LectureService.update(data)
        else {
            // pridava se lekce
            // pokud je predplacena, vytvor pole s prislusnym poctem lekci a posli ho
            if (prepaid) {
                let data_array = []
                let tmp = prepaid_cnt
                while (tmp) {
                    data_array.push(data)
                    tmp--
                }
                request = LectureService.create(data_array)
            } // jinak posli pouze lekci
            else request = LectureService.create(data)
        }
        this.setState({ IS_SUBMIT: true }, () =>
            request
                .then(() => this.props.funcForceClose())
                .catch(() => this.setState({ IS_SUBMIT: false }))
        )
    }

    close = () => this.props.funcClose()

    delete = id => LectureService.remove(id).then(() => this.props.funcForceClose())

    componentDidMount() {
        this.checkDisabledCanceled()
        this.props.coursesVisibleContext.funcRefresh()
    }

    render() {
        const {
            id,
            canceled,
            prepaid,
            canceled_disabled,
            course,
            date,
            time,
            duration,
            at_state,
            at_note,
            at_paid,
            object,
            prepaid_cnt
        } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_lecture">
                <ModalHeader toggle={this.close}>
                    {this.IS_LECTURE ? "Úprava" : "Přidání"} lekce{" "}
                    {this.props.IS_CLIENT ? "klienta" : "skupiny"}:{" "}
                    {this.props.IS_CLIENT ? (
                        <ClientName client={object} bold />
                    ) : (
                        <GroupName group={object} bold />
                    )}
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded ||
                    !this.props.attendanceStatesContext.isLoaded ? (
                        <Loading />
                    ) : (
                        <Fragment>
                            <FormGroup row className="align-items-center">
                                <Col sm={4}>
                                    {this.props.IS_CLIENT && (
                                        <Fragment>
                                            <CustomInput
                                                type="checkbox"
                                                id="prepaid"
                                                checked={prepaid}
                                                onChange={e => {
                                                    this.onChangePrepaid()
                                                    this.onChange(e)
                                                }}
                                            />
                                            <Label for="prepaid" className="mb-0">
                                                Předplaceno
                                            </Label>
                                            {!this.IS_LECTURE && (
                                                <Input
                                                    type="number"
                                                    className="FormLectures_prepaidLectureCnt"
                                                    disabled={!prepaid}
                                                    id="prepaid_cnt"
                                                    value={prepaid_cnt}
                                                    required={prepaid}
                                                    onChange={this.onChange}
                                                />
                                            )}
                                        </Fragment>
                                    )}
                                </Col>
                                <Col sm={4}>
                                    <InputGroup id="FormLectures_Date">
                                        <InputGroupAddon addonType="prepend">
                                            <Label className="input-group-text" for="date">
                                                <FontAwesomeIcon icon={faCalendarAlt} fixedWidth />
                                            </Label>
                                        </InputGroupAddon>
                                        <Input
                                            type="date"
                                            id="date"
                                            value={date}
                                            disabled={prepaid}
                                            onChange={this.onChange}
                                            required={!prepaid}
                                            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                                            max="2099-12-31"
                                            min="2013-01-01"
                                            placeholder="yyyy-mm-dd"
                                            data-qa="lecture_field_date"
                                        />
                                    </InputGroup>
                                    <UncontrolledTooltipWrapper target="FormLectures_Date">
                                        Datum
                                    </UncontrolledTooltipWrapper>
                                </Col>
                                <Col sm={4}>
                                    <InputGroup id="FormLectures_Time">
                                        <InputGroupAddon addonType="prepend">
                                            <Label className="input-group-text" for="time">
                                                <FontAwesomeIcon icon={faClock} fixedWidth />
                                            </Label>
                                        </InputGroupAddon>
                                        <Input
                                            type="time"
                                            id="time"
                                            value={time}
                                            disabled={prepaid}
                                            onChange={this.onChange}
                                            required={!prepaid}
                                            placeholder="hh:mm"
                                            data-qa="lecture_field_time"
                                        />
                                    </InputGroup>
                                    <UncontrolledTooltipWrapper target="FormLectures_Time">
                                        Čas začátku
                                    </UncontrolledTooltipWrapper>
                                </Col>
                            </FormGroup>
                            <FormGroup row className="align-items-center">
                                <Col sm={4}>
                                    <CustomInput
                                        type="checkbox"
                                        id="canceled"
                                        checked={canceled}
                                        onChange={this.onChange}
                                        disabled={canceled_disabled}
                                        data-qa="lecture_checkbox_canceled"
                                    />
                                    <Label
                                        for="canceled"
                                        data-qa="lecture_label_canceled"
                                        className="mb-0">
                                        Zrušeno
                                    </Label>{" "}
                                    {canceled_disabled && (
                                        <Tooltip
                                            postfix="canceled"
                                            text={
                                                <Fragment>
                                                    Na tuto lekci nemá nikdo přijít, proto je
                                                    automaticky zrušená.
                                                    <br />
                                                    Toto lze změnit jen když má přijít alespoň jeden
                                                    klient.
                                                </Fragment>
                                            }
                                        />
                                    )}
                                </Col>
                                <Col sm={4}>
                                    <SelectCourse
                                        value={course}
                                        onChangeCallback={this.onSelectChange}
                                        options={this.props.coursesVisibleContext.courses}
                                        isDisabled={!this.props.IS_CLIENT}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <InputGroup id="FormLectures_Duration">
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
                                            data-qa="lecture_field_duration"
                                        />
                                    </InputGroup>
                                    <UncontrolledTooltipWrapper target="FormLectures_Duration">
                                        Trvání (min.)
                                    </UncontrolledTooltipWrapper>
                                </Col>
                            </FormGroup>
                            <hr />
                            {this.members.map(member => (
                                <div key={member.id} data-qa="form_lecture_attendance">
                                    <h5>
                                        {!this.props.IS_CLIENT && <ClientName client={member} />}
                                    </h5>
                                    <FormGroup row className="align-items-center">
                                        <Col sm={4}>
                                            <InputGroup>
                                                <InputGroupAddon addonType="prepend">
                                                    <Label
                                                        className="input-group-text"
                                                        for={"at_state" + member.id}>
                                                        účast
                                                    </Label>
                                                </InputGroupAddon>
                                                <CustomCustomInput
                                                    type="select"
                                                    name="at_state"
                                                    id={"at_state" + member.id}
                                                    value={at_state[member.id]}
                                                    onChange={this.onChangeMultiple}
                                                    data-id={member.id}
                                                    required
                                                    data-qa="lecture_select_attendance_attendancestate">
                                                    {this.getAttendanceStatesData().map(
                                                        attendancestate =>
                                                            // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                                            (attendancestate.visible ||
                                                                attendancestate.id ===
                                                                    at_state[member.id]) && (
                                                                <option
                                                                    key={attendancestate.id}
                                                                    value={attendancestate.id}>
                                                                    {attendancestate.name}
                                                                </option>
                                                            )
                                                    )}
                                                </CustomCustomInput>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={2} className="text-sm-center">
                                            <CustomInput
                                                type="checkbox"
                                                id={"at_paid" + member.id}
                                                name="at_paid"
                                                checked={at_paid[member.id]}
                                                disabled={prepaid}
                                                onChange={this.onChangeMultiple}
                                                data-id={member.id}
                                                data-qa="lecture_checkbox_attendance_paid"
                                            />
                                            <Label
                                                for={"at_paid" + member.id}
                                                data-qa="lecture_label_attendance_paid"
                                                className={
                                                    "mb-0 font-weight-bold " +
                                                    (at_paid[member.id]
                                                        ? "text-success"
                                                        : "text-danger")
                                                }>
                                                Platba
                                            </Label>{" "}
                                            {prepaid && (
                                                <Tooltip
                                                    postfix="prepaid"
                                                    text="Předplacená lekce je automaticky zaplacená."
                                                />
                                            )}
                                        </Col>
                                        <Col sm={6}>
                                            <InputGroup id={"FormLectures_Note_" + member.id}>
                                                <InputGroupAddon addonType="prepend">
                                                    <Label
                                                        className="input-group-text"
                                                        for={"at_note" + member.id}>
                                                        <FontAwesomeIcon
                                                            icon={faClipboardList}
                                                            fixedWidth
                                                        />
                                                    </Label>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    name="at_note"
                                                    id={"at_note" + member.id}
                                                    value={at_note[member.id]}
                                                    onChange={this.onChangeMultiple}
                                                    data-id={member.id}
                                                    data-qa="lecture_field_attendance_note"
                                                    spellCheck
                                                />
                                            </InputGroup>
                                            <UncontrolledTooltipWrapper
                                                target={"FormLectures_Note_" + member.id}>
                                                Poznámka
                                            </UncontrolledTooltipWrapper>
                                        </Col>
                                    </FormGroup>
                                </div>
                            ))}
                            {!Boolean(this.members.length) && (
                                <p className="text-muted text-center">Žádní účastníci</p>
                            )}
                            {this.IS_LECTURE && (
                                <FormGroup row className="border-top pt-3 align-items-center">
                                    <Label sm={3} className="text-muted">
                                        Smazání
                                    </Label>
                                    <Col sm={9}>
                                        <DeleteButton
                                            content="lekci"
                                            onClick={() => {
                                                const msg =
                                                    `Opravdu chcete smazat ${
                                                        prepaid ? "předplacenou " : ""
                                                    }` +
                                                    `lekci ${
                                                        this.props.IS_CLIENT ? "klienta" : "skupiny"
                                                    } ` +
                                                    (this.props.IS_CLIENT
                                                        ? `${object.surname} ${object.firstname}`
                                                        : object.name) +
                                                    `${
                                                        !prepaid
                                                            ? ` v ${prettyDateWithLongDayYear(
                                                                  new Date(date)
                                                              )} ${time}`
                                                            : ""
                                                    }?`
                                                if (window.confirm(msg)) this.delete(id)
                                            }}
                                            data-qa="button_delete_lecture"
                                        />
                                    </Col>
                                </FormGroup>
                            )}
                        </Fragment>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        loading={this.state.IS_SUBMIT}
                        content={this.IS_LECTURE ? "Uložit" : "Přidat"}
                        data-qa="button_submit_lecture"
                        disabled={!this.props.coursesVisibleContext.isLoaded}
                    />
                    {this.IS_LECTURE &&
                        !this.props.IS_CLIENT &&
                        !this.areAttendantsEqualToMembers() && (
                            <Fragment>
                                <SubmitButton
                                    loading={this.state.IS_SUBMIT}
                                    onClick={e => this.onSubmit(e, true)}
                                    id="FormLectures_SubmitWithClientChanges"
                                    disabled={!this.props.coursesVisibleContext.isLoaded}
                                    content="Uložit + projevit změny v klientech"
                                />
                                <UncontrolledTooltipWrapper target="FormLectures_SubmitWithClientChanges">
                                    Uloží informace a zároveň upraví účastníky této lekce tak, aby
                                    byli v souladu se členy skupiny
                                </UncontrolledTooltipWrapper>
                            </Fragment>
                        )}
                </ModalFooter>
            </Form>
        )
    }
}

export default WithAttendanceStatesContext(WithCoursesVisibleContext(FormLectures))
