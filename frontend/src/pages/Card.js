import React, {Component} from "react"
import {Container, Row, Col, Badge, Button, Modal, ListGroup, ListGroupItem, ListGroupItemHeading, UncontrolledTooltip} from 'reactstrap'
import FormLectures from "../forms/FormLectures"
import {prettyTime, prettyDateWithYear} from "../global/funcDateTime"
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
import {Link} from 'react-router-dom'

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

    getMemberships = (id = this.state.id) => {
        GroupService
            .getAllFromClient(id)
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
        const {object, attendancestates, lectures, currentLecture, memberships, CLIENT} = this.state
        const NoInfo = () => <span className="text-muted">---</span>
        const Phone = ({phone}) => {
            if (phone !== "")
                return <a href={'tel:' + phone}>{phone}</a>
            else
                return <NoInfo/>
        }
        const Email = ({email}) => {
            if (email !== "")
                return <a href={'mailto:' + email}>{email}</a>
            else
                return <NoInfo/>
        }
        const Note = ({note}) => {
            if (note !== "")
                return <span>{note}</span>
            else
                return <NoInfo/>
        }
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        <Button color="secondary" className="nextBtn" onClick={this.goBack}>Jít zpět</Button>{' '}
                        {this.title + (CLIENT ? "klienta" : "skupiny")}: {CLIENT ? <ClientName name={object.name} surname={object.surname}/> : object.name}
                        <Button color="info" className="addBtn" onClick={() => this.toggle()}>Přidat lekci</Button>
                    </h1>
                </Container>
                <Container>
                    <Row className="justify-content-center">
                        <Col sm="6">
                                <ListGroup>
                                    {CLIENT &&
                                    <div>
                                        <ListGroupItem>Telefon: <Phone phone={object.phone}/></ListGroupItem>
                                        <ListGroupItem>E-mail: <Email email={object.email}/></ListGroupItem>
                                            <ListGroupItem>Členství ve skupinách:{' '}
                                                {!Boolean(memberships.length) && <NoInfo/>}
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
                                            </ListGroupItem>
                                        <ListGroupItem>Poznámka: <Note note={object.note}/></ListGroupItem>
                                    </div>}
                                    {!CLIENT &&
                                    <ListGroupItem>
                                        Členové: <ClientsList clients={object.memberships}/>
                                    </ListGroupItem>}
                                </ListGroup>
                        </Col>
                    </Row>
                </Container>
                <br/>
                <Container>
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
                                                    {!CLIENT && <ClientName name={attendance.client.name} surname={attendance.client.surname}/>}{' '}
                                                    <PaidButton paid={attendance.paid}
                                                                attendanceId={attendance.id}
                                                                funcRefresh={this.getLectures}/>{' '}
                                                    <Badge color="info" pill>{attendance.note}</Badge>{' '}
                                                    <RemindPay remind_pay={attendance.remind_pay}/>
                                                    <SelectAttendanceState value={attendance.attendancestate.id}
                                                                           attendanceId={attendance.id}
                                                                           attendancestates={attendancestates}
                                                                           funcRefresh={this.getLectures}/>
                                                </div>)}
                                            <Button color="primary" onClick={() => this.toggle(lectureVal)}>Upravit</Button>
                                        </ListGroupItem>)})}
                                </ListGroup>
                            </div>
                        </Col>)}
                        {!Boolean(lectures.length) &&
                        <p className="text-muted text-center">
                            Žádné lekce
                        </p>}
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} size="xl" autoFocus={false}>
                    <FormLectures lecture={currentLecture} object={object} funcClose={this.toggle} CLIENT={CLIENT}
                                  funcRefresh={this.getLectures} attendancestates={attendancestates}/>
                </Modal>
            </div>
        )
    }
}
