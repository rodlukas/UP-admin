import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTimes } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Alert, Col, Container, Label, ListGroup, ListGroupItem, Row, Table } from "reactstrap"

import AttendanceStateService from "../api/services/AttendanceStateService"
import CourseService from "../api/services/CourseService"
import APP_URLS from "../APP_URLS"
import AppCommit from "../components/AppCommit"
import AppDate from "../components/AppDate"
import AppRelease from "../components/AppRelease"
import CourseCircle from "../components/CourseCircle"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import {
    AttendanceStatesContextProps,
    WithAttendanceStatesContext,
} from "../contexts/AttendanceStatesContext"
import InputWrapper from "../forms/helpers/InputWrapper"
import ModalSettings from "../forms/ModalSettings"
import { EDIT_TYPE } from "../global/constants"
import { AttendanceStateType, CourseType } from "../types/models"
import { CustomRouteComponentProps, QA } from "../types/types"
import "./Settings.css"

type VisibleProps = QA & {
    /** Kurz/stav účasti je viditelný (true). */
    visible: boolean
}

const Visible: React.FC<VisibleProps> = ({ visible, ...props }) => (
    <FontAwesomeIcon
        fixedWidth
        icon={visible ? faCheck : faTimes}
        size="lg"
        {...props}
        className={visible ? "text-success" : "text-secondary"}
    />
)

type Props = CustomRouteComponentProps & AttendanceStatesContextProps

type State = {
    /** Pole kurzů. */
    courses: CourseType[]
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** ID stavu účasti s významem "klient se zúčastní" (výchozí stav). */
    attendanceStateDefaultId?: AttendanceStateType["id"]
    /** ID stavu účasti s významem "klient je omluven". */
    attendanceStateExcusedId?: AttendanceStateType["id"]
}

/** Stránka s nastavením - správa kurzů, stavů účasti, info o aplikaci. */
class Settings extends React.Component<Props, State> {
    state: State = {
        courses: [],
        isLoading: true,
        attendanceStateDefaultId: undefined,
        attendanceStateExcusedId: undefined,
    }

    getAttendanceStatesData = (): AttendanceStateType[] =>
        this.props.attendanceStatesContext.attendancestates
    callAttendanceStatesFuncRefresh = (): void => {
        // zde je potreba zavolat findStateIndexes, to ale obstara componentDidUpdate
        this.props.attendanceStatesContext.funcRefresh()
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const target = e.currentTarget
        const value = Number(target.value)
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState((prevState) => ({
            ...prevState,
            [target.id]: value,
        }))
        const attrApi = target.dataset.attribute
        if (attrApi) {
            // odesli na API patch pozadavek
            const data = { id: value, [attrApi]: true }
            AttendanceStateService.patch(data).then(() => this.callAttendanceStatesFuncRefresh())
        }
    }

    refresh = (type: EDIT_TYPE): void => {
        if (type === EDIT_TYPE.COURSE) {
            this.setState({ isLoading: true }, () => this.getCourses())
        }
        // jine zmeny (v contextu, napr. stavu ucasti) neni treba provadet, to ma na starost ModalSettings
    }

    getCourses = (): void => {
        CourseService.getAll().then((courses) =>
            this.setState({ courses }, () => this.setState({ isLoading: false })),
        )
    }

    componentDidMount(): void {
        this.getCourses()
        // kdyz uz mas data z kontextu, proved hledani, jinak se o zavolani hledani postara componentDidUpdate
        if (this.props.attendanceStatesContext.isLoaded) {
            this.findStateIndexes()
        }
    }

    findStateIndexes = (): void => {
        const defaultElem = this.getAttendanceStatesData().find((elem) => elem.default)
        const attendanceStateDefaultId = defaultElem !== undefined ? defaultElem.id : undefined
        const excusedElem = this.getAttendanceStatesData().find((elem) => elem.excused)
        const attendanceStateExcusedId = excusedElem !== undefined ? excusedElem.id : undefined
        this.setState({
            attendanceStateDefaultId,
            attendanceStateExcusedId,
        })
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        // data z kontextu po componentDidMount z AttendanceStatesContext se zmenila, je potreba projevit zmeny do stavu
        if (
            this.props.attendanceStatesContext.isLoaded &&
            !prevProps.attendanceStatesContext.isLoaded
        ) {
            this.findStateIndexes()
        }
    }

