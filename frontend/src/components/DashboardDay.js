import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge} from 'reactstrap'
import axios from "axios"
import {prettyDateWithDay, toISODate, prettyTime} from "../global/FuncDateTime"
import AuthService from "../Auth/AuthService"
import {API_URL, NOTIFY_LEVEL, NOTIFY_TEXT} from "../global/GlobalConstants"
import PaidButton from "./PaidButton"
import SelectAttendanceState from "./SelectAttendanceState"

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
                <h4 className="text-center">{this.title}</h4>
                <ListGroup>
                {lectures.map(lecture => {
                    return (
                        <ListGroupItem key={lecture.id}>
                            <ListGroupItemHeading>
                                {prettyTime(new Date(lecture.start))} -{' '}
                                {lecture.group ?
                                    lecture.group.name :
                                    <ClientName name={lecture.attendances[0].client.name}
                                                surname={lecture.attendances[0].client.surname}/>}{' '}
                                <Badge pill>{lecture.course.name}</Badge>{' '}
                                <Badge color="warning" pill>Příště platit</Badge>
                            </ListGroupItemHeading>
                            {lecture.group ?
                            <ul>
                                {lecture.attendances.map(attendance =>
                                    <li key={attendance.id}>
                                        <ClientName name={attendance.client.name}
                                                    surname={attendance.client.surname}/>{' '}
                                        <PaidButton paid={attendance.paid} attendanceId={attendance.id}
                                                    funcRefresh={this.getLectures} notify={this.props.notify}/>
                                        <SelectAttendanceState value={attendance.attendancestate.id}
                                                               attendanceId={attendance.id}
                                                               attendancestates={attendancestates}
                                                               funcRefresh={this.getLectures} notify={this.props.notify}/>
                                    </li>)}
                            </ul>
                            :
                            <div>
                                <PaidButton paid={lecture.attendances[0].paid} attendanceId={lecture.attendances[0].id}
                                            funcRefresh={this.getLectures} notify={this.props.notify}/>
                                <SelectAttendanceState value={lecture.attendances[0].attendancestate.id}
                                                       attendanceId={lecture.attendances[0].id}
                                                       attendancestates={attendancestates}
                                                       funcRefresh={this.getLectures} notify={this.props.notify}/>
                            </div>}
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
