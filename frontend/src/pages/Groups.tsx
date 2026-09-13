import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Container, Group, Pagination, Table } from "@mantine/core"
import {
    faCalendarTimes,
    faLayerGroup,
    faSpinnerThird,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useDeactivateGroups, useInactiveGroups } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientsList from "../components/ClientsList"
import CourseName from "../components/CourseName"
import EmptyState, { LoadErrorEmptyState } from "../components/EmptyState"
import GroupName from "../components/GroupName"
import Heading from "../components/Heading"
import InfoTooltip from "../components/InfoTooltip"
import { SkeletonShell, TableSkeleton } from "../components/Skeletons"
import SortableTh from "../components/SortableTh"
import TableToolbar from "../components/TableToolbar"
import { useGroupsActiveContext } from "../contexts/GroupsActiveContext"
import ModalGroups from "../forms/ModalGroups"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { tableFlat } from "../global/surfaces.css"
import { iconAfterText, middle } from "../global/utility.css"
import { areAllMembersActive, isStaleActive, pluralizeCs } from "../global/utils"
import { type DataTableColumn, paginationControlProps, useDataTable } from "../hooks/useDataTable"
import { type ModalGroupsData } from "../types/components"
import { type GroupType } from "../types/models"

import * as styles from "./ClientsGroups.css"

/** V čem hledá vyhledávání nad tabulkou. */
const SEARCH_IN = (group: GroupType): (string | null | undefined)[] => [
    group.name,
    group.course.name,
    ...group.memberships.map((m) => `${m.client.surname} ${m.client.firstname}`),
]

/** Řaditelné sloupce — název skupiny a kurz; podle členů se řadit nedá smysluplně. */
const COLUMNS: DataTableColumn<GroupType>[] = [
    { key: "name", value: (group) => group.name },
    { key: "course", value: (group) => group.course.name },
]

