import React, {Component, Fragment} from "react"
import {Container, Row, Col, Badge, Button, Modal, ListGroup, ListGroupItem, UncontrolledTooltip} from "reactstrap"
import FormLectures from "../forms/FormLectures"
import {prettyTime, prettyDateWithDayYear} from "../global/funcDateTime"
import PaidButton from "../components/PaidButton"
import SelectAttendanceState from "../components/SelectAttendanceState"
import RemindPay from "../components/RemindPay"
import LectureNumber from "../components/LectureNumber"
import AttendanceStateService from "../api/services/attendancestate"
import GroupService from "../api/services/group"
import ClientService from "../api/services/client"
import LectureService from "../api/services/lecture"
import APP_URLS from "../urls"
import ClientsList from "../components/ClientsList"
import ClientName from "../components/ClientName"
import {Link} from "react-router-dom"
import Loading from "../api/Loading"
import "./Card.css"

export default class Card extends Component {
    state = {
        id: this.props.match.params.id,
        IS_CLIENT: this.props.match.path.includes(APP_URLS.klienti),
        object: {},
        IS_MODAL: false,
        currentLecture: {},
        lectures: [],
        attendancestates: [],
        memberships: [],
        IS_LOADING: true
    }

    componentDidMount() {
        this.getObject()
        this.getLectures()
        this.getAttendanceStates()
        if (this.state.IS_CLIENT)
            this.getMemberships()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.id !== prevState.id || this.state.IS_CLIENT !== prevState.IS_CLIENT) {
            this.getObject()
            this.getLectures()
            if (this.state.IS_CLIENT)
                this.getMemberships()
        }
    }

    // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
    static getDerivedStateFromProps(props, state) {
        const IS_CLIENT = props.match.path.includes(APP_URLS.klienti)
        const id = props.match.params.id
        if (state.IS_CLIENT !== IS_CLIENT || state.id !== id) {
            return {
                id: id,
                IS_CLIENT: IS_CLIENT,
                memberships: [],
                IS_LOADING: true
            }
        }
        return null
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    getMemberships = (id = this.state.id) => {
        GroupService.getAllFromClient(id)
            .then((response) => {
                this.setState({memberships: response})
            })
    }

    toggle = (lecture = {}) => {
        this.setState({
            currentLecture: lecture,
            IS_MODAL: !this.state.IS_MODAL
        })
    }

    goBack = () => {
        this.props.history.goBack()
    }

    getObject = (IS_CLIENT = this.state.IS_CLIENT, id = this.state.id) => {
        let service = (IS_CLIENT ? ClientService : GroupService)
        service.get(id)
            .then((response) => {
                this.setState({object: response})
            })
    }

    getLectures = (IS_CLIENT = this.state.IS_CLIENT, id = this.state.id) => {
        let request
        if (IS_CLIENT)
            request = LectureService.getAllFromClientOrdered(id, false)
        else
            request = LectureService.getAllFromGroupOrdered(id, false)
        request.then((response) => { // groupby courses
            let group_to_values = response.reduce(function (obj, item) {
                obj[item.course.name] = obj[item.course.name] || []
                obj[item.course.name].push(item)
                return obj
            }, {})
            let groups = Object.keys(group_to_values).map(function (key) {
                return {course: key, values: group_to_values[key]}
            })
            groups.sort(function (a, b) { // serad podle abecedy
                if (a.course < b.course) return -1
                if (a.course > b.course) return 1
                return 0
            })
            this.setState({lectures: groups, IS_LOADING: false})
        })
    }

    render() {
        const {object, attendancestates, lectures, currentLecture, memberships, IS_CLIENT, IS_LOADING, IS_MODAL} = this.state
        const NoInfo = () => <span className="text-muted">---</span>
        const Phone = ({phone}) => {
            if (phone !== "")
                return <a href={'tel:' + phone}>{phone}</a>
            return <NoInfo/>
        }
        const Email = ({email}) => {
            if (email !== "")
                return <a href={'mailto:' + email}>{email}</a>
            return <NoInfo/>
        }
        const Note = ({note}) => {
            if (note !== "")
                return <span>{note}</span>
            return <NoInfo/>
        }
        const CardContent = () =>
            <Fragment>
                <Container>
                    <h1 className="text-center mb-4">
                        <Button color="secondary" className="nextBtn" onClick={this.goBack}>
                            Jít zpět
                        </Button>
                        {' '}
                        {"Karta " + (IS_CLIENT ? "klienta" : "skupiny")}:
                        {' '}
                        {IS_CLIENT ?
                            <ClientName name={object.name} surname={object.surname}/>
                            :
                            object.name}
                        <Button color="info" className="addBtn" onClick={() => this.toggle()}>
                            Přidat lekci
                        </Button>
                    </h1>
                </Container>
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col sm="9" md="7" lg="5" xl="3">
                            <ListGroup>
                                {IS_CLIENT &&
                                <div>
                                    <ListGroupItem>
                                        <b>Telefon:</b>
                                        {' '}
                                        <Phone phone={object.phone}/>
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        <b>E-mail:</b>
                                        {' '}
                                        <Email email={object.email}/>
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        <b>Členství ve skupinách:</b>
                                        {' '}
                                        {!Boolean(memberships.length) &&
                                        <NoInfo/>}
                                        {memberships.map(membership =>
                                            <span key={membership.id}>
                                                <Link to={APP_URLS.skupiny + "/" + membership.id}
                                                      id={"group" + membership.id}>
                                                    <span>{membership.name}</span>
                                                </Link>
                                                <UncontrolledTooltip placement="right"
                                                                     target={"group" + membership.id}>
                                                otevřít kartu
                                                </UncontrolledTooltip>
                                            </span>
                                        ).reduce((accu, elem) => {
                                            return accu === null ? [elem] : [...accu, ', ', elem]
                                        }, null)}
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        <b>Poznámka:</b>
                                        {' '}
                                        <Note note={object.note}/>
                                    </ListGroupItem>
                                </div>}
                                {!IS_CLIENT &&
                                <ListGroupItem>
                                    Členové: <ClientsList clients={object.memberships}/>
                                </ListGroupItem>}
                            </ListGroup>
                        </Col>
                    </Row>
                </Container>
                <br/>
                <Container fluid>
                    <Row className="justify-content-center">
                        {lectures.map(lecture =>
                            <Col key={lecture.course} sm="9" md="7" lg="5" xl="3">
                                <h4 className="text-center">
                                    {lecture.course}
                                </h4>
                                <ListGroup>
                                    {lecture.values.map(lectureVal => {
                                        const d = new Date(lectureVal.start)
                                        let className = lectureVal.canceled ? "lecture-canceled" : ""
                                        if (d > Date.now())
                                            className += " lecture-future"
                                        if (lectureVal.start === null)
                                            className += " lecture-prepaid"
                                        return (
                                            <ListGroupItem key={lectureVal.id} className={className}>
                                                <h4>
                                                    {lectureVal.start !== null ?
                                                        (prettyDateWithDayYear(d) + " – " + prettyTime(d))
                                                        :
                                                        "Předplacená lekce"}{' '}
                                                    <LectureNumber number={lectureVal.attendances[0].count}/>
                                                    <Button color="primary" className="float-right"
                                                            onClick={() => this.toggle(lectureVal)}>Upravit</Button>
                                                </h4>
                                                <ul className={"list-clients " + (lecture.group && "list-clientsGroup")}>
                                                    {lectureVal.attendances.map(attendance =>
                                                        <li key={attendance.id}>
                                                            {!IS_CLIENT &&
                                                            <ClientName name={attendance.client.name}
                                                                       surname={attendance.client.surname}/>}{' '}
                                                            <PaidButton paid={attendance.paid}
                                                                        attendanceId={attendance.id}
                                                                        funcRefresh={this.getLectures}/>{' '}
                                                            <RemindPay remind_pay={attendance.remind_pay}/>{' '}
                                                            <Badge color="info">{attendance.note}</Badge>
                                                            <SelectAttendanceState
                                                                value={attendance.attendancestate.id}
                                                                attendanceId={attendance.id}
                                                                attendancestates={attendancestates}
                                                                funcRefresh={this.getLectures}/>
                                                        </li>)}
                                                </ul>
                                            </ListGroupItem>)
                                    })}
                                </ListGroup>
                            </Col>)}
                        {!Boolean(lectures.length) &&
                        <p className="text-muted text-center">
                            Žádné lekce
                        </p>}
                    </Row>
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} size="lg" autoFocus={false} className="ModalFormLecture">
                    <FormLectures lecture={currentLecture} object={object} funcClose={this.toggle} IS_CLIENT={IS_CLIENT}
                                  funcRefresh={this.getLectures} attendancestates={attendancestates}/>
                </Modal>
            </Fragment>
        return (
            <Fragment>
                {!IS_LOADING ?
                    <CardContent/> :
                    <Loading/>}
            </Fragment>
        )
    }
}
