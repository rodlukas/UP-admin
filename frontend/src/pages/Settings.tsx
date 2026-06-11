import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    Alert,
    Container,
    Select,
    SimpleGrid,
    Skeleton,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core"
import { faCheck, faTimes } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { useCourses, usePatchAttendanceState } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import AppCommit from "../components/AppCommit"
import AppDate from "../components/AppDate"
import AppRelease from "../components/AppRelease"
import CourseCircle from "../components/CourseCircle"
import Heading from "../components/Heading"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalSettings from "../forms/ModalSettings"
import { EDIT_TYPE } from "../global/constants"
import { bold, iconInlineX, mb0 } from "../global/utility.css"
import { vars } from "../theme/tokens"
import { AttendanceStateType } from "../types/models"
import { QA } from "../types/types"

import * as styles from "./Settings.css"

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
        color={visible ? vars.colors.success : vars.text.muted}
    />
)

/** Stránka s nastavením – správa kurzů, stavů účasti, info o aplikaci. */
const Settings: React.FC = () => {
    const attendanceStatesContext = useAttendanceStatesContext()
    const {
        data: courses = [],
        isLoading: coursesLoading,
        isFetching: coursesFetching,
    } = useCourses()

    const patchAttendanceState = usePatchAttendanceState()

    /** ID stavu účasti s významem "klient se zúčastní" (výchozí stav). */
    const [attendanceStateDefaultId, setAttendanceStateDefaultId] = React.useState<
        AttendanceStateType["id"] | undefined
    >(undefined)
    /** ID stavu účasti s významem "klient je omluven". */
    const [attendanceStateExcusedId, setAttendanceStateExcusedId] = React.useState<
        AttendanceStateType["id"] | undefined
    >(undefined)

    React.useEffect(() => {
        if (!attendanceStatesContext.isLoading) {
            const attendanceStates = attendanceStatesContext.attendancestates
            const defaultElem = attendanceStates.find((elem) => elem.default)
            const excusedElem = attendanceStates.find((elem) => elem.excused)
            setAttendanceStateDefaultId(defaultElem?.id)
            setAttendanceStateExcusedId(excusedElem?.id)
        }
    }, [attendanceStatesContext.isLoading, attendanceStatesContext.attendancestates])

    const onChangeDefaultState = (val: string | null): void => {
        if (!val) {
            return
        }
        const numVal = Number(val)
        setAttendanceStateDefaultId(numVal)
        patchAttendanceState.mutate({ id: numVal, default: true })
    }

    const onChangeExcusedState = (val: string | null): void => {
        if (!val) {
            return
        }
        const numVal = Number(val)
        setAttendanceStateExcusedId(numVal)
        patchAttendanceState.mutate({ id: numVal, excused: true })
    }

    const isLoading = coursesLoading || attendanceStatesContext.isLoading
    const isFetching = coursesFetching || attendanceStatesContext.isFetching

    return (
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
                <>
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} h={36} mb="xs" radius="sm" />
                    ))}
                </>
            ) : (
                <>
                    <SimpleGrid cols={{ base: 1, md: 2 }} className={styles.settingsColumnsRow}>
                        <div>
                            <div className={styles.settingsColumn}>
                                <Title order={2}>Stavy účasti</Title>
                                {attendanceStatesContext.attendancestates.length > 0 && (
                                    <Table.ScrollContainer
                                        minWidth={300}
                                        className={styles.tableSection}>
                                        <Table striped highlightOnHover verticalSpacing="xs">
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Název</Table.Th>
                                                    <Table.Th ta="center">Viditelný</Table.Th>
                                                    <Table.Th ta="right">Akce</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {attendanceStatesContext.attendancestates.map(
                                                    (attendancestate) => (
                                                        <Table.Tr
                                                            key={attendancestate.id}
                                                            data-qa="attendancestate">
                                                            <Table.Td data-qa="attendancestate_name">
                                                                {attendancestate.name}
                                                            </Table.Td>
                                                            <Table.Td ta="center">
                                                                <Visible
                                                                    visible={
                                                                        attendancestate.visible
                                                                    }
                                                                    data-qa="attendancestate_visible"
                                                                />
                                                            </Table.Td>
                                                            <Table.Td ta="right">
                                                                <ModalSettings
                                                                    TYPE={EDIT_TYPE.STATE}
                                                                    currentObject={attendancestate}
                                                                />
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    ),
                                                )}
                                            </Table.Tbody>
                                        </Table>
                                    </Table.ScrollContainer>
                                )}
                                {attendanceStatesContext.attendancestates.length === 0 && (
                                    <Text c="dimmed" className={styles.emptyMessage}>
                                        Žádné stavy účasti
                                    </Text>
                                )}
                                <hr />
                                <Title order={3}>Konfigurace stavů účasti</Title>
                                {attendanceStateDefaultId === undefined && (
                                    <Alert color="red">
                                        Není vybraný výchozí stav, aplikace nemůže správně fungovat!
                                    </Alert>
                                )}
                                {attendanceStateExcusedId === undefined && (
                                    <Alert color="red">
                                        Není vybraný stav &bdquo;omluven&ldquo;, aplikace nemůže
                                        správně fungovat!
                                    </Alert>
                                )}
                                <p className={mb0}>
                                    Pro správné fungování aplikace je třeba některým (viditelným)
                                    stavům účasti přiřadit zvláštní vlastnosti podle jejich významu:
                                </p>
                                <div className={styles.configList}>
                                    <div className={styles.configListItem}>
                                        <div className={styles.configRow}>
                                            <label
                                                htmlFor="state_default_id"
                                                className={styles.configRowLabel}>
                                                <Text component="span" fw={700}>
                                                    &bdquo;klient se zúčastní&ldquo;
                                                </Text>{" "}
                                                (výchozí stav)
                                            </label>
                                            <div className={styles.configRowControl}>
                                                <Select
                                                    id="state_default_id"
                                                    data={attendanceStatesContext.attendancestates
                                                        .filter((s) => s.visible)
                                                        .map((s) => ({
                                                            value: s.id.toString(),
                                                            label: s.name,
                                                        }))}
                                                    value={
                                                        attendanceStateDefaultId?.toString() ?? null
                                                    }
                                                    onChange={onChangeDefaultState}
                                                    placeholder="Vyberte stav..."
                                                    allowDeselect={false}
                                                    comboboxProps={{ withinPortal: true }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.configListItem}>
                                        <div className={styles.configRow}>
                                            <label
                                                htmlFor="state_excused_id"
                                                className={styles.configRowLabel}>
                                                <Text component="span" fw={700}>
                                                    &bdquo;klient je omluven&ldquo;
                                                </Text>
                                            </label>
                                            <div className={styles.configRowControl}>
                                                <Select
                                                    id="state_excused_id"
                                                    data={attendanceStatesContext.attendancestates
                                                        .filter((s) => s.visible)
                                                        .map((s) => ({
                                                            value: s.id.toString(),
                                                            label: s.name,
                                                        }))}
                                                    value={
                                                        attendanceStateExcusedId?.toString() ?? null
                                                    }
                                                    onChange={onChangeExcusedState}
                                                    placeholder="Vyberte stav..."
                                                    allowDeselect={false}
                                                    comboboxProps={{ withinPortal: true }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className={styles.settingsColumn}>
                                <Title order={2}>Kurzy</Title>
                                {courses.length > 0 && (
                                    <Table.ScrollContainer
                                        minWidth={300}
                                        className={styles.tableSection}>
                                        <Table striped highlightOnHover verticalSpacing="xs">
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Název</Table.Th>
                                                    <Table.Th ta="center">Viditelný</Table.Th>
                                                    <Table.Th ta="center">Barva</Table.Th>
                                                    <Table.Th ta="center">Trvání (min.)</Table.Th>
                                                    <Table.Th ta="right">Akce</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {courses.map((course) => (
                                                    <Table.Tr key={course.id} data-qa="course">
                                                        <Table.Td data-qa="course_name">
                                                            {course.name}
                                                        </Table.Td>
                                                        <Table.Td ta="center">
                                                            <Visible
                                                                visible={course.visible}
                                                                data-qa="course_visible"
                                                            />
                                                        </Table.Td>
                                                        <Table.Td ta="center">
                                                            <CourseCircle
                                                                color={course.color}
                                                                size={1.7}
                                                                showTitle
                                                            />
                                                        </Table.Td>
                                                        <Table.Td
                                                            data-qa="course_duration"
                                                            ta="center">
                                                            {course.duration}
                                                        </Table.Td>
                                                        <Table.Td ta="right">
                                                            <ModalSettings
                                                                TYPE={EDIT_TYPE.COURSE}
                                                                currentObject={course}
                                                            />
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </Table.ScrollContainer>
                                )}
                                {courses.length === 0 && (
                                    <Text c="dimmed" className={styles.emptyMessage}>
                                        Žádné kurzy
                                    </Text>
                                )}
                            </div>
                        </div>
                    </SimpleGrid>
                    <div className={styles.footerBlock}>
                        <p className={`${styles.footer} ${styles.emptyMessage}`}>
                            <span className={bold}>Verze aplikace:</span> <AppCommit />
                            {" ("}
                            <AppRelease />
                            {")"} – <AppDate />{" "}
                            <Tooltip label="GitHub repozitář ÚPadmin">
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://github.com/rodlukas/UP-admin"
                                    className={iconInlineX}>
                                    <FontAwesomeIcon
                                        icon={faGithub}
                                        size="lg"
                                        data-qa="link_github_repo"
                                    />
                                </a>
                            </Tooltip>
                            {" • "}
                            <a
                                target="_blank"
                                className={iconInlineX}
                                rel="noopener noreferrer"
                                href="/api/docs/">
                                API dokumentace
                            </a>
                        </p>
                        <p className={`${styles.footer} ${styles.emptyMessage}`}>
                            S láskou vytvořil{" "}
                            <a
                                href="https://lukasrod.cz/"
                                target="_blank"
                                rel="noopener noreferrer">
                                Lukáš Rod
                            </a>
                            <span>, 2018&ndash;%GIT_YEAR</span>
                        </p>
                    </div>
                </>
            )}
        </Container>
    )
}

export default Settings
