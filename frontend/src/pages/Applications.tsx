import { Container, Skeleton, Title, Tooltip } from "@mantine/core"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useApplications, useDeleteApplication } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import DeleteIconButton from "../components/buttons/DeleteIconButton"
import ClientName from "../components/ClientName"
import ClientPhone from "../components/ClientPhone"
import { courseBandVars } from "../components/CourseName.css"
import Heading from "../components/Heading"
import { SkeletonShell } from "../components/Skeletons"
import ModalApplications from "../forms/ModalApplications"
import { prettyDateWithYear } from "../global/funcDateTime"
import { dimmedTextCenter, mb0 } from "../global/utility.css"
import {
    contrastingTextColor,
    GroupedObjectsByCourses,
    groupObjectsByCourses,
    pluralizeCs,
} from "../global/utils"
import { ApplicationType } from "../types/models"

import * as styles from "./Applications.css"

/**
 * Kostra jednoho řádku zájemce — kopíruje `applicationRow`: jméno, datum s poznámkou,
 * telefon a dvojice akčních tlačítek (úprava, smazání), stejné čtyři sloupce jako reálný řádek.
 */
const ApplicationRowSkeleton: React.FC = () => (
    <div className={styles.applicationItem}>
        <div className={styles.applicationRow}>
            <div className={styles.applicationNameCol}>
                <Skeleton h={20} radius="sm" w="70%" />
            </div>
            <div className={styles.applicationMeta}>
                <Skeleton h={18} radius="sm" w="55%" />
            </div>
            <div className={styles.applicationPhoneCol}>
                <Skeleton h={16} radius="sm" w="65%" />
            </div>
            <div className={styles.applicationActionsCol}>
                <div className={styles.applicationActions}>
                    <Skeleton h={32} w={32} circle />
                    <Skeleton h={32} w={32} circle />
                </div>
            </div>
        </div>
    </div>
)

/**
 * Kostra stránky zájemců — kopíruje tvar skutečného obsahu: pruh s názvem kurzu a počtem
 * zájemců, pod ním pár řádků zájemců. Pruh je bez barvy (na rozdíl od `courseHeadingItem`
 * v reálném obsahu) — barva kurzu se dozví až po dotažení dat.
 */
const ApplicationListSkeleton: React.FC = () => (
    <SkeletonShell>
        {[...Array(3)].map((_, i) => (
            <div key={i} className={classNames(styles.course, styles.listSection)}>
                <div className={styles.courseHeadingItem}>
                    <Skeleton h={18} radius="sm" w="35%" />
                    <Skeleton h={20} radius="xl" w={70} />
                </div>
                <ApplicationRowSkeleton />
                <ApplicationRowSkeleton />
            </div>
        ))}
    </SkeletonShell>
)

/** Stránka se zájemci o kurzy. */
const Applications: React.FC = () => {
    const { data: applicationsData, isLoading } = useApplications()
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
            <Heading title={APP_URLS.zajemci.title} buttons={<ModalApplications />} />
            {isLoading ? (
                <ApplicationListSkeleton />
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
                                    style={assignInlineVars(courseBandVars, {
                                        color: courseApplications.course.color,
                                        text: contrastingTextColor(courseApplications.course.color),
                                    })}>
                                    <Title order={2} size="h4" className={styles.courseHeading}>
                                        <span data-qa="application_course">
                                            {courseApplications.course.name}
                                        </span>
                                    </Title>
                                    <span className={styles.courseHeadingCount}>
                                        {/* nezlomitelná mezera, ne obyčejná: `courseHeadingCount`
                                            (= `lectureNumber`) je `inline-flex` a mezeru samotnou
                                            jako text node mezi dvěma flex položkami by prohlížeč
                                            zahodil jako čistě bílý znak */}
                                        <span data-qa="applications_for_course_cnt">{cnt}</span>
                                        {` ${pluralizeCs(cnt, "zájemce", "zájemci", "zájemců")}`}
                                    </span>
                                </div>
                                {courseApplications.objects.map((application) => (
                                    <div
                                        key={application.id}
                                        className={styles.applicationItem}
                                        data-qa="application">
                                        <div className={styles.applicationRow}>
                                            <div className={styles.applicationNameCol}>
                                                {/* velikost i řez shodné s jménem klienta v účasti
                                                    (`clientName` v Attendances.css.ts) — jinak stejný
                                                    údaj v diáři a v zájemcích vypadá jinak velký */}
                                                <Title
                                                    order={3}
                                                    size="h5"
                                                    fz="1.15rem"
                                                    fw={600}
                                                    className={mb0}>
                                                    <ClientName client={application.client} link />
                                                </Title>
                                            </div>
                                            <div className={styles.applicationMeta}>
                                                <Tooltip label="Datum přidání">
                                                    <span
                                                        className={styles.createdDate}
                                                        data-qa="application_created_at">
                                                        {prettyDateWithYear(
                                                            new Date(application.created_at),
                                                        )}
                                                    </span>
                                                </Tooltip>
                                                <span
                                                    className={styles.applicationNote}
                                                    data-qa="application_note"
                                                    data-gdpr>
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
                                                    <DeleteIconButton
                                                        content={`zájemce ${application.client.surname} ${application.client.firstname} o ${application.course.name}`}
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
