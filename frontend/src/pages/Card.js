import React, {Component} from "react"
import {Container, Row, Col, Badge, Button, Modal, ListGroup, ListGroupItem, ListGroupItemHeading} from 'reactstrap'
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

export default class ClientView extends Component {
    constructor(props) {
        super(props)
        this.id = this.props.match.params.id
        this.CLIENT = this.props.match.path.includes(APP_URLS.klienti)
        this.title = "Karta " + (this.CLIENT ? "klienta" : "skupiny")
        this.state = {
            object: {},
            modal: false,
            currentLecture: {},
            lectures: [],
            attendancestates: []
        }
    }

    getAttendanceStates = () => {
        AttendanceStateService
            .getAll()
            .then((response) => {
                this.setState({attendancestates: response})
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

    getObject = () => {
        let service = (this.CLIENT ? ClientService : GroupService)
        service.get(this.id)
            .then((response) => {
                this.setState({object: response})
            })
    }

    getLectures = () => {
        let request
        if (this.CLIENT)
            request = LectureService.getAllFromClientOrdered(this.id, false)
        else
            request = LectureService.getAllFromGroupOrdered(this.id, false)
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
    }

    render() {
        const {object, attendancestates, lectures, currentLecture} = this.state
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}: {this.CLIENT ? (object.name + " " + object.surname) : object.name}</h1>
                <Button color="secondary" onClick={this.goBack}>Jít zpět</Button>{' '}
                <Button color="info" onClick={() => this.toggle()}>Přidat lekci</Button>
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
                                                    <span>{(!this.CLIENT && (attendance.client.name + " " + attendance.client.surname))}</span>{' '}
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
                    <FormLectures lecture={currentLecture} object={object} funcClose={this.toggle} CLIENT={this.CLIENT}
                                  funcRefresh={this.getLectures} attendancestates={attendancestates}/>
                </Modal>
            </div>
        )
    }
}
