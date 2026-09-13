import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome"
import {
    Alert,
    Checkbox,
    type ComboboxItem,
    Grid,
    Group,
    Modal,
    Select,
    Skeleton,
    TextInput,
    Title,
    Tooltip,
} from "@mantine/core"
import {
    faCalendarAlt,
    faClipboardList,
    faClock,
    faHourglass,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { type AnalyticsSource, trackEvent } from "../analytics"
import { useCreateLecture, useDeleteLecture, useUpdateLecture } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import ClientName from "../components/ClientName"
import GroupName from "../components/GroupName"
import InfoTooltip from "../components/InfoTooltip"
import { SkeletonShell } from "../components/Skeletons"
import {
    useAttendanceStatesContext,
    useVisibleAttendanceStateOptions,
    withCurrentAttendanceState,
} from "../contexts/AttendanceStatesContext"
import { useCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import {
    DEFAULT_LECTURE_DURATION_GROUP,
    DEFAULT_LECTURE_DURATION_SINGLE,
    TEXTS,
} from "../global/constants"
import { prettyDateWithLongDayYear, toISODate, toISOTime } from "../global/funcDateTime"
import { dimmedTextCenter } from "../global/utility.css"
import { courseSelectError, type DefaultValuesForLecture } from "../global/utils"
import {
    type AttendancePostApi,
    type AttendancePutApi,
    type AttendanceStateType,
    type AttendanceType,
    type ClientType,
    type CourseType,
    type GroupType,
    type LecturePostApi,
    type LecturePostApiDummy,
    type LecturePutApi,
    type LectureType,
    type LectureTypeWithDate,
} from "../types/models"
import { type fEmptyVoid } from "../types/types"

import * as baseStyles from "./FormBase.css"
import * as styles from "./FormLectures.css"
import SelectCourse from "./helpers/SelectCourse"

/** ID klienta: ID stavu účasti. */
type AtState = Record<number, AttendanceType["attendancestate"]>

/** ID klienta: ID stavu účasti (nebo žádný stav účasti). */
type AtStateWithEmpty = Record<number, AttendanceType["attendancestate"] | undefined>

/** ID klienta: lekce je zaplacená (true). */
type AtPaid = Record<number, boolean>

/** ID klienta: poznámka k účasti. */
type AtNote = Record<number, AttendanceType["note"]>

type Props = {
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
    funcForceClose: () => boolean | void
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
    /** Identifikace místa, odkud byl formulář otevřen (pro analytiku). */
    source: AnalyticsSource
}

type FormLecturesSkeletonProps = {
    /** Počet bloků účastníků — u individuální lekce 1, u skupiny podle počtu členů. */
    memberCount: number
    /** Blok účastníka nese jméno (`ClientName`) jen u skupinové lekce, ne u individuální. */
    withMemberNames: boolean
}

/**
 * Kostra formuláře lekce — kopíruje mřížku skutečného obsahu: sekce „Parametry lekce"
 * (dva řádky po třech polích) a „Účastníci" (opakující se blok se stejným rozvržením sloupců
 * jako řádek účasti), místo plochého seznamu popisek+pole obecné `FormSkeleton`.
 */
const FormLecturesSkeleton: React.FC<FormLecturesSkeletonProps> = ({
    memberCount,
    withMemberNames,
}) => (
    <SkeletonShell>
        <div className={styles.sectionCard}>
            <Title order={5} className={styles.sectionTitle}>
                Parametry lekce
            </Title>
            {[0, 1].map((rowIndex) => (
                <Grid key={rowIndex} align="center" mb="sm" className={styles.formGroup}>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Skeleton h={38} radius="sm" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Skeleton h={38} radius="sm" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Skeleton h={38} radius="sm" />
                    </Grid.Col>
                </Grid>
            ))}
        </div>
        <div className={styles.sectionCard}>
            <Title order={5} className={styles.sectionTitle}>
                Účastníci
            </Title>
            {[...new Array(memberCount)].map((_, index) => (
                <div key={index} className={styles.attendeeBlock}>
                    {withMemberNames && <Skeleton h={20} mb="sm" radius="sm" w="35%" />}
                    <Grid align="center" mb="sm" className={styles.formGroup}>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Skeleton h={38} radius="sm" />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 2 }}>
                            <Skeleton h={38} radius="sm" />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Skeleton h={38} radius="sm" />
                        </Grid.Col>
                    </Grid>
                </div>
            ))}
        </div>
    </SkeletonShell>
)

