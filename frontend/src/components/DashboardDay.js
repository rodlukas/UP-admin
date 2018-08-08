import React, {Component, Fragment} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading} from "reactstrap"
import {prettyDateWithLongDayYearIfDiff, toISODate, prettyTime, isToday} from "../global/funcDateTime"
import LectureNumber from "./LectureNumber"
import LectureService from "../api/services/lecture"
import Loading from "../api/Loading"
import GroupName from "./GroupName"
import CourseName from "./CourseName"
import Attendances from "./Attendances"
import "./DashboardDay.css"

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            IS_LOADING: true
        }
        this.date = new Date(props.date)
    }

    getLectures = () => {
        LectureService.getAllFromDayOrdered(toISODate(this.date), true)
            .then(lectures => this.setState({
                lectures,
                IS_LOADING: false
            }))
    }

    componentDidMount() {
        this.getLectures()
    }

    componentDidUpdate() {
        if (this.props.shouldRefresh)
            this.getLectures()
    }

    render() {
        const {lectures, IS_LOADING} = this.state
        const title = prettyDateWithLongDayYearIfDiff(this.date)
        const Lecture = ({lecture}) =>
            <ListGroupItem className={lecture.group && "LectureGroup"}>
                <h4>
                    {prettyTime(new Date(lecture.start))}
                    {' '}
                    <CourseName course={lecture.course}/>
                    {' '}
                    <LectureNumber number={lecture.attendances[0].count}/>
                </h4>
                {lecture.group &&
                <h5>
                    <GroupName group={lecture.group} title link/>
                </h5>}
                <Attendances attendancestates={this.props.attendancestates} lecture={lecture}
                             funcRefresh={this.props.setRefreshState || this.getLectures} showClient/>
            </ListGroupItem>
        const EmptyLecture = () =>
            <ListGroupItem>
                <ListGroupItemHeading className="text-muted text-center">
                    Volno
                </ListGroupItemHeading>
            </ListGroupItem>
        const Lectures = () =>
            <Fragment>
                {Boolean(lectures.length) ?
                    lectures.map(lecture => <Lecture lecture={lecture} key={lecture.id}/>)
                    :
                    <EmptyLecture/>}
            </Fragment>
        const DayLoading = () =>
            <ListGroupItem>
                <Loading/>
            </ListGroupItem>
        return (
            <ListGroup>
                <ListGroupItem color={isToday(this.date) ? "primary" : ''}>
                    <h4 className="text-center">{title}</h4>
                </ListGroupItem>
                {IS_LOADING ?
                    <DayLoading/>
                    :
                    <Lectures/>}
            </ListGroup>
        )
    }
}
