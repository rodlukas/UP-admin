import { Box, Text, Title, Tooltip } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource } from "../analytics"
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
import { inlineBlockNowrap, mb0 } from "../global/utility.css"
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

type Props = {
    /** Při požadavcích na API nedělej prodlevu (true) - prodleva se hodí při rychlém překlikávání mezi dny v diáři. */
    withoutWaiting?: boolean
    /** Datum pro zobrazované lekce. */
    date: string
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující lekce pro jeden zadaný den. */
const DashboardDay: React.FC<Props> = (props) => {
    const { source } = props
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
    const hasLectures = lectures.length > 0
    let content: React.ReactNode
    if (showLoading) {
        content = (
            <div className={classNames(lectureStyles.lecture, styles.dashboardDayItem)}>
                <Loading />
            </div>
        )
    } else if (hasLectures) {
        content = lectures.map((lecture) => {
            const className = classNames(lectureStyles.lecture, styles.dashboardDayItem, {
                [styles.lectureGroup]: lecture.group && !lecture.canceled,
                [lectureStyles.lectureCanceled]: lecture.canceled,
                [styles.lectureCanceledDashboardday]: lecture.canceled,
            })
            return (
                <div
                    key={lecture.id}
                    data-qa="lecture"
                    className={className}
                    {...(lecture.canceled && { "data-qa-canceled": "true" })}>
                    <div
                        className={classNames(lectureStyles.lectureHeading, styles.lectureHeading)}
                        style={assignInlineVars(styles.dashboardDayVars, {
                            courseBackground: lecture.course.color,
                        })}>
                        <Title order={4}>
                            <Tooltip label={courseDuration(lecture.duration)}>
                                <strong>{prettyTime(new Date(lecture.start))}</strong>
                            </Tooltip>
                        </Title>
                        <CourseName course={lecture.course} className={styles.courseName} />
                        <LectureNumber
                            lecture={lecture}
                            colorize
                            className={classNames(lectureStyles.lectureNumber, styles.lectureNumber)}
                            color="light"
                        />
                        <ModalLectures
                            object={lecture.group ?? lecture.attendances[0].client}
                            currentLecture={lecture}
                            source={source}
                        />
                    </div>
                    <div className={lectureStyles.lectureContent}>
                        {lecture.group && (
                            <Title order={5}>
                                <GroupName group={lecture.group} title link />
                            </Title>
                        )}
                        <Attendances lecture={lecture} showClient source={source} />
                    </div>
                </div>
            )
        })
    } else {
        content = (
            <div
                className={classNames(
                    lectureStyles.lecture,
                    styles.lectureFree,
                    styles.dashboardDayItem,
                )}>
                <Text c="dimmed" ta="center" fw={500}>
                    Volno
                </Text>
            </div>
        )
    }

    return (
        <div className={styles.dashboardDayWrapper}>
            <Box
                ta="center"
                className={`${styles.dashboardDayDate}${isToday(getDate()) ? ` ${styles.dashboardDayDateToday}` : ""}`}>
                <Title
                    order={4}
                    className={classNames(
                        isUserCelebratingResult === USER_CELEBRATION.NOTHING
                            ? styles.celebrationNone
                            : "celebration",
                        mb0,
                        inlineBlockNowrap,
                    )}>
                    <Celebration isUserCelebratingResult={isUserCelebratingResult} /> {title}
                </Title>
                <ModalLecturesWizard
                    date={props.date}
                    dropdownClassName={styles.dashboardDayDateAction}
                    dropdownSize="sm"
                    dropdownDirection="up"
                    isFetching={isFetching && !isLoading}
                    source={source}
                />
            </Box>
            {content}
        </div>
    )
}

export default DashboardDay
