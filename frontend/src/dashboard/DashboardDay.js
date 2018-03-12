import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge, Input} from 'reactstrap'
import axios from "axios"
import {faUsdCircle} from '@fortawesome/fontawesome-pro-solid'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: []
        }
        this.prettydate = new Date(props.date)
        this.day = this.prettydate.toLocaleDateString('cs-CZ', {weekday: 'long'})
        this.title = this.day + " " + this.prettydate.getDate() + ". " + (this.prettydate.getMonth() + 1) + ". "
    }

    toISODate() {
        return this.prettydate.getFullYear() + "-" + (this.prettydate.getMonth() + 1) + "-" + this.prettydate.getDate()
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?date=' + this.toISODate())
            .then((response) => {
                this.setState({lectures: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentWillMount() {
        this.getLectures()
    }

    render() {
        return (
            <div>
                <h4 className="text-center">{this.title}</h4>
                <ListGroup>
                    {this.state.lectures.length ?
                        this.state.lectures.map(lecture =>
                            {
                                const d = new Date(lecture.start)
                                return (
                                    <ListGroupItem key={lecture.id}>
                                        <ListGroupItemHeading>
                                            {d.getHours() + ":" + d.getMinutes()} - {lecture.group ? lecture.group.name : lecture.attendances[0].client.name + " " + lecture.attendances[0].client.surname}{' '}
                                            <Badge pill>{lecture.course.name}</Badge>{' '}
                                            <Badge color="warning" pill>Příště platit</Badge>
                                        </ListGroupItemHeading>
                                        <ul>
                                            {lecture.group ? lecture.attendances.map(attendance =>
                                                <li key={attendance.id}>
                                                    {attendance.client.name} {attendance.client.surname} -
                                                    <FontAwesomeIcon icon={faUsdCircle} size="2x"
                                                                     className={attendance.paid ? "text-success" : "text-danger"}/>{' '}
                                                    <Input type="select" bsSize="sm">
                                                        <option>{attendance.attendancestate.name}</option>
                                                    </Input>
                                                </li>
                                            ) : <p>
                                                    <FontAwesomeIcon icon={faUsdCircle} size="2x"
                                                                     className={lecture.attendances[0].paid ? "text-success" : "text-danger"}/>
                                                    <Input type="select" bsSize="sm">
                                                        <option>{lecture.attendances[0].attendancestate.name}</option>
                                                    </Input>
                                                </p>
                                            }
                                        </ul>
                                    </ListGroupItem>)
                            }
                        )
                        :
                        <ListGroupItem>
                            <ListGroupItemHeading>Volno</ListGroupItemHeading>
                        </ListGroupItem>
                    }
                </ListGroup>
            </div>
        )
    }
}
