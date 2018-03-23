import React, {Component} from "react"
import {Table, Button, Modal, Container, Row, Col} from 'reactstrap'
import FormSettings from "../forms/FormSettings"
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"

export default class Settings extends Component {
    constructor(props) {
        super(props)
        this.title = "Nastavení"
        this.state = {
            attendancestates: [],
            courses: [],
            modal: false,
            currentObject: {},
            currentType: EDIT_TYPE.STATE
        }
    }

    toggle = (type, object = {}) => {
        this.setState({
            currentObject: object,
            currentType: type,
            modal: !this.state.modal
        })
    }

    refresh = (type) => {
        if (type === EDIT_TYPE.COURSE)
            this.getCourses()
        else if (type === EDIT_TYPE.STATE)
            this.getAttendanceStates()
    }

    getAttendanceStates = () => {
        AttendanceStateService
            .getAll()
            .then((response) => {
                this.setState({attendancestates: response})
            })
    }

    getCourses = () => {
        CourseService
            .getAll()
            .then((response) => {
                this.setState({courses: response})
            })
    }

    componentDidMount() {
        this.getAttendanceStates()
        this.getCourses()
    }

    render() {
        const Visible = ({visible}) => (visible ? 'ANO' : 'NE')
        return (
            <div>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Container fluid={true}>
                    <Button color="info" onClick={() => this.toggle(EDIT_TYPE.STATE)}>Přidat stav</Button>{' '}
                    <Button color="info" onClick={() => this.toggle(EDIT_TYPE.COURSE)}>Přidat kurz</Button>
                    <Row>
                        <Col>
                            <h2>Stavy účasti</h2>
                            <Table striped size="sm">
                                <thead className="thead-dark">
                                <tr>
                                    <th>Název</th>
                                    <th>Viditelnost</th>
                                    <th>Akce</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.attendancestates.map(attendancestate =>
                                    <tr key={attendancestate.id}>
                                        <td>{attendancestate.name}</td>
                                        <td><Visible visible={attendancestate.visible}/></td>
                                        <td>
                                            <Button color="primary"
                                                    onClick={() => this.toggle(EDIT_TYPE.STATE, attendancestate)}>Upravit</Button>
                                        </td>
                                    </tr>)}
                                </tbody>
                            </Table>
                            {!Boolean(this.state.attendancestates.length) &&
                            <p className="text-muted text-center">
                                Žádné stavy účasti
                            </p>}
                        </Col>
                        <Col>
                            <h2>Kurzy</h2>
                            <Table striped size="sm">
                                <thead className="thead-dark">
                                <tr>
                                    <th>Název</th>
                                    <th>Viditelnost</th>
                                    <th>Akce</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.courses.map(course =>
                                    <tr key={course.id}>
                                        <td>{course.name}</td>
                                        <td><Visible visible={course.visible}/></td>
                                        <td>
                                            <Button color="primary"
                                                    onClick={() => this.toggle(EDIT_TYPE.COURSE, course)}>Upravit</Button>
                                        </td>
                                    </tr>)}
                                </tbody>
                            </Table>
                            {!Boolean(this.state.courses.length) &&
                            <p className="text-muted text-center">
                                Žádné kurzy
                            </p>}
                        </Col>
                    </Row>
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <FormSettings object={this.state.currentObject} funcClose={this.toggle} funcRefresh={this.refresh}
                                  TYPE={this.state.currentType}/>
                </Modal>
            </div>
        )
    }
}
