import React, {Component, Fragment} from "react"
import {Container, Row, Col, Button} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import {prettyDateWithYearIfDiff, isEqualDate, getMonday, addDays, DAYS_IN_WEEK, getWeekSerializedFromMonday} from "../global/funcDateTime"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowAltCircleRight, faArrowAltCircleLeft} from "@fortawesome/pro-solid-svg-icons"
import APP_URLS from "../urls"
import {Link} from "react-router-dom"
import "./Diary.css"
import Heading from "../components/Heading"

export default class Diary extends Component {
    state = {
        shouldRefresh: false
    }

    getWeek = () => getWeekSerializedFromMonday(this.getRequiredMonday())
    getFridayDate = () => new Date(this.getWeek()[4])
    getNextMondaySerialized = () => Diary.serializeDateUrl(addDays(this.getRequiredMonday(), DAYS_IN_WEEK))
    getPrevMondaySerialized = () => Diary.serializeDateUrl(addDays(this.getRequiredMonday(), -DAYS_IN_WEEK))
    getCurrentMonday = () => getMonday(new Date())
    getCurrentMondaySerialized = () => Diary.serializeDateUrl(this.getCurrentMonday())
    getRequiredMonday = () => getMonday(Diary.parseDateFromParams(this.props.match.params))

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown)
    }

    onKeyDown = e => {
        const key = e.key
        if (key === "ArrowLeft")
            this.props.history.push(this.getPrevMondaySerialized())
        else if (key === "ArrowRight")
            this.props.history.push(this.getNextMondaySerialized())
    }

    static parseDateFromParams(params) {
        let date = new Date()
        if (params.month != null && params.year != null && params.day != null)
        {
            date.setDate(params.day)
            date.setMonth(params.month - 1)
            date.setFullYear(params.year)
        }
        return date
    }

    static serializeDateUrl (date) {
        return APP_URLS.diar + "/" + date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
    }

    // aby po kliknuti nezustal focus na tlacitku (nedaji se pak pouzivat klavesove sipky)
    removeFocusAfterClick = e => {
        e.target.blur()
    }

    setRefreshState = () => {
        this.setState({shouldRefresh: true})
        this.setState({shouldRefresh: false})
    }

    render() {
        const TitleDate = ({date}) =>
            <span className="TitleDate">
                {prettyDateWithYearIfDiff(date)}
            </span>
        const Title = () =>
            <Fragment>
                {' '}Týden <TitleDate date={this.getRequiredMonday()}/> – <TitleDate date={this.getFridayDate()}/>{' '}
            </Fragment>
        const HeadingContent = () =>
            <Fragment>
                <Link to={this.getPrevMondaySerialized()}>
                    <FontAwesomeIcon icon={faArrowAltCircleLeft} className="arrowBtn text-muted"/>
                </Link>
                <Title/>
                <Link to={this.getNextMondaySerialized()}>
                    <FontAwesomeIcon icon={faArrowAltCircleRight} className="arrowBtn text-muted"/>
                </Link>
                {' '}
                <Link to={this.getCurrentMondaySerialized()}>
                    <Button color="secondary" disabled={isEqualDate(this.getCurrentMonday(), this.getRequiredMonday())}
                            onClick={e => this.removeFocusAfterClick(e)}>
                        Dnes
                    </Button>
                </Link>
            </Fragment>
        // je dulezite, aby pro .col byl definovany lg="", jinak bude pro >=lg platit hodnota z md
        return (
            <div>
                <Heading content={<HeadingContent/>}/>
                <Container fluid className="pageContent">
                    <Row>
                    {this.getWeek().map(day =>
                        <Col key={day} sm="12" md="6" lg="" className="diary-day">
                            <DashboardDay
                                date={day}
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
