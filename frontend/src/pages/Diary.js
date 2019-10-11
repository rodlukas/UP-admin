import { faArrowAltCircleLeft, faArrowAltCircleRight } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { Component, Fragment } from "react"
import { Link } from "react-router-dom"
import { Button, Col, Container, Row } from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesFast from "../forms/ModalLecturesFast"
import {
    addDays,
    DAYS_IN_WEEK,
    getMonday,
    getWeekSerializedFromMonday,
    isEqualDate,
    prettyDateWithLongDayYear,
    prettyDateWithYearIfDiff,
    yearDiffs
} from "../global/funcDateTime"
import APP_URLS from "../urls"
import "./Diary.css"

const TitleDate = ({ date }) => (
    <span className={`TitleDate font-weight-bold ${yearDiffs(date) ? "TitleDate-long" : ""}`}>
        {prettyDateWithYearIfDiff(date)}
    </span>
)

export default class Diary extends Component {
    getRequiredMonday = () => getMonday(Diary.parseDateFromParams(this.props.match.params))
    getWeek = () => getWeekSerializedFromMonday(this.getRequiredMonday())

    state = {
        shouldRefresh: false,
        week: this.getWeek()
    }

    getFridayDate = () => new Date(this.state.week[4])
    getNextMondaySerialized = () =>
        Diary.serializeDateUrl(addDays(this.getRequiredMonday(), DAYS_IN_WEEK))
    getPrevMondaySerialized = () =>
        Diary.serializeDateUrl(addDays(this.getRequiredMonday(), -DAYS_IN_WEEK))
    getCurrentMonday = () => getMonday(new Date())
    getCurrentMondaySerialized = () => Diary.serializeDateUrl(this.getCurrentMonday())

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown)
    }

    componentDidUpdate(prevProps, prevState) {
        // pokud se datum ktery pozadujeme shoduje s tim ve stavu, nic neupdatuj
        if (isEqualDate(new Date(prevState.week[0]), this.getRequiredMonday())) return
        // pozadujeme jiny datum, nez jsme meli ve stavu
        if (
            this.props.match.params.year !== prevProps.match.params.year ||
            this.props.match.params.month !== prevProps.match.params.month ||
            this.props.match.params.day !== prevProps.match.params.day
        )
            this.setState({ week: this.getWeek() }, this.setRefreshState)
    }

    onKeyDown = e => {
        const key = e.key
        if (key === "ArrowLeft") this.props.history.push(this.getPrevMondaySerialized())
        else if (key === "ArrowRight") this.props.history.push(this.getNextMondaySerialized())
    }

    static parseDateFromParams(params) {
        if (params.month != null && params.year != null && params.day != null)
            return new Date(params.year, params.month - 1, params.day)
        else return new Date()
    }

    static serializeDateUrl(date) {
        return `${APP_URLS.diar.url}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    }

    // aby po kliknuti nezustal focus na tlacitku (nedaji se pak pouzivat klavesove sipky)
    removeFocusAfterClick = e => {
        e.target.blur()
    }

    setRefreshState = () =>
        this.setState({ shouldRefresh: true }, () => this.setState({ shouldRefresh: false }))

    render() {
        // je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md
        return (
            <Fragment>
                <Heading
                    content={
                        <Fragment>
                            <Link to={this.getPrevMondaySerialized()} title="Předchozí týden">
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleLeft}
                                    className="arrowBtn text-muted"
                                />
                            </Link>{" "}
                            Týden <TitleDate date={this.getRequiredMonday()} /> –{" "}
                            <TitleDate date={this.getFridayDate()} />{" "}
                            <Link to={this.getNextMondaySerialized()} title="Další týden">
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleRight}
                                    className="arrowBtn text-muted"
                                />
                            </Link>{" "}
                            <Link
                                to={APP_URLS.diar.url}
                                title={prettyDateWithLongDayYear(new Date())}>
                                <Button
                                    color="secondary"
                                    disabled={isEqualDate(
                                        this.getCurrentMonday(),
                                        this.getRequiredMonday()
                                    )}
                                    onClick={e => this.removeFocusAfterClick(e)}
                                    className="float-none align-top">
                                    Dnes
                                </Button>
                            </Link>{" "}
                            <ModalLecturesFast refresh={this.setRefreshState} />
                        </Fragment>
                    }
                />
                <Container fluid className="pageContent">
                    <Row>
                        {this.state.week.map((day, index) => (
                            <Col key={index} md="6" lg="" className="diary-day">
                                <DashboardDay
                                    date={day}
                                    setRefreshState={this.setRefreshState}
                                    shouldRefresh={this.state.shouldRefresh}
                                />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </Fragment>
        )
    }
}
