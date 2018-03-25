import React, {Component} from "react"
import {Container, Row, Col, Badge, Button, Modal, ListGroup, ListGroupItem, ListGroupItemHeading, UncontrolledTooltip, Card} from 'reactstrap'
import FormLectures from "../forms/FormLectures"
import {prettyTime, prettyDateWithYear} from "../global/funcDateTime"
import PaidButton from "../components/PaidButton"
import SelectAttendanceState from "../components/SelectAttendanceState"
import RemindPay from "../components/RemindPay"
import {Link} from 'react-router-dom'
import LectureNumber from "../components/LectureNumber"
import AttendanceStateService from "../api/services/attendancestate"
import GroupService from "../api/services/group"
import ClientService from "../api/services/client"
import LectureService from "../api/services/lecture"
import APP_URLS from "../urls"

export default class ClientView extends Component {
    constructor(props) {
        super(props)
        this.title = "Karta "
        this.state = {
            id: props.match.params.id,
            CLIENT: props.match.path.includes(APP_URLS.klienti),
            object: {},
            modal: false,
            currentLecture: {},
            lectures: [],
            attendancestates: [],
            memberships: []
        }
    }

    componentWillReceiveProps(nextProps) { // pro prechazeni napr. mezi klientem a skupinou (napr. pri kliknuti na skupinu v karte klienta)
        const CLIENT = nextProps.match.path.includes(APP_URLS.klienti)
        const id = nextProps.match.params.id
        if(this.state.CLIENT !== CLIENT || this.state.id !== id)
        {
            this.setState({
                id: id,
                CLIENT: CLIENT,
                memberships: []
            })
            this.getObject(CLIENT, id)
            this.getLectures(CLIENT, id)
            if (CLIENT)
                this.getMemberships(id)
        }
    }

