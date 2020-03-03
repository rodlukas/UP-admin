import {
    faCalendarAlt,
    faClipboardList,
    faClock,
    faHourglass
} from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as React from "react"
import { ChangeEvent, FormEvent } from "react"
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
import {
    AttendanceStatesContextProps,
    WithAttendanceStatesContext
} from "../contexts/AttendanceStatesContext"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext
} from "../contexts/CoursesVisibleContext"
import {
    DEFAULT_LECTURE_DURATION_GROUP,
    DEFAULT_LECTURE_DURATION_SINGLE
} from "../global/constants"
import { prettyDateWithLongDayYear, toISODate, toISOTime } from "../global/funcDateTime"
import { alertRequired, DefaultValuesForLecture } from "../global/utils"
import {
    AttendancePostApi,
    AttendancePutApi,
    AttendanceStateType,
    AttendanceType,
    ClientType,
    CourseType,
    GroupType,
    LecturePostApi,
    LecturePostApiDummy,
    LecturePutApi,
    LectureType,
    LectureTypeWithDate
} from "../types/models"
import { fEmptyVoid } from "../types/types"
import "./FormLectures.css"
import CustomInputWrapper from "./helpers/CustomInputWrapper"
import SelectCourse from "./helpers/SelectCourse"

// klic je ClientType["id"]
type AtState = { [key: number]: AttendanceType["attendancestate"] }
type AtStateWithEmpty = { [key: number]: AttendanceType["attendancestate"] | undefined }
type AtPaid = { [key: number]: boolean }
type AtNote = { [key: number]: AttendanceType["note"] }

type Props = AttendanceStatesContextProps &
    CoursesVisibleContextProps & {
        lecture: LectureType | LecturePostApiDummy | LectureTypeWithDate
        date: string
        object: ClientType | GroupType
        defaultValuesForLecture?: DefaultValuesForLecture
        funcClose: () => boolean | void
        funcForceClose: (modalSubmitted?: boolean, data?: never) => boolean | void
        setFormDirty: fEmptyVoid
    }

type State = {
    atState: AtStateWithEmpty | AtState
    atPaid: AtPaid
    atNote: AtNote
    prepaid: boolean
    canceled: LecturePostApiDummy["canceled"]
    canceledPrevious?: LecturePostApiDummy["canceled"]
    date: string
    time: string
    course: LecturePostApiDummy["course"]
    duration: LecturePostApiDummy["duration"]
    canceledDisabled: boolean
    isSubmit: boolean
    prepaidCnt: number
}

/** Formulář pro lekce. */
class FormLectures extends React.Component<Props, State> {
    isClient = (object: ClientType | GroupType): object is ClientType => "phone" in object

    isLectureWithDate = (lecture: Props["lecture"]): lecture is LectureTypeWithDate =>
        this.isLecture(lecture) && !this.isPrepaid(lecture.start)

    isPrepaid = (start: Props["lecture"]["start"]): start is string => start === null

    isLecture = (lecture: Props["lecture"]): lecture is LectureType => "id" in lecture

    isAtStateWithoutEmpty = (atState: State["atState"]): atState is AtState => {
        for (const [, value] of Object.entries(atState)) if (value === null) return false
        return true
    }

    members: Array<ClientType> = this.isClient(this.props.object)
        ? [this.props.object]
        : this.isLecture(this.props.lecture)
        ? this.getMembers(this.props.lecture.attendances)
        : this.getMembers(this.props.object.memberships)

    getAttendanceStatesData = (): Array<AttendanceStateType> =>
        this.props.attendanceStatesContext.attendancestates

