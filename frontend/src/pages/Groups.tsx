import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Alert, Badge, Button, Container, Table } from "reactstrap"

import { useDeactivateGroups, useInactiveGroups } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { areAllMembersActive, isStaleActive } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"
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
        const label = count === 1 ? "skupinu" : count < 5 ? "skupiny" : "skupin"
        if (globalThis.confirm(`Opravdu chcete přesunout ${count} ${label} do neaktivních?`)) {
            deactivateGroups.mutate(staleGroups.map((g) => g.id))
        }
    }

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.skupiny.title}{" "}
                        {!isLoading() && (
                            <Badge color="secondary" pill>
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
                <Alert
                    color="warning"
                    className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <span>
                        {staleGroups.length}{" "}
                        {staleGroups.length === 1
                            ? "aktivní skupina nemá"
                            : staleGroups.length < 5
                              ? "aktivní skupiny nemají"
                              : "aktivních skupin nemá"}{" "}
                        lekci déle než {DAYS_WITHOUT_LECTURE_WARNING} dní.
                    </span>
                    <Button
                        color="warning"
                        size="sm"
                        disabled={deactivateGroups.isPending}
                        onClick={handleDeactivateAll}>
                        Přesunout do neaktivních
                        {deactivateGroups.isPending && (
                            <FontAwesomeIcon icon={faSpinnerThird} spin className="ms-2" />
                        )}
                    </Button>
                </Alert>
            )}

            {getGroupsData().length > 0 && (
                <Table striped size="sm" responsive className="table-custom">
                    <thead className="table-light">
                        <tr>
                            <th>Název</th>
                            <th className="d-none d-sm-table-cell">Kurz</th>
                            <th>Členové</th>
                            <th className="text-end text-md-end">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading() ? (
                            <tr>
                                <td colSpan={4}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <>
                                {getGroupsData().map((group) => (
                                    <tr key={group.id} data-qa="group">
                                        <td>
                                            <GroupName group={group} link noWrap />{" "}
                                            {group.active &&
                                                !areAllMembersActive(group.memberships) && (
                                                    <Tooltip
                                                        postfix={`Group_ActiveGroupWithInactiveClientAlert_${group.id}`}
                                                        placement="right"
                                                        size="1x"
                                                        text={
                                                            TEXTS.WARNING_ACTIVE_GROUP_WITH_INACTIVE_CLIENTS
                                                        }
                                                    />
                                                )}
                                            {group.active &&
                                                isStaleActive(group.last_lecture_date) && (
                                                    <Tooltip
                                                        postfix={`Group_StaleActive_${group.id}`}
                                                        placement="right"
                                                        size="1x"
                                                        text={TEXTS.WARNING_STALE_GROUP}
                                                    />
                                                )}
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <CourseName course={group.course} />
                                        </td>
                                        <td>
                                            <ClientsList memberships={group.memberships} />
                                        </td>
                                        <td className="text-end text-md-end">
                                            <ModalGroups
                                                currentGroup={group}
                                                refresh={refreshFromModal}
                                                source="groups_page"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </Table>
            )}
            {getGroupsData().length === 0 && !isLoading() && (
                <p className="text-muted text-center">
                    Žádné {active ? "aktivní" : "neaktivní"} skupiny
                </p>
            )}
        </Container>
    )
}

export default Groups
