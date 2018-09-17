import React, {Component, Fragment} from "react"
import {Container, Row, Col, Modal, ListGroup, ListGroupItem} from "reactstrap"
import FormLectures from "../forms/FormLectures"
import {prettyTime, prettyDateWithDayYear} from "../global/funcDateTime"
import LectureNumber from "../components/LectureNumber"
import GroupService from "../api/services/group"
import ClientService from "../api/services/client"
import LectureService from "../api/services/lecture"
import APP_URLS from "../urls"
import ClientName from "../components/ClientName"
import Loading from "../components/Loading"
import "./Card.css"
import GroupName from "../components/GroupName"
import Attendances from "../components/Attendances"
import BackButton from "../components/buttons/BackButton"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import GroupsList from "../components/GroupsList"
import Email from "../components/Email"
import Phone from "../components/Phone"
import Note from "../components/Note"
import Heading from "../components/Heading"
import {groupByCourses} from "../global/utils"
import PrepaidCounters from "../components/PrepaidCounters"

export default class Card extends Component {
    state = {
        object: {},
        IS_MODAL: false,
        currentLecture: {},
        lectures: [],
        memberships: [],
        IS_LOADING: true,
        defaultCourse: null // pro FormLecture, aby se vybral velmi pravdepodobny kurz pri pridavani lekce
    }

    getId = () =>
        this.props.match.params.id
    getPrevId = (prevProps) =>
        prevProps.match.params.id
    isClient = () =>
        this.props.match.path.includes(APP_URLS.klienti)
    wasClient = (prevProps) =>
        prevProps.match.path.includes(APP_URLS.klienti)

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

    // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
    componentDidUpdate(prevProps) {
        if (this.getId() !== this.getPrevId(prevProps) || this.isClient() !== this.wasClient(prevProps)) {
            this.setState({IS_LOADING: true})
            this.getObject()
            this.getLectures()
            if (this.isClient())
                this.getMemberships()
        }
    }

    refreshAfterLectureChanges = () => {
        this.getObject()
        this.getLectures()
    }

    toggle = (lecture = {}) =>
        this.setState({
            currentLecture: lecture,
            IS_MODAL: !this.state.IS_MODAL
        })

    goBack = () =>
        this.props.history.goBack()

    getMemberships = (id = this.getId()) =>
        GroupService.getAllFromClient(id)
            .then(memberships => this.setState({memberships}))

    getObject = (IS_CLIENT = this.isClient(), id = this.getId()) => {
        let service = (IS_CLIENT ? ClientService : GroupService)
        service.get(id)
            .then(object => this.setState({object}))
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
                lectures: grouppedByCourses,
                IS_LOADING: false
            })
        })
    }

    // uprava nadrazeneho objektu po uprave prepaid_cnt
    funcRefreshPrepaidCnt = (id, prepaid_cnt) => {
        const object = this.state.object
        // najdi membership s danym id
        const elemId = object.memberships.findIndex(elem => elem.id === Number(id))
        if(elemId !== -1)
            object.memberships[elemId].prepaid_cnt = Number(prepaid_cnt)
        else
            throw new Error("Nepodařilo se správně aktualizovat počet předplacených lekcí v nadřazené komponentě")
        this.setState({object})
        this.getLectures()
    }

    render() {
        const {object, lectures, defaultCourse, currentLecture, memberships, IS_LOADING, IS_MODAL} = this.state
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
                        <b>Členství ve skupinách:</b> <GroupsList groups={memberships}/>
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
                        <ListGroupItem key={lecture.id} className={className}>
                            <h4>
                                {lecture.start !== null ?
                                    (prettyDateWithDayYear(d) + " – " + prettyTime(d))
                                    :
                                    "Předplacená lekce"}
                                {' '}
                                <LectureNumber lecture={lecture}/>
                                <div className="float-right">
                                    <EditButton onClick={() => this.toggle(lecture)}/>
                                </div>
                            </h4>
                            <Attendances lecture={lecture} funcRefresh={this.refreshAfterLectureChanges} showClient={!this.isClient()}/>
                        </ListGroupItem>)})}
            </Fragment>
        const AllLectures = () =>
            <Fragment>
                {lectures.map(courseLectures =>
                    <Col key={courseLectures.course} sm="9" md="7" lg="5" xl="3">
                        <h4 className="text-center">
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
                <AddButton content="Přidat lekci" onClick={() => this.toggle()}/>
            </Fragment>
        const CardContent = () =>
            <div className="pageContent">
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col sm="9" md="7" lg="5" xl="3">
                            <ClientInfo/>
                        </Col>
                    </Row>
                </Container>
                {!this.isClient() &&
                <PrepaidCounters memberships={object.memberships} funcRefreshPrepaidCnt={this.funcRefreshPrepaidCnt}/>}
                <br/>
                <Container fluid>
                    <Row className="justify-content-center">
                        <AllLectures/>
                    </Row>
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} size="lg" className="ModalFormLecture">
                    <FormLectures lecture={currentLecture} object={object} funcClose={this.toggle}
                                  IS_CLIENT={this.isClient()} funcRefresh={this.refreshAfterLectureChanges}
                                  defaultCourse={defaultCourse}/>
                </Modal>
            </div>
        return (
            <Fragment>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                </Container>
                {!IS_LOADING ?
                    <CardContent/> :
                    <Loading/>}
            </Fragment>
        )
    }
}
