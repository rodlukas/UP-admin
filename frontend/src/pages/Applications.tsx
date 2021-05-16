import * as React from "react"
import { Badge, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import ApplicationService from "../api/services/ApplicationService"
import APP_URLS from "../APP_URLS"
import DeleteButton from "../components/buttons/DeleteButton"
import ClientName from "../components/ClientName"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext,
} from "../contexts/CoursesVisibleContext"
import ModalApplications from "../forms/ModalApplications"
import { prettyDateWithYear } from "../global/funcDateTime"
import { GroupedObjectsByCourses, groupObjectsByCourses } from "../global/utils"
import { ApplicationType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"
import "./Applications.css"

type Props = CustomRouteComponentProps & CoursesVisibleContextProps

type State = {
    /** Pole zájemců o kurzy. */
    applications: GroupedObjectsByCourses<ApplicationType>
    /** Probíhá načítání (true). */
    isLoading: boolean
}

/** Stránka se zájemci o kurzy. */
class Applications extends React.Component<Props, State> {
    state: State = {
        applications: [],
        isLoading: true,
    }

    refresh = (): void => this.setState({ isLoading: true }, this.getApplications)

    getApplications = (): void => {
        ApplicationService.getAll().then((applications) => {
            const grouppedApplicationsByCourses =
                groupObjectsByCourses<ApplicationType>(applications)
            this.setState({
                applications: grouppedApplicationsByCourses,
                isLoading: false,
            })
        })
    }

    delete = (id: ApplicationType["id"]): void => {
        ApplicationService.remove(id).then(() => this.refresh())
    }

    componentDidMount(): void {
        this.getApplications()
        // prednacteni pro FormApplications (klienty z kontextu nenacitame, protoze chceme i neaktivni)
        this.props.coursesVisibleContext.funcRefresh()
    }

    render(): React.ReactNode {
        const { applications, isLoading } = this.state
        return (
            <>
                <Container>
                    <Heading
                        title={APP_URLS.zajemci.title}
                        buttons={<ModalApplications refresh={this.refresh} />}
                    />
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            {applications.length > 0 && (
                                <UncontrolledTooltipWrapper target="Applications_DateAdded">
                                    Datum přidání
                                </UncontrolledTooltipWrapper>
                            )}
                            {applications.map((courseApplications) => {
                                const cnt = courseApplications.objects.length
                                return (
                                    <ListGroup
                                        key={courseApplications.course.id}
                                        data-qa="applications_for_course"
                                        className="Applications_course">
                                        <ListGroupItem
                                            style={{ background: courseApplications.course.color }}>
                                            <h4 className="mb-0 Applications_courseHeading">
                                                <span data-qa="application_course">
                                                    {courseApplications.course.name}
                                                </span>{" "}
                                                <Badge
                                                    pill
                                                    style={{
                                                        color: courseApplications.course.color,
                                                    }}
                                                    className="font-weight-bold">
                                                    <span data-qa="applications_for_course_cnt">
                                                        {cnt}
                                                    </span>{" "}
                                                    zájemc
                                                    {cnt === 1
                                                        ? "e"
                                                        : cnt > 1 && cnt < 5
                                                        ? "i"
                                                        : "ů"}
                                                </Badge>
                                            </h4>
                                        </ListGroupItem>
                                        {courseApplications.objects.map((application) => (
                                            <ListGroupItem
                                                key={application.id}
                                                data-qa="application">
                                                <Row className="align-items-center">
                                                    <Col md="3">
                                                        <h5 className="mb-0">
                                                            <ClientName
                                                                client={application.client}
                                                                link
                                                            />
                                                        </h5>
                                                    </Col>
                                                    <Col md="5" className="mt-md-0 mt-1">
                                                        <Badge
                                                            color="light"
                                                            id="Applications_DateAdded"
                                                            data-qa="application_created_at">
                                                            {prettyDateWithYear(
                                                                new Date(application.created_at)
                                                            )}
                                                        </Badge>{" "}
                                                        <span data-qa="application_note">
                                                            {application.note}
                                                        </span>
                                                    </Col>
                                                    <Col md="2">
                                                        {application.client.phone && (
                                                            <ClientPhone
                                                                phone={application.client.phone}
                                                                icon
                                                            />
                                                        )}
                                                    </Col>
                                                    <Col className="text-right mt-1 mt-md-0" md="2">
                                                        <ModalApplications
                                                            currentApplication={application}
                                                            refresh={this.refresh}
                                                        />{" "}
                                                        <DeleteButton
                                                            onClick={(): void => {
                                                                if (
                                                                    window.confirm(
                                                                        "Opravdu chcete smazat zájemce " +
                                                                            `${application.client.surname} ${application.client.firstname} o ${application.course.name}?`
                                                                    )
                                                                ) {
                                                                    this.delete(application.id)
                                                                }
                                                            }}
                                                            data-qa="button_delete_application"
                                                        />
                                                    </Col>
                                                </Row>
                                            </ListGroupItem>
                                        ))}
                                    </ListGroup>
                                )
                            })}
                            {applications.length === 0 && (
                                <p className="text-muted text-center">Žádní zájemci</p>
                            )}
                        </>
                    )}
                </Container>
            </>
        )
    }
}

export default WithCoursesVisibleContext(Applications)
