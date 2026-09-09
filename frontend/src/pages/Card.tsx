import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    Alert,
    Breadcrumbs,
    Button,
    Container,
    Group,
    SimpleGrid,
    Skeleton,
    Tabs,
    Title,
    Tooltip,
} from "@mantine/core"
import { faCalendar, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link, useNavigate } from "@tanstack/react-router"
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
import ClientAnalysis from "../components/ClientAnalysis"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import ClientsList from "../components/ClientsList"
import ComponentsList from "../components/ComponentsList"
import CourseName from "../components/CourseName"
import { courseBandVars } from "../components/CourseName.css"
import EmptyState from "../components/EmptyState"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import * as lectureStyles from "../components/Lecture.css"
import LectureNumber from "../components/LectureNumber"
import LectureTypeIcon from "../components/LectureTypeIcon"
import PrepaidCounters from "../components/PrepaidCounters"
import { SkeletonShell } from "../components/Skeletons"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalClients from "../forms/ModalClients"
import ModalGroups from "../forms/ModalGroups"
import ModalLectures from "../forms/ModalLectures"
import { TEXTS } from "../global/constants"
import { prettyDateWithDayYear, prettyTime } from "../global/funcDateTime"
import { dimmedText, iconAfterText, mb0, srOnly } from "../global/utility.css"
import {
    clientName,
    contrastingTextColor,
    courseDuration,
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    groupObjectsByCourses,
    GroupedObjectsByCourses,
    isStaleActive,
    pageTitle,
} from "../global/utils"
import { useRememberRecentRecord } from "../hooks/useRememberRecentRecord"
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
    onRefreshFromModal: (data: ModalClientsGroupsData) => void
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
    object,
    cardSource,
    defaultValuesForLecture,
    onRefreshFromModal,
}) => (
    <>
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
            <Alert
                // pozadi i ramecek dodava `staleAlert`, viz ClientsGroups.css.ts
                variant="transparent"
                color="yellow"
                mt={0}
                className={styles.cardNotice}>
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
        <Alert variant="transparent" color="yellow" mt={0} className={styles.cardNotice}>
            <Group justify="space-between" wrap="wrap">
                <span>
                    {isClientObject(object)
                        ? TEXTS.WARNING_STALE_CLIENT
                        : TEXTS.WARNING_STALE_GROUP}
                </span>
                {/* `default` varianta: syte zlute tlacitko bylo na mekkem notice
                    nejhlasitejsi veci stranky, stejne jako na Klientech */}
                <Button variant="default" disabled={isDeactivatePending} onClick={onDeactivate}>
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
    groupsOfClient: GroupType[]
    pastGroups: GroupType[]
}

/**
 * Klíčová fakta o klientovi nad záložkami — obdoba „highlights panelu" z record pages:
 * to, co uživatel potřebuje vidět vždycky, bez ohledu na to, kterou záložku má otevřenou.
 * Graf a rozpad docházky se přesunuly do záložky Analýza, protože to je průzkum, ne fakt.
 */
const ClientInfo: React.FC<ClientInfoProps> = ({ client, groupsOfClient, pastGroups }) => (
    <dl className={styles.summaryPanel}>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Telefon</dt>
            <dd className={styles.summaryValue}>
                <ClientPhone phone={client.phone} />
            </dd>
        </div>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>E-mail</dt>
            <dd className={styles.summaryValue}>
                <ClientEmail email={client.email} />
            </dd>
        </div>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Skupiny</dt>
            <dd className={styles.summaryValue}>
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
            </dd>
        </div>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Poznámka</dt>
            <dd className={styles.summaryValue}>
                <ClientNote note={client.note} />
            </dd>
        </div>
    </dl>
)

type GroupInfoProps = {
    group: GroupType
}

/**
 * Klíčová fakta o skupině nad záložkami. Karta skupiny je dosud žádná neměla, i když
 * klient ano — kurz a členy přitom potřebuješ vidět bez ohledu na otevřenou záložku.
 */
