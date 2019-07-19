import React, {Component, Fragment} from "react"
import {Col, Container, ListGroup, ListGroupItem, Row} from "reactstrap"
import ClientService from "../api/services/client"
import GroupService from "../api/services/group"
import LectureService from "../api/services/lecture"
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
import ModalClients from "../forms/ModalClients"
import ModalGroups from "../forms/ModalGroups"
import ModalLectures from "../forms/ModalLectures"
import {prettyDateWithDayYear, prettyTime} from "../global/funcDateTime"
import {courseDuration, groupByCourses} from "../global/utils"
import APP_URLS from "../urls"
import "./Card.css"

export default class Card extends Component {
    constructor(props) {
        super(props)
        this.state = {
            object: {},
            lectures: [],
            memberships: [],
            LOADING_CNT: this.isClient() ? 0 : 1,
            defaultCourse: null // pro FormLecture, aby se vybral velmi pravdepodobny kurz pri pridavani lekce
        }
    }

    loadingStateIncrement = () =>
        this.setState(prevState => ({LOADING_CNT: prevState.LOADING_CNT + 1}))

    getId = () =>
        this.props.match.params.id
    getPrevId = (prevProps) =>
        prevProps.match.params.id
    isClient = () =>
        this.props.match.path.includes(APP_URLS.klienti.url)
    wasClient = (prevProps) =>
        prevProps.match.path.includes(APP_URLS.klienti.url)

    // zvolit optimalni kurz, jehoz lekce bude s nejvyssi pravdepodobnosti pridavana ve formulari
    getDefaultCourseSingle = lectures => {
        if(this.isClient())
        {
            if(lectures.length === 0)
                this.setState({defaultCourse: null})
            else if(lectures.length === 1)
            {
                // chodi na jeden jediny kurz, vyber ho
                const firstLectureOfCourse = lectures[0].values[0]
                this.setState({defaultCourse: firstLectureOfCourse.course})
            }
            else if(lectures.length > 1)
            {
                // chodi na vice kurzu, vyber ten jehoz posledni lekce je nejpozdeji (predplacene jen kdyz neni jina moznost)
                let latestLecturesOfEachCourse = []
                lectures.forEach(
                    elem => latestLecturesOfEachCourse.push(elem.values[0]))
                const latestLecture = latestLecturesOfEachCourse.reduce(
                    (prev, current) => (prev.start > current.start) ? prev : current)
                this.setState({defaultCourse: latestLecture.course})
            }
        }
        else
            this.setState({defaultCourse: null})
    }

    componentDidMount() {
        this.getObject()
        this.getLectures()
        if (this.isClient())
            this.getMemberships()
    }

    refreshObject = () => {
        this.setState(
            prevState => ({LOADING_CNT: prevState.LOADING_CNT - 1}),
            () =>
                this.getObject()
        )
    }

    refresh = (all = true) => {
        if (this.isClient() && all) {
            this.setState(
                prevState => ({LOADING_CNT: prevState.LOADING_CNT - 3}),
                () => {
                    this.getObject()
                    this.getLectures()
                    this.getMemberships()
                })
        }
        else {
            this.setState(
                prevState => ({LOADING_CNT: prevState.LOADING_CNT - 2}),
                () => {
                    this.getObject()
                    this.getLectures()
                })
        }
    }

    // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
    componentDidUpdate(prevProps) {
        if (this.getId() !== this.getPrevId(prevProps) || this.isClient() !== this.wasClient(prevProps))
            this.refresh()
    }

    refreshAfterLectureChanges = () => {
        this.refresh(false)
    }

    goBack = () =>
        this.props.history.goBack()

    getMemberships = (id = this.getId()) =>
        GroupService.getAllFromClient(id)
            .then(memberships => this.setState({memberships}, this.loadingStateIncrement))

    getObject = (IS_CLIENT = this.isClient(), id = this.getId()) => {
        let service = (IS_CLIENT ? ClientService : GroupService)
        service.get(id)
            .then(object => this.setState({object}, this.loadingStateIncrement))
    }

    getLectures = (IS_CLIENT = this.isClient(), id = this.getId()) => {
        let request
        if (IS_CLIENT)
            request = LectureService.getAllFromClientOrdered(id, false)
        else
            request = LectureService.getAllFromGroupOrdered(id, false)
        request.then(lectures => {
            const grouppedByCourses = groupByCourses(lectures)
            this.getDefaultCourseSingle(grouppedByCourses)
            this.setState({
                lectures: grouppedByCourses
            }, this.loadingStateIncrement)
        })
    }

