import React, { Component } from "react"
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "reactstrap"
import LectureService from "../api/services/lecture"
import { WithAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalLectures from "../forms/ModalLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { USER_CELEBRATION } from "../global/constants"
import {
    isToday,
    isUserCelebrating,
    prettyDateWithLongDayYearIfDiff,
    prettyTime,
    toISODate
} from "../global/funcDateTime"
import { courseDuration } from "../global/utils"
import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import "./DashboardDay.css"
import GroupName from "./GroupName"
import LectureNumber from "./LectureNumber"
import Loading from "./Loading"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

class DashboardDay extends Component {
    state = {
        lectures: [],
        IS_LOADING: true
    }

    getDate = () => new Date(this.props.date)

    getLectures = () => {
        this.setState({ IS_LOADING: true }, () =>
            LectureService.getAllFromDayOrdered(toISODate(this.getDate()), true).then(lectures =>
                this.setState({
                    lectures,
                    IS_LOADING: false
                })
            )
        )
    }

    componentDidMount() {
        this.getLectures()
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId)
    }

    componentDidUpdate(prevProps) {
        if (this.props.shouldRefresh && !prevProps.shouldRefresh) {
            if (this.props.withoutWaiting) this.getLectures()
            // zpozdeni pro usetreni requestu pri rychlem preklikavani tydnu v diari
            else {
                clearTimeout(this.timeoutId)
                this.setState(
                    { IS_LOADING: true },
                    () => (this.timeoutId = setTimeout(this.getLectures, 700))
                )
            }
        }
    }

    render() {
        const { lectures, IS_LOADING } = this.state
        const title = prettyDateWithLongDayYearIfDiff(this.getDate())
        const isUserCelebratingResult = isUserCelebrating(this.getDate())
        return (
            <ListGroup className="pageContent">
                <ListGroupItem
                    color={isToday(this.getDate()) ? "primary" : ""}
                    className="text-center DashboardDay_date">
                    <h4
                        className={
                            "mb-0 text-nowrap d-inline-block " +
                            (isUserCelebratingResult === USER_CELEBRATION.NOTHING
                                ? "celebration_none"
                                : "celebration")
                        }>
                        <Celebration isUserCelebratingResult={isUserCelebratingResult} /> {title}
                    </h4>
                    <ModalLecturesWizard
                        refresh={this.props.setRefreshState}
                        date={this.props.date}
                        className="float-right"
                        size="sm"
                        direction="up"
                    />
                </ListGroupItem>
                {IS_LOADING || !this.props.attendanceStatesContext.isLoaded ? (
                    <ListGroupItem className="lecture">
                        <Loading />
                    </ListGroupItem>
                ) : lectures.length > 0 ? (
                    lectures.map(lecture => {
                        let className = lecture.group ? "LectureGroup" : ""
                        if (lecture.canceled) className = "lecture-canceled"
                        return (
                            <ListGroupItem
                                key={lecture.id}
                                className={className + " lecture lecture_dashboardday"}>
                                <div
                                    className="lecture_heading"
                                    style={{ background: lecture.course.color }}>
                                    <h4>
                                        <span
                                            id={"Card_CourseDuration_" + lecture.id}
                                            className="font-weight-bold">
                                            {prettyTime(new Date(lecture.start))}
                                        </span>
                                        <UncontrolledTooltipWrapper
                                            target={"Card_CourseDuration_" + lecture.id}>
                                            {courseDuration(lecture.duration)}
                                        </UncontrolledTooltipWrapper>
                                    </h4>
                                    <CourseName course={lecture.course} />
                                    <LectureNumber lecture={lecture} colorize />
                                    <ModalLectures
                                        IS_CLIENT={!lecture.group}
                                        object={
                                            lecture.group
                                                ? lecture.group
                                                : lecture.attendances[0].client
                                        }
                                        currentLecture={lecture}
                                        refresh={this.props.setRefreshState}
                                    />
                                </div>
                                <div className="lecture_content">
                                    {lecture.group && (
                                        <h5>
                                            <GroupName group={lecture.group} title link />
                                        </h5>
                                    )}
                                    <Attendances
                                        lecture={lecture}
                                        funcRefresh={this.props.setRefreshState}
                                        showClient
                                    />
                                </div>
                            </ListGroupItem>
                        )
                    })
                ) : (
                    <ListGroupItem className="lecture lecture_free">
                        <ListGroupItemHeading className="text-muted text-center">
                            Volno
                        </ListGroupItemHeading>
                    </ListGroupItem>
                )}
            </ListGroup>
        )
    }
}

export default WithAttendanceStatesContext(DashboardDay)
