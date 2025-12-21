import classNames from "classnames"
import * as React from "react"
import { Alert, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import {
    useClient,
    useGroup,
    useGroupsFromClient,
    useLecturesFromClient,
    useLecturesFromGroup,
} from "../api/hooks"
import APP_URLS from "../APP_URLS"
import Attendances from "../components/Attendances"
import BackButton from "../components/buttons/BackButton"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import GroupName from "../components/GroupName"
import GroupsList from "../components/GroupsList"
import Heading from "../components/Heading"
import LectureNumber from "../components/LectureNumber"
import Loading from "../components/Loading"
import PrepaidCounters from "../components/PrepaidCounters"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalClients from "../forms/ModalClients"
import ModalGroups from "../forms/ModalGroups"
import ModalLectures from "../forms/ModalLectures"
import { TEXTS } from "../global/constants"
import { prettyDateWithDayYear, prettyTime } from "../global/funcDateTime"
import {
    clientName,
    courseDuration,
    DefaultValuesForLecture,
    getDefaultValuesForLecture,
    groupObjectsByCourses,
    GroupedObjectsByCourses,
    pageTitle,
} from "../global/utils"
import { ModalClientsGroupsData } from "../types/components"
import { ClientType, GroupType, LectureType } from "../types/models"
import { CustomRouteComponentProps, Model } from "../types/types"
import "./Card.css"

type ParamProps = { id: Model["id"] }

type Props = CustomRouteComponentProps<ParamProps>

type ClientOrGroup = ClientType | GroupType | null

/** Stránka s kartou klienta nebo skupiny. */
const Card: React.FC<Props> = (props) => {
    const attendanceStatesContext = useAttendanceStatesContext()
    const id = props.match.params.id
    const isClientPageValue = props.match.path.includes(APP_URLS.klienti.url)

    const isClient = (object: ClientOrGroup): object is ClientType =>
        Boolean(object && "phone" in object)

    const isGroup = (object: ClientOrGroup): object is GroupType =>
        Boolean(object && "name" in object)

    const clientQuery = useClient(isClientPageValue ? id : undefined)
    const groupQuery = useGroup(isClientPageValue ? undefined : id)
    const groupsOfClientQuery = useGroupsFromClient(isClientPageValue ? id : undefined)
    const lecturesFromClientQuery = useLecturesFromClient(isClientPageValue ? id : undefined, false)
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
            const titleName = isClient(object) ? clientName(object) : object.name
            const pageName = isClient(object)
                ? APP_URLS.klienti_karta.title
                : APP_URLS.skupiny_karta.title
            document.title = pageTitle(`${titleName} – ${pageName}`)
        }
    }, [object])

    const isLoading =
        (isClientPageValue ? clientQuery.isLoading : groupQuery.isLoading) ||
        (isClientPageValue ? groupsOfClientQuery.isLoading : false) ||
        (isClientPageValue
            ? lecturesFromClientQuery.isLoading
            : lecturesFromGroupQuery.isLoading) ||
        attendanceStatesContext.isLoading

    const isFetching =
        (isClientPageValue ? clientQuery.isFetching : groupQuery.isFetching) ||
        (isClientPageValue ? groupsOfClientQuery.isFetching : false) ||
        (isClientPageValue
            ? lecturesFromClientQuery.isFetching
            : lecturesFromGroupQuery.isFetching) ||
        attendanceStatesContext.isLoading

    const refreshObjectFromModal = React.useCallback(
        (data: ModalClientsGroupsData): void => {
            if (data?.isDeleted) {
                props.history.push(isClientPageValue ? APP_URLS.klienti.url : APP_URLS.skupiny.url)
            }
        },
        [props.history, isClientPageValue],
    )

    const goBack = (): void => {
        props.history.goBack()
    }

    const renderLecture = (lecture: LectureType): React.ReactElement => {
        // ziskej datetime zacatku lekce, kdyz neni tak 01/01/1970
        const date = new Date(lecture.start ?? 0)
        const className = classNames("lecture", "lecture_card", {
            "lecture-canceled": lecture.canceled,
            "lecture-future": date > new Date(Date.now()),
            "lecture-prepaid": lecture.start === null,
        })
        return (
            <ListGroupItem key={lecture.id} className={className} data-qa="lecture">
                <div className="lecture_heading">
                    <h4>
                        <span data-qa="lecture_start" id={`Card_CourseDuration_${lecture.id}`}>
                            {lecture.start !== null
                                ? `${prettyDateWithDayYear(date)} – ${prettyTime(date)}`
                                : "Předplacená lekce"}
                        </span>
                        <UncontrolledTooltipWrapper target={`Card_CourseDuration_${lecture.id}`}>
                            {courseDuration(lecture.duration)}
                        </UncontrolledTooltipWrapper>
                    </h4>
                    <LectureNumber lecture={lecture} />
                    <ModalLectures object={object} currentLecture={lecture} />
                </div>
                <div className="lecture_content">
                    <Attendances lecture={lecture} showClient={isGroup(object)} />
                </div>
            </ListGroupItem>
        )
    }

    return (
        <>
            <Container>
                <Heading
                    title={
                        <>
                            {`Karta ${isClientPageValue ? "klienta" : "skupiny"}`}:{" "}
                            {isClient(object) ? (
                                <ClientName client={object} bold />
                            ) : (
                                object && <GroupName group={object} bold />
                            )}
                        </>
                    }
                    isFetching={isFetching}
                    buttons={
                        <>
                            <BackButton onClick={goBack} />
                            {isClient(object) ? (
                                <ModalClients
                                    currentClient={object}
                                    refresh={(data) =>
                                        refreshObjectFromModal(data as ModalClientsGroupsData)
                                    }
                                />
                            ) : (
                                object && (
                                    <ModalGroups
                                        currentGroup={object}
                                        refresh={(data) =>
                                            refreshObjectFromModal(data as ModalClientsGroupsData)
                                        }
                                    />
                                )
                            )}
                            <ModalLectures
                                defaultValuesForLecture={defaultValuesForLecture}
                                object={object}
                            />
                        </>
                    }
                />
            </Container>
            {isLoading ? (
                <Loading />
            ) : (
                <Container>
                    <div className="CardInfo">
                        {object && !object.active && (
                            <Alert color="warning" className="mt-0">
                                {isClient(object)
                                    ? TEXTS.WARNING_INACTIVE_CLIENT
                                    : TEXTS.WARNING_INACTIVE_GROUP}
                            </Alert>
                        )}
                        {isClient(object) && (
                            <ListGroup>
                                <ListGroupItem>
                                    <b>Telefon:</b> <ClientPhone phone={object.phone} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <b>E-mail:</b> <ClientEmail email={object.email} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <b>Skupiny:</b> <GroupsList groups={groupsOfClient} />
                                </ListGroupItem>
                                <ListGroupItem>
                                    <b>Poznámka:</b> <ClientNote note={object.note} />
                                </ListGroupItem>
                            </ListGroup>
                        )}
                    </div>
                    {isGroup(object) && (
                        <PrepaidCounters
                            isGroupActive={object.active}
                            memberships={object.memberships}
                        />
                    )}
                    <h2>Lekce</h2>
                    <Row className="justify-content-center">
                        {lectures.map((courseLectures) => (
                            <Col
                                key={courseLectures.course.id}
                                sm="10"
                                md="8"
                                lg="6"
                                xl={isGroup(object) ? 5 : 4}
                                data-qa="card_course">
                                <ListGroup>
                                    <ListGroupItem
                                        style={{ background: courseLectures.course.color }}>
                                        <h4
                                            className="text-center mb-0 Card_courseHeading"
                                            data-qa="card_course_name">
                                            {courseLectures.course.name}
                                        </h4>
                                    </ListGroupItem>
                                    {courseLectures.objects.map(renderLecture)}
                                </ListGroup>
                            </Col>
                        ))}
                        {lectures.length === 0 && (
                            <p className="text-muted text-center">Žádné lekce</p>
                        )}
                    </Row>
                </Container>
            )}
        </>
    )
}

export default Card