    // uprava nadrazeneho objektu (tohoto) po uprave v synovi (prepaid_cnt)
    funcRefreshPrepaidCnt = (id, prepaid_cnt) => {
        this.setState(
            prevState => {
                let success_update_cnt = 0
                const memberships = prevState.object.memberships.map(membership => {
                    if (membership.id === id) {
                        success_update_cnt++
                        return {...membership, prepaid_cnt: prepaid_cnt}
                    } else {
                        return membership
                    }
                })
                if (success_update_cnt !== 1)
                    throw new Error("Nepodařilo se správně aktualizovat počet předplacených lekcí v nadřazené komponentě")
                return ({
                    object: {...prevState.object, memberships},
                    LOADING_CNT: prevState.LOADING_CNT - 1
                })
            },
            this.getLectures)
    }

    render() {
        const {object, lectures, defaultCourse, memberships, LOADING_CNT} = this.state
        const ClientInfo = () =>
            <ListGroup>
                {this.isClient() &&
                <Fragment>
                    <ListGroupItem>
                        <b>Telefon:</b> <Phone phone={object.phone}/>
                    </ListGroupItem>
                    <ListGroupItem>
                        <b>E-mail:</b> <Email email={object.email}/>
                    </ListGroupItem>
                    <ListGroupItem>
                        <b>Skupiny:</b> <GroupsList groups={memberships}/>
                    </ListGroupItem>
                    <ListGroupItem>
                        <b>Poznámka:</b> <Note note={object.note}/>
                    </ListGroupItem>
                </Fragment>}
            </ListGroup>
        const CourseLectures = ({courseLectures}) =>
            <Fragment>
                {courseLectures.map(lecture => {
                    const d = new Date(lecture.start)
                    let className = lecture.canceled ? "lecture-canceled" : ""
                    if (d > Date.now())
                        className += " lecture-future"
                    if (lecture.start === null)
                        className += " lecture-prepaid"
                    return (
                        <ListGroupItem key={lecture.id} className={className + " lecture"} data-qa="lecture">
                            <h4>
                                <span data-qa="lecture_start" title={courseDuration(lecture.duration)}>
                                {lecture.start !== null ?
                                    (prettyDateWithDayYear(d) + " – " + prettyTime(d))
                                    :
                                    "Předplacená lekce"}
                                </span>
                                {' '}
                                <LectureNumber lecture={lecture}/>
                                <div className="float-right">
                                    <ModalLectures IS_CLIENT={this.isClient()} object={object} currentLecture={lecture}
                                                   refresh={this.refreshAfterLectureChanges}/>
                                </div>
                            </h4>
                            <Attendances lecture={lecture} funcRefresh={this.refreshAfterLectureChanges}
                                         showClient={!this.isClient()}/>
                        </ListGroupItem>)
                })}
            </Fragment>
        const AllLectures = () =>
            <Fragment>
                {lectures.map(courseLectures =>
                    <Col key={courseLectures.course} sm="9" md="7" lg="5" xl="3" data-qa="card_course">
                        <h4 className="text-center" data-qa="card_course_name">
                            {courseLectures.course}
                        </h4>
                        <ListGroup>
                            <CourseLectures courseLectures={courseLectures.values}/>
                        </ListGroup>
                    </Col>)}
                {!Boolean(lectures.length) &&
                <p className="text-muted text-center">
                    Žádné lekce
                </p>}
            </Fragment>
        const HeadingContent = () =>
            <Fragment>
                <BackButton onClick={this.goBack}/>
                {' '}
                {"Karta " + (this.isClient() ? "klienta" : "skupiny")}:
                {' '}
                <span className="font-weight-bold">
                    {this.isClient() ?
                        <ClientName client={object}/>
                        :
                        <GroupName group={object}/>}
                </span>
                <ModalLectures defaultCourse={defaultCourse} IS_CLIENT={this.isClient()}
                               object={object} refresh={this.refreshAfterLectureChanges}/>
                {this.isClient() &&
                <ModalClients currentClient={object} refresh={this.refreshObject}/>}
                {!this.isClient() &&
                <ModalGroups currentGroup={object} refresh={this.refreshObject}/>}
            </Fragment>
        const CardContent = () =>
            <div className="pageContent">
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col sm="9" md="7" lg="5" xl="3">
                            <ClientInfo/>
                        </Col>
                    </Row>
                    {!this.isClient() &&
                    <PrepaidCounters memberships={object.memberships}
                                     funcRefreshPrepaidCnt={this.funcRefreshPrepaidCnt}/>}
                    <br/>
                    <Row className="justify-content-center">
                        <AllLectures/>
                    </Row>
                </Container>
            </div>
        return (
            <Fragment>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                </Container>
                {LOADING_CNT === 3 ?
                    <CardContent/> :
                    <Loading/>}
            </Fragment>
        )
    }
}
