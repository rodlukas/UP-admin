import React, {Component} from "react"
import {ListGroup, ListGroupItem, ListGroupItemHeading, Badge} from 'reactstrap';
import axios from 'axios';

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.date = new Date().toISOString().substring(0, 10)
        this.prettydate = new Date()
        this.title = "Dnešní přehled - " + this.prettydate.getDate() + ". " + (this.prettydate.getMonth()+1) + ". " + this.prettydate.getFullYear()
        this.state = {
            lectures: [],
            modal: false,
            currentuser: []
        }
        this.toggle = this.toggle.bind(this)
    }

    toggle(user) {
        this.setState({
            currentuser: user,
            modal: !this.state.modal
        })
    }

    getLectures = () => {
        axios.get('/api/v1/lectures/?date=' + this.date)
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
            <div>
                <h1>{this.title}</h1>
                <ListGroup>
                    {
                        this.state.lectures.map(
                            lecture =>
                            {
                                const d = new Date(lecture.start)
                                return (
                                <ListGroupItem key={lecture.id}>
                                    <ListGroupItemHeading>{d.getHours() + ":" + d.getMinutes()} - {lecture.group ? lecture.group.name : lecture.attendances[0].client.name + " " + lecture.attendances[0].client.surname} <Badge
                                        pill>{lecture.course.name}</Badge></ListGroupItemHeading>

                                    <ul>
                                        {lecture.group ? lecture.attendances.map(
                                            attendance =>
                                                <li key={attendance.id}>
                                                    {attendance.client.name} {attendance.client.surname} - {attendance.paid ? "placeno" : "NEPLACENO"}, {attendance.attendancestate.name}
                                                </li>
                                                ) : ""
                                        }
                                    </ul>
                                </ListGroupItem>)
                            }
                                )
                    }
                </ListGroup>
            </div>
        )
    }
}

export default Dashboard
