import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTimes } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"
import { Alert, Col, Container, Label, ListGroup, ListGroupItem, Row, Table } from "reactstrap"

import { useCourses, usePatchAttendanceState } from "../api/hooks"
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
import CustomInputWrapper from "../forms/helpers/CustomInputWrapper"
import ModalSettings from "../forms/ModalSettings"
import { EDIT_TYPE } from "../global/constants"
import { AttendanceStateType } from "../types/models"
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
        className={classNames({
            "text-success": visible,
            "text-secondary": !visible,
        })}
    />
)

type Props = CustomRouteComponentProps & AttendanceStatesContextProps

/** Stránka s nastavením - správa kurzů, stavů účasti, info o aplikaci. */
const Settings: React.FC<Props> = (props) => {
    const {
        data: courses = [],
        isLoading: coursesLoading,
        isFetching: coursesFetching,
    } = useCourses()
    const patchAttendanceState = usePatchAttendanceState()

    /**ID stavu účasti s významem "klient se zúčastní" (výchozí stav). */
    const [attendanceStateDefaultId, setAttendanceStateDefaultId] = React.useState<
        AttendanceStateType["id"] | undefined
    >(undefined)
    /** ID stavu účasti s významem "klient je omluven". */
    const [attendanceStateExcusedId, setAttendanceStateExcusedId] = React.useState<
        AttendanceStateType["id"] | undefined
    >(undefined)

    React.useEffect(() => {
        if (props.attendanceStatesContext.isLoaded) {
            const attendanceStates = props.attendanceStatesContext.attendancestates
            const defaultElem = attendanceStates.find((elem) => elem.default)
            const defaultId = defaultElem !== undefined ? defaultElem.id : undefined
            const excusedElem = attendanceStates.find((elem) => elem.excused)
            const excusedId = excusedElem !== undefined ? excusedElem.id : undefined
            setAttendanceStateDefaultId(defaultId)
            setAttendanceStateExcusedId(excusedId)
        }
    }, [props.attendanceStatesContext.isLoaded, props.attendanceStatesContext.attendancestates])

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>): void => {
            const target = e.currentTarget
            const value = Number(target.value)
            if (target.id === "state_default_id") {
                setAttendanceStateDefaultId(value)
            } else if (target.id === "state_excused_id") {
                setAttendanceStateExcusedId(value)
            }
            const attrApi = target.dataset.attribute
            if (attrApi) {
                // odesli na API patch pozadavek
                const data = { id: value, [attrApi]: true }
                patchAttendanceState.mutate(data)
            }
        },
        [patchAttendanceState],
    )

    const isLoading = coursesLoading || !props.attendanceStatesContext.isLoaded
    const isFetching = coursesFetching || props.attendanceStatesContext.isFetching
    return (
        <>
            <Container>
                <Heading
                    title={APP_URLS.nastaveni.title}
                    isFetching={isFetching}
                    buttons={
                        <>
                            <ModalSettings TYPE={EDIT_TYPE.STATE} />
                            <ModalSettings TYPE={EDIT_TYPE.COURSE} />
                        </>
                    }
                />
                {isLoading ? (
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
                                            <th className="text-right text-md-right">Akce</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.attendanceStatesContext.attendancestates.map(
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
                                                    <td className="text-right text-md-right">
                                                        <ModalSettings
                                                            TYPE={EDIT_TYPE.STATE}
                                                            currentObject={attendancestate}
                                                        />
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </Table>
                                {props.attendanceStatesContext.attendancestates.length === 0 && (
                                    <p className="text-muted text-center">Žádné stavy účasti</p>
                                )}
                                <hr />
                                <h3>Konfigurace stavů účasti</h3>
                                {attendanceStateDefaultId === undefined && (
                                    <Alert color="danger">
                                        Není vybraný výchozí stav, aplikace nemůže správně fungovat!
                                    </Alert>
                                )}
                                {attendanceStateExcusedId === undefined && (
                                    <Alert color="danger">
                                        Není vybraný stav „omluven“, aplikace nemůže správně
                                        fungovat!
                                    </Alert>
                                )}
                                <p className="mb-2">
                                    Pro správné fungování aplikace je třeba některým (viditelným)
                                    stavům účasti přiřadit zvláštní vlastnosti podle jejich významu:
                                </p>
                                <ListGroup>
                                    <ListGroupItem>
                                        <Row>
                                            <Label for="state_default_id" sm={7}>
                                                <span className="font-weight-bold">
                                                    „klient se zúčastní“
                                                </span>{" "}
                                                (výchozí stav)
                                            </Label>
                                            <Col sm={5}>
                                                <CustomInputWrapper
                                                    type="select"
                                                    id="state_default_id"
                                                    value={attendanceStateDefaultId ?? "default"}
                                                    onChange={onChange}
                                                    data-attribute="default">
                                                    <option disabled value="default">
                                                        Vyberte stav...
                                                    </option>
                                                    {props.attendanceStatesContext.attendancestates.map(
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
                                                </CustomInputWrapper>
                                            </Col>
                                        </Row>
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        <Row>
                                            <Label for="state_excused_id" sm={7}>
                                                <span className="font-weight-bold">
                                                    „klient je omluven“
                                                </span>
                                            </Label>
                                            <Col sm={5}>
                                                <CustomInputWrapper
                                                    type="select"
                                                    id="state_excused_id"
                                                    value={attendanceStateExcusedId ?? "default"}
                                                    onChange={onChange}
                                                    data-attribute="excused">
                                                    <option disabled value="default">
                                                        Vyberte stav...
                                                    </option>
                                                    {props.attendanceStatesContext.attendancestates.map(
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
                                                </CustomInputWrapper>
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
                                            <th className="text-right text-md-right">Akce</th>
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
                                                <td className="text-right text-md-right">
                                                    <ModalSettings
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
                            <span className="font-weight-bold">Verze aplikace:</span>{" "}
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
                                href="https://lukasrod.cz/"
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

export default WithAttendanceStatesContext(Settings)
