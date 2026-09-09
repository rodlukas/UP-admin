import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Button, Container, Group, Pagination, Table } from "@mantine/core"
import { faCalendarTimes, faSpinnerThird, faUsers } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useDeactivateClients, useInactiveClients } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import EmptyState from "../components/EmptyState"
import Heading from "../components/Heading"
import InfoTooltip from "../components/InfoTooltip"
import { SkeletonShell, TableSkeleton } from "../components/Skeletons"
import SortableTh from "../components/SortableTh"
import TableToolbar from "../components/TableToolbar"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { tableFlat } from "../global/surfaces.css"
import { iconAfterText } from "../global/utility.css"
import { isStaleActive, pluralizeCs } from "../global/utils"
import { DataTableColumn, paginationControlProps, useDataTable } from "../hooks/useDataTable"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"

import * as styles from "./Clients.css"

/** V čem hledá vyhledávání nad tabulkou. */
const SEARCH_IN = (client: ClientType): (string | null | undefined)[] => [
    client.surname,
    client.firstname,
    client.phone,
    client.email,
    client.note,
]

/**
 * Řaditelné sloupce. Záměrně jen jméno: řazení podle telefonu, e-mailu nebo poznámky
 * nikdo nepoužije a šipka u každé hlavičky je jen šum (Carbon: řaditelné mají být
 * sloupce, u kterých to dává smysl).
 */
const COLUMNS: DataTableColumn<ClientType>[] = [
    { key: "name", value: (client) => `${client.surname} ${client.firstname}` },
]

