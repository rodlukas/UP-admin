import classNames from "classnames"
import * as React from "react"
import { Badge, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import { useApplications, useDeleteApplication } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import DeleteButton from "../components/buttons/DeleteButton"
import ClientName from "../components/ClientName"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import UncontrolledTooltipWrapper from "../components/UncontrolledTooltipWrapper"
import ModalApplications from "../forms/ModalApplications"
import { prettyDateWithYear } from "../global/funcDateTime"
import { GroupedObjectsByCourses, groupObjectsByCourses } from "../global/utils"
import { ApplicationType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

import styles from "./Applications.module.css"

type Props = CustomRouteComponentProps

/**
 * Vrací správnou koncovku pro slovo "zájemc" podle počtu.
 * @param cnt Počet zájemců
 * @returns Koncovka: "e" pro 1, "i" pro 2-4, "ů" pro 5+
 */
const getZajemciSuffix = (cnt: number): string => {
    if (cnt === 1) {
        return "e"
    }
    if (cnt > 1 && cnt < 5) {
        return "i"
    }
    return "ů"
}

/** Stránka se zájemci o kurzy. */
const Applications: React.FC<Props> = () => {
    const { data: applicationsData, isLoading, isFetching } = useApplications()
    const deleteApplication = useDeleteApplication()

    const applications: GroupedObjectsByCourses<ApplicationType> = React.useMemo(() => {
        if (!applicationsData) {
            return []
        }
        return groupObjectsByCourses<ApplicationType>(applicationsData)
    }, [applicationsData])

    const handleDelete = (id: ApplicationType["id"]): void => {
        deleteApplication.mutate(id)
    }

    return (
        <>
            <Container>
                <Heading
                    title={APP_URLS.zajemci.title}
                    buttons={<ModalApplications />}
                    isFetching={isFetching && applications.length > 0}
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
                                    className={styles.course}>
                                    <ListGroupItem
                                        style={{ background: courseApplications.course.color }}>
                                        <h4 className={classNames("mb-0", styles.courseHeading)}>
                                            <span data-qa="application_course">
                                                {courseApplications.course.name}
                                            </span>{" "}
                                            <Badge
                                                pill
                                                style={{
                                                    color: courseApplications.course.color,
                                                }}
                                                className={classNames(
                                                    "font-weight-bold",
                                                    styles.courseHeadingBadge,
                                                )}>
                                                <span data-qa="applications_for_course_cnt">
                                                    {cnt}
                                                </span>{" "}
                                                zájemc{getZajemciSuffix(cnt)}
                                            </Badge>
                                        </h4>
                                    </ListGroupItem>
                                    {courseApplications.objects.map((application) => (
                                        <ListGroupItem key={application.id} data-qa="application">
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
                                                            new Date(application.created_at),
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
                                                    />{" "}
                                                    <DeleteButton
                                                        onClick={(): void => {
                                                            if (
                                                                window.confirm(
                                                                    "Opravdu chcete smazat zájemce " +
                                                                        `${application.client.surname} ${application.client.firstname} o ${application.course.name}?`,
                                                                )
                                                            ) {
                                                                handleDelete(application.id)
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

export default Applications
