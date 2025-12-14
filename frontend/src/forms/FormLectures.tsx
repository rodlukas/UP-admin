import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCalendarAlt,
    faClipboardList,
    faClock,
    faHourglass,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import {
    Alert,
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
    ModalHeader,
    UncontrolledAlert,
} from "reactstrap"

import { useCreateLecture, useDeleteLecture, useUpdateLecture } from "../api/hooks"
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
    WithAttendanceStatesContext,
} from "../contexts/AttendanceStatesContext"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext,
} from "../contexts/CoursesVisibleContext"
import {
    DEFAULT_LECTURE_DURATION_GROUP,
    DEFAULT_LECTURE_DURATION_SINGLE,
    TEXTS,
} from "../global/constants"
import { prettyDateWithLongDayYear, toISODate, toISOTime } from "../global/funcDateTime"
import { DefaultValuesForLecture } from "../global/utils"
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
    LectureTypeWithDate,
} from "../types/models"
import { fEmptyVoid } from "../types/types"

import "./FormLectures.css"
import CustomInputWrapper from "./helpers/CustomInputWrapper"
import SelectCourse from "./helpers/SelectCourse"

/** ID klienta: ID stavu účasti. */
type AtState = Record<number, AttendanceType["attendancestate"]>

/** ID klienta: ID stavu účasti (nebo žádný stav účasti). */
type AtStateWithEmpty = Record<number, AttendanceType["attendancestate"] | undefined>

/** ID klienta: lekce je zaplacená (true). */
type AtPaid = Record<number, boolean>

/** ID klienta: poznámka k účasti. */
type AtNote = Record<number, AttendanceType["note"]>

type Props = AttendanceStatesContextProps &
    CoursesVisibleContextProps & {
        /** Lekce. */
        lecture: LectureType | LecturePostApiDummy | LectureTypeWithDate
        /** Datum lekce. */
        date: string
        /** Objekt, který má přiřazenu danou lekci (klient/skupina). */
        object: ClientType | GroupType
        /** Výchozí hodnoty pro lekci. */
        defaultValuesForLecture?: DefaultValuesForLecture
        /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
        funcClose: () => boolean | void
        /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
        funcForceClose: (modalSubmitted?: boolean, data?: never) => boolean | void
        /** Funkce, která se volá při změně údajů ve formuláři. */
        setFormDirty: fEmptyVoid
    }

