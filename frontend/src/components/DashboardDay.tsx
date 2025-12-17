import classNames from "classnames"
import * as React from "react"
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "reactstrap"

import { useLecturesFromDay } from "../api/hooks"
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

import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import "./DashboardDay.css"
import GroupName from "./GroupName"
import LectureNumber from "./LectureNumber"
import Loading from "./Loading"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = AttendanceStatesContextProps & {
    /** Při požadavcích na API nedělej prodlevu (true) - prodleva se hodí při rychlém překlikávání mezi dny v diáři. */
    withoutWaiting?: boolean
    /** Datum pro zobrazované lekce. */
    date: string
}

/** Komponenta zobrazující lekce pro jeden zadaný den. */
const DashboardDay: React.FC<Props> = (props) => {
    const getDate = (): Date => new Date(props.date)

    const {
        data: lectures = [],
        isLoading,
        isFetching,
    } = useLecturesFromDay(toISODate(getDate()), true)

    const title = prettyDateWithLongDayYearIfDiff(getDate())
    const isUserCelebratingResult = isUserCelebrating(getDate())

    const showLoading = isLoading || !props.attendanceStatesContext.isLoaded

    return (
        <ListGroup className="DashboardDay_wrapper">
            <ListGroupItem
                color={isToday(getDate()) ? "primary" : ""}
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
                    date={props.date}
                    dropdownClassName="float-right"
                    dropdownSize="sm"
                    dropdownDirection="up"
                    isFetching={isFetching && !isLoading}
                />
            </ListGroupItem>
            {showLoading ? (
                <ListGroupItem className="lecture">
                    <Loading />
                </ListGroupItem>
            ) : lectures.length > 0 ? (
                lectures.map((lecture) => {
                    const className = classNames("lecture", "lecture_dashboardday", {
                        LectureGroup: lecture.group,
                        "lecture-canceled": lecture.canceled,
                    })
                    return (
                        <ListGroupItem key={lecture.id} data-qa="lecture" className={className}>
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
                                    object={lecture.group ?? lecture.attendances[0].client}
                                    currentLecture={lecture}
                                />
                            </div>
                            <div className="lecture_content">
                                {lecture.group && (
                                    <h5>
                                        <GroupName group={lecture.group} title link />
                                    </h5>
                                )}
                                <Attendances lecture={lecture} showClient />
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

export default WithAttendanceStatesContext(DashboardDay)
