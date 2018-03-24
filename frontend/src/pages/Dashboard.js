import React, {Component} from "react"
import {Container, Row, Col} from 'reactstrap'
import DashboardDay from '../components/DashboardDay'
import AttendanceStateService from "../api/services/attendancestate"

export default class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.date = new Date()
        this.title = "Dnešní přehled"
        this.state = {attendancestates: []}
    }

    getAttendanceStates = () => {
        AttendanceStateService
            .getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    render() {
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container>
                    <Row>
                        <Col sm="12" md={{size: 8, offset: 2}}>
                            <DashboardDay date={this.date.toString()} attendancestates={this.state.attendancestates}/>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}
