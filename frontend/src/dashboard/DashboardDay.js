import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, Input} from 'reactstrap'
import axios from "axios"
import {faUsdCircle} from '@fortawesome/fontawesome-pro-solid'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {prettyDateWithDay, toISODate, prettyTime} from "../components/FuncDateTime"

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
        axios.get('/api/v1/attendancestates/')
            .then((response) => {
                this.setState({attendancestates: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?date=' + toISODate(this.date))
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

    componentDidMount() {
        this.getLectures()
        this.getDataAttendanceStates()
    }


    render() {
        const ClientName = ({name, surname}) => <span>{name} {surname}</span>
        const PaidButton = ({state}) =>
            <FontAwesomeIcon icon={faUsdCircle} size="2x" className={state ? "text-success" : "text-danger"}/>
        const SelectAttendanceState = ({value}) =>
            <Input type="select" bsSize="sm" onChange={this.onChange} value={value}>
                {this.state.attendancestates.map(attendancestate =>
                    <option key={attendancestate.id} value={attendancestate.id}>{attendancestate.name}</option>)}
            </Input>

        return (
            <div>
                <h4 className="text-center">{this.title}</h4>
                <ListGroup>
                {this.state.lectures.length ?
                    this.state.lectures.map(lecture => {
                    return (
                        <ListGroupItem key={lecture.id}>
                            <ListGroupItemHeading>
                                {prettyTime(new Date(lecture.start))} -
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
                                            <PaidButton state={attendance.paid}/>
                                            <SelectAttendanceState value={attendance.attendancestate.id}/>
                                        </li>)}
                                </ul>
                                :
                                <div>
                                    <PaidButton state={lecture.attendances[0].paid}/>
                                    <SelectAttendanceState value={lecture.attendances[0].attendancestate.id}/>
                                </div>}
                        </ListGroupItem>)
                    })
                    :
                    <ListGroupItem>
                        <ListGroupItemHeading className="text-muted">Volno</ListGroupItemHeading>
                    </ListGroupItem>}
                </ListGroup>
            </div>
        )
    }
}
