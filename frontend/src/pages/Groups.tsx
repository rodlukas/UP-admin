import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Badge, Button, Container, Group, Skeleton, Table, Text } from "@mantine/core"
import { faHourglassEnd, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useDeactivateGroups, useInactiveGroups } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Tooltip from "../components/Tooltip"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { iconAfterText, middle } from "../global/utility.css"
import { areAllMembersActive, isStaleActive } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"

import * as styles from "./Groups.css"

/** Stránka se skupinami. */
const Groups: React.FC = () => {
    const groupsActiveContext = useGroupsActiveContext()
    /** Je vybráno zobrazení aktivních skupin (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveGroups = [], isLoading: inactiveLoading } = useInactiveGroups(!active)
    const deactivateGroups = useDeactivateGroups()

    const isLoading = (): boolean => (active ? groupsActiveContext.isLoading : inactiveLoading)

    const getGroupsData = (): GroupType[] => (active ? groupsActiveContext.groups : inactiveGroups)

    const staleGroups = React.useMemo(
        () => groupsActiveContext.groups.filter((g) => isStaleActive(g.last_lecture_date)),
        [groupsActiveContext.groups],
    )

    const refresh = (newActive: boolean = active): void => {
        setActive(newActive)
    }

    const refreshFromModal = (data: ModalGroupsData): void => {
        if (data?.active !== undefined) {
            refresh(data.active)
        }
    }

    const handleDeactivateAll = (): void => {
        const count = staleGroups.length
        let label = "skupin"
        if (count === 1) {
            label = "skupinu"
        } else if (count < 5) {
            label = "skupiny"
        }
        if (globalThis.confirm(`Opravdu chcete přesunout ${count} ${label} do neaktivních?`)) {
            deactivateGroups.mutate(
                staleGroups.map((g) => g.id),
                {
                    onSuccess: () =>
                        trackEvent("group_deactivated", { source: "groups_page", count }),
                },
            )
        }
    }

    const staleText = React.useMemo(() => {
        if (staleGroups.length === 1) {
            return "aktivní skupina nemá"
        }
        if (staleGroups.length < 5) {
            return "aktivní skupiny nemají"
        }
        return "aktivních skupin nemá"
    }, [staleGroups.length])

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.skupiny.title}{" "}
                        {!isLoading() && (
                            <Badge color="gray" radius="xl">
                                {getGroupsData().length}
                            </Badge>
                        )}
                    </>
                }
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} source="groups_page" />
                        <ModalGroups refresh={refreshFromModal} source="groups_page" />
                    </>
                }
                isFetching={
                    active
                        ? groupsActiveContext.isFetching && groupsActiveContext.groups.length > 0
                        : false
                }
            />

            {active && !groupsActiveContext.isLoading && staleGroups.length > 0 && (
                <Alert color="yellow" className={styles.staleAlert}>
                    <Group justify="space-between" wrap="wrap" gap="sm">
                        <Group gap="sm" wrap="nowrap">
                            <FontAwesomeIcon icon={faHourglassEnd} />
                            <span>
                                {staleGroups.length} {staleText} lekci déle než{" "}
                                {DAYS_WITHOUT_LECTURE_WARNING} dní.
                            </span>
                        </Group>
                        <Button
                            color="yellow"
                            size="sm"
                            disabled={deactivateGroups.isPending}
                            onClick={handleDeactivateAll}>
                            Přesunout do neaktivních
                            {deactivateGroups.isPending && (
                                <FontAwesomeIcon
                                    icon={faSpinnerThird}
                                    spin
                                    className={iconAfterText}
                                />
                            )}
                        </Button>
                    </Group>
                </Alert>
            )}

            {isLoading() ? (
                <div className={styles.tableSection}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} h={36} mb="xs" radius="sm" />
                    ))}
                </div>
            ) : getGroupsData().length > 0 ? (
                <Table.ScrollContainer minWidth={400} className={styles.tableSection}>
                    <Table striped highlightOnHover verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Název</Table.Th>
                                <Table.Th className={styles.hiddenBelowSm}>Kurz</Table.Th>
                                <Table.Th>Členové</Table.Th>
                                <Table.Th ta="right">Akce</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {getGroupsData().map((group) => (
                                <Table.Tr key={group.id} data-qa="group">
                                    <Table.Td>
                                        <GroupName group={group} link noWrap />
                                        {group.active &&
                                            (!areAllMembersActive(group.memberships) ||
                                                isStaleActive(group.last_lecture_date)) && (
                                                <Group
                                                    gap={4}
                                                    display="inline-flex"
                                                    ml="0.25rem"
                                                    className={middle}>
                                                    {!areAllMembersActive(group.memberships) && (
                                                        <Tooltip
                                                            placement="right"
                                                            size="1x"
                                                            text={
                                                                TEXTS.WARNING_ACTIVE_GROUP_WITH_INACTIVE_CLIENTS
                                                            }
                                                        />
                                                    )}
                                                    {isStaleActive(group.last_lecture_date) && (
                                                        <Tooltip
                                                            placement="right"
                                                            size="1x"
                                                            icon={faHourglassEnd}
                                                            text={TEXTS.WARNING_STALE_GROUP}
                                                        />
                                                    )}
                                                </Group>
                                            )}
                                    </Table.Td>
                                    <Table.Td className={styles.hiddenBelowSm}>
                                        <CourseName course={group.course} />
                                    </Table.Td>
                                    <Table.Td>
                                        <ClientsList memberships={group.memberships} />
                                    </Table.Td>
                                    <Table.Td ta="right">
                                        <ModalGroups
                                            currentGroup={group}
                                            refresh={refreshFromModal}
                                            source="groups_page"
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            ) : (
                <Text c="dimmed" ta="center">
                    Žádné {active ? "aktivní" : "neaktivní"} skupiny
                </Text>
            )}
        </Container>
    )
}

export default Groups
