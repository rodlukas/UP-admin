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
import EmptyState from "../components/EmptyState"
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
import { DataTableColumn, paginationControlProps, useDataTable } from "../hooks/useDataTable"
import { ModalGroupsData } from "../types/components"
import { GroupType } from "../types/models"

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
    const { data: inactiveGroups = [], isLoading: inactiveLoading } = useInactiveGroups(!active)
    const deactivateGroups = useDeactivateGroups()

    const isLoading = (): boolean => (active ? groupsActiveContext.isLoading : inactiveLoading)

    const getGroupsData = React.useCallback(
        (): GroupType[] => (active ? groupsActiveContext.groups : inactiveGroups),
        [active, groupsActiveContext.groups, inactiveGroups],
    )

    const table = useDataTable<GroupType>({
        rows: getGroupsData(),
        searchIn: SEARCH_IN,
        columns: COLUMNS,
        initialSortKey: "name",
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

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.skupiny.title}{" "}
                        {!isLoading() && (
                            <span className={styles.titleCount}>{getGroupsData().length}</span>
                        )}
                    </>
                }
                // ActiveSwitcher zustava vzdy vykreslovany (i behem nacitani): jinak by
                // se pri prvnim prepnuti na neaktivni (studeny fetch) na chvili ztratil
                // a uzivatel by se nemel jak prepnout zpatky
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} source="groups_page" />
                        <ModalGroups refresh={refreshFromModal} source="groups_page" />
                    </>
                }
            />

            {active && !groupsActiveContext.isLoading && staleGroups.length > 0 && (
                <Alert
                    // pozadi i ramecek dodava `staleAlert` (statusNoticeWarning) — Mantine
                    // `light` varianta by pres nej nakreslila svou sytou zlutou plochu
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
                        {/* `default` varianta: sytě žluté tlačítko bylo na měkkém notice
                            nejhlasitější věcí stránky. Neutrální obrys drží akci čitelnou
                            a `autoContrast` uz neni potreba (neresi se bily text na zlute). */}
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

            {isLoading() ? (
                <SkeletonShell>
                    <TableSkeleton count={6} />
                </SkeletonShell>
            ) : getGroupsData().length > 0 ? (
                <>
                    <TableToolbar
                        query={table.query}
                        onQueryChange={table.search}
                        label="skupinu"
                        fields="název, kurz, člen"
                        filteredCount={table.filteredCount}
                        totalCount={getGroupsData().length}
                    />
                    {table.filteredCount === 0 ? (
                        <EmptyState
                            icon={faLayerGroup}
                            title="Nic nenalezeno"
                            description={`Hledání „${table.query}“ neodpovídá žádná skupina.`}
                        />
                    ) : (
                        <Table.ScrollContainer minWidth={400} className={styles.tableSection}>
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
                                                            {isStaleActive(
                                                                group.last_lecture_date,
                                                            ) && (
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
            ) : (
                <EmptyState
                    icon={faLayerGroup}
                    title={`Žádné ${active ? "aktivní" : "neaktivní"} skupiny`}
                    description={
                        active
                            ? "Vytvoř první skupinu a objeví se tady."
                            : "Neaktivní jsou skupiny, které sem byly přesunuty ze seznamu aktivních."
                    }
                />
            )}
        </Container>
    )
}

export default Groups
