import React, { Component, Fragment } from "react"
import {
    Alert,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    Row,
    UncontrolledTooltip
} from "reactstrap"
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"
import Attendances from "../components/Attendances"
import BackButton from "../components/buttons/BackButton"
import ClientName from "../components/ClientName"
import Email from "../components/Email"
import GroupName from "../components/GroupName"
import GroupsList from "../components/GroupsList"
import Heading from "../components/Heading"
import LectureNumber from "../components/LectureNumber"
import Loading from "../components/Loading"
import Note from "../components/Note"
import Phone from "../components/Phone"
import PrepaidCounters from "../components/PrepaidCounters"
import { WithAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalClients from "../forms/ModalClients"
import ModalGroups from "../forms/ModalGroups"
import ModalLectures from "../forms/ModalLectures"
import { prettyDateWithDayYear, prettyTime } from "../global/funcDateTime"
import {
    courseDuration,
    getDefaultValuesForLecture,
    getLecturesForGroupingByCourses,
    groupByCourses
} from "../global/utils"
import APP_URLS from "../urls"
import "./Card.css"

class Card extends Component {
    isClient = () => this.props.match.path.includes(APP_URLS.klienti.url)

    state = {
        object: {},
        lectures: [],
        memberships: [],
        LOADING_CNT: this.isClient() ? 0 : 1,
        defaultValuesForLecture: null // pro FormLecture, aby se vybral velmi pravdepodobny kurz/datum a cas pri pridavani lekce
    }

    loadingStateIncrement = () =>
        this.setState(prevState => ({ LOADING_CNT: prevState.LOADING_CNT + 1 }))

    getId = () => this.props.match.params.id
    getPrevId = prevProps => prevProps.match.params.id
    wasClient = prevProps => prevProps.match.path.includes(APP_URLS.klienti.url)

    componentDidMount() {
        this.getObject()
        this.getLectures()
        if (this.isClient()) this.getMemberships()
    }

    refreshObject = () => {
        this.setState(
            prevState => ({ LOADING_CNT: prevState.LOADING_CNT - 1 }),
            () => this.getObject()
        )
    }

    refresh = (all = true) => {
        if (this.isClient() && all) {
            this.setState(
                prevState => ({ LOADING_CNT: prevState.LOADING_CNT - 3 }),
                () => {
                    this.getObject()
                    this.getLectures()
                    this.getMemberships()
                }
            )
        } else {
            this.setState(
                prevState => ({ LOADING_CNT: prevState.LOADING_CNT - 2 }),
                () => {
                    this.getObject()
                    this.getLectures()
                }
            )
        }
    }

    // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
    componentDidUpdate(prevProps) {
        if (
            this.getId() !== this.getPrevId(prevProps) ||
            this.isClient() !== this.wasClient(prevProps)
        )
            this.refresh()
    }

    refreshAfterLectureChanges = () => {
        this.refresh(false)
    }

    goBack = () => this.props.history.goBack()

    getMemberships = (id = this.getId()) =>
        GroupService.getAllFromClient(id).then(memberships =>
            this.setState({ memberships }, this.loadingStateIncrement)
        )

    getObject = (IS_CLIENT = this.isClient(), id = this.getId()) => {
        let service = IS_CLIENT ? ClientService : GroupService
        service.get(id).then(object => this.setState({ object }, this.loadingStateIncrement))
    }

    getLectures = () => {
        const request = getLecturesForGroupingByCourses(this.getId(), this.isClient())
        request.then(lectures => {
            const lecturesGroupedByCourses = groupByCourses(lectures)
            this.setState(
                {
                    lectures: lecturesGroupedByCourses,
                    defaultValuesForLecture: getDefaultValuesForLecture(lecturesGroupedByCourses)
                },
                this.loadingStateIncrement
            )
        })
    }

    // uprava nadrazeneho objektu (tohoto) po uprave v synovi (prepaid_cnt)
    funcRefreshPrepaidCnt = (id, prepaid_cnt) => {
        this.setState(prevState => {
            let success_update_cnt = 0
            const memberships = prevState.object.memberships.map(membership => {
                if (membership.id === id) {
                    success_update_cnt++
                    return { ...membership, prepaid_cnt: prepaid_cnt }
                } else {
                    return membership
                }
            })
            if (success_update_cnt !== 1)
                throw new Error(
                    "Nepodařilo se správně aktualizovat počet předplacených lekcí v nadřazené komponentě"
                )
            return {
                object: { ...prevState.object, memberships },
                LOADING_CNT: prevState.LOADING_CNT - 1
            }
        }, this.getLectures)
    }

    render() {
        const { object, lectures, defaultValuesForLecture, memberships, LOADING_CNT } = this.state
        return (
            <Fragment>
                <Container>
                    <Heading
                        content={
                            <Fragment>
                                <BackButton onClick={this.goBack} />{" "}
                                {"Karta " + (this.isClient() ? "klienta" : "skupiny")}:{" "}
                                {this.isClient() ? (
                                    <ClientName client={object} bold />
                                ) : (
                                    <GroupName group={object} bold />
                                )}
                                <ModalLectures
                                    defaultValuesForLecture={defaultValuesForLecture}
                                    IS_CLIENT={this.isClient()}
                                    object={object}
                                    refresh={this.refreshAfterLectureChanges}
                                />
                                {this.isClient() && (
                                    <ModalClients
                                        currentClient={object}
                                        refresh={this.refreshObject}
                                    />
                                )}
                                {!this.isClient() && (
                                    <ModalGroups
                                        currentGroup={object}
                                        refresh={this.refreshObject}
                                    />
                                )}
                            </Fragment>
                        }
                    />
                </Container>
                {LOADING_CNT === 3 && this.props.attendanceStatesContext.isLoaded ? (
                    <div className="pageContent">
                        <Container fluid>
                            <Row className="justify-content-center">
                                <Col sm="9" md="7" lg="5" xl="3">
                                    {!object.active && (
                                        <Alert color="warning">
                                            <strong>
                                                {this.isClient() ? "Klient" : "Skupina"} není
                                                aktivní
                                            </strong>{" "}
                                            &ndash; nelze {this.isClient() ? "mu" : "jí"} tedy
                                            přidávat lekce.
                                        </Alert>
                                    )}
                                    <ListGroup>
                                        {this.isClient() && (
                                            <Fragment>
                                                <ListGroupItem>
                                                    <b>Telefon:</b> <Phone phone={object.phone} />
                                                </ListGroupItem>
                                                <ListGroupItem>
                                                    <b>E-mail:</b> <Email email={object.email} />
                                                </ListGroupItem>
                                                <ListGroupItem>
                                                    <b>Skupiny:</b>{" "}
                                                    <GroupsList groups={memberships} />
                                                </ListGroupItem>
                                                <ListGroupItem>
                                                    <b>Poznámka:</b> <Note note={object.note} />
                                                </ListGroupItem>
                                            </Fragment>
                                        )}
                                    </ListGroup>
                                </Col>
                            </Row>
                            {!this.isClient() && (
                                <PrepaidCounters
                                    isGroupActive={object.active}
                                    memberships={object.memberships}
                                    funcRefreshPrepaidCnt={this.funcRefreshPrepaidCnt}
                                />
                            )}
                            <br />
                            <Row className="justify-content-center">
                                {lectures.map(courseLectures => (
                                    <Col
                                        key={courseLectures.course.id}
                                        sm="9"
                                        md="7"
                                        lg="5"
                                        xl="3"
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
                                            {courseLectures.lectures.map(lecture => {
                                                const d = new Date(lecture.start)
                                                let className = lecture.canceled
                                                    ? "lecture-canceled"
                                                    : ""
                                                if (d > Date.now()) className += " lecture-future"
                                                if (lecture.start === null)
                                                    className += " lecture-prepaid"
                                                return (
                                                    <ListGroupItem
                                                        key={lecture.id}
                                                        className={
                                                            className + " lecture lecture_card"
                                                        }
                                                        data-qa="lecture">
                                                        <div className="lecture_heading">
                                                            <h4>
                                                                <span
                                                                    data-qa="lecture_start"
                                                                    id={
                                                                        "Card_CourseDuration" +
                                                                        lecture.id
                                                                    }>
                                                                    {lecture.start !== null
                                                                        ? prettyDateWithDayYear(d) +
                                                                          " – " +
                                                                          prettyTime(d)
                                                                        : "Předplacená lekce"}
                                                                </span>
                                                                <UncontrolledTooltip
                                                                    target={
                                                                        "Card_CourseDuration" +
                                                                        lecture.id
                                                                    }>
                                                                    {courseDuration(
                                                                        lecture.duration
                                                                    )}
                                                                </UncontrolledTooltip>
                                                            </h4>
                                                            <LectureNumber lecture={lecture} />
                                                            <ModalLectures
                                                                IS_CLIENT={this.isClient()}
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
                                                                showClient={!this.isClient()}
                                                            />
                                                        </div>
                                                    </ListGroupItem>
                                                )
                                            })}
                                        </ListGroup>
                                    </Col>
                                ))}
                                {!Boolean(lectures.length) && (
                                    <p className="text-muted text-center">Žádné lekce</p>
                                )}
                            </Row>
                        </Container>
                    </div>
                ) : (
                    <Loading />
                )}
            </Fragment>
        )
    }
}

export default WithAttendanceStatesContext(Card)
