import * as React from "react"
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "reactstrap"
import LectureService from "../api/services/LectureService"
import {
    AttendanceStatesContextProps,
    WithAttendanceStatesContext,
} from "../contexts/AttendanceStatesContext"
import ModalLectures from "../forms/ModalLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { USER_CELEBRATION } from "../global/constants"
import {
    isToday,
    isUserCelebrating,
    prettyDateWithLongDayYearIfDiff,
    prettyTime,
    toISODate,
} from "../global/funcDateTime"
import { courseDuration } from "../global/utils"
import { LectureTypeWithDate } from "../types/models"
import { fEmptyVoid, TimeoutType } from "../types/types"
import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import "./DashboardDay.css"
import GroupName from "./GroupName"
import LectureNumber from "./LectureNumber"
import Loading from "./Loading"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = AttendanceStatesContextProps & {
    withoutWaiting?: boolean
    date: string
    shouldRefresh: boolean
    setRefreshState: fEmptyVoid
}

type State = {
    lectures: Array<LectureTypeWithDate>
    isLoading: boolean
}

/** Komponenta zobrazující lekce pro jeden zadaný den. */
class DashboardDay extends React.Component<Props, State> {
    state: State = {
        lectures: [],
        isLoading: true,
    }

    timeoutId: TimeoutType

    getDate = (): Date => new Date(this.props.date)

    getLectures = (): void => {
        this.setState({ isLoading: true }, () => {
            LectureService.getAllFromDayOrdered(toISODate(this.getDate()), true).then((lectures) =>
                this.setState({
                    lectures,
                    isLoading: false,
                })
            )
        })
    }

    componentDidMount(): void {
        this.getLectures()
    }

    componentWillUnmount(): void {
        window.clearTimeout(this.timeoutId)
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.shouldRefresh && !prevProps.shouldRefresh) {
            if (this.props.withoutWaiting) {
                this.getLectures()
            }
            // zpozdeni pro usetreni requestu pri rychlem preklikavani tydnu v diari
            else {
                window.clearTimeout(this.timeoutId)
                this.setState(
                    { isLoading: true },
                    () => (this.timeoutId = window.setTimeout(this.getLectures, 700))
                )
            }
        }
    }

    render(): React.ReactNode {
        const { lectures, isLoading } = this.state
        const title = prettyDateWithLongDayYearIfDiff(this.getDate())
        const isUserCelebratingResult = isUserCelebrating(this.getDate())
        return (
            <ListGroup className="pageContent">
                <ListGroupItem
                    color={isToday(this.getDate()) ? "primary" : ""}
                    className="text-center DashboardDay_date">
                    <h4
                        className={`mb-0 text-nowrap d-inline-block ${
                            isUserCelebratingResult === USER_CELEBRATION.NOTHING
                                ? "celebration_none"
                                : "celebration"
                        }`}>
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
                {isLoading || !this.props.attendanceStatesContext.isLoaded ? (
                    <ListGroupItem className="lecture">
                        <Loading />
                    </ListGroupItem>
                ) : lectures.length > 0 ? (
                    lectures.map((lecture) => {
                        let className = lecture.group ? "LectureGroup" : ""
                        if (lecture.canceled) {
                            className = "lecture-canceled"
                        }
                        return (
                            <ListGroupItem
                                key={lecture.id}
                                className={`${className} lecture lecture_dashboardday`}>
                                <div
                                    className="lecture_heading"
                                    style={{ background: lecture.course.color }}>
                                    <h4>
                                        <span
                                            id={`Card_CourseDuration_${lecture.id}`}
                                            className="font-weight-bold">
                                            {prettyTime(new Date(lecture.start))}
                                        </span>
                                        <UncontrolledTooltipWrapper
                                            target={`Card_CourseDuration_${lecture.id}`}>
                                            {courseDuration(lecture.duration)}
                                        </UncontrolledTooltipWrapper>
                                    </h4>
                                    <CourseName course={lecture.course} />
                                    <LectureNumber lecture={lecture} colorize />
                                    <ModalLectures
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
