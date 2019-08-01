import React, {Component, Fragment} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading} from "reactstrap"
import LectureService from "../api/services/lecture"
import ModalLectures from "../forms/ModalLectures"
import {isToday, prettyDateWithLongDayYearIfDiff, prettyTime, toISODate} from "../global/funcDateTime"
import {courseDuration} from "../global/utils"
import Attendances from "./Attendances"
import CourseName from "./CourseName"
import "./DashboardDay.css"
import GroupName from "./GroupName"
import LectureNumber from "./LectureNumber"
import Loading from "./Loading"

export default class DashboardDay extends Component {
    state = {
        lectures: [],
        IS_LOADING: true
    }

    getDate = () => new Date(this.props.date)

    getLectures = () => {
        LectureService.getAllFromDayOrdered(toISODate(this.getDate()), true)
            .then(lectures => this.setState({
                lectures,
                IS_LOADING: false
            }))
    }

    getProperRefreshFunc = () => this.props.setRefreshState || this.getLectures

    componentDidMount() {
        if (this.props.withoutWaiting)
            this.getLectures()
        else
            // zpozdeni pro usetreni requestu pri rychlem preklikavani tydnu v diari
            this.timeoutId = setTimeout(this.getLectures, 1000)
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
    }

    componentDidUpdate(prevProps) {
        if (this.props.shouldRefresh && !prevProps.shouldRefresh)
            this.getLectures()
    }

    render() {
        const {lectures, IS_LOADING} = this.state
        const properRefreshFunc = this.getProperRefreshFunc()
        const title = prettyDateWithLongDayYearIfDiff(this.getDate())
        const Lecture = ({lecture}) => {
            let className = lecture.group ? "LectureGroup" : ""
            if (lecture.canceled)
                className = "lecture-canceled"
            return (
                <ListGroupItem className={className + " lecture lecture_dashboardday"}>
                    <div className="lecture_heading" style={{background: lecture.course.color}}>
                        <h4>
                            <span title={courseDuration(lecture.duration)} className="font-weight-bold">
                                {prettyTime(new Date(lecture.start))}
                            </span>
                        </h4>
                        <CourseName course={lecture.course}/>
                        <LectureNumber lecture={lecture} colorize/>
                        <ModalLectures IS_CLIENT={!lecture.group}
                                       object={lecture.group ? lecture.group : lecture.attendances[0].client}
                                       currentLecture={lecture} refresh={properRefreshFunc}/>
                    </div>
                    <div className="lecture_content">
                        {lecture.group &&
                        <h5>
                            <GroupName group={lecture.group} title link/>
                        </h5>}
                        <Attendances lecture={lecture} funcRefresh={properRefreshFunc} showClient/>
                    </div>
                </ListGroupItem>
            )
        }
        const EmptyLecture = () =>
            <ListGroupItem className="lecture lecture_free">
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
            <ListGroupItem className="lecture">
                <Loading/>
            </ListGroupItem>
        return (
            <ListGroup className="pageContent">
                <ListGroupItem color={isToday(this.getDate()) ? "primary" : ''}>
                    <h4 className="text-center mb-0 text-nowrap">{title}</h4>
                </ListGroupItem>
                {IS_LOADING ?
                    <DayLoading/>
                    :
                    <Lectures/>}
            </ListGroup>
        )
    }
}
