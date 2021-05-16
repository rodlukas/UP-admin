import * as React from "react"
import { Alert, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import ClientService from "../api/services/ClientService"
import GroupService from "../api/services/GroupService"
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
import {
    AttendanceStatesContextProps,
    WithAttendanceStatesContext,
} from "../contexts/AttendanceStatesContext"
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
    getLecturesgroupedByCourses,
    GroupedObjectsByCourses,
    pageTitle,
} from "../global/utils"
import { ModalClientsGroupsData } from "../types/components"
import { ClientType, GroupType, LectureType, MembershipType } from "../types/models"
import { CustomRouteComponentProps, Model } from "../types/types"
import "./Card.css"

type ParamProps = { id: Model["id"] }

type Props = CustomRouteComponentProps<ParamProps> & AttendanceStatesContextProps

type State = {
    /** Zobrazený objekt v kartě - klient/skupina. */
    object: ClientType | GroupType | null
    /** Pole lekcí roztříděných podle kurzů. */
    lectures: GroupedObjectsByCourses<LectureType>
    /** Skupiny, ve kterých je klient členem. */
    groupsOfClient: Array<GroupType>
    /** Počet zbývajících požadavků na načtení. */
    pendingLoadingCnt: number
    /** Předpočítané výchozí hodnoty pro přidávanou lekci. */
    defaultValuesForLecture?: DefaultValuesForLecture
}

/** Stránka s kartou klienta nebo skupiny. */
class Card extends React.Component<Props, State> {
    isClientPage = (): boolean => this.props.match.path.includes(APP_URLS.klienti.url)

    isClient = (object: State["object"]): object is ClientType =>
        Boolean(object && "phone" in object)

    isGroup = (object: State["object"]): object is GroupType => Boolean(object && "name" in object)

    state: State = {
        object: null,
        lectures: [],
        groupsOfClient: [],
        pendingLoadingCnt: this.isClientPage() ? 3 : 2,
        defaultValuesForLecture: undefined, // pro FormLecture, aby se vybral velmi pravdepodobny kurz/datum a cas pri pridavani lekce
    }

    loadingDone = (): void =>
        this.setState((prevState) => ({ pendingLoadingCnt: prevState.pendingLoadingCnt - 1 }))

    getId = (): Model["id"] => this.props.match.params.id
    getPrevId = (prevProps: Props): Model["id"] => prevProps.match.params.id
    wasClientPage = (prevProps: Props): boolean =>
        prevProps.match.path.includes(APP_URLS.klienti.url)

    componentDidMount(): void {
        this.getObject()
        this.getLectures()
        if (this.isClientPage()) {
            this.getGroupsOfClient()
        }
    }

    refreshObjectFromModal = (data: ModalClientsGroupsData): void => {
        if (!data?.isDeleted) {
            this.setState(
                (prevState) => ({ pendingLoadingCnt: prevState.pendingLoadingCnt + 1 }),
                () => this.getObject()
            )
        } else {
            this.props.history.push(
                this.isClientPage() ? APP_URLS.klienti.url : APP_URLS.skupiny.url
            )
        }
    }

    refresh = (all = true): void => {
        if (this.isClientPage() && all) {
            this.setState(
                (prevState) => ({ pendingLoadingCnt: prevState.pendingLoadingCnt + 3 }),
                () => {
                    this.getObject()
                    this.getLectures()
                    this.getGroupsOfClient()
                }
            )
        } else {
            this.setState(
                (prevState) => ({ pendingLoadingCnt: prevState.pendingLoadingCnt + 2 }),
                () => {
                    this.getObject()
                    this.getLectures()
                }
            )
        }
    }

    // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
    componentDidUpdate(prevProps: Readonly<Props>): void {
        if (
            this.getId() !== this.getPrevId(prevProps) ||
            this.isClientPage() !== this.wasClientPage(prevProps)
        ) {
            this.refresh()
        }
    }

    refreshAfterLectureChanges = (): void => {
        this.refresh(false)
    }

    goBack = (): void => {
        this.props.history.goBack()
    }

    getGroupsOfClient = (id = this.getId()): void => {
        GroupService.getAllFromClient(id).then((groupsOfClient) =>
            this.setState({ groupsOfClient }, this.loadingDone)
        )
    }

    getObject = (isClient = this.isClientPage(), id = this.getId()): void => {
        const service = isClient ? ClientService : GroupService
        const request: Promise<ClientType | GroupType> = service.get(id)
        request.then((object) => {
            this.refreshTitle(object)
            this.setState({ object }, this.loadingDone)
        })
    }

    refreshTitle = (object: GroupType | ClientType): void => {
        const titleName = this.isClient(object) ? clientName(object) : object.name
        const pageName = this.isClient(object)
            ? APP_URLS.klienti_karta.title
            : APP_URLS.skupiny_karta.title
        document.title = pageTitle(`${titleName} – ${pageName}`)
    }

    getLectures = (): void => {
        const request = getLecturesgroupedByCourses(this.getId(), this.isClientPage())
        request.then((lecturesGroupedByCourses) => {
            this.setState(
                {
                    lectures: lecturesGroupedByCourses,
                    defaultValuesForLecture: getDefaultValuesForLecture(lecturesGroupedByCourses),
                },
                this.loadingDone
            )
        })
    }