const GroupInfo: React.FC<GroupInfoProps> = ({ group }) => (
    <dl className={styles.summaryPanel}>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Kurz</dt>
            <dd className={styles.summaryValue}>
                <CourseName course={group.course} />
            </dd>
        </div>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Členové ({group.memberships.length})</dt>
            <dd className={styles.summaryValue}>
                {group.memberships.length === 0 ? (
                    <span className={dimmedText}>žádní členové</span>
                ) : (
                    <ClientsList memberships={group.memberships} />
                )}
            </dd>
        </div>
        <div className={styles.summaryItem}>
            <dt className={styles.summaryLabel}>Stav</dt>
            <dd className={styles.summaryValue}>{group.active ? "Aktivní" : "Neaktivní"}</dd>
        </div>
    </dl>
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

    // teprve tady je jasné, že `id` odpovídá skutečnému, úspěšně načtenému záznamu —
    // dokud dotaz běží nebo skončí chybou (smazaný/neexistující klient/skupina), se
    // záznam do „naposledy otevřených" nezapisuje (viz useRememberRecentRecord).
    // Nadto musí být záznam AKTIVNÍ: kontexty, ze kterých ⌘K paleta (AppSpotlight)
    // záznamy vyhledává i následně maže ty nevyřešitelné, obsahují jen aktivní
    // klienty/skupiny — bez tohoto filtru by karta neaktivního klienta zapsala záznam,
    // který paleta nikdy nevyhledá, jen vytlačí z 5místné historie použitelné aktivní
    // záznamy a při nejbližší prunovací příležitosti ho sama zase smaže.
    const isActiveObject = isClientPageValue ? clientQuery.data?.active : groupQuery.data?.active
    useRememberRecentRecord(
        isClientPageValue ? "client" : "group",
        id,
        (isClientPageValue ? clientQuery.isSuccess : groupQuery.isSuccess) &&
            isActiveObject === true,
    )
    const groupsOfClientQuery = useGroupsFromClient(isClientPageValue ? id : undefined)
    const allGroupsEverQuery = useAllGroupsEverFromClient(isClientPageValue ? id : undefined)
    const lecturesFromClientQuery = useLecturesFromClient(isClientPageValue ? id : undefined, false)
    /**
     * Analýza je jediný konzument všech lekcí klienta včetně skupinových a `keepMounted={false}`
     * ji defaultně vůbec nenamountuje. Dotaz se proto zapíná až prvním otevřením záložky:
     * jinak by každé otevření karty stahovalo celý kalendář klienta i s vnořenými účastmi
     * a klienty — kvůli datům, která výchozí záložka „Lekce" nezobrazuje.
     */
    const [wasAnalysisOpened, setWasAnalysisOpened] = React.useState(false)
    const lecturesFromClientAllQuery = useLecturesFromClientAll(
        isClientPageValue && wasAnalysisOpened ? id : undefined,
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

    // bez `lecturesFromClientAllQuery`: ta patri jen zalozce Analyza (viz vyse) a nesmi
    // drzet skeleton cele karty kvuli datum, ktera vychozi zalozka nezobrazuje
    const clientQueriesLoading =
        clientQuery.isLoading ||
        groupsOfClientQuery.isLoading ||
        allGroupsEverQuery.isLoading ||
        lecturesFromClientQuery.isLoading

    const groupQueriesLoading = groupQuery.isLoading || lecturesFromGroupQuery.isLoading

    const isLoading =
        (isClientPageValue ? clientQueriesLoading : groupQueriesLoading) ||
        !!attendanceStatesContext.isLoading

    // Background refetch seznamu lekcí (napr. po ulozeni/smazani lekce z modalu) — na rozdil
    // od `isLoading` (jen prvotni nacteni, kryte skeletonem cele karty) toto E2E krokum
    // (`wait_loading_ends` v tests/ui_steps/lectures.py) drzi `data-qa=loading` po dobu, kdy
    // uz je stara data v DOM porad videt, ale prekresluji se na nova. Zamerne per-karta,
    // ne globalni (`TopProgressBar` a jeho `data-qa=global-loading`) — sdileny marker by
    // kroky cekajici na tuhle konkretni lekci nechal cekat i na nesouvisejici dotazy jinde.
    const isLecturesFetching =
        !isLoading &&
        (isClientPageValue ? lecturesFromClientQuery.isFetching : lecturesFromGroupQuery.isFetching)

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
            [lectureStyles.lectureCanceledStruck]: lecture.canceled,
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
                    {/* order/size odděleně: h1 jméno klienta/skupiny (Card.tsx výše) → h2
                        název kurzu → h3 datum lekce; „Lekce" (dřívější h2) je od záložek
                        (Tabs.Tab) místo nadpisu, takže v hierarchii chybí — zbylé úrovně
                        proto o jednu posunuté, vzhled zůstává h4 */}
                    <Title order={3} className={lectureStyles.lectureTitle}>
                        <Tooltip label={courseDuration(lecture.duration)}>
                            <span data-qa="lecture_start">
                                {isPrepaidLecture
                                    ? "Předplacená lekce"
                                    : `${prettyDateWithDayYear(date)} – ${prettyTime(date)}`}
                            </span>
                        </Tooltip>
                    </Title>
                    <LectureTypeIcon lecture={lecture} />
                    <LectureNumber lecture={lecture} className={lectureStyles.lectureNumber} />
                    <ModalLectures object={object} currentLecture={lecture} source={cardSource} />
                </div>
                {/* přeškrtnutí je pro oko, tenhle text pro čtečku (WCAG 1.4.1) */}
                {lecture.canceled && <span className={srOnly}>Zrušeno</span>}
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
                {/* Drobeckova navigace misto tlacitka „Jit zpet": rika, kde uzivatel je,
                    ne jen kam se vratit — a titulek pak nemusi opakovat „Karta klienta". */}
                <Breadcrumbs className={styles.breadcrumbs}>
                    <Link to={isClientPageValue ? APP_URLS.klienti.url : APP_URLS.skupiny.url}>
                        {isClientPageValue ? APP_URLS.klienti.title : APP_URLS.skupiny.title}
                    </Link>
                    <span className={styles.breadcrumbCurrent}>
                        {isClientObject(object) ? clientName(object) : (object?.name ?? "")}
                    </span>
                </Breadcrumbs>
                <Heading
                    title={
                        isClientObject(object) ? (
                            <ClientName client={object} bold />
                        ) : (
                            object && <GroupName group={object} bold />
                        )
                    }
                    buttons={
                        <HeaderActions
                            object={object}
                            cardSource={cardSource}
                            defaultValuesForLecture={defaultValuesForLecture}
                            onRefreshFromModal={refreshObjectFromModal}
                        />
                    }
                />
            </Container>
            {isLoading ? (
                <Container>
                    <SkeletonShell>
                        <Skeleton h={28} mb="sm" radius="sm" w="60%" />
                        <Skeleton h={20} mb="xs" radius="sm" />
                        <Skeleton h={20} mb="xs" radius="sm" w="80%" />
                        <Skeleton h={20} mb="xl" radius="sm" w="40%" />
                        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                            {[...new Array(3)].map((_, i) => (
                                <Skeleton key={i} h={200} radius="md" />
                            ))}
                        </SimpleGrid>
                    </SkeletonShell>
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
                            groupsOfClient={groupsOfClient}
                            pastGroups={pastGroups}
                        />
                    )}
                    {isGroupObject(object) && <GroupInfo group={object} />}
                    {/* Zalozky misto jedne dlouhe stranky. „Lekce" musi zustat vychozi:
                        je to duvod, proc se karta oteviraq — a chytaji se jich E2E kroky
                        (`card_course`). */}
                    <Tabs
                        defaultValue="lekce"
                        keepMounted={false}
                        onChange={(value) => {
                            if (value === "analyza") {
                                setWasAnalysisOpened(true)
                            }
                        }}
                        className={styles.tabs}>
                        <Tabs.List>
                            <Tabs.Tab value="lekce">Lekce</Tabs.Tab>
                            {isClientObject(object) && <Tabs.Tab value="analyza">Analýza</Tabs.Tab>}
                            {isGroupObject(object) && (
                                <Tabs.Tab value="predplacene">Předplacené lekce</Tabs.Tab>
                            )}
                        </Tabs.List>

                        {isClientObject(object) && (
                            <Tabs.Panel value="analyza" pt="md">
                                {lecturesFromClientAllQuery.isPending ? (
                                    <Skeleton h={320} radius="md" />
                                ) : (
                                    <ClientAnalysis
                                        clientId={id}
                                        lectures={lecturesFromClientAllQuery.data ?? []}
                                    />
                                )}
                            </Tabs.Panel>
                        )}
                        {isGroupObject(object) && (
                            <Tabs.Panel value="predplacene" pt="md">
                                <PrepaidCounters
                                    isGroupActive={object.active}
                                    memberships={object.memberships}
                                />
                            </Tabs.Panel>
                        )}

                        <Tabs.Panel value="lekce" pt="md">
                            {isLecturesFetching && (
                                <span data-qa="loading" aria-hidden="true" hidden />
                            )}
                            <div className={styles.lectureColumns}>
                                {lectures.map((courseLectures) => (
                                    <div
                                        key={courseLectures.course.id}
                                        className={styles.lectureColumn}
                                        data-qa="card_course">
                                        <div className={styles.infoList}>
                                            <div
                                                className={styles.courseHeadingItem}
                                                style={assignInlineVars(courseBandVars, {
                                                    color: courseLectures.course.color,
                                                    text: contrastingTextColor(
                                                        courseLectures.course.color,
                                                    ),
                                                })}>
                                                {/* `.text` tohoto prvku cte E2E krok — tecka nesmi
                                            pridat zadny text, proto prazdny span */}
                                                <Title
                                                    order={2}
                                                    size="h4"
                                                    className={mb0}
                                                    data-qa="card_course_name">
                                                    {courseLectures.course.name}
                                                </Title>
                                            </div>
                                            {courseLectures.objects.map(renderLecture)}
                                        </div>
                                    </div>
                                ))}
                                {lectures.length === 0 && (
                                    <EmptyState
                                        icon={faCalendar}
                                        title="Žádné lekce"
                                        description="Až se přidá první lekce, objeví se tady seřazená po kurzech."
                                    />
                                )}
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </Container>
            )}
        </>
    )
}

export default Card
