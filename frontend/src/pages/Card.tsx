import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    Alert,
    Button,
    Container,
    Group,
    SimpleGrid,
    Skeleton,
    Title,
    Tooltip,
} from "@mantine/core"
import { faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { useNavigate } from "@tanstack/react-router"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { trackEvent } from "../analytics"
import {
    useAllGroupsEverFromClient,
    useClient,
    useDeactivateClients,
    useDeactivateGroups,
    useGroup,
    useGroupsFromClient,
    useLecturesFromClient,
    useLecturesFromClientAll,
    useLecturesFromGroup,
} from "../api/hooks"
import APP_URLS from "../APP_URLS"
import Attendances from "../components/Attendances"
import BackButton from "../components/buttons/BackButton"
import ClientAnalysis from "../components/ClientAnalysis"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import ComponentsList from "../components/ComponentsList"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import * as lectureStyles from "../components/Lecture.css"
import LectureNumber from "../components/LectureNumber"
import PrepaidCounters from "../components/PrepaidCounters"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalClients from "../forms/ModalClients"
import ModalGroups from "../forms/ModalGroups"
import ModalLectures from "../forms/ModalLectures"
import { TEXTS } from "../global/constants"
import { prettyDateWithDayYear, prettyTime } from "../global/funcDateTime"
import { dimmedText, dimmedTextCenter, iconAfterText, textCenterMb0 } from "../global/utility.css"
import {
    clientName,
    courseDuration,
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    getReadableTextColorWithOverlay,
    groupObjectsByCourses,
    GroupedObjectsByCourses,
    isStaleActive,
    pageTitle,
} from "../global/utils"
import { ModalClientsGroupsData } from "../types/components"
import { ClientType, GroupType, LectureType } from "../types/models"
import { Model } from "../types/types"

import * as styles from "./Card.css"

type ClientOrGroup = ClientType | GroupType | null

type CardProps = {
    id: Model["id"]
    isClientPage: boolean
}

const isClientObject = (object: ClientOrGroup): object is ClientType =>
    Boolean(object && "phone" in object)

const isGroupObject = (object: ClientOrGroup): object is GroupType =>
    Boolean(object && "name" in object)

type HeaderActionsProps = {
    object: ClientOrGroup
    cardSource: "client_card" | "group_card"
    defaultValuesForLecture: DefaultValuesForLecture | undefined
    onBack: () => void
    onRefreshFromModal: (data: ModalClientsGroupsData) => void
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
    object,
    cardSource,
    defaultValuesForLecture,
    onBack,
    onRefreshFromModal,
}) => (
    <>
        <BackButton onClick={onBack} />
        {/* ModalClientsData i ModalGroupsData jsou zúžením ModalClientsGroupsData,
            callback s širším parametrem je proto přiřaditelný přímo (bez `as`). */}
        {isClientObject(object) ? (
            <ModalClients
                currentClient={object}
                refresh={onRefreshFromModal}
                source="client_card"
            />
        ) : (
            object && (
                <ModalGroups
                    currentGroup={object}
                    refresh={onRefreshFromModal}
                    source="group_card"
                />
            )
        )}
        <ModalLectures
            defaultValuesForLecture={defaultValuesForLecture}
            object={object}
            source={cardSource}
        />
    </>
)

type AlertsProps = {
    object: ClientOrGroup
    isDeactivatePending: boolean
    onDeactivate: () => void
}

const Alerts: React.FC<AlertsProps> = ({ object, isDeactivatePending, onDeactivate }) => {
    if (!object) {
        return null
    }
    if (!object.active) {
        return (
            <Alert color="yellow" mt={0}>
                {isClientObject(object)
                    ? TEXTS.WARNING_INACTIVE_CLIENT
                    : TEXTS.WARNING_INACTIVE_GROUP}
            </Alert>
        )
    }
    if (!isStaleActive(object.last_lecture_date)) {
        return null
    }
    return (
        <Alert color="yellow" mt={0}>
            <Group justify="space-between" wrap="wrap">
                <span>
                    {isClientObject(object)
                        ? TEXTS.WARNING_STALE_CLIENT
                        : TEXTS.WARNING_STALE_GROUP}
                </span>
                {/* autoContrast: bílý text na yellow-filled měl jen 1.86:1 (light, yellow-6)
                    / 2.48:1 (dark, yellow-8); černý text dává 11.28:1 / 8.46:1 (WCAG AA). */}
                <Button
                    color="yellow"
                    autoContrast
                    size="sm"
                    disabled={isDeactivatePending}
                    onClick={onDeactivate}>
                    Přesunout do neaktivních
                    {isDeactivatePending && (
                        <FontAwesomeIcon icon={faSpinnerThird} spin className={iconAfterText} />
                    )}
                </Button>
            </Group>
        </Alert>
    )
}

