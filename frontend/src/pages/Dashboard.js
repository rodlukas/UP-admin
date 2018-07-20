import React, {Component, Fragment} from "react"
import {Container, Row, Col} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import AttendanceStateService from "../api/services/attendancestate"
import Heading from "../components/Heading"

export default class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.date = new Date()
        this.state = {attendancestates: []}
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then(attendancestates => this.setState({attendancestates}))
    }

    componentDidMount() {
        this.getAttendanceStates()
    }

    render() {
        const HeadingContent = () =>
            <Fragment>
                Dnešní přehled
            </Fragment>
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content={<HeadingContent/>}/>
                        <DashboardDay date={this.date.toString()} attendancestates={this.state.attendancestates}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}
