import React, {Component} from "react"
import {Table, Button, Modal, Container, Row, Col} from 'reactstrap'
import FormSettings from "../forms/FormSettings"
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import Loading from "../api/Loading"

export default class Settings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            attendancestates: [],
            courses: [],
            modal: false,
            currentObject: {},
            currentType: EDIT_TYPE.STATE,
            loadingTimes: 0
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
        this.setState({loadingTimes: this.state.loadingTimes - 1})
        if (type === EDIT_TYPE.COURSE)
            this.getCourses()
        else if (type === EDIT_TYPE.STATE)
            this.getAttendanceStates()
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then((response) => {
                this.setState({attendancestates: response, loadingTimes: this.state.loadingTimes + 1})
            })
    }

    getCourses = () => {
        CourseService.getAll()
            .then((response) => {
                this.setState({courses: response, loadingTimes: this.state.loadingTimes + 1})
            })
    }

    componentDidMount() {
        this.getAttendanceStates()
        this.getCourses()
    }

    render() {
        const {attendancestates, courses, currentType, currentObject} = this.state
        const Visible = ({visible}) => (visible ? 'ANO' : 'NE')
        const SettingsContent = () =>
            <div>
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
                            {attendancestates.map(attendancestate =>
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
                        {!Boolean(attendancestates.length) &&
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
                            {courses.map(course =>
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
                        {!Boolean(courses.length) &&
                        <p className="text-muted text-center">
                            Žádné kurzy
                        </p>}
                    </Col>
                </Row>
            </div>
        return (
            <div>
                <Container>
                    <h1 className="text-center mb-4">
                        Nastavení
                        <Button color="info" className="addBtn" onClick={() => this.toggle(EDIT_TYPE.COURSE)}>Přidat
                            kurz</Button>
                        <Button color="info" className="addBtn" onClick={() => this.toggle(EDIT_TYPE.STATE)}>Přidat
                            stav</Button>
                    </h1>
                    {this.state.loadingTimes !== 2 ?
                        <Loading/> :
                        <SettingsContent/>}
                </Container>
                <Modal isOpen={this.state.modal} toggle={this.toggle} autoFocus={false}>
                    <FormSettings object={currentObject} funcClose={this.toggle} funcRefresh={this.refresh}
                                  TYPE={currentType}/>
                </Modal>
            </div>
        )
    }
}