type ClientInfoProps = {
    client: ClientType
    id: Model["id"]
    groupsOfClient: GroupType[]
    pastGroups: GroupType[]
    lectures: LectureType[]
}

const ClientInfo: React.FC<ClientInfoProps> = ({
    client,
    id,
    groupsOfClient,
    pastGroups,
    lectures,
}) => (
    <div className={styles.clientTopRow}>
        <div className={classNames(styles.infoList, styles.clientSummaryPanel)}>
            <div className={styles.infoListItem}>
                <b>Telefon:</b> <ClientPhone phone={client.phone} />
            </div>
            <div className={styles.infoListItem}>
                <b>E-mail:</b> <ClientEmail email={client.email} />
            </div>
            <div className={styles.infoListItem}>
                <b>Skupiny:</b>{" "}
                {groupsOfClient.length === 0 && pastGroups.length === 0 ? (
                    <span className={dimmedText}>žádné skupiny</span>
                ) : (
                    <ComponentsList
                        components={[
                            ...groupsOfClient.map((g) => (
                                <GroupName key={g.id} group={g} link showCircle noWrap />
                            )),
                            ...pastGroups.map((g) => (
                                <span key={g.id} className={styles.pastGroup}>
                                    <GroupName group={g} link showCircle noWrap />
                                </span>
                            )),
                        ]}
                    />
                )}
            </div>
            <div className={styles.infoListItem}>
                <b>Poznámka:</b> <ClientNote note={client.note} />
            </div>
        </div>
        <div className={styles.analysisPanel}>
            <ClientAnalysis clientId={id} lectures={lectures} />
        </div>
    </div>
)

