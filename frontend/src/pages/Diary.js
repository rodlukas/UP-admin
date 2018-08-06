import React, {Component, Fragment} from "react"
import {Container, Row, Col, Button} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import {prettyDateWithYearIfDiff, isEqualDate} from "../global/funcDateTime"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowAltCircleRight, faArrowAltCircleLeft} from "@fortawesome/pro-solid-svg-icons"
import AttendanceStateService from "../api/services/attendancestate"
import APP_URLS from "../urls"
import {Link} from "react-router-dom"
import "./Diary.css"
import Heading from "../components/Heading"

const WORK_DAYS_COUNT = 5
const DAYS_PER_WEEK = 7

export default class Diary extends Component {
    constructor(props) {
        super(props)
        this.currentMonday = Diary.getDate(new Date())
        this.state = {
            week: [],
            title: "",
            nextMonday: null,
            prevMonday: null,
            lastParams: null,
            attendancestates: [],
            shouldRefresh: false
        }
    }

    componentDidMount() {
        this.getAttendanceStates()
        document.addEventListener('keydown', this.onKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown)
    }

    onKeyDown = (e) => {
        const key = e.key
        if (key === "ArrowLeft")
            this.props.history.push(Diary.serializeDateUrl(this.state.prevMonday))
        else if (key === "ArrowRight")
            this.props.history.push(Diary.serializeDateUrl(this.state.nextMonday))
    }

    static getDerivedStateFromProps(props, state) {
        if (props.match.params !== state.lastParams)
        {
            const newMonday = Diary.getDate(props.match.params)
            const week = Diary.getWeekArray(newMonday)
            return {
                week: week,
                title: "Týden " + prettyDateWithYearIfDiff(newMonday) + " – " + prettyDateWithYearIfDiff(week[4]),
                nextMonday: Diary.addDays(newMonday, DAYS_PER_WEEK),
                prevMonday: Diary.addDays(newMonday, -DAYS_PER_WEEK),
                lastParams: props.match.params
            }
        }
        return null
    }

    static getDate(params) {
        let getDate = new Date()
        if (params.month == null || params.year == null || params.day == null)
            return Diary.getMonday(getDate)
        getDate.setDate(params.day)
        getDate.setMonth(params.month - 1)
        getDate.setFullYear(params.year)
        return Diary.getMonday(getDate)
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    // priprav pole datumu pracovnich dnu v prislusnem tydnu
    static getWeekArray(monday) {
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

    // zjisti datum nejblizsiho pondeli predchazejici datumu (pripadne tentyz datum pokud uz pondeli je)
    static getMonday(date) {
        let res = new Date(date)
        res.setDate(res.getDate() + 1 - (res.getDay() || 7))
        return res
    }

    static addDays(date, days) {
        let res = new Date(date)
        res.setDate(res.getDate() + days)
        return res
    }

    static serializeDateUrl (date) {
        return APP_URLS.diar + "/" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
    }

    // aby po kliknuti nezustal focus na tlacitku (nedaji se pak pouzivat klavesove sipky)
    removeFocusAfterClick = (e) => {
        e.target.blur()
    }

    setRefreshState = () => {
        this.setState({shouldRefresh: true})
        this.setState({shouldRefresh: false})
    }

    render() {
        const HeadingContent = () =>
            <Fragment>
                <Link to={Diary.serializeDateUrl(this.state.prevMonday)}>
                    <FontAwesomeIcon icon={faArrowAltCircleLeft} className="arrowBtn text-muted"/>
                </Link>
                {" " + this.state.title + " "}
                <Link to={Diary.serializeDateUrl(this.state.nextMonday)}>
                    <FontAwesomeIcon icon={faArrowAltCircleRight} className="arrowBtn text-muted"/>
                </Link>
                {' '}
                <Link to={Diary.serializeDateUrl(this.currentMonday)}>
                    <Button color="secondary" disabled={isEqualDate(this.currentMonday, this.state.week[0])}
                            onClick={(e) => this.removeFocusAfterClick(e)}>
                        Dnes
                    </Button>
                </Link>
            </Fragment>
        // je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md
        return (
            <div>
                <Heading content={<HeadingContent/>}/>
                <Container fluid>
                    <Row>
                    {this.state.week.map(day =>
                        <Col key={day} sm="12" md="6" lg="" className="diary-day">
                            <DashboardDay
                                date={day.toString()}
                                attendancestates={this.state.attendancestates}
                                setRefreshState={this.setRefreshState}
                                shouldRefresh={this.state.shouldRefresh}
                            />
                        </Col>)}
                    </Row>
                </Container>
            </div>
        )
    }
}