/** Formulář pro lekce. */
const FormLectures: React.FC<Props> = (props) => {
    const createLecture = useCreateLecture()
    const updateLecture = useUpdateLecture()
    const deleteLecture = useDeleteLecture()

    // Helper functions
    const isClient = (object: ClientType | GroupType): object is ClientType => "phone" in object

    const isLecture = (lecture: Props["lecture"]): lecture is LectureType => "id" in lecture

    const isPrepaid = (start: Props["lecture"]["start"]): start is string => start === null

    const isLectureWithDate = (lecture: Props["lecture"]): lecture is LectureTypeWithDate =>
        isLecture(lecture) && !isPrepaid(lecture.start)

    const isAtStateWithoutEmpty = (atState: AtStateWithEmpty | AtState): atState is AtState => {
        for (const [, value] of Object.entries(atState)) {
            if (value === null) {
                return false
            }
        }
        return true
    }

    const getAttendanceStatesData = React.useCallback((): AttendanceStateType[] => {
        return props.attendanceStatesContext.attendancestates
    }, [props.attendanceStatesContext.attendancestates])

    const getMembers = React.useCallback((memberships: { client: ClientType }[]): ClientType[] => {
        // map se provadi nad hodnotami MembershipType | AttendanceType
        return memberships.map((member) => member.client)
    }, [])

    /** Klienti účastnící se lekce. */
    const members = React.useMemo(() => {
        if (isClient(props.object)) {
            return [props.object]
        }
        if (isLecture(props.lecture)) {
            return getMembers(props.lecture.attendances)
        }
        return getMembers(props.object.memberships)
    }, [props.object, props.lecture, getMembers])

    const computeDuration = React.useCallback((): LectureType["duration"] => {
        // pokud je to klient a mame vypocitany nejpravdepodobnejsi kurz, pouzij ho, jinak default
        if (isClient(props.object)) {
            return props.defaultValuesForLecture?.course
                ? props.defaultValuesForLecture.course.duration
                : DEFAULT_LECTURE_DURATION_SINGLE
        }
        // je to skupina
        return DEFAULT_LECTURE_DURATION_GROUP
    }, [props.object, props.defaultValuesForLecture])

    const getDefaultStateIndex = React.useCallback((): AttendanceStateType["id"] | undefined => {
        const attendanceStates = getAttendanceStatesData()
        if (attendanceStates.length) {
            const res = attendanceStates.find((elem) => elem.default === true)
            if (res !== undefined) {
                return res.id
            } else {
                // pokud pole neni prazdne, ale zadny stav neni vychozi, vrat prvni prvek
                return attendanceStates[0].id
            }
        }
        return undefined
    }, [getAttendanceStatesData])

    const getExcusedStateIndex = React.useCallback((): AttendanceStateType["id"] | undefined => {
        const attendanceStates = getAttendanceStatesData()
        if (attendanceStates.length) {
            const res = attendanceStates.find((elem) => elem.excused === true)
            if (res !== undefined) {
                return res.id
            }
        }
        return undefined
    }, [getAttendanceStatesData])

    const createAttendanceStateObjects = React.useCallback((): AtStateWithEmpty => {
        const objects: AtStateWithEmpty = {}
        const defaultStateIndex = getDefaultStateIndex()
        members.forEach((client, id) => {
            objects[client.id] = isLecture(props.lecture)
                ? props.lecture.attendances[id].attendancestate
                : defaultStateIndex
        })
        return objects
    }, [members, props.lecture, getDefaultStateIndex])

    const createPaidObjects = React.useCallback(
        (object: ClientType | GroupType): AtPaid => {
            const objects: AtPaid = {}
            members.forEach((client, id) => {
                if (isLecture(props.lecture)) {
                    objects[client.id] = props.lecture.attendances[id].paid
                } else {
                    objects[client.id] = false
                    if (!isClient(object)) {
                        const membership = object.memberships.find(
                            (elem) => elem.client.id === client.id,
                        )
                        if (membership && membership.prepaid_cnt > 0) {
                            objects[client.id] = true
                        }
                    }
                }
            })
            return objects
        },
        [members, props.lecture],
    )

    const createNoteObjects = React.useCallback((): AtNote => {
        const objects: AtNote = {}
        members.forEach((client, id) => {
            objects[client.id] = isLecture(props.lecture) ? props.lecture.attendances[id].note : ""
        })
        return objects
    }, [members, props.lecture])

    const initialAtState = React.useMemo(
        () => createAttendanceStateObjects(),
        [createAttendanceStateObjects],
    )
    const initialAtPaid = React.useMemo(
        () => createPaidObjects(props.object),
        [createPaidObjects, props.object],
    )
    const initialAtNote = React.useMemo(() => createNoteObjects(), [createNoteObjects])

    /** Objekt držící stavy účasti k jednotlivým klientům. */
    const [atState, setAtState] = React.useState<AtStateWithEmpty | AtState>(initialAtState)
    /** Objekt držící zaplacenost (true) k jednotlivým klientům. */
    const [atPaid, setAtPaid] = React.useState<AtPaid>(initialAtPaid)
    /** Objekt držící poznámky k jednotlivým klientům. */
    const [atNote, setAtNote] = React.useState<AtNote>(initialAtNote)
    /** Lekce je předplacená (true). */
    const [prepaid, setPrepaid] = React.useState(isPrepaid(props.lecture.start))
    /** Lekce je zrušená (true). */
    const [canceled, setCanceled] = React.useState(props.lecture.canceled || false)
    /** Předchozí hodnota zrušení lekce (než bylo automaticky nastaveno). */
    const [canceledPrevious, setCanceledPrevious] = React.useState<
        LecturePostApiDummy["canceled"] | undefined
    >(undefined)
    /** Datum lekce. */
    const [date, setDate] = React.useState(() => {
        if (isLectureWithDate(props.lecture)) {
            return toISODate(new Date(props.lecture.start))
        }
        if (props.date !== "") {
            return props.date
        }
        if (props.defaultValuesForLecture && props.defaultValuesForLecture.start !== "") {
            return toISODate(props.defaultValuesForLecture.start)
        }
        return ""
    })
    /** Čas lekce. */
    const [time, setTime] = React.useState(() => {
        if (isLectureWithDate(props.lecture)) {
            return toISOTime(new Date(props.lecture.start))
        }
        if (props.defaultValuesForLecture && props.defaultValuesForLecture.start !== "") {
            return toISOTime(props.defaultValuesForLecture.start)
        }
        return ""
    })
    /** Kurz lekce. */
    const [course, setCourse] = React.useState<LecturePostApiDummy["course"]>(() => {
        if (isLecture(props.lecture)) {
            return props.lecture.course
        }
        if (isClient(props.object) && props.defaultValuesForLecture) {
            return props.defaultValuesForLecture.course
        }
        if (!isClient(props.object)) {
            return props.object.course
        }
        return null
    })
    /** Trvání lekce. */
    const [duration, setDuration] = React.useState<LectureType["duration"]>(() => {
        if (isLecture(props.lecture)) {
            return props.lecture.duration
        }
        return computeDuration()
    })
    /** Zrušení lekce není možné upravit (true). */
    const [canceledDisabled, setCanceledDisabled] = React.useState(false)
    /** Formulář byl odeslán (true). */
    const [isSubmit, setIsSubmit] = React.useState(false)
    /** Počet přidávaných předplacených lekcí. */
    const [prepaidCnt, setPrepaidCnt] = React.useState(1)

    // Update atState when attendance states change
    React.useEffect(() => {
        setAtState(createAttendanceStateObjects())
    }, [createAttendanceStateObjects])

    // zaridi, ze se nastavi disabled checkbox Zruseno pokud jsou vsichni omluveni a pripadne zpet vrati puvodni hodnotu
    const checkDisabledCanceled = React.useCallback((): void => {
        const clientCnt = Object.keys(atState).length
        if (clientCnt === 0) {
            return
        }
        let excusedCnt = 0
        const excusedId = getExcusedStateIndex()
        for (const [, val] of Object.entries(atState)) {
            if (val === excusedId) {
                // ve state je String
                excusedCnt++
            }
        }
        if (clientCnt === excusedCnt) {
            // vsichni jsou omluveni, lekce nejde zrusit
            setCanceledPrevious(canceled)
            setCanceled(true)
            setCanceledDisabled(true)
        } else {
            if (canceledDisabled) {
                // vsichni uz nejsou omluveni (ale byli), hodnotu checkboxu vrat na puvodni
                setCanceled(Boolean(canceledPrevious))
                setCanceledPrevious(undefined)
            }
            // uz neni potreba aby byl checkbox Zruseno disabled
            setCanceledDisabled(false)
        }
    }, [atState, getExcusedStateIndex, canceled, canceledDisabled, canceledPrevious])

    React.useEffect(() => {
        checkDisabledCanceled()
    }, [atState, checkDisabledCanceled])

    const areAttendantsEqualToMembers = React.useCallback((): boolean => {
        if (isClient(props.object)) {
            return true
        }
        if (!isLecture(props.lecture)) {
            return false
        }
        const idsAttendants = props.lecture.attendances.map((x) => x.client.id)
        const idsMembers = props.object.memberships.map((x) => x.client.id)
        return (
            idsAttendants.length === idsMembers.length &&
            idsAttendants.every((val) => idsMembers.includes(val))
        )
    }, [props.object, props.lecture])

    const onChangeMultiple = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            props.setFormDirty()
            const target = e.currentTarget
            const id = Number(target.dataset.id)
            let value: boolean | string | number =
                target.type === "checkbox" ? target.checked : target.value
            if (target.name === "atState") {
                value = Number(value)
            }
            const nameStateAttr = target.name as "atState" | "atPaid" | "atNote"

            if (nameStateAttr === "atState") {
                setAtState((prev) => ({
                    ...prev,
                    [id]: value as AttendanceType["attendancestate"],
                }))
            } else if (nameStateAttr === "atPaid") {
                setAtPaid((prev) => ({ ...prev, [id]: value as boolean }))
            } else if (nameStateAttr === "atNote") {
                setAtNote((prev) => ({ ...prev, [id]: value as string }))
            }
        },
        [props],
    )

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            props.setFormDirty()
            const target = e.currentTarget
            const value = target.type === "checkbox" ? target.checked : target.value

            if (target.id === "prepaid") {
                setPrepaid(value as boolean)
            } else if (target.id === "canceled") {
                setCanceled(value as boolean)
            } else if (target.id === "date") {
                setDate(value as string)
            } else if (target.id === "time") {
                setTime(value as string)
            } else if (target.id === "duration") {
                setDuration(Number(value))
            } else if (target.id === "prepaidCnt") {
                setPrepaidCnt(Number(value))
            }
        },
        [props],
    )

    const onSelectChange = React.useCallback(
        (_name: "course", obj?: CourseType | null): void => {
            props.setFormDirty()
            const courseValue = obj === undefined ? null : obj
            setCourse(courseValue)
            if (courseValue) {
                setDuration(courseValue.duration)
            }
        },
        [props],
    )

    const onChangePrepaid = React.useCallback((): void => {
        if (!prepaid) {
            const paid = { ...atPaid }
            members.forEach((member) => (paid[member.id] = true))
            setAtPaid(paid)
            setDate("")
            setTime("")
        }
    }, [prepaid, atPaid, members])

    const getAttendancesSubmit = React.useCallback(<
        T extends AttendancePostApi | AttendancePutApi,
    >(): T[] => {
        const attendances: T[] = []
        if (isAtStateWithoutEmpty(atState)) {
            members.forEach((member) => {
                const attendancesDataPost = {
                    client_id: member.id,
                    attendancestate: atState[member.id],
                    paid: atPaid[member.id],
                    note: atNote[member.id],
                }
                if (isLecture(props.lecture)) {
                    const attendanceId = props.lecture.attendances.find(
                        (elem) => elem.client.id === member.id,
                    )
                    if (attendanceId === undefined) {
                        throw Error("Nepodařilo se dohledat ID účasti")
                    }
                    const attendancesDataPut = {
                        ...attendancesDataPost,
                        id: attendanceId.id,
                    }
                    attendances.push(attendancesDataPut as T)
                } else {
                    attendances.push(attendancesDataPost as T)
                }
            })
        } else {
            throw Error("Některý z účastníků nemá definovaný stav účasti")
        }
        return attendances
    }, [atState, atPaid, atNote, members, props.lecture])

    const onSubmit = React.useCallback(
        (
            e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
            refreshClients = false,
        ): void => {
            e.preventDefault()

            const start = `${date} ${time}`
            const courseId = course!.id
            const data = {
                duration,
                canceled,
                group_id: !isClient(props.object) ? props.object.id : null,
                start: prepaid ? null : start,
                refresh_clients: refreshClients,
                ...(isClient(props.object) && { course_id: courseId }),
            }
            if (isLecture(props.lecture)) {
                const attendances = getAttendancesSubmit<AttendancePutApi>()
                const dataPut: LecturePutApi = { ...data, attendances, id: props.lecture.id }
                setIsSubmit(true)
                updateLecture.mutate(dataPut, {
                    onSuccess: () => {
                        props.funcForceClose()
                    },
                    onError: () => {
                        setIsSubmit(false)
                    },
                })
            } else {
                const attendances = getAttendancesSubmit<AttendancePostApi>()
                const dataPost: LecturePostApi = { ...data, attendances }

                // pridava se lekce
                // pokud je predplacena, vytvor pole s prislusnym poctem lekci a posli ho
                if (prepaid) {
                    const dataArray: LecturePostApi[] = []
                    let tmp = prepaidCnt
                    while (tmp) {
                        dataArray.push(dataPost)
                        tmp--
                    }
                    setIsSubmit(true)
                    createLecture.mutate(dataArray, {
                        onSuccess: () => {
                            props.funcForceClose()
                        },
                        onError: () => {
                            setIsSubmit(false)
                        },
                    })
                } else {
                    // jinak posli pouze lekci
                    setIsSubmit(true)
                    createLecture.mutate(dataPost, {
                        onSuccess: () => {
                            props.funcForceClose()
                        },
                        onError: () => {
                            setIsSubmit(false)
                        },
                    })
                }
            }
        },
        [
            date,
            time,
            course,
            duration,
            canceled,
            prepaid,
            prepaidCnt,
            props,
            getAttendancesSubmit,
            updateLecture,
            createLecture,
        ],
    )

    const close = React.useCallback((): void => {
        props.funcClose()
    }, [props])

    const handleDelete = React.useCallback(
        (id: LectureType["id"]): void => {
            deleteLecture.mutate(id, {
                onSuccess: () => {
                    props.funcForceClose()
                },
            })
        },
        [deleteLecture, props],
    )

    const isLoading =
        !props.coursesVisibleContext.isLoaded || !props.attendanceStatesContext.isLoaded

    return (
        <Form onSubmit={onSubmit} data-qa="form_lecture">
            <ModalHeader toggle={close}>
                {isLecture(props.lecture) ? "Úprava" : "Přidání"} lekce{" "}
                {isClient(props.object) ? "klienta" : "skupiny"}:{" "}
                {isClient(props.object) ? (
                    <ClientName client={props.object} bold />
                ) : (
                    <GroupName group={props.object} bold />
                )}
            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <Loading />
                ) : (
                    <>
                        <FormGroup row className="align-items-center">
                            <Col sm={4}>
                                {isClient(props.object) && (
                                    <>
                                        <CustomInput
                                            type="checkbox"
                                            id="prepaid"
                                            checked={prepaid}
                                            onChange={(e): void => {
                                                onChangePrepaid()
                                                onChange(e)
                                            }}
                                        />
                                        <Label for="prepaid" className="mb-0">
                                            Předplaceno
                                        </Label>
                                        {!isLecture(props.lecture) && (
                                            <Input
                                                type="number"
                                                className="FormLectures_prepaidLectureCnt"
                                                disabled={!prepaid}
                                                id="prepaidCnt"
                                                value={prepaidCnt}
                                                required={prepaid}
                                                onChange={onChange}
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
                                        onChange={onChange}
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
                                        onChange={onChange}
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
                                    onChange={onChange}
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
                                    required
                                    value={course}
                                    onChangeCallback={onSelectChange}
                                    options={props.coursesVisibleContext.courses}
                                    isDisabled={!isClient(props.object)}
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
                                        onChange={onChange}
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
                        {!isClient(props.object) && !isLecture(props.lecture) && (
                            <UncontrolledAlert color="info">
                                Klienti s předplacenými lekcemi mají tuto lekci automaticky
                                zaplacenou.
                            </UncontrolledAlert>
                        )}
                        {members.map((member) => (
                            <div key={member.id} data-qa="form_lecture_attendance">
                                {!isClient(props.object) && (
                                    <h5>
                                        <ClientName client={member} link />{" "}
                                        {!member.active && (
                                            <Tooltip
                                                postfix={`FormLectures_InactiveClientAlert_${member.id.toString()}`}
                                                text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP}
                                                size="1x"
                                            />
                                        )}
                                    </h5>
                                )}
                                {isClient(props.object) && !props.object.active && (
                                    <Alert color="warning">{TEXTS.WARNING_INACTIVE_CLIENT}</Alert>
                                )}
                                <FormGroup row className="align-items-center">
                                    <Col sm={4}>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">
                                                <Label
                                                    className="input-group-text"
                                                    for={`atState${member.id}`}>
                                                    účast
                                                </Label>
                                            </InputGroupAddon>
                                            <CustomInputWrapper
                                                type="select"
                                                name="atState"
                                                id={`atState${member.id}`}
                                                value={atState[member.id]}
                                                onChange={onChangeMultiple}
                                                data-id={member.id}
                                                required
                                                data-qa="lecture_select_attendance_attendancestate">
                                                {getAttendanceStatesData().map(
                                                    (attendancestate) =>
                                                        // ukaz pouze viditelne, pokud ma klient neviditelny, ukaz ho take
                                                        (attendancestate.visible ||
                                                            attendancestate.id ===
                                                                atState[member.id]) && (
                                                            <option
                                                                key={attendancestate.id}
                                                                value={attendancestate.id}>
                                                                {attendancestate.name}
                                                            </option>
                                                        ),
                                                )}
                                            </CustomInputWrapper>
                                        </InputGroup>
                                    </Col>
                                    <Col sm={2} className="text-sm-center">
                                        <CustomInput
                                            type="checkbox"
                                            id={`atPaid${member.id}`}
                                            name="atPaid"
                                            checked={atPaid[member.id]}
                                            disabled={prepaid}
                                            onChange={onChangeMultiple}
                                            data-id={member.id}
                                            data-qa="lecture_checkbox_attendance_paid"
                                        />
                                        <Label
                                            for={`atPaid${member.id}`}
                                            data-qa="lecture_label_attendance_paid"
                                            className={`mb-0 font-weight-bold ${
                                                atPaid[member.id] ? "text-success" : "text-danger"
                                            }`}>
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
                                        <InputGroup id={`FormLectures_Note_${member.id}`}>
                                            <InputGroupAddon addonType="prepend">
                                                <Label
                                                    className="input-group-text"
                                                    for={`atNote${member.id}`}>
                                                    <FontAwesomeIcon
                                                        icon={faClipboardList}
                                                        fixedWidth
                                                    />
                                                </Label>
                                            </InputGroupAddon>
                                            <Input
                                                type="text"
                                                name="atNote"
                                                id={`atNote${member.id}`}
                                                value={atNote[member.id]}
                                                onChange={onChangeMultiple}
                                                data-id={member.id}
                                                data-qa="lecture_field_attendance_note"
                                                spellCheck
                                            />
                                        </InputGroup>
                                        <UncontrolledTooltipWrapper
                                            target={`FormLectures_Note_${member.id}`}>
                                            Poznámka
                                        </UncontrolledTooltipWrapper>
                                    </Col>
                                </FormGroup>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <p className="text-muted text-center">Žádní účastníci</p>
                        )}
                        {isLecture(props.lecture) && (
                            <FormGroup row className="border-top pt-3 align-items-center">
                                <Label sm={3} className="text-muted">
                                    Smazání
                                </Label>
                                <Col sm={9}>
                                    <DeleteButton
                                        content="lekci"
                                        onClick={(): void => {
                                            const msgDateTime = !prepaid
                                                ? ` v ${prettyDateWithLongDayYear(
                                                      new Date(date),
                                                  )} ${time}`
                                                : ""
                                            const msgObjectName = isClient(props.object)
                                                ? `${props.object.surname} ${props.object.firstname}`
                                                : props.object.name
                                            const msgObject = isClient(props.object)
                                                ? "klienta"
                                                : "skupiny"
                                            const msgPrepaid = prepaid ? "předplacenou " : ""
                                            const msg = `Opravdu chcete smazat ${msgPrepaid}lekci ${msgObject} ${msgObjectName}${msgDateTime}?`
                                            if (isLecture(props.lecture) && window.confirm(msg)) {
                                                handleDelete(props.lecture.id)
                                            }
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
                <CancelButton onClick={close} />{" "}
                <SubmitButton
                    loading={isSubmit}
                    content={isLecture(props.lecture) ? "Uložit" : "Přidat"}
                    data-qa="button_submit_lecture"
                    disabled={!props.coursesVisibleContext.isLoaded}
                />
                {isLecture(props.lecture) &&
                    !isClient(props.object) &&
                    !areAttendantsEqualToMembers() && (
                        <>
                            <SubmitButton
                                loading={isSubmit}
                                onClick={(e): void => onSubmit(e, true)}
                                id="FormLectures_SubmitWithClientChanges"
                                disabled={!props.coursesVisibleContext.isLoaded}
                                content="Uložit + projevit změny v klientech"
                            />
                            <UncontrolledTooltipWrapper target="FormLectures_SubmitWithClientChanges">
                                Uloží informace a zároveň upraví účastníky této lekce tak, aby byli
                                v souladu se členy skupiny
                            </UncontrolledTooltipWrapper>
                        </>
                    )}
            </ModalFooter>
        </Form>
    )
}

export default WithAttendanceStatesContext(WithCoursesVisibleContext(FormLectures))
