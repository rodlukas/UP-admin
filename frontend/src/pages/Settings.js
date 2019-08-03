import {faCheck, faTimes} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React, {Component, Fragment} from "react"
import {Alert, Col, Container, CustomInput, Modal, Row, Table} from "reactstrap"
import AttendanceStateService from "../api/services/attendancestate"
import CourseService from "../api/services/course"
import AppRelease from "../components/AppRelease"
import AppVersion from "../components/AppVersion"
import AddButton from "../components/buttons/AddButton"
import EditButton from "../components/buttons/EditButton"
import Circle from "../components/Circle"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import {WithAttendanceStatesContext} from "../contexts/AttendanceStatesContext"
import {WithCoursesVisibleContext} from "../contexts/CoursesVisibleContext"
import FormSettings from "../forms/FormSettings"
import {EDIT_TYPE} from "../global/constants"
import APP_URLS from "../urls"

const Visible = ({visible, ...props}) =>
    <FontAwesomeIcon fixedWidth icon={visible ? faCheck : faTimes} size="lg" {...props}
                     className={visible ? "text-success" : "text-secondary"}/>

class Settings extends Component {
    constructor(props) {
        super(props)
        this.state = {
            courses: [],
            IS_MODAL: false,
            currentObject: {},
            currentType: EDIT_TYPE.STATE,
            LOADING_CNT: this.isLoadedAttendanceStates() ? 1 : 0,
            state_default_id: undefined,
            state_excused_id: undefined
        }
    }

    loadingStateIncrement = () =>
        this.setState(prevState => ({LOADING_CNT: prevState.LOADING_CNT + 1}))

    loadingStateDecrementCallback = prevState => ({LOADING_CNT: prevState.LOADING_CNT - 1})

    isLoadedAttendanceStates = () =>
        this.props.attendanceStatesContext.isLoaded
    getAttendanceStatesData = () =>
        this.props.attendanceStatesContext.attendancestates
    callAttendanceStatesFuncRefresh = () =>
        this.props.attendanceStatesContext.funcRefresh(this.loadingStateIncrement)