    render(): React.ReactNode {
        const { courses, attendanceStateExcusedId, attendanceStateDefaultId } = this.state
        return (
            <>
                <Container>
                    <Heading
                        title={APP_URLS.nastaveni.title}
                        buttons={
                            <>
                                <ModalSettings refresh={this.refresh} TYPE={EDIT_TYPE.STATE} />
                                <ModalSettings refresh={this.refresh} TYPE={EDIT_TYPE.COURSE} />
                            </>
                        }
                    />
                    {this.state.isLoading || !this.props.attendanceStatesContext.isLoaded ? (
                        <Loading />
                    ) : (
                        <>
                            <Row>
                                <Col md={6}>
                                    <h2>Stavy účasti</h2>
                                    <Table striped responsive size="sm" className="table-custom">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Název</th>
                                                <th className="text-center">Viditelný</th>
                                                <th className="text-end text-md-end">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.getAttendanceStatesData().map(
                                                (attendancestate) => (
                                                    <tr
                                                        key={attendancestate.id}
                                                        data-qa="attendancestate">
                                                        <td data-qa="attendancestate_name">
                                                            {attendancestate.name}
                                                        </td>
                                                        <td className="text-center">
                                                            <Visible
                                                                visible={attendancestate.visible}
                                                                data-qa="attendancestate_visible"
                                                            />
                                                        </td>
                                                        <td className="text-end text-md-end">
                                                            <ModalSettings
                                                                refresh={this.refresh}
                                                                TYPE={EDIT_TYPE.STATE}
                                                                currentObject={attendancestate}
                                                            />
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </Table>
                                    {this.getAttendanceStatesData().length === 0 && (
                                        <p className="text-muted text-center">Žádné stavy účasti</p>
                                    )}
                                    <hr />
                                    <h3>Konfigurace stavů účasti</h3>
                                    {attendanceStateDefaultId === undefined && (
                                        <Alert color="danger">
                                            Není vybraný výchozí stav, aplikace nemůže správně
                                            fungovat!
                                        </Alert>
                                    )}
                                    {attendanceStateExcusedId === undefined && (
                                        <Alert color="danger">
                                            Není vybraný stav „omluven“, aplikace nemůže správně
                                            fungovat!
                                        </Alert>
                                    )}
                                    <p className="mb-2">
                                        Pro správné fungování aplikace je třeba některým
                                        (viditelným) stavům účasti přiřadit zvláštní vlastnosti
                                        podle jejich významu:
                                    </p>
                                    <ListGroup>
                                        <ListGroupItem>
                                            <Row>
                                                <Label for="state_default_id" sm={7}>
                                                    <span className="fw-bold">
                                                        „klient se zúčastní“
                                                    </span>{" "}
                                                    (výchozí stav)
                                                </Label>
                                                <Col sm={5}>
                                                    <InputWrapper
                                                        type="select"
                                                        id="state_default_id"
                                                        value={
                                                            attendanceStateDefaultId ?? "default"
                                                        }
                                                        onChange={this.onChange}
                                                        data-attribute="default">
                                                        <option disabled value="default">
                                                            Vyberte stav...
                                                        </option>
                                                        {this.getAttendanceStatesData().map(
                                                            (attendancestate) =>
                                                                // ukaz jen viditelne stavy, neviditelne nemohou byt vychozi
                                                                attendancestate.visible && (
                                                                    <option
                                                                        key={attendancestate.id}
                                                                        value={attendancestate.id}>
                                                                        {attendancestate.name}
                                                                    </option>
                                                                ),
                                                        )}
                                                    </InputWrapper>
                                                </Col>
                                            </Row>
                                        </ListGroupItem>
                                        <ListGroupItem>
                                            <Row>
                                                <Label for="state_excused_id" sm={7}>
                                                    <span className="fw-bold">
                                                        „klient je omluven“
                                                    </span>
                                                </Label>
                                                <Col sm={5}>
                                                    <InputWrapper
                                                        type="select"
                                                        id="state_excused_id"
                                                        value={
                                                            attendanceStateExcusedId ?? "default"
                                                        }
                                                        onChange={this.onChange}
                                                        data-attribute="excused">
                                                        <option disabled value="default">
                                                            Vyberte stav...
                                                        </option>
                                                        {this.getAttendanceStatesData().map(
                                                            (attendancestate) =>
                                                                // ukaz jen viditelne stavy, neviditelne nemohou byt omluvene
                                                                attendancestate.visible && (
                                                                    <option
                                                                        key={attendancestate.id}
                                                                        value={attendancestate.id}>
                                                                        {attendancestate.name}
                                                                    </option>
                                                                ),
                                                        )}
                                                    </InputWrapper>
                                                </Col>
                                            </Row>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                                <Col md={6}>
                                    <h2>Kurzy</h2>
                                    <Table striped responsive size="sm" className="table-custom">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Název</th>
                                                <th className="text-center">Viditelný</th>
                                                <th className="text-center">Barva</th>
                                                <th className="text-center">Trvání</th>
                                                <th className="text-end text-md-end">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map((course) => (
                                                <tr key={course.id} data-qa="course">
                                                    <td data-qa="course_name">{course.name}</td>
                                                    <td className="text-center">
                                                        <Visible
                                                            visible={course.visible}
                                                            data-qa="course_visible"
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <CourseCircle
                                                            color={course.color}
                                                            size={1.7}
                                                            showTitle
                                                        />
                                                    </td>
                                                    <td
                                                        data-qa="course_duration"
                                                        className="text-center">
                                                        {course.duration}
                                                    </td>
                                                    <td className="text-end text-md-end">
                                                        <ModalSettings
                                                            refresh={this.refresh}
                                                            TYPE={EDIT_TYPE.COURSE}
                                                            currentObject={course}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {courses.length === 0 && (
                                        <p className="text-muted text-center">Žádné kurzy</p>
                                    )}
                                </Col>
                            </Row>
                            <hr />
                            <p className="text-center Settings_Footer">
                                <span className="fw-bold">Verze aplikace:</span>{" "}
                                <AppCommit pageId="Settings" />
                                {" ("}
                                <AppRelease />
                                {")"} – <AppDate />{" "}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://github.com/rodlukas/UP-admin"
                                    className="mx-1">
                                    <FontAwesomeIcon
                                        id="Settings_GHRepo"
                                        icon={faGithub}
                                        size="lg"
                                        data-qa="lecture_attendance_paid"
                                    />
                                    <UncontrolledTooltipWrapper target="Settings_GHRepo">
                                        GitHub repozitář ÚPadmin
                                    </UncontrolledTooltipWrapper>
                                </a>
                                {" • "}
                                <a
                                    target="_blank"
                                    className="mx-1"
                                    rel="noopener noreferrer"
                                    href="/api/docs/">
                                    API dokumentace
                                </a>
                            </p>
                            <p className="text-center Settings_Footer">
                                S láskou vytvořil{" "}
                                <a
                                    href="http://lukasrod.cz/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    Lukáš Rod
                                </a>
                                , 2018&ndash;%GIT_YEAR
                            </p>
                        </>
                    )}
                </Container>
            </>
        )
    }
}

export default WithAttendanceStatesContext(Settings)