    state: State = {
        atState: this.createAttendanceStateObjects(),
        atPaid: this.createPaidObjects(this.props.object),
        atNote: this.createNoteObjects(),
        prepaid: this.isPrepaid(this.props.lecture.start),
        canceled: this.props.lecture.canceled || false,
        canceledPrevious: undefined,
        date: this.isLectureWithDate(this.props.lecture)
            ? toISODate(new Date(this.props.lecture.start))
            : this.props.date !== ""
            ? this.props.date
            : this.props.defaultValuesForLecture && this.props.defaultValuesForLecture.start !== ""
            ? toISODate(this.props.defaultValuesForLecture.start)
            : "",
        time: this.isLectureWithDate(this.props.lecture)
            ? toISOTime(new Date(this.props.lecture.start))
            : this.props.defaultValuesForLecture && this.props.defaultValuesForLecture.start !== ""
            ? toISOTime(this.props.defaultValuesForLecture.start)
            : "",
        course: this.isLecture(this.props.lecture)
            ? this.props.lecture.course
            : this.isClient(this.props.object) && this.props.defaultValuesForLecture
            ? this.props.defaultValuesForLecture.course
            : !this.isClient(this.props.object)
            ? this.props.object.course
            : null,
        duration: this.props.lecture.duration || this.computeDuration(),
        prepaidCnt: 1,
        canceledDisabled: false,
        isSubmit: false
    }

    areAttendantsEqualToMembers(): boolean {
        if (this.isClient(this.props.object)) return true
        const idsAttendants = this.props.lecture.attendances.map(x => x.client.id)
        const idsMembers = this.props.object.memberships.map(x => x.client.id)
        return (
            idsAttendants.length === idsMembers.length &&
            idsAttendants.every(val => idsMembers.includes(val))
        )
    }

    computeDuration(): LectureType["duration"] {
        // pokud je to klient a mame vypocitany nejpravdepodobnejsi kurz, pouzij ho, jinak default
        if (this.isClient(this.props.object))
            return this.props.defaultValuesForLecture && this.props.defaultValuesForLecture.course
                ? this.props.defaultValuesForLecture.course.duration
                : DEFAULT_LECTURE_DURATION_SINGLE
        // je to skupina
        return DEFAULT_LECTURE_DURATION_GROUP
    }