/** Stránka s kartou klienta nebo skupiny. */
const Card: React.FC<CardProps> = ({ id, isClientPage }) => {
    const attendanceStatesContext = useAttendanceStatesContext()
    const navigate = useNavigate()
    const isClientPageValue = isClientPage

    const deactivateClient = useDeactivateClients()
    const deactivateGroup = useDeactivateGroups()

    const clientQuery = useClient(isClientPageValue ? id : undefined)
    const groupQuery = useGroup(isClientPageValue ? undefined : id)
    const groupsOfClientQuery = useGroupsFromClient(isClientPageValue ? id : undefined)
    const allGroupsEverQuery = useAllGroupsEverFromClient(isClientPageValue ? id : undefined)
    const lecturesFromClientQuery = useLecturesFromClient(isClientPageValue ? id : undefined, false)
    const lecturesFromClientAllQuery = useLecturesFromClientAll(
        isClientPageValue ? id : undefined,
        false,
    )
    const lecturesFromGroupQuery = useLecturesFromGroup(isClientPageValue ? undefined : id, false)

    /** Klient nebo skupina zobrazená na kartě. */
    const object: ClientOrGroup = React.useMemo(() => {
        if (isClientPageValue) {
            return clientQuery.data ?? null
        }
        return groupQuery.data ?? null
    }, [isClientPageValue, clientQuery.data, groupQuery.data])

    /** Skupiny, jejichž členem je zobrazený klient. */
    const groupsOfClient: GroupType[] = groupsOfClientQuery.data ?? []

    /** Skupiny, které klient opustil (měl v nich lekci, ale už není členem). */
    const pastGroups: GroupType[] = allGroupsEverQuery.data ?? []

    /** Lekce zobrazeného klienta nebo skupiny, seskupené podle kurzů. */
    const lectures: GroupedObjectsByCourses<LectureType> = React.useMemo(() => {
        const lecturesData = isClientPageValue
            ? lecturesFromClientQuery.data
            : lecturesFromGroupQuery.data
        if (!lecturesData) {
            return []
        }
        return groupObjectsByCourses(lecturesData)
    }, [isClientPageValue, lecturesFromClientQuery.data, lecturesFromGroupQuery.data])

    /** Výchozí hodnoty pro přidání nové lekce (kurz, datum, čas). */
    const defaultValuesForLecture: DefaultValuesForLecture | undefined = React.useMemo(() => {
        if (lectures.length === 0) {
            return undefined
        }
        return getDefaultValuesForLecture(lectures)
    }, [lectures])

    // aktualizace title
    React.useEffect(() => {
        if (object) {
            const titleName = isClientObject(object) ? clientName(object) : object.name
            const pageName = isClientObject(object)
                ? APP_URLS.klienti_karta.title
                : APP_URLS.skupiny_karta.title
            document.title = pageTitle(`${titleName} – ${pageName}`)
        }
    }, [object])

    const clientQueriesLoading =
        clientQuery.isLoading ||
        groupsOfClientQuery.isLoading ||
        allGroupsEverQuery.isLoading ||
        !!lecturesFromClientAllQuery.isLoading ||
        lecturesFromClientQuery.isLoading

    const groupQueriesLoading = groupQuery.isLoading || lecturesFromGroupQuery.isLoading

    const isLoading =
        (isClientPageValue ? clientQueriesLoading : groupQueriesLoading) ||
        !!attendanceStatesContext.isLoading

    const clientQueriesFetching =
        clientQuery.isFetching ||
        groupsOfClientQuery.isFetching ||
        allGroupsEverQuery.isFetching ||
        !!lecturesFromClientAllQuery.isFetching ||
        lecturesFromClientQuery.isFetching

    const groupQueriesFetching = groupQuery.isFetching || lecturesFromGroupQuery.isFetching

    const isFetching =
        (isClientPageValue ? clientQueriesFetching : groupQueriesFetching) ||
        !!attendanceStatesContext.isLoading

    const refreshObjectFromModal = React.useCallback(
        (data: ModalClientsGroupsData): void => {
            if (data?.isDeleted) {
                void navigate({
                    to: isClientPageValue ? APP_URLS.klienti.url : APP_URLS.skupiny.url,
                })
            }
        },
        [isClientPageValue, navigate],
    )

    const goBack = (): void => {
        globalThis.history.back()
    }

    const handleDeactivate = (): void => {
        if (!object) {
            return
        }
        const label = isClientObject(object) ? "klienta" : "skupinu"
        if (!globalThis.confirm(`Opravdu chcete přesunout ${label} do neaktivních?`)) {
            return
        }
        // queryClient.invalidateQueries() je volano globalne v mutationCache.onSuccess
        // (api/queryClient.tsx), takze tady stací mit jen analytics callback.
        if (isClientObject(object)) {
            deactivateClient.mutate([id], {
                onSuccess: () => {
                    trackEvent("client_deactivated", { source: "client_card" })
                },
            })
        } else {
            deactivateGroup.mutate([id], {
                onSuccess: () => {
                    trackEvent("group_deactivated", { source: "group_card" })
                },
            })
        }
    }

    const cardSource = isClientPageValue ? ("client_card" as const) : ("group_card" as const)
    const isDeactivatePending = isClientObject(object)
        ? deactivateClient.isPending
        : deactivateGroup.isPending

    const renderLecture = (lecture: LectureType): React.ReactElement => {
        // ziskej datetime zacatku lekce, kdyz neni tak 01/01/1970
        const date = new Date(lecture.start ?? 0)
        const isPrepaidLecture = lecture.start === null
        const className = classNames(lectureStyles.lecture, styles.lectureCard, {
            [lectureStyles.lectureCanceled]: lecture.canceled,
            [styles.lectureFuture]: date > new Date(Date.now()),
            [styles.lecturePrepaid]: isPrepaidLecture,
        })
        return (
            <div
                key={lecture.id}
                className={classNames(styles.infoListItem, className)}
                data-qa="lecture"
                {...(lecture.canceled && { "data-qa-canceled": "true" })}>
                <div className={lectureStyles.lectureHeading}>
                    <Title order={4}>
                        <Tooltip label={courseDuration(lecture.duration)}>
                            <span data-qa="lecture_start">
                                {isPrepaidLecture
                                    ? "Předplacená lekce"
                                    : `${prettyDateWithDayYear(date)} – ${prettyTime(date)}`}
                            </span>
                        </Tooltip>
                    </Title>
                    <LectureNumber lecture={lecture} className={lectureStyles.lectureNumber} />
                    <ModalLectures object={object} currentLecture={lecture} source={cardSource} />
                </div>
                <div className={lectureStyles.lectureContent}>
                    <Attendances
                        lecture={lecture}
                        showClient={isGroupObject(object)}
                        source={cardSource}
                    />
                </div>
            </div>
        )
    }

    return (
        <>
            <Container>
                <Heading
                    title={
                        <>
                            {`Karta ${isClientPageValue ? "klienta" : "skupiny"}`}:{" "}
                            {isClientObject(object) ? (
                                <ClientName client={object} bold />
                            ) : (
                                object && <GroupName group={object} bold />
                            )}
                        </>
                    }
                    isFetching={isFetching}
                    buttons={
                        <HeaderActions
                            object={object}
                            cardSource={cardSource}
                            defaultValuesForLecture={defaultValuesForLecture}
                            onBack={goBack}
                            onRefreshFromModal={refreshObjectFromModal}
                        />
                    }
                />
            </Container>
            {isLoading ? (
                <Container>
                    <Skeleton h={28} mb="sm" radius="sm" w="60%" />
                    <Skeleton h={20} mb="xs" radius="sm" />
                    <Skeleton h={20} mb="xs" radius="sm" w="80%" />
                    <Skeleton h={20} mb="xl" radius="sm" w="40%" />
                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} h={200} radius="md" />
                        ))}
                    </SimpleGrid>
                </Container>
            ) : (
                <Container>
                    <div className={styles.cardInfo}>
                        <Alerts
                            object={object}
                            isDeactivatePending={isDeactivatePending}
                            onDeactivate={handleDeactivate}
                        />
                    </div>
                    {isClientObject(object) && (
                        <ClientInfo
                            client={object}
                            id={id}
                            groupsOfClient={groupsOfClient}
                            pastGroups={pastGroups}
                            lectures={lecturesFromClientAllQuery.data ?? []}
                        />
                    )}
                    {isGroupObject(object) && (
                        <PrepaidCounters
                            isGroupActive={object.active}
                            memberships={object.memberships}
                        />
                    )}
                    <Title order={2} className={styles.lecturesTitle}>
                        Lekce
                    </Title>
                    <div className={styles.lectureColumns}>
                        {lectures.map((courseLectures) => (
                            <div
                                key={courseLectures.course.id}
                                className={classNames(
                                    styles.lectureColumn,
                                    !isGroupObject(object) && styles.lectureColumnNarrow,
                                )}
                                data-qa="card_course">
                                <div className={styles.infoList}>
                                    <div
                                        className={styles.courseHeadingItem}
                                        style={assignInlineVars(styles.cardVars, {
                                            courseBackground: courseLectures.course.color,
                                            // pozadí hlavičky ztmavuje overlay (viz Card.css.ts)
                                            courseText: getReadableTextColorWithOverlay(
                                                courseLectures.course.color,
                                                styles.COURSE_HEADING_OVERLAY_OPACITY,
                                            ),
                                        })}>
                                        <h4
                                            className={`${styles.courseHeading} ${textCenterMb0}`}
                                            data-qa="card_course_name">
                                            {courseLectures.course.name}
                                        </h4>
                                    </div>
                                    {courseLectures.objects.map(renderLecture)}
                                </div>
                            </div>
                        ))}
                        {lectures.length === 0 && <p className={dimmedTextCenter}>Žádné lekce</p>}
                    </div>
                </Container>
            )}
        </>
    )
}

export default Card
