import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, UncontrolledTooltip} from 'reactstrap'
import {Link} from 'react-router-dom'
import {prettyDateWithDay, toISODate, prettyTime, isToday} from "../global/funcDateTime"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"
import "../global/lists.css"
import RemindPay from "./RemindPay"
import LectureNumber from "./LectureNumber"
import LectureService from "../api/services/lecture"
import ClientName from "./ClientName"
import Loading from "../api/Loading"
import APP_URLS from "../urls"

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            loading: true
        }
        this.date = new Date(props.date)
    }

    getLectures = () => {
        LectureService
            .getAllFromDayOrdered(toISODate(this.date), true)
            .then((response) => {
                this.setState({lectures: response, loading: false})
            })
    }

    componentDidMount() {
        this.getLectures()
    }

    render() {
        const {lectures} = this.state
        const title = prettyDateWithDay(this.date)
        const Day = () =>
            <div>
                {lectures.map(lecture =>
                    <ListGroupItem key={lecture.id} className={lecture.group && "list-bgGroup"}>
                        <h4>{prettyTime(new Date(lecture.start))} <Badge pill>{lecture.course.name}</Badge>{' '}
                            <LectureNumber number={lecture.attendances[0].count}/></h4>
                        {lecture.group &&
                        <div>
                            <Link to={(APP_URLS.skupiny + "/" + lecture.group.id)} id={"card" + lecture.id}>
                                <h5>Skupina {lecture.group.name}</h5>
                            </Link>
                            <UncontrolledTooltip placement="left" target={"card" + lecture.id}>
                                otevřít kartu
                            </UncontrolledTooltip>
                        </div>}
                        <ul className={"list-clients " + (lecture.group && "list-clientsGroup")}>
                            {lecture.attendances.map(attendance =>
                                <li key={attendance.id}>
                                    <Link to={(APP_URLS.klienti + "/" + attendance.client.id)} id={"card" + attendance.id}>
                                        <ClientName name={attendance.client.name}
                                                    surname={attendance.client.surname}/>
                                    </Link>{' '}
                                    <UncontrolledTooltip placement="left" target={"card" + attendance.id}>
                                        otevřít kartu
                                    </UncontrolledTooltip>
                                    <PaidButton paid={attendance.paid} attendanceId={attendance.id}
                                                funcRefresh={this.getLectures}/>{' '}
                                    <RemindPay remind_pay={attendance.remind_pay}/>{' '}
                                    <Badge color="info">{attendance.note}</Badge>
                                    <SelectAttendanceState value={attendance.attendancestate.id}
                                                           attendanceId={attendance.id}
                                                           attendancestates={this.props.attendancestates}
                                                           funcRefresh={this.getLectures}/>
                                </li>)}
                        </ul>
                    </ListGroupItem>)}
                {!Boolean(lectures.length) &&
                <ListGroupItem>
                    <ListGroupItemHeading className="text-muted text-center">Volno</ListGroupItemHeading>
                </ListGroupItem>}
            </div>

        return (
            <div>
                <ListGroup>
                    <ListGroupItem color={isToday(this.date) ? "primary" : ''}>
                        <h4 className="text-center">{title}</h4>
                    </ListGroupItem>
                    {this.state.loading ?
                        <ListGroupItem><Loading/></ListGroupItem> :
                        <Day/>}
                </ListGroup>
            </div>
        )
    }
}
