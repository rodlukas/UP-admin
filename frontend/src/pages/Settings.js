import React, {Component, Fragment} from "react"
import {Table, Modal, Container, Row, Col, CustomInput, Alert} from "reactstrap"
import FormSettings from "../forms/FormSettings"
import {EDIT_TYPE} from "../global/constants"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import Loading from "../components/Loading"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import Heading from "../components/Heading"
import AppVersion from "../components/AppVersion"
import {WithAttendanceStatesContext} from "../contexts/AttendanceStateContext"
import {faCheck, faTimes} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"

class Settings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            courses: [],
            IS_MODAL: false,
            currentObject: {},
            currentType: EDIT_TYPE.STATE,
            IS_LOADING: true,
            state_default_id: undefined,
            state_excused_id: undefined
        }
    }

    getAttendanceStatesData = () =>
        this.props.attendanceStatesContext.attendancestates
    callAttendanceStatesFuncRefresh = () =>
        this.props.attendanceStatesContext.funcRefresh()

    toggle = (type, object = {}) =>
        this.setState({
            currentObject: object,
            currentType: type,
            IS_MODAL: !this.state.IS_MODAL
        })

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
        // odesli na API patch pozadavek
        const data = {id: value, [target.dataset.attribute]: true}
        AttendanceStateService.patch(data)
    }

    refresh = type => {
        if (type === EDIT_TYPE.COURSE)
        {
            this.setState({IS_LOADING: true})
            this.getCourses()
        }
        else if (type === EDIT_TYPE.STATE)
        {
            this.callAttendanceStatesFuncRefresh()
            this.findStateIndexes()
        }
    }

    getCourses = () =>
        CourseService.getAll()
            .then(courses =>
                this.setState({
                    courses,
                    IS_LOADING: false}))

    componentDidMount() {
        this.getCourses()
        this.findStateIndexes()
    }

    componentDidUpdate(prevProps) {
        if(this.getAttendanceStatesData() !== prevProps.attendanceStatesContext.attendancestates)
            this.findStateIndexes()
    }

    findStateIndexes = () => {
        let default_elem = undefined, excused_elem = undefined
        if(this.getAttendanceStatesData() !== null) {
            default_elem = this.getAttendanceStatesData().find(elem => elem.default === true)
            if (default_elem !== undefined)
                default_elem = default_elem.id
            excused_elem = this.getAttendanceStatesData().find(elem => elem.excused === true)
            if (excused_elem !== undefined)
                excused_elem = excused_elem.id
        }
        this.setState({
            state_default_id: default_elem,
            state_excused_id: excused_elem
        })
    }

    render() {
        const {courses, currentType, currentObject, state_excused_id, state_default_id, IS_MODAL, IS_LOADING} = this.state
        const Visible = ({visible}) =>
            <FontAwesomeIcon icon={visible ? faCheck : faTimes} size="lg"/>
        const AttendanceStates = () =>
            <Fragment>
                <h2 className="text-center">
                    Stavy účasti
                </h2>
                <Table striped size="sm">
                    <thead className="thead-dark">
                    <tr>
                        <th>Název</th>
                        <th>Viditelný</th>
                        <th>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.getAttendanceStatesData().map(attendancestate =>
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
                {!Boolean(this.getAttendanceStatesData().length) &&
                <p className="text-muted text-center">
                    Žádné stavy účasti
                </p>}
            </Fragment>
        const DefaultAttendanceState = () =>
            <Fragment>
                <h3 className="text-center">
                    Konfigurace stavů účasti
                </h3>
                {state_default_id === undefined &&
                <Alert color="danger">
                    Není vybraný výchozí stav, aplikace nemůže správně fungovat!
                </Alert>}
                {state_excused_id === undefined &&
                <Alert color="danger">
                    Není vybraný stav „omluven“, aplikace nemůže správně fungovat!
                </Alert>}
                <p>
                    Pro správné fungování aplikace je třeba zvolit výchozí stav účasti, ten zároveň
                    <span className="font-weight-bold"> musí reprezentovat stav „klient se zúčastní/zúčastnil“</span>.
                </p>
                <CustomInput type="select" id="state_default_id" value={state_default_id || "default"}
                             onChange={this.onChange} data-attribute="default">
                    <option disabled value="default">
                        Vyberte stav...
                    </option>
                    {this.getAttendanceStatesData().map(attendancestate =>
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>)}
                </CustomInput>
                <p>
                    Pro správné fungování omluvených a zrušených lekcí je třeba zvolit stav účasti, který
                    <span className="font-weight-bold"> reprezentuje stav „klient je omluven“</span>.
                </p>
                <CustomInput type="select" id="state_excused_id" value={state_excused_id || "default"}
                             onChange={this.onChange} data-attribute="excused">
                    <option disabled value="default">
                        Vyberte stav...
                    </option>
                    {this.getAttendanceStatesData().map(attendancestate =>
                        <option key={attendancestate.id} value={attendancestate.id}>
                            {attendancestate.name}
                        </option>)}
                </CustomInput>
            </Fragment>
        const Courses = () =>
            <Fragment>
                <h2 className="text-center">
                    Kurzy
                </h2>
                <Table striped size="sm">
                    <thead className="thead-dark">
                    <tr>
                        <th>Název</th>
                        <th>Viditelný</th>
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
                <p className="text-center">
                    <span className="font-weight-bold">Verze aplikace:</span> <AppVersion/> - GIT_DATETIME
                </p>
            </Fragment>
        const HeadingContent = () =>
            <Fragment>
                Nastavení
                <AddButton content="Přidat kurz" onClick={() => this.toggle(EDIT_TYPE.COURSE)}/>
                <AddButton content="Přidat stav" onClick={() => this.toggle(EDIT_TYPE.STATE)}/>
            </Fragment>
        return (
            <Fragment>
                <Container>
                    <Heading content={<HeadingContent/>}/>
                    {IS_LOADING ?
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

export default WithAttendanceStatesContext(Settings)