    getDefaultStateIndex(): AttendanceStateType["id"] | undefined {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.default === true)
            if (res !== undefined) return res.id
            // pokud pole neni prazdne, ale zadny stav neni vychozi, vrat prvni prvek
            else return this.getAttendanceStatesData()[0].id
        }
        return undefined
    }

    getExcusedStateIndex(): AttendanceStateType["id"] | undefined {
        if (this.getAttendanceStatesData().length) {
            const res = this.getAttendanceStatesData().find(elem => elem.excused === true)
            if (res !== undefined) return res.id
        }
        return undefined
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (this.getAttendanceStatesData() !== prevProps.attendanceStatesContext.attendancestates)
            this.setState({ atState: this.createAttendanceStateObjects() })
    }

    // zaridi, ze se nastavi disabled checkbox Zruseno pokud jsou vsichni omluveni a pripadne zpet vrati puvodni hodnotu
    checkDisabledCanceled = (): void => {
        const clientCnt = Object.keys(this.state.atState).length
        if (clientCnt === 0) return
        let excusedCnt = 0
        const excusedId = this.getExcusedStateIndex()
        for (const [, val] of Object.entries(this.state.atState))
            if (val === excusedId)
                // ve state je String
                excusedCnt++
        if (clientCnt === excusedCnt)
            // vsichni jsou omluveni, lekce nejde zrusit
            this.setState(prevState => ({
                canceledPrevious: prevState.canceled,
                canceled: true,
                canceledDisabled: true
            }))
        else {
            if (this.state.canceledDisabled)
                // vsichni uz nejsou omluveni (ale byli), hodnotu checkboxu vrat na puvodni
                this.setState(prevState => ({
                    canceled: Boolean(prevState.canceledPrevious),
                    canceledPrevious: undefined
                }))
            this.setState({ canceledDisabled: false }) // uz neni potreba aby byl checkbox Zruseno disabled
        }
    }

    getMembers(memberships: Array<{ client: ClientType }>): Array<ClientType> {
        const members: Array<ClientType> = []
        // map se provadi nad hodnotami MembershipType | AttendanceType
        memberships.map(member => members.push(member.client))
        return members
    }

    createAttendanceStateObjects(): AtStateWithEmpty {
        const objects: AtStateWithEmpty = {}
        const defaultStateIndex = this.getDefaultStateIndex()
        this.members.map(
            (client, id) =>
                (objects[client.id] = this.isLecture(this.props.lecture)
                    ? this.props.lecture.attendances[id].attendancestate
                    : defaultStateIndex)
        )
        return objects
    }

    createPaidObjects(object: ClientType | GroupType): AtPaid {
        const objects: AtPaid = {}
        this.members.forEach((client, id) => {
            if (this.isLecture(this.props.lecture))
                objects[client.id] = this.props.lecture.attendances[id].paid
            else {
                objects[client.id] = false
                if (!this.isClient(object)) {
                    const membership = object.memberships.find(elem => elem.client.id === client.id)
                    if (membership !== undefined && membership.prepaid_cnt > 0)
                        objects[client.id] = true
                }
            }
        })
        return objects
    }

    createNoteObjects(): AtNote {
        const objects: AtNote = {}
        this.members.map(
            (client, id) =>
                (objects[client.id] = this.isLecture(this.props.lecture)
                    ? this.props.lecture.attendances[id].note
                    : "")
        )
        return objects
    }

    onChangeMultiple = (e: ChangeEvent<HTMLInputElement>): void => {
        this.props.setFormDirty()
        const target = e.currentTarget
        const id = Number(target.dataset.id)
        let value: boolean | string | number =
            target.type === "checkbox" ? target.checked : target.value
        if (target.name === "atState") value = Number(value)
        const nameStateAttr = target.name as keyof State
        this.setState(
            prevState => {
                // as object - ve state jsou hodnoty co nejsou objekty
                const newStateVal: AtNote | AtPaid | AtState = {
                    ...(prevState[nameStateAttr] as object)
                }
                newStateVal[id] = value
                // ...prevState kvuli https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365
                return { ...prevState, [nameStateAttr]: newStateVal }
            },
            () => {
                if (nameStateAttr === "atState") this.checkDisabledCanceled()
            }
        )
    }

    onChange = (e: ChangeEvent<HTMLInputElement>): void => {
        this.props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState(prevState => ({
            ...prevState,
            [target.id]: value
        }))
    }

    onSelectChange = (name: "course", obj: CourseType | null | undefined): void => {
        this.props.setFormDirty()
        if (obj === undefined) obj = null
        this.setState({ [name]: obj })
        obj && this.setState({ duration: obj.duration })
    }

    onChangePrepaid = (): void => {
        if (!this.state.prepaid) {
            const paid = this.state.atPaid
            this.members.map(member => (paid[member.id] = true))
            this.setState({ date: "", time: "", atPaid: paid })
        }
    }

    getAttendancesSubmit = <T extends AttendancePostApi | AttendancePutApi>(): Array<T> => {
        const { atNote, atPaid, atState } = this.state
        const attendances: Array<T> = []
        if (this.isAtStateWithoutEmpty(atState)) {
            this.members.forEach(member => {
                const attendancesDataPost = {
                    client_id: member.id,
                    attendancestate: atState[member.id],
                    paid: atPaid[member.id],
                    note: atNote[member.id]
                }
                if (this.isLecture(this.props.lecture)) {
                    const attendanceId = this.props.lecture.attendances.find(
                        elem => elem.client.id === member.id
                    )
                    if (attendanceId === undefined) throw "Nepodařilo se dohledat ID účasti"
                    const attendancesDataPut = {
                        ...attendancesDataPost,
                        id: attendanceId.id
                    }
                    attendances.push(attendancesDataPut as T)
                } else attendances.push(attendancesDataPost as T)
            })
        } else throw "Některý z účastníků nemá definovaný stav účasti"
        return attendances
    }

    onSubmit = (e: FormEvent<HTMLFormElement>, refresh_clients = false): void => {
        e.preventDefault()
        const { prepaid, canceled, course, time, date, duration, prepaidCnt } = this.state
        if (alertRequired("kurz", course)) return

        const start = date + " " + time
        const courseId = (course as LectureType["course"]).id
        const data = {
            duration,
            canceled,
            group_id: !this.isClient(this.props.object) ? this.props.object.id : null,
            start: prepaid ? null : start,
            refresh_clients,
            ...(this.isClient(this.props.object) && { course_id: courseId })
        }
        let request: Promise<LectureType>
        if (this.isLecture(this.props.lecture)) {
            const attendances = this.getAttendancesSubmit<AttendancePutApi>()
            const dataPut: LecturePutApi = { ...data, attendances, id: this.props.lecture.id }
            request = LectureService.update(dataPut)
        } else {
            const attendances = this.getAttendancesSubmit<AttendancePostApi>()
            const dataPost: LecturePostApi = { ...data, attendances }

            // pridava se lekce
            // pokud je predplacena, vytvor pole s prislusnym poctem lekci a posli ho
            if (prepaid) {
                const dataArray: Array<LecturePostApi> = []
                let tmp = prepaidCnt
                while (tmp) {
                    dataArray.push(dataPost)
                    tmp--
                }
                request = LectureService.create(dataArray)
            } // jinak posli pouze lekci
            else request = LectureService.create(dataPost)
        }
        this.setState({ isSubmit: true }, (): void => {
            request
                .then(() => this.props.funcForceClose())
                .catch(() => this.setState({ isSubmit: false }))
        })
    }

    close = (): void => {
        this.props.funcClose()
    }

    delete = (id: LectureType["id"]): void => {
        LectureService.remove(id).then(() => this.props.funcForceClose())
    }

    componentDidMount(): void {
        this.checkDisabledCanceled()
        this.props.coursesVisibleContext.funcRefresh()
    }

    render(): React.ReactNode {
        const {
            canceled,
            prepaid,
            canceledDisabled,
            course,
            date,
            time,
            duration,
            atState,
            atNote,
            atPaid,
            prepaidCnt
        } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_lecture">
                <ModalHeader toggle={this.close}>
                    {this.isLecture(this.props.lecture) ? "Úprava" : "Přidání"} lekce{" "}
                    {this.isClient(this.props.object) ? "klienta" : "skupiny"}:{" "}
                    {this.isClient(this.props.object) ? (
                        <ClientName client={this.props.object} bold />
                    ) : (
                        <GroupName group={this.props.object} bold />
                    )}
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded ||
                    !this.props.attendanceStatesContext.isLoaded ? (
                        <Loading />
                    ) : (
                        <>
                            <FormGroup row className="align-items-center">
                                <Col sm={4}>
                                    {this.isClient(this.props.object) && (
                                        <>
                                            <CustomInput
                                                type="checkbox"
                                                id="prepaid"
                                                checked={prepaid}
                                                onChange={(e): void => {
                                                    this.onChangePrepaid()
                                                    this.onChange(e)
                                                }}
                                            />
                                            <Label for="prepaid" className="mb-0">
                                                Předplaceno
                                            </Label>
                                            {!this.isLecture(this.props.lecture) && (
                                                <Input
                                                    type="number"
                                                    className="FormLectures_prepaidLectureCnt"
                                                    disabled={!prepaid}
                                                    id="prepaidCnt"
                                                    value={prepaidCnt}
                                                    required={prepaid}
                                                    onChange={this.onChange}
                                                />
                                            )}
                                        </>
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
                                        disabled={canceledDisabled}
                                        data-qa="lecture_checkbox_canceled"
                                    />
                                    <Label
                                        for="canceled"
                                        data-qa="lecture_label_canceled"
                                        className="mb-0">
                                        Zrušeno
                                    </Label>{" "}
                                    {canceledDisabled && (
                                        <Tooltip
                                            postfix="canceled"
                                            text={
                                                <>
                                                    Na tuto lekci nemá nikdo přijít, proto je
                                                    automaticky zrušená.
                                                    <br />
                                                    Toto lze změnit jen když má přijít alespoň jeden
                                                    klient.
                                                </>
                                            }
                                        />
                                    )}
                                </Col>
                                <Col sm={4}>
                                    <SelectCourse
                                        value={course}
                                        onChangeCallback={this.onSelectChange}
                                        options={this.props.coursesVisibleContext.courses}
                                        isDisabled={!this.isClient(this.props.object)}
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
                                        {!this.isClient(this.props.object) && (
                                            <ClientName client={member} link />
                                        )}
                                    </h5>
                                    <FormGroup row className="align-items-center">
                                        <Col sm={4}>
                                            <InputGroup>
                                                <InputGroupAddon addonType="prepend">
                                                    <Label
                                                        className="input-group-text"
                                                        for={"atState" + member.id}>
                                                        účast
                                                    </Label>
                                                </InputGroupAddon>
                                                <CustomInputWrapper
                                                    type="select"
                                                    name="atState"
                                                    id={"atState" + member.id}
                                                    value={atState[member.id]}
                                                    onChange={this.onChangeMultiple}
                                                    data-id={member.id}
                                                    required
                                                    data-qa="lecture_select_attendance_attendancestate">
                                                    {this.getAttendanceStatesData().map(
                                                        attendancestate =>
                                                            // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz
                                                            // ho take
                                                            (attendancestate.visible ||
                                                                attendancestate.id ===
                                                                    atState[member.id]) && (
                                                                <option
                                                                    key={attendancestate.id}
                                                                    value={attendancestate.id}>
                                                                    {attendancestate.name}
                                                                </option>
                                                            )
                                                    )}
                                                </CustomInputWrapper>
                                            </InputGroup>
                                        </Col>
                                        <Col sm={2} className="text-sm-center">
                                            <CustomInput
                                                type="checkbox"
                                                id={"atPaid" + member.id}
                                                name="atPaid"
                                                checked={atPaid[member.id]}
                                                disabled={prepaid}
                                                onChange={this.onChangeMultiple}
                                                data-id={member.id}
                                                data-qa="lecture_checkbox_attendance_paid"
                                            />
                                            <Label
                                                for={"atPaid" + member.id}
                                                data-qa="lecture_label_attendance_paid"
                                                className={
                                                    "mb-0 font-weight-bold " +
                                                    (atPaid[member.id]
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
                                                        for={"atNote" + member.id}>
                                                        <FontAwesomeIcon
                                                            icon={faClipboardList}
                                                            fixedWidth
                                                        />
                                                    </Label>
                                                </InputGroupAddon>
                                                <Input
                                                    type="text"
                                                    name="atNote"
                                                    id={"atNote" + member.id}
                                                    value={atNote[member.id]}
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
                            {this.members.length === 0 && (
                                <p className="text-muted text-center">Žádní účastníci</p>
                            )}
                            {this.isLecture(this.props.lecture) && (
                                <FormGroup row className="border-top pt-3 align-items-center">
                                    <Label sm={3} className="text-muted">
                                        Smazání
                                    </Label>
                                    <Col sm={9}>
                                        <DeleteButton
                                            content="lekci"
                                            onClick={(): void => {
                                                const msg =
                                                    `Opravdu chcete smazat ${
                                                        prepaid ? "předplacenou " : ""
                                                    }` +
                                                    `lekci ${
                                                        this.isClient(this.props.object)
                                                            ? "klienta"
                                                            : "skupiny"
                                                    } ` +
                                                    (this.isClient(this.props.object)
                                                        ? `${this.props.object.surname} ${this.props.object.firstname}`
                                                        : this.props.object.name) +
                                                    `${
                                                        !prepaid
                                                            ? ` v ${prettyDateWithLongDayYear(
                                                                  new Date(date)
                                                              )} ${time}`
                                                            : ""
                                                    }?`
                                                if (
                                                    this.isLecture(this.props.lecture) &&
                                                    window.confirm(msg)
                                                )
                                                    this.delete(this.props.lecture.id)
                                            }}
                                            data-qa="button_delete_lecture"
                                        />
                                    </Col>
                                </FormGroup>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        loading={this.state.isSubmit}
                        content={this.isLecture(this.props.lecture) ? "Uložit" : "Přidat"}
                        data-qa="button_submit_lecture"
                        disabled={!this.props.coursesVisibleContext.isLoaded}
                    />
                    {this.isLecture(this.props.lecture) &&
                        !this.isClient(this.props.object) &&
                        !this.areAttendantsEqualToMembers() && (
                            <>
                                <SubmitButton
                                    loading={this.state.isSubmit}
                                    onClick={(e): void => this.onSubmit(e, true)}
                                    id="FormLectures_SubmitWithClientChanges"
                                    disabled={!this.props.coursesVisibleContext.isLoaded}
                                    content="Uložit + projevit změny v klientech"
                                />
                                <UncontrolledTooltipWrapper target="FormLectures_SubmitWithClientChanges">
                                    Uloží informace a zároveň upraví účastníky této lekce tak, aby
                                    byli v souladu se členy skupiny
                                </UncontrolledTooltipWrapper>
                            </>
                        )}
                </ModalFooter>
            </Form>
        )
    }
}

export default WithAttendanceStatesContext(WithCoursesVisibleContext(FormLectures))
