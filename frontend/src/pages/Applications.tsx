import { Badge, Container, Skeleton, Title, Tooltip } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useApplications, useDeleteApplication } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import DeleteButton from "../components/buttons/DeleteButton"
import ClientName from "../components/ClientName"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import ModalApplications from "../forms/ModalApplications"
import { prettyDateWithYear } from "../global/funcDateTime"
import { dimmedTextCenter, mb0 } from "../global/utility.css"
import {
    getReadableTextColor,
    GroupedObjectsByCourses,
    groupObjectsByCourses,
} from "../global/utils"
import { ApplicationType } from "../types/models"

import * as styles from "./Applications.css"

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
const Applications: React.FC = () => {
    const { data: applicationsData, isLoading, isFetching } = useApplications()
    const deleteApplication = useDeleteApplication()

    const applications: GroupedObjectsByCourses<ApplicationType> = React.useMemo(() => {
        if (!applicationsData) {
            return []
        }
        return groupObjectsByCourses<ApplicationType>(applicationsData)
    }, [applicationsData])

    const handleDelete = (id: ApplicationType["id"]): void => {
        deleteApplication.mutate(id, {
            onSuccess: () => {
                trackEvent("application_deleted", { source: "applications_page" })
            },
        })
    }

    return (
        <Container>
            <Heading
                title={APP_URLS.zajemci.title}
                buttons={<ModalApplications />}
                isFetching={isFetching && applications.length > 0}
            />
            {isLoading ? (
                <>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} h={110} mb="md" radius="md" />
                    ))}
                </>
            ) : (
                <>
                    {applications.map((courseApplications) => {
                        const cnt = courseApplications.objects.length
                        return (
                            <div
                                key={courseApplications.course.id}
                                className={classNames(styles.course, styles.listSection)}
                                data-qa="applications_for_course">
                                <div
                                    className={styles.courseHeadingItem}
                                    style={assignInlineVars(styles.applicationsVars, {
                                        courseBackground: courseApplications.course.color,
                                        badgeColor: getReadableTextColor(
                                            courseApplications.course.color,
                                        ),
                                    })}>
                                    <Title order={4} className={styles.courseHeading}>
                                        <span data-qa="application_course">
                                            {courseApplications.course.name}
                                        </span>
                                    </Title>
                                    <Badge radius="xl" className={styles.courseHeadingBadge}>
                                        <span data-qa="applications_for_course_cnt">{cnt}</span>{" "}
                                        zájemc{getZajemciSuffix(cnt)}
                                    </Badge>
                                </div>
                                {courseApplications.objects.map((application) => (
                                    <div
                                        key={application.id}
                                        className={styles.applicationItem}
                                        data-qa="application">
                                        <div className={styles.applicationRow}>
                                            <div className={styles.applicationNameCol}>
                                                <Title order={5} className={mb0}>
                                                    <ClientName client={application.client} link />
                                                </Title>
                                            </div>
                                            <div className={styles.applicationMeta}>
                                                <Tooltip label="Datum přidání">
                                                    <Badge
                                                        variant="light"
                                                        color="gray"
                                                        className={styles.createdBadge}
                                                        data-qa="application_created_at">
                                                        {prettyDateWithYear(
                                                            new Date(application.created_at),
                                                        )}
                                                    </Badge>
                                                </Tooltip>
                                                <span data-qa="application_note" data-gdpr>
                                                    {application.note}
                                                </span>
                                            </div>
                                            <div className={styles.applicationPhoneCol}>
                                                {application.client.phone && (
                                                    <ClientPhone
                                                        phone={application.client.phone}
                                                        icon
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.applicationActionsCol}>
                                                <div className={styles.applicationActions}>
                                                    <ModalApplications
                                                        currentApplication={application}
                                                    />
                                                    <DeleteButton
                                                        size="sm"
                                                        onClick={(): void => {
                                                            if (
                                                                globalThis.confirm(
                                                                    "Opravdu chcete smazat zájemce " +
                                                                        `${application.client.surname} ${application.client.firstname} o ${application.course.name}?`,
                                                                )
                                                            ) {
                                                                handleDelete(application.id)
                                                            }
                                                        }}
                                                        data-qa="button_delete_application"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                    {applications.length === 0 && <p className={dimmedTextCenter}>Žádní zájemci</p>}
                </>
            )}
        </Container>
    )
}

export default Applications