type NativePickerTriggerProps = {
    /** Pole, jehož nativní picker se má otevřít. */
    fieldId: "date" | "time"
    icon: FontAwesomeIconProps["icon"]
    ariaLabel: string
    disabled: boolean
    onOpen: (fieldId: string) => void
}

/**
 * Ikona v `leftSection` pole data/času, spouštěč nativního pickeru — viz `nativeDateTime`
 * ve FormLectures.css.ts. Ve Firefoxu (na rozdíl od Chromium/Safari) zůstává vedle ní i
 * nativní glyf výběru, protože ten se tam schovat nedá — ikona se ale nechává v obou
 * prohlížečích stejně: bez ní by ve Firefoxu po `leftSection` zbyla jen prázdná mezera,
 * což je horší než zdvojená ikona.
 */
const NativePickerTrigger: React.FC<NativePickerTriggerProps> = ({
    fieldId,
    icon,
    ariaLabel,
    disabled,
    onOpen,
}) => (
    <button
        type="button"
        className={styles.nativeDateTimeTrigger}
        disabled={disabled}
        onClick={() => onOpen(fieldId)}
        aria-label={ariaLabel}>
        <FontAwesomeIcon icon={icon} fixedWidth />
    </button>
)

/**
 * Vytvoří pole `count` shodných dat lekce — pro odeslání více po sobě jdoucích
 * předplacených lekcí najednou (viz použití v `onSubmit`).
 */
const buildPrepaidLecturesData = (data: LecturePostApi, count: number): LecturePostApi[] => {
    const dataArray: LecturePostApi[] = []
    let tmp = count
    while (tmp) {
        dataArray.push(data)
        tmp--
    }
    return dataArray
}

