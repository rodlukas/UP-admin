import * as React from "react"
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "reactstrap"

import LectureService from "../api/services/LectureService"
import {
    AttendanceStatesContextProps,
    WithAttendanceStatesContext,
} from "../contexts/AttendanceStatesContext"
import ModalLectures from "../forms/ModalLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { DASHBOARDDAY_UPDATE_TYPE, USER_CELEBRATION } from "../global/constants"
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
    /** Při požadavcích na API nedělej prodlevu (true) - prodleva se hodí při rychlém překlikávání mezi dny v diáři. */
    withoutWaiting?: boolean
    /** Datum pro zobrazované lekce. */
    date: string
    /** Typ aktualizace komponenty se dnem - pro propagaci aktualizací dalších dní (aktualizaci požaduje rodič). */
    updateType: number
    /** Funkce, která se zavolá po nějaké aktualizaci v rámci komponenty. */
    setUpdateType: fEmptyVoid
}

type State = {
    /** Pole lekcí pro daný den. */
    lectures: Array<LectureTypeWithDate>
    /** Probíhá načítání (true). */
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
                }),
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
        if (
            this.props.updateType !== DASHBOARDDAY_UPDATE_TYPE.NONE &&
            prevProps.updateType === DASHBOARDDAY_UPDATE_TYPE.NONE
        ) {
            // pokud se nema uplatnit prodleva nebo se nemeni den (napr. se upravil jen stav ucasti)
            if (
                this.props.withoutWaiting ||
                (this.props.date === prevProps.date &&
                    this.props.updateType === DASHBOARDDAY_UPDATE_TYPE.DAY_UNCHANGED)
            ) {
                this.getLectures()
            }
            // zpozdeni pro usetreni requestu pri rychlem preklikavani tydnu v diari
            else {
                window.clearTimeout(this.timeoutId)
                this.setState(
                    { isLoading: true },
                    () => (this.timeoutId = window.setTimeout(this.getLectures, 700)),
                )
            }
        }
    }

    render(): React.ReactNode {
        const { lectures, isLoading } = this.state
        const title = prettyDateWithLongDayYearIfDiff(this.getDate())
        const isUserCelebratingResult = isUserCelebrating(this.getDate())
        return (
            <ListGroup>
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
                        refresh={this.props.setUpdateType}
                        date={this.props.date}
                        dropdownClassName="float-right"
                        dropdownSize="sm"
                        dropdownDirection="up"
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
                                data-qa="lecture"
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
                                        refresh={this.props.setUpdateType}
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
                                        funcRefresh={this.props.setUpdateType}
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
