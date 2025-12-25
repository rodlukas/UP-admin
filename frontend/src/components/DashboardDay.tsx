import classNames from "classnames"
import * as React from "react"
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "reactstrap"

import { useLecturesFromDay } from "../api/hooks"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
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
import { DEFAULT_DELAY, useDelayedValue } from "../hooks/useDelayedValue"

import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import * as styles from "./DashboardDay.css"
import GroupName from "./GroupName"
import * as lectureStyles from "./Lecture.css"
import LectureNumber from "./LectureNumber"
import Loading from "./Loading"
import UncontrolledTooltipWrapper from "./UncontrolledTooltipWrapper"

type Props = {
    /** Při požadavcích na API nedělej prodlevu (true) - prodleva se hodí při rychlém překlikávání mezi dny v diáři. */
    withoutWaiting?: boolean
    /** Datum pro zobrazované lekce. */
    date: string
}

/** Komponenta zobrazující lekce pro jeden zadaný den. */
const DashboardDay: React.FC<Props> = (props) => {
    const attendanceStatesContext = useAttendanceStatesContext()
    const getDate = (): Date => new Date(props.date)

    /** Datum, pro které se má načíst data (může být zpožděno při rychlém překlikávání). */
    const delayedDate = useDelayedValue(props.date, DEFAULT_DELAY, props.withoutWaiting)

    const {
        data: lectures = [],
        isLoading,
        isFetching,
    } = useLecturesFromDay(toISODate(new Date(delayedDate)), true)

    const title = prettyDateWithLongDayYearIfDiff(getDate())
    const isUserCelebratingResult = isUserCelebrating(getDate())

    const showLoading = isLoading || attendanceStatesContext.isLoading

    return (
        <ListGroup className={styles.dashboardDayWrapper}>
            <ListGroupItem
                color={isToday(getDate()) ? "primary" : ""}
                className={classNames("text-center", styles.dashboardDayDate)}>
                <h4
                    className={classNames(
                        "mb-0",
                        "text-nowrap",
                        "d-inline-block",
                        isUserCelebratingResult === USER_CELEBRATION.NOTHING
                            ? styles.celebrationNone
                            : "celebration",
                    )}>
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
                <ListGroupItem className={lectureStyles.lecture}>
                    <Loading />
                </ListGroupItem>
            ) : lectures.length > 0 ? (
                lectures.map((lecture) => {
                    const className = classNames(lectureStyles.lecture, {
                        [styles.lectureGroup]: lecture.group && !lecture.canceled,
                        [lectureStyles.lectureCanceled]: lecture.canceled,
                        [styles.lectureCanceledDashboardday]: lecture.canceled,
                    })
                    return (
                        <ListGroupItem
                            key={lecture.id}
                            data-qa="lecture"
                            className={className}
                            {...(lecture.canceled && { "data-qa-canceled": "true" })}>
                            <div
                                className={classNames(
                                    lectureStyles.lectureHeading,
                                    styles.lectureHeading,
                                )}
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
                                <CourseName course={lecture.course} className={styles.courseName} />
                                <LectureNumber
                                    lecture={lecture}
                                    colorize
                                    className={classNames(
                                        lectureStyles.lectureNumber,
                                        styles.lectureNumber,
                                    )}
                                />
                                <ModalLectures
                                    object={lecture.group ?? lecture.attendances[0].client}
                                    currentLecture={lecture}
                                />
                            </div>
                            <div className={lectureStyles.lectureContent}>
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
                <ListGroupItem className={classNames(lectureStyles.lecture, styles.lectureFree)}>
                    <ListGroupItemHeading className="text-muted text-center">
                        Volno
                    </ListGroupItemHeading>
                </ListGroupItem>
            )}
        </ListGroup>
    )
}

export default DashboardDay
