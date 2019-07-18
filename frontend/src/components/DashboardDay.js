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
        this.getLectures()
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
                <ListGroupItem className={className + " lecture"}>
                    <h4>
                        <span title={courseDuration(lecture.duration)}>
                            {prettyTime(new Date(lecture.start))}
                        </span>
                        {' '}
                        <CourseName course={lecture.course}/>
                        {' '}
                        <LectureNumber lecture={lecture}/>
                        <div className="float-right">
                            <ModalLectures IS_CLIENT={!lecture.group}
                                           object={lecture.group ? lecture.group : lecture.attendances[0].client}
                                           currentLecture={lecture} refresh={properRefreshFunc}/>
                        </div>
                    </h4>
                    {lecture.group &&
                    <h5>
                        <GroupName group={lecture.group} title link/>
                    </h5>}
                    <Attendances lecture={lecture} funcRefresh={properRefreshFunc} showClient/>
                </ListGroupItem>
            )
        }
        const EmptyLecture = () =>
            <ListGroupItem className="lecture">
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