    // uprava nadrazeneho objektu (tohoto) po uprave v synovi (prepaid_cnt)
    funcRefreshPrepaidCnt = (
        id: MembershipType["id"],
        prepaidCnt: MembershipType["prepaid_cnt"]
    ): void => {
        this.setState((prevState) => {
            const newLoadingState = {
                pendingLoadingCnt: prevState.pendingLoadingCnt + 1,
            }
            if (this.isClient(prevState.object) || prevState.object === null) {
                // ...prevState kvuli https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365
                return {
                    ...prevState,
                    ...newLoadingState,
                }
            }
            let successUpdateCnt = 0
            const memberships = prevState.object.memberships.map((membership) => {
                if (membership.id === id) {
                    successUpdateCnt++
                    return { ...membership, prepaid_cnt: prepaidCnt }
                } else {
                    return membership
                }
            })
            if (successUpdateCnt !== 1) {
                throw new Error(
                    "Nepodařilo se správně aktualizovat počet předplacených lekcí v nadřazené komponentě"
                )
            }
            return {
                object: { ...prevState.object, memberships },
                ...newLoadingState,
            }
        }, this.getLectures)
    }

    render(): React.ReactNode {
        const { object, lectures, defaultValuesForLecture, groupsOfClient, pendingLoadingCnt } =
            this.state
        return (
            <>
                <Container>
                    <Heading
                        title={
                            <>
                                {`Karta ${this.isClientPage() ? "klienta" : "skupiny"}`}:{" "}
                                {this.isClient(object) ? (
                                    <ClientName client={object} bold />
                                ) : (
                                    object && <GroupName group={object} bold />
                                )}
                            </>
                        }
                        buttons={
                            <>
                                <BackButton onClick={this.goBack} />
                                {this.isClient(object) ? (
                                    <ModalClients
                                        currentClient={object}
                                        refresh={this.refreshObjectFromModal}
                                    />
                                ) : (
                                    object && (
                                        <ModalGroups
                                            currentGroup={object}
                                            refresh={this.refreshObjectFromModal}
                                        />
                                    )
                                )}
                                <ModalLectures
                                    defaultValuesForLecture={defaultValuesForLecture}
                                    object={object}
                                    refresh={this.refreshAfterLectureChanges}
                                />
                            </>
                        }
                    />
                </Container>
                {pendingLoadingCnt === 0 && this.props.attendanceStatesContext.isLoaded ? (
                    <Container>
                        <div className="CardInfo">
                            {object && !object.active && (
                                <Alert color="warning" className="mt-0">
                                    {this.isClient(object)
                                        ? TEXTS.WARNING_INACTIVE_CLIENT
                                        : TEXTS.WARNING_INACTIVE_GROUP}
                                </Alert>
                            )}
                            {this.isClient(object) && (
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
                        {this.isGroup(object) && (
                            <PrepaidCounters
                                isGroupActive={object.active}
                                memberships={object.memberships}
                                funcRefreshPrepaidCnt={this.funcRefreshPrepaidCnt}
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
                                    xl={this.isGroup(object) ? 5 : 4}
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
                                        {courseLectures.objects.map((lecture) => {
                                            // ziskej datetime zacatku lekce, kdyz neni tak 01/01/1970
                                            const date = new Date(lecture.start ?? 0)
                                            let className = lecture.canceled
                                                ? "lecture-canceled"
                                                : ""
                                            if (date > new Date(Date.now())) {
                                                className += " lecture-future"
                                            }
                                            if (lecture.start === null) {
                                                className += " lecture-prepaid"
                                            }
                                            return (
                                                <ListGroupItem
                                                    key={lecture.id}
                                                    className={`${className} lecture lecture_card`}
                                                    data-qa="lecture">
                                                    <div className="lecture_heading">
                                                        <h4>
                                                            <span
                                                                data-qa="lecture_start"
                                                                id={`Card_CourseDuration_${lecture.id}`}>
                                                                {lecture.start !== null
                                                                    ? `${prettyDateWithDayYear(
                                                                          date
                                                                      )} – ${prettyTime(date)}`
                                                                    : "Předplacená lekce"}
                                                            </span>
                                                            <UncontrolledTooltipWrapper
                                                                target={`Card_CourseDuration_${lecture.id}`}>
                                                                {courseDuration(lecture.duration)}
                                                            </UncontrolledTooltipWrapper>
                                                        </h4>
                                                        <LectureNumber lecture={lecture} />
                                                        <ModalLectures
                                                            object={object}
                                                            currentLecture={lecture}
                                                            refresh={
                                                                this.refreshAfterLectureChanges
                                                            }
                                                        />
                                                    </div>
                                                    <div className="lecture_content">
                                                        <Attendances
                                                            lecture={lecture}
                                                            funcRefresh={
                                                                this.refreshAfterLectureChanges
                                                            }
                                                            showClient={this.isGroup(object)}
                                                        />
                                                    </div>
                                                </ListGroupItem>
                                            )
                                        })}
                                    </ListGroup>
                                </Col>
                            ))}
                            {lectures.length === 0 && (
                                <p className="text-muted text-center">Žádné lekce</p>
                            )}
                        </Row>
                    </Container>
                ) : (
                    <Loading />
                )}
            </>
        )
    }
}

export default WithAttendanceStatesContext(Card)
