import { Box, Text, Title, Tooltip } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { AnalyticsSource } from "../analytics"
import { useLecturesFromDay } from "../api/hooks"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalLectures from "../forms/ModalLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import {
    isToday,
    isUserCelebrating,
    prettyDateWithLongDayYearIfDiff,
    prettyTime,
} from "../global/funcDateTime"
import { inlineBlockNowrap, mb0, srOnly } from "../global/utility.css"
import { contrastingTextColor, courseDuration } from "../global/utils"
import { DEFAULT_DELAY, useDelayedValue } from "../hooks/useDelayedValue"

import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import * as styles from "./DashboardDay.css"
import GroupName from "./GroupName"
import * as lectureStyles from "./Lecture.css"
import LectureNumber from "./LectureNumber"
import LectureTypeIcon from "./LectureTypeIcon"
import { LectureListSkeleton } from "./Skeletons"

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

    // Datum se do hooku předává tak, jak přišlo — je to už ISO datum. Průchod `new Date()`
    // a zpátky přes `toISODate` by v pásmech se záporným posunem vrátil předchozí den
    // (datum bez času se parsuje jako UTC, `toISODate` čte lokální složky) a rozešel by
    // klíč dotazu s `Dashboard` a `Diary`, které posílají ISO datum přímo.
    const {
        data: lectures = [],
        isLoading,
        isFetching,
    } = useLecturesFromDay(delayedDate, true)

    const title = prettyDateWithLongDayYearIfDiff(getDate())
    const isUserCelebratingResult = isUserCelebrating(getDate())
    const isDayToday = isToday(getDate())

    /**
     * Než prodleva dojede, míří dotaz pořád na předchozí datum — a jeho odpověď bývá v cache,
     * takže `isLoading` je false a sloupec by pod novým datem v hlavičce vykreslil lekce toho
     * minulého (a „Upravit lekci“ by otevřela lekci z jiného týdne). Po dobu prodlevy se proto
     * ukazuje kostra, tedy totéž, co ukazoval dotaz vystřelený okamžitě.
     */
    const isDatePending = delayedDate !== props.date

    const showLoading = isDatePending || isLoading || attendanceStatesContext.isLoading
    const hasLectures = lectures.length > 0
    let content: React.ReactNode
    if (showLoading) {
        content = <LectureListSkeleton count={3} />
    } else if (hasLectures) {
        content = lectures.map((lecture) => {
            return (
                <div
                    key={lecture.id}
                    data-qa="lecture"
                    className={classNames(styles.lectureBlock, styles.dashboardDayItem, {
                        [lectureStyles.lectureCanceledStruck]: lecture.canceled,
                    })}
                    // barvu kurzu nese pruh hlavičky (`lectureHeader`); text v něm musí
                    // zůstat čitelný i na světlém či tmavém uživatelském hexu
                    style={assignInlineVars(lectureStyles.lectureVars, {
                        courseColor: lecture.course.color,
                        courseText: contrastingTextColor(lecture.course.color),
                    })}
                    {...(lecture.canceled && { "data-qa-canceled": "true" })}>
                    <div
                        className={classNames(styles.lectureHeader, {
                            [styles.lectureHeaderCanceled]: lecture.canceled,
                        })}>
                        {/* order/size odděleně: úroveň nadpisu musí navazovat na nadpis
                            dne (h2), vzhled zůstává h4 */}
                        <Title order={3} size="h4" className={lectureStyles.lectureTitle}>
                            <Tooltip label={courseDuration(lecture.duration)}>
                                <strong>{prettyTime(new Date(lecture.start))}</strong>
                            </Tooltip>
                        </Title>
                        <CourseName
                            course={lecture.course}
                            withDot={false}
                            className={styles.lectureHeaderCourse}
                        />
                        <LectureTypeIcon lecture={lecture} />
                        <LectureNumber lecture={lecture} />
                        <ModalLectures
                            object={lecture.group ?? lecture.attendances[0].client}
                            currentLecture={lecture}
                            source={source}
                        />
                    </div>
                    <div
                        className={classNames(styles.lectureBody, {
                            [styles.lectureBodyCanceled]: lecture.canceled,
                        })}>
                        {/* přeškrtnutí je pro oko, tenhle text pro čtečku — bez něj by stav
                            nesl jen vzhled (WCAG 1.4.1) */}
                        {lecture.canceled && <span className={srOnly}>Zrušeno</span>}
                        {lecture.group && (
                            <Title order={4} size="h5" className={lectureStyles.lectureSubtitle}>
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
        <div
            className={classNames(styles.dashboardDayWrapper, {
                [styles.dashboardDayToday]: isDayToday,
            })}>
            <Box
                className={classNames(styles.dashboardDayDate, {
                    [styles.dashboardDayDateToday]: isDayToday,
                })}>
                <Title
                    order={2}
                    size="h4"
                    // `celebrationNone` (flex: 1; min-width: 0) platí bez ohledu na oslavu —
                    // je to layout hlavičky dne, ne nic specifického pro "bez oslavy" (viz
                    // DashboardDay.css.ts). Dřívější `"celebration"` byl literál bez
                    // odpovídající třídy v bundlu (Celebration.css.ts exportuje jen hashované
                    // jméno), takže ve svátečních dnech titulek ztrácel flex a přetékal.
                    className={classNames(styles.celebrationNone, mb0, inlineBlockNowrap)}>
                    <Celebration isUserCelebratingResult={isUserCelebratingResult} /> {title}
                </Title>
                <ModalLecturesWizard
                    date={props.date}
                    dropdownClassName={styles.dashboardDayDateAction}
                    dropdownSize="sm"
                    dropdownVariant="subtle"
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
