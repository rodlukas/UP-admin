import React, {Component} from "react"
import {Container, Row, Col, Button} from 'reactstrap'
import DashboardDay from '../components/DashboardDay'
import {prettyDate} from "../global/funcDateTime"
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {faArrowAltCircleRight, faArrowAltCircleLeft} from "@fortawesome/fontawesome-pro-solid"
import AttendanceStateService from "../api/services/attendancestate"

const WORK_DAYS_COUNT = 5
const DAYS_PER_WEEK = 7

export default class Diary extends Component {
    constructor(props) {
        super(props)
        this.titlePart = "Týden "
        this.thisMonday = Diary.getMonday(new Date())
        this.state = this.getNewState(this.thisMonday)
        this.state['attendancestates'] = []
    }

    getNewState(monday) {
        const week = Diary.getWeekArray(monday)
        return {
            week: week,
            title: this.titlePart + prettyDate(monday) + " - " + prettyDate(week[4]),
            nextMonday: Diary.addDays(monday, DAYS_PER_WEEK),
            prevMonday: Diary.addDays(monday, -DAYS_PER_WEEK)
        }
    }

    getAttendanceStates = () => {
        AttendanceStateService
            .getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    static getWeekArray(monday) { // priprav pole datumu pracovnich dnu v prislusnem tydnu
        let result = []
        let endDate = new Date(monday)
        let workDays = WORK_DAYS_COUNT
        while (workDays > 0) {
            result.push(new Date(endDate))
            endDate.setDate(endDate.getDate() + 1)
            workDays--
        }
        return result
    }

    static getMonday(date) { // zjisti datum nejblizsiho pondeli predchazejici datumu (pripadne tentyz datum pokud uz pondeli je)
        let res = new Date(date)
        res.setDate(res.getDate() + 1 - (res.getDay() || 7))
        return res
    }

    static addDays(date, days) {
        let res = new Date(date)
        res.setDate(res.getDate() + days)
        return res
    }

    changeDate = (monday) => {
        this.setState(this.getNewState(monday))
    }

    render() {
        const {attendancestates, week} = this.state
        // je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md
        return (
            <div>
                <h1 className="text-center mb-4">
                    <FontAwesomeIcon icon={faArrowAltCircleLeft} className="arrowBtn text-muted"
                                     onClick={() => this.changeDate(this.state.prevMonday)}/>
                    {" " + this.state.title + " "}
                    <FontAwesomeIcon icon={faArrowAltCircleRight} className="arrowBtn text-muted"
                                     onClick={() => this.changeDate(this.state.nextMonday)}/>{' '}
                    <Button color="secondary" onClick={() => this.changeDate(this.thisMonday)}>Dnes</Button>
                </h1>
                <Container fluid>
                    <Row>
                    {week.map(day =>
                        <Col key={day} sm="12" md="6" lg="">
                            <DashboardDay date={day.toString()} attendancestates={attendancestates}/>
                        </Col>)}
                    </Row>
                </Container>
            </div>
        )
    }
}
