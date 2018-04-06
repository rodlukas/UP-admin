import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, UncontrolledTooltip} from 'reactstrap'
import {Link} from 'react-router-dom'
import {prettyDateWithDay, toISODate, prettyTime} from "../global/funcDateTime"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"
import "../global/lists.css"
import RemindPay from "./RemindPay"
import LectureNumber from "./LectureNumber"
import LectureService from "../api/services/lecture"
import ClientName from "../components/ClientName"
import Loading from "../api/Loading"

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            loading: true,
            attendancestates: props.attendancestates
        }
        this.date = new Date(props.date)
        this.title = prettyDateWithDay(this.date)
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

    componentWillReceiveProps(nextProps) {
        if (this.state.attendancestates !== nextProps.attendancestates) {
            this.setState({attendancestates: nextProps.attendancestates})
        }
    }

    render() {
        const {attendancestates, lectures} = this.state
        const Day = () =>
            <div>
                {lectures.map(lecture =>
                        <ListGroupItem key={lecture.id} className={lecture.group && "list-bgGroup"}>
                            <h4>{prettyTime(new Date(lecture.start))} <Badge pill>{lecture.course.name}</Badge>{' '}
                                <LectureNumber number={lecture.attendances[0].count}/></h4>
                            {lecture.group &&
                            <div>
                                <Link to={("skupiny/" + lecture.group.id)} id={"card" + lecture.id}>
                                    <h5>Skupina {lecture.group.name}</h5>
                                </Link>
                                <UncontrolledTooltip placement="left" target={"card" + lecture.id}>
                                    otevřít kartu
                                </UncontrolledTooltip>
                            </div>}
                            <ul className={"list-clients " + (lecture.group && "list-clientsGroup")}>
                                {lecture.attendances.map(attendance =>
                                    <li key={attendance.id}>
                                        <Link to={("klienti/" + attendance.client.id)} id={"card" + attendance.id}>
                                            <ClientName name={attendance.client.name}
                                                        surname={attendance.client.surname}/>
                                        </Link>{' '}
                                        <UncontrolledTooltip placement="left" target={"card" + attendance.id}>
                                            otevřít kartu
                                        </UncontrolledTooltip>
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
                        </ListGroupItem>)}
                {!Boolean(lectures.length) &&
                <ListGroupItem>
                    <ListGroupItemHeading className="text-muted text-center">Volno</ListGroupItemHeading>
                </ListGroupItem>}
            </div>

        return (
            <div>
                <ListGroup>
                    <ListGroupItem color={this.date.getDate() === new Date().getDate() ? "primary" : ''}>
                        <h4 className="text-center">{this.title}</h4>
                    </ListGroupItem>
                    {this.state.loading ?
                        <ListGroupItem><Loading/></ListGroupItem> :
                        <Day/>}
                </ListGroup>
            </div>
        )
    }
}
