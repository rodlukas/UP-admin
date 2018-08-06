import React, {Component, Fragment} from "react"
import {Table, Modal, Container, Row, Col, CustomInput, Alert} from "reactstrap"
import FormSettings from "../forms/FormSettings"
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import Loading from "../api/Loading"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import Heading from "../components/Heading"
import AppVersion from "../components/AppVersion"

const UNDEF = "undef"

export default class Settings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            attendancestates: [],
            courses: [],
            IS_MODAL: false,
            currentObject: {},
            currentType: EDIT_TYPE.STATE,
            LOADING_CNT: 0,
            default_id: this.findDefaultId()
        }
    }

    toggle = (type, object = {}) => {
        this.setState({
            currentObject: object,
            currentType: type,
            IS_MODAL: !this.state.IS_MODAL
        })
    }

    onChange = (e) => {
        const target = e.target
        const state = this.state
        state[target.name] = target.value
        this.setState(state)
        // odesli na API patch pozadavek
        const data = {id: this.state.default_id, default: true}
        AttendanceStateService.patch(data)
    }

    refresh = (type) => {
        this.setState({LOADING_CNT: this.state.LOADING_CNT - 1})
        if (type === EDIT_TYPE.COURSE)
            this.getCourses()
        else if (type === EDIT_TYPE.STATE)
            this.getAttendanceStates()
    }

    getAttendanceStates = () => {
        AttendanceStateService.getAll()
            .then(attendancestates =>
                this.setState({
                    attendancestates,
                    LOADING_CNT: this.state.LOADING_CNT + 1,
                    default_id: this.findDefaultId(attendancestates)}))
    }

    getCourses = () => {
        CourseService.getAll()
            .then(courses =>
                this.setState({
                    courses,
                    LOADING_CNT: this.state.LOADING_CNT + 1}))
    }

    componentDidMount() {
        this.getAttendanceStates()
        this.getCourses()
    }

    findDefaultId = (attendancestates = null) => {
        let default_elem
        if(attendancestates !== null) {
            default_elem = attendancestates.find(function (element) {
                return element.default === true
            })
            if (default_elem !== undefined)
                return default_elem.id
        }
        return UNDEF
    }

    render() {
        const {attendancestates, courses, currentType, currentObject, default_id, IS_MODAL, LOADING_CNT} = this.state
        const Visible = ({visible}) => (visible ? 'ANO' : 'NE')
        const AttendanceStates = () =>
            <Fragment>
                <h2>
                    Stavy účasti
                </h2>
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
                            <td>
                                {attendancestate.name}
                            </td>
                            <td>
                                <Visible visible={attendancestate.visible}/>
                            </td>
                            <td>
                                <EditButton onClick={() => this.toggle(EDIT_TYPE.STATE, attendancestate)}/>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                {!Boolean(attendancestates.length) &&
                <p className="text-muted text-center">
                    Žádné stavy účasti
                </p>}
            </Fragment>
        const DefaultAttendanceState = () =>
            <Fragment>
                <h3>
                    Výchozí stav účasti
                </h3>
                {default_id === UNDEF &&
                <Alert color="danger">
                    Není vybraný výchozí stav, aplikace nemůže správně fungovat!
                </Alert>}
                <p>
                    Pro správné fungování aplikace je třeba zvolit výchozí stav účasti, ten zároveň
                    <span className="font-weight-bold"> musí reprezentovat stav „klient se zúčastní/zúčastnil“</span>.
                </p>
                <CustomInput type="select" name="default_id" id="default_id" value={default_id}
                             onChange={this.onChange}>
                    <option disabled value={UNDEF}>
                        Vyberte stav...
                    </option>
                    {attendancestates.map(attendancestate =>
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>)}
                </CustomInput>
            </Fragment>
        const Courses = () =>
            <Fragment>
                <h2>
                    Kurzy
                </h2>
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
                            <td>
                                {course.name}
                            </td>
                            <td>
                                <Visible visible={course.visible}/>
                            </td>
                            <td>
                                <EditButton onClick={() => this.toggle(EDIT_TYPE.COURSE, course)}/>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>
                {!Boolean(courses.length) &&
                <p className="text-muted text-center">
                    Žádné kurzy
                </p>}
            </Fragment>
        const SettingsContent = () =>
            <Fragment>
                <Row>
                    <Col>
                        <AttendanceStates/>
                        <hr/>
                        <DefaultAttendanceState/>
                    </Col>
                    <Col>
                        <Courses/>
                    </Col>
                </Row>
                <hr/>
                <p>
                    Verze aplikace: <AppVersion/>, GIT_DATETIME
                </p>
            </Fragment>
        const HeadingContent = () =>
            <Fragment>
                Nastavení
                <AddButton title="Přidat kurz" onClick={() => this.toggle(EDIT_TYPE.COURSE)}/>
                <AddButton title="Přidat stav" onClick={() => this.toggle(EDIT_TYPE.STATE)}/>
            </Fragment>
        return (
            <Fragment>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    {LOADING_CNT !== 2 ?
                        <Loading/> :
                        <SettingsContent/>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormSettings object={currentObject} funcClose={this.toggle} funcRefresh={this.refresh}
                                  TYPE={currentType}/>
                </Modal>
            </Fragment>
        )
    }
}
