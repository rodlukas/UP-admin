import React, {Component} from "react"
import {Container, Row, Col} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import AttendanceStateService from "../api/services/attendancestate"

export default class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.date = new Date()
        this.state = {attendancestates: []}
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    render() {
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <h1 className="text-center mb-4">
                            Dnešní přehled
                        </h1>
                        <DashboardDay date={this.date.toString()} attendancestates={this.state.attendancestates}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}
