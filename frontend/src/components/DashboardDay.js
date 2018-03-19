import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, UncontrolledTooltip} from 'reactstrap'
import axios from "axios"
import {prettyDateWithDay, toISODate, prettyTime} from "../global/FuncDateTime"
import AuthService from "../Auth/AuthService"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"
import "./DashboardDay.css"

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: [],
            attendancestates: []
        }
        this.date = new Date(props.date)
        this.title = prettyDateWithDay(this.date)
    }

    getDataAttendanceStates = () => {
        axios.get(API_URL + 'attendancestates/', AuthService.getHeaders())
            .then((response) => {
                this.setState({attendancestates: response.data})
            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR_LOADING, NOTIFY_LEVEL.ERROR)
            })
    }

    getLectures = () => {
        axios.get(API_URL + 'lectures/?date=' + toISODate(this.date) + '&ordering=start', AuthService.getHeaders())
            .then((response) => {
                this.setState({lectures: response.data})

            })
            .catch((error) => {
                console.log(error)
                this.props.notify(NOTIFY_TEXT.ERROR_LOADING, NOTIFY_LEVEL.ERROR)
            })
    }

    componentDidMount() {
        this.getDataAttendanceStates()
        this.getLectures()
    }

    render() {
        const ClientName = ({name, surname}) => <span>{name} {surname}</span>
        const {attendancestates, lectures} = this.state
        return (
            <div>
                <h2 className="text-center">{this.title}</h2>
                <ListGroup>
                {lectures.map(lecture => {
                    const cardUrl = (lecture.group ? ("skupiny/" + lecture.group.id) : ("klienti/" + lecture.attendances[0].client.id))
                    return (
                        <ListGroupItem key={lecture.id} className={lecture.group && "list-bgGroup"}>
                            <h4>{prettyTime(new Date(lecture.start))} <Badge pill>{lecture.course.name}</Badge> <Badge
                                color="secondary" pill>{lecture.attendances[0].count}.</Badge></h4>
                            <ListGroupItemHeading>
                                <a href={cardUrl} id={"card" + lecture.id}>
                                {lecture.group ?
                                    <span>{lecture.group.name}</span> :
                                    <ClientName name={lecture.attendances[0].client.name}
                                                surname={lecture.attendances[0].client.surname}/>}
                                </a>
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
                                                    funcRefresh={this.getLectures} notify={this.props.notify}/>{' '}
                                        <Badge color="info" pill>{attendance.note}</Badge>{' '}
                                        <Badge color="warning" pill>Příště platit</Badge>
                                        <SelectAttendanceState value={attendance.attendancestate.id}
                                                               attendanceId={attendance.id}
                                                               attendancestates={attendancestates}
                                                               funcRefresh={this.getLectures} notify={this.props.notify}/>
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