    getAttendanceStates = () => {
        AttendanceStateService
            .getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    getMemberships = () => {
        GroupService
            .getAllFromClient(this.state.id)
            .then((response) => {
                this.setState({memberships: response})
            })
    }

    toggle = (lecture = {}) => {
        this.setState({
            currentLecture: lecture,
            modal: !this.state.modal
        })
    }

    goBack = () => {
        this.props.history.goBack()
    }

    getObject = (CLIENT = this.state.CLIENT, id = this.state.id) => {
        let service = (CLIENT ? ClientService : GroupService)
        service.get(id)
            .then((response) => {
                this.setState({object: response})
            })
    }

    getLectures = (CLIENT = this.state.CLIENT, id = this.state.id) => {
        let request
        if (CLIENT)
            request = LectureService.getAllFromClientOrdered(id, false)
        else
            request = LectureService.getAllFromGroupOrdered(id, false)
        request.then((response) => { // groupby courses
            let group_to_values = response.reduce(function (obj, item) {
                obj[item.course.name] = obj[item.course.name] || []
                obj[item.course.name].push(item)
                return obj}, {})
            let groups = Object.keys(group_to_values).map(function (key) {
                return {course: key, values: group_to_values[key]}
            })
            groups.sort(function (a, b) { // serad podle abecedy
                if (a.course < b.course) return -1
                if (a.course > b.course) return 1
                return 0
            })
            this.setState({lectures: groups})
        })
    }

    componentDidMount() {
        this.getObject()
        this.getLectures()
        this.getAttendanceStates()
        if (this.state.CLIENT)
            this.getMemberships()
    }

    render() {
        const ClientName = ({name, surname}) => <span>{name} {surname}</span>
        const ClientsList = ({clients = {}}) => {
            return (
                <span>
                    {clients.length ?
                        clients.map(membership =>
                            <span key={membership.client.id}>
                                <Link to={"/klienti/" + membership.client.id} id={"client" + membership.client.id}>
                                    <ClientName name={membership.client.name}
                                                surname={membership.client.surname}/>
                                </Link>
                                <UncontrolledTooltip placement="right" target={"client" + membership.client.id}>
                                    otevřít kartu
                                </UncontrolledTooltip>
                            </span>).reduce((accu, elem) => {
                                        return accu === null ? [elem] : [...accu, ', ', elem]}, null)
                        :
                        <span className="text-muted">žádní členové</span>}
                </span>)}
        const {object, attendancestates, lectures, currentLecture, memberships, CLIENT} = this.state
        return (
            <div>
                <h1 className="text-center mb-4">{this.title + (CLIENT ? "klienta" : "skupiny")}: {CLIENT ? <ClientName name={object.name} surname={object.surname}/> : object.name}</h1>
                <Button color="secondary" onClick={this.goBack}>Jít zpět</Button>{' '}
                <Button color="info" onClick={() => this.toggle()}>Přidat lekci</Button>
                <Card>
                    {CLIENT &&
                    <ul>
                        <li>Telefon: <a href={'tel:' + object.phone}>{object.phone}</a></li>
                        <li>E-mail: <a href={'mailto:' + object.email}>{object.email}</a></li>
                        <li>
                            {Boolean(memberships.length) && "Členství ve skupinách: "}
                            {memberships.map(membership =>
                                <span key={membership.id}>
                                <Link to={"/skupiny/" + membership.id} id={"group" + membership.id}>
                                    <span>{membership.name}</span>
                                </Link>
                                <UncontrolledTooltip placement="right" target={"group" + membership.id}>
                                otevřít kartu
                                </UncontrolledTooltip>
                            </span>).reduce((accu, elem) => {
                                        return accu === null ? [elem] : [...accu, ', ', elem]
                                    }, null)}
                        </li>
                        <li>Poznámka: {object.note}</li>
                    </ul>}
                    {console.log(object)}
                    {!CLIENT &&
                    <div>
                        Členové: <ClientsList clients={object.memberships}/>
                    </div>}
                </Card>

                <Container fluid={true}>
                    <Row>
                    {lectures.map(lecture =>
                        <Col key={lecture.course}>
                            <div>
                                <h4 className="text-center">{lecture.course}</h4>
                                <ListGroup>
                                {lecture.values.map(lectureVal => {
                                    const d = new Date(lectureVal.start)
                                    return (
                                        <ListGroupItem key={lectureVal.id}>
                                            <ListGroupItemHeading>
                                            {lectureVal.start !== null ?
                                                (prettyDateWithYear(d) + " - " + prettyTime(d))
                                                :
                                                "Předplacená lekce"}{' '}
                                                <LectureNumber number={lectureVal.attendances[0].count}/>
                                            </ListGroupItemHeading>{' '}
                                            {lectureVal.attendances.map(attendance =>
                                                <div key={attendance.id}>
                                                    <span>{(!CLIENT && (attendance.client.name + " " + attendance.client.surname))}</span>{' '}
                                                    <PaidButton paid={attendance.paid} attendanceId={attendance.id}
                                                                funcRefresh={this.getLectures}/>{' '}
                                                    <Badge color="info" pill>{attendance.note}</Badge>{' '}
                                                    <RemindPay remind_pay={attendance.remind_pay}/>
                                                    <SelectAttendanceState value={attendance.attendancestate.id} attendanceId={attendance.id}
                                                                attendancestates={attendancestates}
                                                                funcRefresh={this.getLectures}/>
                                                </div>)}
                                            <Button color="primary" onClick={() => this.toggle(lectureVal)}>Upravit</Button>
                                        </ListGroupItem>)
                                })}
                                </ListGroup>
                            </div>
                        </Col>)}
                        {!Boolean(lectures.length) &&
                        <p className="text-muted text-center">
                            Žádné lekce
                        </p>}
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} size="xl">
                    <FormLectures lecture={currentLecture} object={object} funcClose={this.toggle} CLIENT={CLIENT}
                                  funcRefresh={this.getLectures} attendancestates={attendancestates}/>
                </Modal>
            </div>
        )
    }
}