/** Formulář pro lekce. */
const FormLectures: React.FC<Props> = (props) => {
    const attendanceStatesContext = useAttendanceStatesContext()
    const coursesVisibleContext = useCoursesVisibleContext()
    const createLecture = useCreateLecture()
    const updateLecture = useUpdateLecture()
    const deleteLecture = useDeleteLecture()

    const isClient = (object: ClientType | GroupType): object is ClientType => "phone" in object

    const isLecture = (lecture: Props["lecture"]): lecture is LectureType => "id" in lecture

    const isPrepaid = (start: Props["lecture"]["start"]): start is null => start === null

    const isLectureWithDate = (lecture: Props["lecture"]): lecture is LectureTypeWithDate =>
        isLecture(lecture) && !isPrepaid(lecture.start)

    const isAtStateWithoutEmpty = (atState: AtStateWithEmpty | AtState): atState is AtState => {
        for (const [, value] of Object.entries(atState)) {
            // `== null` zachytí i `undefined` — tim je hodnota bez vybraneho stavu
            // reprezentovana (viz AtStateWithEmpty), takze samotne `=== null` by
            // neproslo nikdy a stráž by propustila i neuplna data
            if (value == null) {
                return false
            }
        }
        return true
    }

    const getMembers = React.useCallback((memberships: { client: ClientType }[]): ClientType[] => {
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
        if (isClient(props.object)) {
            return props.defaultValuesForLecture?.course
                ? props.defaultValuesForLecture.course.duration
                : DEFAULT_LECTURE_DURATION_SINGLE
        }
        return DEFAULT_LECTURE_DURATION_GROUP
    }, [props.object, props.defaultValuesForLecture])

    const getDefaultStateIndex = React.useCallback((): AttendanceStateType["id"] | undefined => {
        const attendanceStates = attendanceStatesContext.attendancestates
        if (attendanceStates.length) {
            const res = attendanceStates.find((elem) => elem.default === true)
            if (res === undefined) {
                return attendanceStates[0].id
            }
            return res.id
        }
        return undefined
    }, [attendanceStatesContext.attendancestates])

    const getExcusedStateIndex = React.useCallback((): AttendanceStateType["id"] | undefined => {
        const attendanceStates = attendanceStatesContext.attendancestates
        if (attendanceStates.length) {
            const res = attendanceStates.find((elem) => elem.excused === true)
            if (res !== undefined) {
                return res.id
            }
        }
        return undefined
    }, [attendanceStatesContext.attendancestates])

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
        if (isClient(props.object)) {
            return null
        } else {
            return props.object.course
        }
    })
    /** Trvání lekce. */
    const [duration, setDuration] = React.useState<LecturePostApiDummy["duration"] | undefined>(
        () => {
            if (isLecture(props.lecture)) {
                return props.lecture.duration
            }
            return computeDuration()
        },
    )
    /** Zrušení lekce není možné upravit (true). */
    const [canceledDisabled, setCanceledDisabled] = React.useState(false)
    // Odvozeno z mutací, ne vlastní `useState` + ruční `setIsSubmit()`: ručně držená kopie
    // stavu, který si knihovna stejně vede sama, se může rozejít (stačí přibýt cesta, která
    // ho nevrátí zpět, a tlačítko zůstane točit navždy). Stejně jako FormGroups /
    // FormApplications / FormClients.
    const isSubmit = createLecture.isPending || updateLecture.isPending

    // pokus o odeslání bez vybraného kurzu — řídí zobrazení chyby u SelectCourse
    // (searchable input s napsaným textem projde nativní validací required, takže by
    // submit byl jinak tichý no-op; stejný vzor jako FormGroups/FormApplications)
    const [triedSubmit, setTriedSubmit] = React.useState(false)
    /** Počet přidávaných předplacených lekcí. */
    const [prepaidCnt, setPrepaidCnt] = React.useState(1)

    React.useEffect(() => {
        setAtState(createAttendanceStateObjects())
    }, [createAttendanceStateObjects])

    const checkDisabledCanceled = React.useCallback((): void => {
        const clientCnt = Object.keys(atState).length
        if (clientCnt === 0) {
            return
        }
        let excusedCnt = 0
        const excusedId = getExcusedStateIndex()
        for (const [, val] of Object.entries(atState)) {
            if (val === excusedId) {
                excusedCnt++
            }
        }
        if (clientCnt === excusedCnt) {
            // hodnotu k obnoveni ulozit jen pri PRECHODU do automaticky zruseneho stavu:
            // efekt bezi znovu i po vlastnim setCanceled(true) a bez teto podminky by si
            // prepsal zapamatovanou hodnotu na `true` — po odomluveni klienta by pak
            // checkbox zustal zaskrtnuty, i kdyz lekce puvodne zrusena nebyla
            if (!canceledDisabled) {
                setCanceledPrevious(canceled)
            }
            setCanceled(true)
            setCanceledDisabled(true)
        } else {
            if (canceledDisabled) {
                setCanceled(Boolean(canceledPrevious))
                setCanceledPrevious(undefined)
            }
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
            const value: boolean | string =
                target.type === "checkbox" ? target.checked : target.value
            const nameStateAttr = target.name as "atPaid" | "atNote"

            if (nameStateAttr === "atPaid") {
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
                setDuration(value === "" ? undefined : Number(value))
            } else if (target.id === "prepaidCnt") {
                setPrepaidCnt(Number(value))
            }
        },
        [props],
    )

    /**
     * Otevře nativní picker data/času. Ikona v `leftSection` je klikatelná díky
     * `leftSectionPointerEvents="all"` (výchozí `none`) — nese afordanci výběru
     * (viz `NativePickerTrigger` výše).
     *
     * **Nesmí viset na celém poli.** Klik do rozepsaného data má umístit kurzor do segmentu;
     * picker ho místo toho překryje a vezme si focus, takže překlep v roce by pak nešlo
     * myší opravit. `showPicker` není ve starších prohlížečích a mimo user gesto vyhazuje
     * výjimku — proto guard i try/catch.
     */
    const openNativePicker = React.useCallback((inputId: string): void => {
        const input = document.getElementById(inputId)
        if (input instanceof HTMLInputElement && typeof input.showPicker === "function") {
            try {
                input.showPicker()
            } catch {
                // nejde otevřít (mimo user gesto / disabled pole) — pole zůstane editovatelné
            }
        }
    }, [])

    const onSelectChange = React.useCallback(
        (_name: "course", obj?: CourseType | null): void => {
            props.setFormDirty()
            const courseValue = obj === undefined ? null : obj
            setCourse(courseValue)
            if (courseValue) {
                setDuration(courseValue.duration)
                // zruš chybu jen když je splněné i zbylé povinné pole (stav účasti u všech
                // členů) — na rozdíl od FormApplications tu totiž kurz není jediná podmínka
                // (viz isAtStateWithoutEmpty pojistka v onSubmit); jinak by po výběru kurzu
                // zmizela i chyba „Vyberte stav účasti", přestože formulář pořád nejde odeslat
                if (isAtStateWithoutEmpty(atState)) {
                    setTriedSubmit(false)
                }
            }
        },
        [props, atState],
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
                        throw new Error("Nepodařilo se dohledat ID účasti")
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
            throw new Error("Některý z účastníků nemá definovaný stav účasti")
        }
        return attendances
    }, [atState, atPaid, atNote, members, props.lecture])

    // sdílené se Settings.tsx (viz AttendanceStatesContext.tsx); skrytý, ale aktuálně
    // zvolený stav doplňuje withCurrentAttendanceState níž
    const visibleAttendanceStateOptions = useVisibleAttendanceStateOptions()

    const attendanceStatesById = React.useMemo(
        () => new Map(attendanceStatesContext.attendancestates.map((s) => [s.id, s])),
        [attendanceStatesContext.attendancestates],
    )

    /**
     * Options pro Select stavu účasti člena: viditelné stavy + jeho aktuálně zvolený (i skrytý)
     * stav. `selectable: true` — viz withCurrentAttendanceState: na rozdíl od konfigurace
     * v Nastavení se sem uživatel musí mít jak vrátit, když omylem přepne na jiný stav.
     */
    const getAttendanceStateOptions = (memberId: number): ComboboxItem[] => {
        const currentStateId = atState[memberId]
        return withCurrentAttendanceState(
            visibleAttendanceStateOptions,
            currentStateId !== undefined ? attendanceStatesById.get(currentStateId) : undefined,
            { selectable: true },
        )
    }

    const onSubmit = React.useCallback(
        (
            e: React.SyntheticEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
            refreshClients = false,
        ): void => {
            e.preventDefault()

            // pojistka: sekundarni submit tlacitko (onClick + preventDefault) obchazi nativni
            // HTML validaci formulare — spustime ji proto rucne, aby nativni bubliny vyskocily
            // i na teto ceste u VSECH poli (datum, cas, trvani, pocet predplacenych), ne jen kurz
            const formElement =
                e.currentTarget instanceof HTMLFormElement ? e.currentTarget : e.currentTarget.form
            if (formElement && !formElement.reportValidity()) {
                return
            }
            // kurz (viz komentář u triedSubmit výše) ověřujeme ještě zvlášť — je to custom
            // Select bez nativního `required` inputu, takže na něj reportValidity výše
            // nestačí. `duration` už native `required min="1"` má a řádek výše by na
            // prázdné/neplatné hodnotě zastavil dřív — zbylá podmínka je tu jen pro jistotu.
            if (!course || duration === undefined) {
                setTriedSubmit(true)
                return
            }
            // pojistka: `getAttendancesSubmit` by na neuplna data (typicky nulti pocet
            // nastavenych stavu ucasti — `atState` je pak pro kazdeho clena `undefined`)
            // jinak reagovala nezachycenym `throw` primo v event handleru — bez spinneru,
            // chyby ci notifikace by tlacitko jen tise "nic neudelalo" (viz Alert vyse
            // a jeho `error` na Selectu stavu ucasti pro viditelnou zpetnou vazbu)
            if (!isAtStateWithoutEmpty(atState)) {
                setTriedSubmit(true)
                return
            }

            const start = `${date} ${time}`
            const courseId = course.id
            const data = {
                duration,
                canceled,
                group_id: isClient(props.object) ? null : props.object.id,
                start: prepaid ? null : start,
                refresh_clients: refreshClients,
                ...(isClient(props.object) && { course_id: courseId }),
            }
            if (isLecture(props.lecture)) {
                const attendances = getAttendancesSubmit<AttendancePutApi>()
                const dataPut: LecturePutApi = { ...data, attendances, id: props.lecture.id }
                updateLecture.mutate(dataPut, {
                    onSuccess: () => {
                        trackEvent("lecture_updated", { source: props.source })
                        props.funcForceClose()
                    },
                })
            } else {
                // pridava se lekce
                const attendances = getAttendancesSubmit<AttendancePostApi>()
                const dataPost: LecturePostApi = { ...data, attendances }

                // pokud je predplacena, posli pole se stejnym poctem lekci jako `prepaidCnt`, jinak jen jednu
                const createPayload = prepaid
                    ? buildPrepaidLecturesData(dataPost, prepaidCnt)
                    : dataPost
                createLecture.mutate(createPayload, {
                    onSuccess: () => {
                        trackEvent("lecture_created", { source: props.source })
                        props.funcForceClose()
                    },
                })
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
            atState,
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
                    trackEvent("lecture_deleted", { source: props.source })
                    props.funcForceClose()
                },
            })
        },
        [deleteLecture, props],
    )

    const isLoading = coursesVisibleContext.isLoading || attendanceStatesContext.isLoading
    // bez alespon jednoho stavu ucasti nema Select stavu co nabidnout (viz getAttendanceStateOptions)
    // a formular nelze odeslat (viz isAtStateWithoutEmpty pojistka v onSubmit) — dej to najevo
    // uz v UI, at uzivatel nevidi jen "nefunkcni" tlacitko Pridat.
    // Tyka se jen PRIDANI: pri uprave existujici lekce ma kazdy clen uz dosazeny (a v DB
    // pres `PROTECT` porad platny) stav z `props.lecture.attendances`, takze prazdny
    // `attendancestates` (napr. selhany refetch) `isAtStateWithoutEmpty` nevadi.
    // `hasData` rozliší, jestli je prázdno proto, že nejsou nakonfigurované žádné stavy
    // (WARNING_NO_ATTENDANCE_STATES – uživatel má jít do Nastavení), nebo proto, že se je
    // nepodařilo natáhnout (ERROR_ATTENDANCE_STATES_LOAD – přechodná chyba, ne konfigurace).
    let noAttendanceStates: "not-configured" | "load-error" | undefined
    if (
        !isLoading &&
        !isLecture(props.lecture) &&
        attendanceStatesContext.attendancestates.length === 0
    ) {
        noAttendanceStates = attendanceStatesContext.hasData ? "not-configured" : "load-error"
    } else {
        noAttendanceStates = undefined
    }

    // Na rozdíl od `noAttendanceStates` výše se týká i ÚPRAVY existující lekce: každý člen
    // tam má už dosazený (a v DB pořád platný) stav, ale bez načteného seznamu stavů ho
    // `getAttendanceStateOptions`/`attendanceStatesById` nemá jak pojmenovat — Select by
    // pak vypadal prázdně, přestože reálná hodnota existuje. Radši zablokovat s hláškou
    // než tiše ukázat prázdný povinný Select.
    const attendanceStatesLoadFailed = !isLoading && !attendanceStatesContext.hasData

    /**
     * Hláška nad formulářem.
     *
     * Při ÚPRAVĚ je `noAttendanceStates` vždy `undefined` (viz výš), takže bez téhle větve
     * zůstaly Selecty členů zablokované a prázdné BEZ jakéhokoli vysvětlení na stránce —
     * povinné pole, které vypadá, že ho uživatel vymazal. Vlastní znění potřebuje proto,
     * že na rozdíl od přidání se tu uložit dá: stavy členů se pošlou beze změny takové,
     * jaké v DB už jsou, takže blokovat kvůli tomu i změnu termínu by bylo přehnané.
     */
    let attendanceStatesNotice: TEXTS | undefined
    if (noAttendanceStates === "not-configured") {
        attendanceStatesNotice = TEXTS.WARNING_NO_ATTENDANCE_STATES
    } else if (noAttendanceStates === "load-error") {
        attendanceStatesNotice = TEXTS.ERROR_ATTENDANCE_STATES_LOAD
    } else if (attendanceStatesLoadFailed) {
        attendanceStatesNotice = TEXTS.ERROR_ATTENDANCE_STATES_LOAD_EDIT
    } else {
        attendanceStatesNotice = undefined
    }

    return (
        <form onSubmit={onSubmit} data-qa="form_lecture">
            <Modal.Header>
                <Modal.Title>
                    {isLecture(props.lecture) ? "Úprava" : "Přidání"} lekce{" "}
                    {isClient(props.object) ? "klienta" : "skupiny"}:{" "}
                    {isClient(props.object) ? (
                        <ClientName client={props.object} bold />
                    ) : (
                        <GroupName group={props.object} bold />
                    )}
                </Modal.Title>
                <Modal.CloseButton data-qa="modal_close" />
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <FormLecturesSkeleton
                        memberCount={members.length || 1}
                        withMemberNames={!isClient(props.object)}
                    />
                ) : (
                    <>
                        {attendanceStatesNotice && (
                            <Alert
                                color="red"
                                mb="sm"
                                className={styles.warningNotice}
                                data-qa="form_lecture_no_attendancestates_alert">
                                {attendanceStatesNotice}
                            </Alert>
                        )}
                        <div className={styles.sectionCard}>
                            <Title order={5} className={styles.sectionTitle}>
                                Parametry lekce
                            </Title>
                            <Grid align="center" mb="sm" className={styles.formGroup}>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    {isClient(props.object) && (
                                        <Group gap="xs" align="center">
                                            <Checkbox
                                                id="prepaid"
                                                checked={prepaid}
                                                onChange={(e): void => {
                                                    onChangePrepaid()
                                                    onChange(e)
                                                }}
                                                label="Předplaceno"
                                            />
                                            {!isLecture(props.lecture) && (
                                                <TextInput
                                                    type="number"
                                                    className={styles.prepaidLectureCnt}
                                                    disabled={!prepaid}
                                                    id="prepaidCnt"
                                                    value={prepaidCnt}
                                                    required={prepaid}
                                                    withAsterisk={prepaid}
                                                    onChange={onChange}
                                                    min="1"
                                                    aria-label="Počet předplacených lekcí"
                                                />
                                            )}
                                        </Group>
                                    )}
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Tooltip label="Datum" withinPortal>
                                        <TextInput
                                            type="date"
                                            id="date"
                                            className={styles.nativeDateTime}
                                            value={date}
                                            disabled={prepaid}
                                            onChange={onChange}
                                            required={!prepaid}
                                            withAsterisk={!prepaid}
                                            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                                            max="2099-12-31"
                                            min="2013-01-01"
                                            placeholder="yyyy-mm-dd"
                                            aria-label="Datum lekce"
                                            data-qa="lecture_field_date"
                                            leftSectionPointerEvents="all"
                                            leftSection={
                                                <NativePickerTrigger
                                                    fieldId="date"
                                                    icon={faCalendarAlt}
                                                    ariaLabel="Otevřít výběr data"
                                                    disabled={prepaid}
                                                    onOpen={openNativePicker}
                                                />
                                            }
                                        />
                                    </Tooltip>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Tooltip label="Čas začátku" withinPortal>
                                        <TextInput
                                            type="time"
                                            id="time"
                                            className={styles.nativeDateTime}
                                            value={time}
                                            disabled={prepaid}
                                            onChange={onChange}
                                            required={!prepaid}
                                            withAsterisk={!prepaid}
                                            placeholder="hh:mm"
                                            aria-label="Čas lekce"
                                            data-qa="lecture_field_time"
                                            leftSectionPointerEvents="all"
                                            leftSection={
                                                <NativePickerTrigger
                                                    fieldId="time"
                                                    icon={faClock}
                                                    ariaLabel="Otevřít výběr času"
                                                    disabled={prepaid}
                                                    onOpen={openNativePicker}
                                                />
                                            }
                                        />
                                    </Tooltip>
                                </Grid.Col>
                            </Grid>
                            <Grid align="center" mb="sm" className={styles.formGroup}>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Group gap="xs" align="center">
                                        <Checkbox
                                            id="canceled"
                                            checked={canceled}
                                            onChange={onChange}
                                            disabled={canceledDisabled}
                                            data-qa="lecture_checkbox_canceled"
                                            label={
                                                <span data-qa="lecture_label_canceled">
                                                    Zrušeno
                                                </span>
                                            }
                                        />
                                        {canceledDisabled && (
                                            <InfoTooltip
                                                text={
                                                    <>
                                                        Na tuto lekci nemá nikdo přijít, proto je
                                                        automaticky zrušená.
                                                        <br />
                                                        Toto lze změnit jen když má přijít alespoň
                                                        jeden klient.
                                                    </>
                                                }
                                                ariaLabel="Na tuto lekci nemá nikdo přijít, proto je automaticky zrušená. Toto lze změnit jen když má přijít alespoň jeden klient."
                                                tone="info"
                                            />
                                        )}
                                    </Group>
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <SelectCourse
                                        required
                                        value={course}
                                        onChangeCallback={onSelectChange}
                                        options={coursesVisibleContext.courses}
                                        isDisabled={!isClient(props.object)}
                                        error={courseSelectError(
                                            triedSubmit,
                                            Boolean(course),
                                            coursesVisibleContext,
                                        )}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <Tooltip label="Trvání (min.)" withinPortal>
                                        <TextInput
                                            type="number"
                                            id="duration"
                                            value={duration ?? ""}
                                            onChange={onChange}
                                            required
                                            withAsterisk
                                            min="1"
                                            aria-label="Trvání lekce v minutách"
                                            data-qa="lecture_field_duration"
                                            leftSection={
                                                <label htmlFor="duration">
                                                    <FontAwesomeIcon
                                                        icon={faHourglass}
                                                        fixedWidth
                                                    />
                                                </label>
                                            }
                                        />
                                    </Tooltip>
                                </Grid.Col>
                            </Grid>
                        </div>
                        {!isClient(props.object) && !isLecture(props.lecture) && (
                            <Alert color="blue" mb="sm" className={styles.infoNotice}>
                                Klienti s předplacenými lekcemi mají tuto lekci automaticky
                                zaplacenou.
                            </Alert>
                        )}
                        <div className={styles.sectionCard}>
                            <Title order={5} className={styles.sectionTitle}>
                                Účastníci
                            </Title>
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    data-qa="form_lecture_attendance"
                                    className={styles.attendeeBlock}>
                                    {!isClient(props.object) && (
                                        <Title order={5}>
                                            <ClientName client={member} link />{" "}
                                            {!member.active && (
                                                <InfoTooltip
                                                    text={TEXTS.WARNING_INACTIVE_CLIENT_GROUP}
                                                    size="1x"
                                                />
                                            )}
                                        </Title>
                                    )}
                                    {isClient(props.object) && !props.object.active && (
                                        <Alert
                                            color="yellow"
                                            mb="sm"
                                            className={styles.warningNotice}>
                                            {TEXTS.WARNING_INACTIVE_CLIENT}
                                        </Alert>
                                    )}
                                    <Grid align="center" mb="sm" className={styles.formGroup}>
                                        <Grid.Col span={{ base: 12, sm: 4 }}>
                                            <Select
                                                id={`atState${member.id}`}
                                                aria-label={
                                                    attendanceStatesLoadFailed
                                                        ? "Stav účasti se nepodařilo načíst"
                                                        : "Stav účasti"
                                                }
                                                data={
                                                    attendanceStatesLoadFailed
                                                        ? []
                                                        : getAttendanceStateOptions(member.id)
                                                }
                                                value={
                                                    attendanceStatesLoadFailed
                                                        ? null
                                                        : (atState[member.id]?.toString() ?? null)
                                                }
                                                placeholder={
                                                    attendanceStatesLoadFailed
                                                        ? "Nepodařilo se načíst"
                                                        : undefined
                                                }
                                                disabled={attendanceStatesLoadFailed}
                                                onChange={(val) => {
                                                    if (!val) {
                                                        return
                                                    }
                                                    props.setFormDirty()
                                                    setAtState((prev) => ({
                                                        ...prev,
                                                        [member.id]: Number(val),
                                                    }))
                                                }}
                                                required
                                                withAsterisk
                                                allowDeselect={false}
                                                error={
                                                    triedSubmit && atState[member.id] === undefined
                                                        ? "Vyberte stav účasti"
                                                        : undefined
                                                }
                                                data-qa="lecture_select_attendance_attendancestate"
                                            />
                                        </Grid.Col>
                                        <Grid.Col
                                            span={{ base: 12, sm: 2 }}
                                            className={styles.attendancePaidCol}>
                                            <Group gap="xs" justify="center">
                                                <Checkbox
                                                    id={`atPaid${member.id}`}
                                                    name="atPaid"
                                                    checked={atPaid[member.id]}
                                                    disabled={prepaid}
                                                    onChange={onChangeMultiple}
                                                    data-id={member.id}
                                                    data-qa="lecture_checkbox_attendance_paid"
                                                    label={
                                                        <span
                                                            data-qa="lecture_label_attendance_paid"
                                                            className={
                                                                atPaid[member.id]
                                                                    ? styles.paidLabelPaid
                                                                    : styles.paidLabelUnpaid
                                                            }>
                                                            Platba
                                                        </span>
                                                    }
                                                />
                                                {prepaid && (
                                                    <InfoTooltip
                                                        text="Předplacená lekce je automaticky zaplacená."
                                                        tone="info"
                                                    />
                                                )}
                                            </Group>
                                        </Grid.Col>
                                        <Grid.Col span={{ base: 12, sm: 6 }}>
                                            <Tooltip label="Poznámka" withinPortal>
                                                <TextInput
                                                    type="text"
                                                    name="atNote"
                                                    id={`atNote${member.id}`}
                                                    value={atNote[member.id]}
                                                    onChange={onChangeMultiple}
                                                    data-id={member.id}
                                                    aria-label="Poznámka k účasti"
                                                    data-qa="lecture_field_attendance_note"
                                                    spellCheck
                                                    leftSection={
                                                        <label htmlFor={`atNote${member.id}`}>
                                                            <FontAwesomeIcon
                                                                icon={faClipboardList}
                                                                fixedWidth
                                                            />
                                                        </label>
                                                    }
                                                />
                                            </Tooltip>
                                        </Grid.Col>
                                    </Grid>
                                </div>
                            ))}
                            {members.length === 0 && (
                                <p className={dimmedTextCenter}>Žádní účastníci</p>
                            )}
                        </div>
                        {isLecture(props.lecture) && (
                            <div
                                className={`${baseStyles.formSection} ${baseStyles.formSectionDanger}`}>
                                <Title order={6} className={baseStyles.formSectionTitle}>
                                    Smazání
                                </Title>
                                <div className={baseStyles.deleteAlertText}>
                                    <p>Nenávratně smaže vybranou lekci včetně všech účastí.</p>
                                    <DeleteButton
                                        content="lekci"
                                        onClick={(): void => {
                                            const msgDateTime = prepaid
                                                ? ""
                                                : ` v ${prettyDateWithLongDayYear(new Date(date))} ${time}`
                                            const msgObjectName = isClient(props.object)
                                                ? `${props.object.surname} ${props.object.firstname}`
                                                : props.object.name
                                            const msgObject = isClient(props.object)
                                                ? "klienta"
                                                : "skupiny"
                                            const msgPrepaid = prepaid ? "předplacenou " : ""
                                            const msg = `Opravdu chcete smazat ${msgPrepaid}lekci ${msgObject} ${msgObjectName}${msgDateTime}?`
                                            if (
                                                isLecture(props.lecture) &&
                                                globalThis.confirm(msg)
                                            ) {
                                                handleDelete(props.lecture.id)
                                            }
                                        }}
                                        data-qa="button_delete_lecture"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
            <Group justify="flex-end" px="md" pb="md" className={baseStyles.modalActions}>
                <CancelButton onClick={close} />
                <SubmitButton
                    loading={isSubmit}
                    content={isLecture(props.lecture) ? "Uložit" : "Přidat"}
                    data-qa="button_submit_lecture"
                    disabled={coursesVisibleContext.isLoading || Boolean(noAttendanceStates)}
                />
                {isLecture(props.lecture) &&
                    !isClient(props.object) &&
                    !areAttendantsEqualToMembers() && (
                        <Tooltip
                            label="Uloží informace a zároveň upraví účastníky této lekce tak, aby byli v souladu se členy skupiny"
                            withinPortal>
                            <span>
                                <SubmitButton
                                    loading={isSubmit}
                                    onClick={(e): void => onSubmit(e, true)}
                                    id="FormLectures_SubmitWithClientChanges"
                                    variant="light"
                                    color="gray"
                                    disabled={
                                        coursesVisibleContext.isLoading ||
                                        Boolean(noAttendanceStates)
                                    }
                                    content="Uložit + projevit změny v klientech"
                                />
                            </span>
                        </Tooltip>
                    )}
            </Group>
        </form>
    )
}

export default FormLectures
