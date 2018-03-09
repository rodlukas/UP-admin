import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge} from 'reactstrap';
import axios from "axios"
import {faUsdCircle} from '@fortawesome/fontawesome-pro-solid'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

export default class DashboardDay extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lectures: []
        }
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?date=' + this.props.date)
            .then((response) => {
                this.setState({lectures: response.data})
            })
            .catch((error) => {
                console.log(error)
            })
    }

    componentDidMount() {
        this.getLectures()
    }

    render() {
        return (
            <ListGroup>
                {this.state.lectures.length ?
                    this.state.lectures.map(
                        lecture => {
                            const d = new Date(lecture.start)
                            return (
                                <ListGroupItem key={lecture.id}>
                                    <ListGroupItemHeading>{d.getHours() + ":" + d.getMinutes()} - {lecture.group ? lecture.group.name : lecture.attendances[0].client.name + " " + lecture.attendances[0].client.surname}
                                        &nbsp;<Badge pill>{lecture.course.name}</Badge></ListGroupItemHeading>

                                    <ul>
                                        {lecture.group ? lecture.attendances.map(
                                            attendance =>
                                                <li key={attendance.id}>
                                                    {attendance.client.name} {attendance.client.surname} - <FontAwesomeIcon icon={faUsdCircle}
                                                                                                                            size="lg" className={attendance.paid ? "text-success" : "text-danger"}/>, {attendance.attendancestate.name}
                                                </li>
                                        ) : ""
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
        )
    }
}