/** Stránka s klienty. */
const Clients: React.FC = () => {
    const clientsActiveContext = useClientsActiveContext()
    /** Je vybráno zobrazení aktivních klientů (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveClients = [], isLoading: inactiveLoading } = useInactiveClients(!active)
    const deactivateClients = useDeactivateClients()

    const isLoading = (): boolean => (active ? clientsActiveContext.isLoading : inactiveLoading)

    const getClientsData = React.useCallback(
        (): ClientType[] => (active ? clientsActiveContext.clients : inactiveClients),
        [active, clientsActiveContext.clients, inactiveClients],
    )

    const table = useDataTable<ClientType>({
        rows: getClientsData(),
        searchIn: SEARCH_IN,
        columns: COLUMNS,
        initialSortKey: "name",
    })

    const staleClients = React.useMemo(
        () => clientsActiveContext.clients.filter((c) => isStaleActive(c.last_lecture_date)),
        [clientsActiveContext.clients],
    )

    const refresh = (newActive: boolean = active): void => {
        setActive(newActive)
    }

    const refreshFromModal = (data: ModalClientsData): void => {
        if (data?.active !== undefined) {
            refresh(data.active)
        }
    }

    const handleDeactivateAll = (): void => {
        const count = staleClients.length
        const label = pluralizeCs(count, "klienta", "klienty", "klientů")
        if (globalThis.confirm(`Opravdu chcete přesunout ${count} ${label} do neaktivních?`)) {
            deactivateClients.mutate(
                staleClients.map((c) => c.id),
                {
                    onSuccess: () =>
                        trackEvent("client_deactivated", { source: "clients_page", count }),
                },
            )
        }
    }

    const staleText = pluralizeCs(
        staleClients.length,
        "aktivní klient nemá",
        "aktivní klienti nemají",
        "aktivních klientů nemá",
    )

    let clientsContent: React.ReactNode
    if (isLoading()) {
        clientsContent = (
            <SkeletonShell>
                <TableSkeleton />
            </SkeletonShell>
        )
    } else if (getClientsData().length > 0) {
        clientsContent = (
            <>
                <TableToolbar
                    query={table.query}
                    onQueryChange={table.search}
                    label="klienta"
                    fields="jméno, telefon, e-mail, poznámka"
                    filteredCount={table.filteredCount}
                    totalCount={getClientsData().length}
                />
                {table.filteredCount === 0 ? (
                    <EmptyState
                        icon={faUsers}
                        title="Nic nenalezeno"
                        description={`Hledání „${table.query}“ neodpovídá žádný klient.`}
                    />
                ) : (
                    <Table.ScrollContainer minWidth={560} className={styles.tableSection}>
                        <Table className={tableFlat}>
                            <Table.Thead>
                                <Table.Tr>
                                    <SortableTh
                                        sortKey="name"
                                        activeKey={table.sortKey}
                                        direction={table.sortDirection}
                                        onSort={table.toggleSort}>
                                        Příjmení a jméno
                                    </SortableTh>
                                    <Table.Th className={styles.hiddenBelowMd}>Telefon</Table.Th>
                                    <Table.Th
                                        className={`${styles.emailHeader} ${styles.hiddenBelowMd}`}>
                                        E-mail
                                    </Table.Th>
                                    <Table.Th className={styles.hiddenBelowSm}>Poznámka</Table.Th>
                                    <Table.Th ta="right">Akce</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {table.rowsOnPage.map((client) => (
                                    <Table.Tr key={client.id} data-qa="client">
                                        <Table.Td className={styles.nameCell}>
                                            <ClientName client={client} link />{" "}
                                            {client.active &&
                                                isStaleActive(client.last_lecture_date) && (
                                                    <InfoTooltip
                                                        placement="right"
                                                        size="1x"
                                                        icon={faCalendarTimes}
                                                        text={TEXTS.WARNING_STALE_CLIENT}
                                                    />
                                                )}
                                        </Table.Td>
                                        <Table.Td
                                            className={`${styles.phoneCell} ${styles.hiddenBelowMd}`}>
                                            <ClientPhone phone={client.phone} />
                                        </Table.Td>
                                        <Table.Td className={styles.hiddenBelowMd}>
                                            <ClientEmail email={client.email} />
                                        </Table.Td>
                                        <Table.Td className={styles.hiddenBelowSm}>
                                            <ClientNote note={client.note} />
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            <ModalClients
                                                currentClient={client}
                                                refresh={refreshFromModal}
                                                source="clients_page"
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
                    // stránky, aby `[data-qa=client]` počítaly/hledaly nad celým
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
    } else {
        clientsContent = (
            <EmptyState
                icon={faUsers}
                title={`Žádní ${active ? "aktivní" : "neaktivní"} klienti`}
                description={
                    active
                        ? "Přidej prvního klienta a objeví se tady."
                        : "Neaktivní jsou klienti, kteří sem byli přesunuti ze seznamu aktivních."
                }
            />
        )
    }

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.klienti.title}{" "}
                        {!isLoading() && (
                            <span className={styles.titleCount}>{getClientsData().length}</span>
                        )}
                    </>
                }
                // ActiveSwitcher zustava vzdy vykreslovany (i behem nacitani): jinak by
                // se pri prvnim prepnuti na neaktivni (studeny fetch) na chvili ztratil
                // a uzivatel by se nemel jak prepnout zpatky
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} source="clients_page" />
                        <ModalClients refresh={refreshFromModal} source="clients_page" />
                    </>
                }
            />
            {active && !clientsActiveContext.isLoading && staleClients.length > 0 && (
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
                                {staleClients.length} {staleText} lekci déle než{" "}
                                {DAYS_WITHOUT_LECTURE_WARNING} dní.
                            </span>
                        </Group>
                        {/* `default` varianta: sytě žluté tlačítko by na žlutém notice bylo
                            nejhlasitější věcí stránky. Neutrální obrys drží akci čitelnou
                            a nepotřebuje `autoContrast` (neřeší se bílý text na žluté). */}
                        <Button
                            variant="default"
                            disabled={deactivateClients.isPending}
                            onClick={handleDeactivateAll}>
                            Přesunout do neaktivních
                            {deactivateClients.isPending && (
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
            {clientsContent}
        </Container>
    )
}

export default Clients
