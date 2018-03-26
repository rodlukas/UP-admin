import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, UncontrolledTooltip} from 'reactstrap'
import {Link} from 'react-router-dom'
import {prettyDateWithDay, toISODate, prettyTime} from "../global/funcDateTime"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"
import "./DashboardDay.css"
import RemindPay from "./RemindPay"
import LectureNumber from "./LectureNumber"
import LectureService from "../api/services/lecture"
import ClientName from "../components/ClientName"

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            attendancestates: props.attendancestates
        }
        this.date = new Date(props.date)
        this.title = prettyDateWithDay(this.date)
    }

    getLectures = () => {
        LectureService
            .getAllFromDayOrdered(toISODate(this.date), true)
            .then((response) => {
                this.setState({lectures: response})
            })
    }

    componentDidMount() {
        this.getLectures()
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.attendancestates !== nextProps.attendancestates) {
            this.setState({attendancestates: nextProps.attendancestates})
        }
    }

    render() {
        const {attendancestates, lectures} = this.state
        return (
            <div>
                <h4 className="text-center">{this.title}</h4>
                <ListGroup>
                {lectures.map(lecture => {
                    const cardUrl = (lecture.group ? ("skupiny/" + lecture.group.id) : ("klienti/" + lecture.attendances[0].client.id))
                    return (
                        <ListGroupItem key={lecture.id} className={lecture.group && "list-bgGroup"}>
                            <h4>{prettyTime(new Date(lecture.start))} <Badge pill>{lecture.course.name}</Badge>{' '}
                                <LectureNumber number={lecture.attendances[0].count}/></h4>
                            <ListGroupItemHeading>
                                <Link to={cardUrl} id={"card" + lecture.id}>
                                {lecture.group ?
                                    <span>{lecture.group.name}</span> :
                                    <ClientName name={lecture.attendances[0].client.name}
                                                surname={lecture.attendances[0].client.surname}/>}
                                </Link>
                                <UncontrolledTooltip placement="right" target={"card" + lecture.id}>
                                    otevřít kartu
                                </UncontrolledTooltip>
                            </ListGroupItemHeading>
                            <ul className={"list-clients " + (lecture.group && "list-clientsGroup")}>
                                {lecture.attendances.map(attendance =>
                                    <li key={attendance.id}>
                                        {lecture.group &&
                                        <ClientName name={attendance.client.name}
                                                    surname={attendance.client.surname}/>}{' '}
                                        <PaidButton paid={attendance.paid} attendanceId={attendance.id}
                                                    funcRefresh={this.getLectures}/>{' '}
                                        <Badge color="info" pill>{attendance.note}</Badge>{' '}
                                        <RemindPay remind_pay={attendance.remind_pay}/>
                                        <SelectAttendanceState value={attendance.attendancestate.id}
                                                               attendanceId={attendance.id}
                                                               attendancestates={attendancestates}
                                                               funcRefresh={this.getLectures}/>
                                    </li>)}
                            </ul>
                        </ListGroupItem>)
                    })}
                    {!Boolean(lectures.length) &&
                        <ListGroupItem>
                            <ListGroupItemHeading className="text-muted text-center">Volno</ListGroupItemHeading>
                        </ListGroupItem>}
                </ListGroup>
            </div>
        )
    }
}