    toggle = (type, object = {}) =>
        this.setState(prevState => ({
            currentObject: object,
            currentType: type,
            IS_MODAL: !prevState.IS_MODAL
        }))

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
        // odesli na API patch pozadavek
        const data = {id: value, [target.dataset.attribute]: true}
        AttendanceStateService.patch(data)
            .then(() =>
                this.setState(
                    this.loadingStateDecrementCallback,
                    this.callAttendanceStatesFuncRefresh))
    }

    refresh = type => {
        if (type === EDIT_TYPE.COURSE) {
            this.setState(
                this.loadingStateDecrementCallback,
                () => {
                    this.getCourses()
                    this.props.coursesVisibleContext.funcHardRefresh()
                })
        } else if (type === EDIT_TYPE.STATE) {
            this.setState(
                this.loadingStateDecrementCallback,
                () => {
                    this.callAttendanceStatesFuncRefresh()
                    // neni zde potreba volat findStateIndexes - resi componentDidUpdate
                })
        }
    }

    getCourses = () =>
        CourseService.getAll()
            .then(courses =>
                this.setState({courses}, this.loadingStateIncrement))

    componentDidMount() {
        this.getCourses()
        this.findStateIndexes()
    }

    componentDidUpdate(prevProps) {
        if (this.getAttendanceStatesData() !== prevProps.attendanceStatesContext.attendancestates)
        // je potreba volat findStateIndexes, protoze se napr. muze skryt vychozi stav, tzn. API mu odebere i priznak ze je vychozi - je potreba tyto zmeny projevit
            this.findStateIndexes()
        if (this.isLoadedAttendanceStates() !== prevProps.attendanceStatesContext.isLoaded)
            this.loadingStateIncrement()
    }

    findStateIndexes = () => {
        let default_elem = undefined, excused_elem = undefined
        if (this.getAttendanceStatesData() !== null) {
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
        const {courses, currentType, currentObject, state_excused_id, state_default_id, IS_MODAL, LOADING_CNT} = this.state
        return (
            <Fragment>
                <Container>
                    <Heading content={
                        <Fragment>
                            {APP_URLS.nastaveni.title}
                            <AddButton content="Přidat kurz" onClick={() => this.toggle(EDIT_TYPE.COURSE)}
                                       data-qa="button_add_course"/>
                            <AddButton content="Přidat stav účasti" onClick={() => this.toggle(EDIT_TYPE.STATE)}
                                       data-qa="button_add_attendancestate"/>
                        </Fragment>
                    }/>
                    {LOADING_CNT !== 2 ?
                        <Loading/> :
                        <div className="pageContent">
                            <Row>
                                <Col>
                                    <h2 className="text-center">
                                        Stavy účasti
                                    </h2>
                                    <Table striped size="sm">
                                        <thead className="thead-dark">
                                        <tr>
                                            <th>Název</th>
                                            <th className="text-center">Viditelný</th>
                                            <th>Akce</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {this.getAttendanceStatesData().map(attendancestate =>
                                            <tr key={attendancestate.id} data-qa="attendancestate">
                                                <td data-qa="attendancestate_name">
                                                    {attendancestate.name}
                                                </td>
                                                <td className="text-center">
                                                    <Visible visible={attendancestate.visible}
                                                             data-qa="attendancestate_visible"/>
                                                </td>
                                                <td>
                                                    <EditButton content="Upravit stav účasti"
                                                                onClick={() => this.toggle(EDIT_TYPE.STATE, attendancestate)}
                                                                data-qa="button_edit_attendancestate"/>
                                                </td>
                                            </tr>)}
                                        </tbody>
                                    </Table>
                                    {!Boolean(this.getAttendanceStatesData().length) &&
                                    <p className="text-muted text-center">
                                        Žádné stavy účasti
                                    </p>}
                                    <hr/>
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
                                    <h4 className="text-center">Výchozí stav</h4>
                                    <p className="mb-2">
                                        Pro správné fungování aplikace je třeba zvolit <span
                                        className="font-weight-bold">výchozí</span> stav
                                        účasti (viditelný), ten zároveň <span className="font-weight-bold">musí
                                        reprezentovat stav „klient se zúčastní/zúčastnil“</span>.
                                    </p>
                                    <CustomInput type="select" id="state_default_id"
                                                 value={state_default_id || "default"}
                                                 onChange={this.onChange} data-attribute="default">
                                        <option disabled value="default">
                                            Vyberte stav...
                                        </option>
                                        {this.getAttendanceStatesData().map(attendancestate =>
                                            // ukaz jen viditelne stavy, neviditelne nemohou byt vychozi
                                            attendancestate.visible &&
                                            <option key={attendancestate.id} value={attendancestate.id}>
                                                {attendancestate.name}
                                            </option>)}
                                    </CustomInput>
                                    <h4 className="mt-3 text-center">Stav omluven</h4>
                                    <p className="mb-2">
                                        Pro správné fungování omluvených a zrušených lekcí je třeba zvolit stav účasti
                                        (viditelný),
                                        který <span
                                        className="font-weight-bold">reprezentuje stav „klient je omluven“</span>.
                                    </p>
                                    <CustomInput type="select" id="state_excused_id"
                                                 value={state_excused_id || "default"}
                                                 onChange={this.onChange} data-attribute="excused">
                                        <option disabled value="default">
                                            Vyberte stav...
                                        </option>
                                        {this.getAttendanceStatesData().map(attendancestate =>
                                            // ukaz jen viditelne stavy, neviditelne nemohou byt omluvene
                                            attendancestate.visible &&
                                            <option key={attendancestate.id} value={attendancestate.id}>
                                                {attendancestate.name}
                                            </option>)}
                                    </CustomInput>
                                </Col>
                                <Col>
                                    <h2 className="text-center">
                                        Kurzy
                                    </h2>
                                    <Table striped size="sm">
                                        <thead className="thead-dark">
                                        <tr>
                                            <th>Název</th>
                                            <th className="text-center">Viditelný</th>
                                            <th className="text-center">Barva</th>
                                            <th className="text-center">Trvání</th>
                                            <th>Akce</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {courses.map(course =>
                                            <tr key={course.id} data-qa="course">
                                                <td data-qa="course_name">
                                                    {course.name}
                                                </td>
                                                <td className="text-center">
                                                    <Visible visible={course.visible} data-qa="course_visible"/>
                                                </td>
                                                <td className="text-center">
                                                    <Circle color={course.color} size={1.7} showTitle/>
                                                </td>
                                                <td data-qa="course_duration" className="text-center">
                                                    {course.duration}
                                                </td>
                                                <td>
                                                    <EditButton content="Upravit kurz"
                                                                onClick={() => this.toggle(EDIT_TYPE.COURSE, course)}
                                                                data-qa="button_edit_course"/>
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
                            <hr/>
                            <p className="text-center">
                                <span className="font-weight-bold">Verze aplikace:</span>
                                {' '}
                                <AppVersion/><AppRelease/> –
                                {' '}
                                <span className="text-nowrap">GIT_DATETIME</span>
                            </p>
                        </div>}
                </Container>
                <Modal isOpen={IS_MODAL} toggle={this.toggle} autoFocus={false}>
                    <FormSettings object={currentObject} funcClose={this.toggle} funcRefresh={this.refresh}
                                  TYPE={currentType}/>
                </Modal>
            </Fragment>
        )
    }
}

export default WithAttendanceStatesContext(WithCoursesVisibleContext(Settings))
