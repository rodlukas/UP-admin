import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, Input} from 'reactstrap'
import axios from "axios"
import {prettyDateWithDay, toISODate, prettyTime} from "../components/FuncDateTime"
import AuthService from "../Auth/AuthService"
import {API_URL} from "../components/GlobalConstants"
import PaidButton from "../components/PaidButton"

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
            })
    }

    getLectures = () => {
        axios.get(API_URL + 'lectures/?date=' + toISODate(this.date), AuthService.getHeaders())
            .then((response) => {
                this.setState({lectures: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = (target.type === 'checkbox') ? target.checked : target.value
        this.setState(state)
    }

    onChangePaid = (context) => {
        let lectures = this.state.lectures
        let findAttendance = lectures.find(el => el.id === context.lectureId).attendances
        findAttendance.find(el => el.id === context.attendanceId).paid ^= true // negace
        this.setState({lectures: lectures})
    }

    componentDidMount() {
        this.getLectures()
        this.getDataAttendanceStates()
    }


    render() {
        const ClientName = ({name, surname}) => <span>{name} {surname}</span>
        const SelectAttendanceState = ({value}) =>
            <Input type="select" bsSize="sm" onChange={this.onChange} value={value}>
                {this.state.attendancestates.map(attendancestate =>
                    <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
            </Input>

        return (
            <div>
                <h4 className="text-center">{this.title}</h4>
                <ListGroup>
                {this.state.lectures.map(lecture => {
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
                                                        lectureId={lecture.id} onChange={this.onChangePaid}/>
                                            <SelectAttendanceState value={attendance.attendancestate.id}/>
                                        </li>)}
                                </ul>
                                :
                                <div>
                                    <PaidButton paid={lecture.attendances[0].paid} attendanceId={lecture.attendances[0].id}
                                                lectureId={lecture.id} onChange={this.onChangePaid}/>
                                    <SelectAttendanceState value={lecture.attendances[0].attendancestate.id}/>
                                </div>}
                        </ListGroupItem>)
                    })}
                    {!Boolean(this.state.lectures.length) &&
                        <ListGroupItem>
                            <ListGroupItemHeading className="text-muted text-center">Volno</ListGroupItemHeading>
                        </ListGroupItem>}
                </ListGroup>
            </div>
        )
    }
}