/** Stránka se skupinami. */
const Groups: React.FC = () => {
    const groupsActiveContext = useGroupsActiveContext()
    /** Je vybráno zobrazení aktivních skupin (true). */
    const [active, setActive] = React.useState(true)
    const {
        data: inactiveGroupsData,
        // `isLoading`, ne `isPending` — stejný důvod jako u `useInactiveClients` v Clients.tsx
        isLoading: inactiveLoading,
    } = useInactiveGroups(!active)
    const inactiveGroups = inactiveGroupsData ?? []
    const deactivateGroups = useDeactivateGroups()

    const isLoading = (): boolean => (active ? groupsActiveContext.isLoading : inactiveLoading)
    // „data už dorazila (třeba prázdná)", ne `isSuccess` — rozlišuje skutečně prázdný seznam
    // od nenačteného (chyba/offline) a na rozdíl od `isSuccess` přežije selhaný refetch, při
    // kterém si TanStack Query data z cache nechá (viz `hasData` v kontextech)
    const hasData = active ? groupsActiveContext.hasData : inactiveGroupsData !== undefined
    // volá se jen synchronně inline v rámci téhož renderu, memoizace tu nic nešetří
    const groupsData: GroupType[] = active ? groupsActiveContext.groups : inactiveGroups

    const table = useDataTable<GroupType>({
        rows: groupsData,
        searchIn: SEARCH_IN,
        columns: COLUMNS,
        initialSortKey: "name",
        resetKey: active,
    })

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
        const label = pluralizeCs(count, "skupinu", "skupiny", "skupin")
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

    const staleText = pluralizeCs(
        staleGroups.length,
        "aktivní skupina nemá",
        "aktivní skupiny nemají",
        "aktivních skupin nemá",
    )

    let groupsContent: React.ReactNode
    if (isLoading()) {
        groupsContent = (
            <SkeletonShell>
                <TableSkeleton count={6} />
            </SkeletonShell>
        )
    } else if (groupsData.length > 0) {
        groupsContent = (
            <>
                <TableToolbar
                    query={table.query}
                    onQueryChange={table.search}
                    label="skupinu"
                    fields="název, kurz, člen"
                    filteredCount={table.filteredCount}
                    totalCount={groupsData.length}
                />
                {table.filteredCount === 0 ? (
                    <EmptyState
                        icon={faLayerGroup}
                        title={TEXTS.NO_RESULTS}
                        description={`Hledání „${table.query}“ neodpovídá žádná skupina.`}
                    />
                ) : (
                    <Table.ScrollContainer
                        minWidth={400}
                        type="native"
                        className={styles.tableSection}>
                        <Table className={tableFlat}>
                            <Table.Thead>
                                <Table.Tr>
                                    <SortableTh
                                        sortKey="name"
                                        activeKey={table.sortKey}
                                        direction={table.sortDirection}
                                        onSort={table.toggleSort}>
                                        Název
                                    </SortableTh>
                                    <SortableTh
                                        sortKey="course"
                                        activeKey={table.sortKey}
                                        direction={table.sortDirection}
                                        onSort={table.toggleSort}
                                        className={styles.hiddenBelowSm}>
                                        Kurz
                                    </SortableTh>
                                    <Table.Th>Členové</Table.Th>
                                    <Table.Th ta="right">Akce</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {table.rowsOnPage.map((group) => (
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
                                                        {!areAllMembersActive(
                                                            group.memberships,
                                                        ) && (
                                                            <InfoTooltip
                                                                placement="right"
                                                                size="1x"
                                                                text={
                                                                    TEXTS.WARNING_ACTIVE_GROUP_WITH_INACTIVE_CLIENTS
                                                                }
                                                            />
                                                        )}
                                                        {isStaleActive(group.last_lecture_date) && (
                                                            <InfoTooltip
                                                                placement="right"
                                                                size="1x"
                                                                icon={faCalendarTimes}
                                                                text={TEXTS.WARNING_STALE_GROUP}
                                                            />
                                                        )}
                                                    </Group>
                                                )}
                                        </Table.Td>
                                        <Table.Td className={styles.hiddenBelowSm}>
                                            <CourseName course={group.course} band />
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
                )}
                {table.isPaginated && (
                    // `data-qa="pagination"`: E2E kroky přes ni umí projít všechny
                    // stránky, aby `[data-qa=group]` počítaly/hledaly nad celým
                    // seznamem, ne jen nad aktuální stránkou (viz useDataTable)
                    <div data-qa="pagination">
                        <Pagination
                            value={table.page}
                            onChange={table.setPage}
                            total={table.pageCount}
                            getControlProps={paginationControlProps}
                            className={styles.pagination}
                        />
                    </div>
                )}
            </>
        )
    } else if (hasData) {
        groupsContent = (
            <EmptyState
                icon={faLayerGroup}
                title={`Žádné ${active ? "aktivní" : "neaktivní"} skupiny`}
                description={
                    active
                        ? "Vytvoř první skupinu a objeví se tady."
                        : "Neaktivní jsou skupiny, které sem byly přesunuty ze seznamu aktivních."
                }
            />
        )
    } else {
        // prázdné pole bez načtených dat znamená chybu při načítání (nebo offline), ne
        // skutečně žádné skupiny — jinak by výpadek API vypadal jako čistý stav
        groupsContent = <LoadErrorEmptyState resource="Skupiny" />
    }

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.skupiny.title}{" "}
                        {/* `hasData` — stejný důvod jako u Klientů (Clients.tsx) */}
                        {!isLoading() && hasData && (
                            <span className={styles.titleCount}>{groupsData.length}</span>
                        )}
                    </>
                }
                // ActiveSwitcher zůstává vždy vykreslovaný i během načítání — stejný důvod
                // jako na Klientech (Clients.tsx)
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} source="groups_page" />
                        <ModalGroups refresh={refreshFromModal} source="groups_page" />
                    </>
                }
            />

            {active && !groupsActiveContext.isLoading && staleGroups.length > 0 && (
                <Alert
                    // pozadi i ramecek dodava `staleAlert` — stejny duvod jako na Klientech
                    variant="transparent"
                    color="yellow"
                    className={styles.staleAlert}>
                    <Group justify="space-between" wrap="wrap" gap="sm">
                        <Group gap="sm" wrap="nowrap">
                            <FontAwesomeIcon icon={faCalendarTimes} />
                            <span>
                                {staleGroups.length} {staleText} lekci déle než{" "}
                                {DAYS_WITHOUT_LECTURE_WARNING} dní.
                            </span>
                        </Group>
                        {/* `default` varianta: stejný důvod jako na Klientech (Clients.tsx) */}
                        <Button
                            variant="default"
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

            {groupsContent}
        </Container>
    )
}

export default Groups
