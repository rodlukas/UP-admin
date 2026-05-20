import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, Badge, Button, Container, Group, Skeleton, Table, Text } from "@mantine/core"
import { faHourglassEnd, faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"

import { trackEvent } from "../analytics"
import { useDeactivateClients, useInactiveClients } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Tooltip from "../components/Tooltip"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { iconAfterText } from "../global/utility.css"
import { isStaleActive } from "../global/utils"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"

import * as styles from "./Clients.css"

/** Stránka s klienty. */
const Clients: React.FC = () => {
    const clientsActiveContext = useClientsActiveContext()
    /** Je vybráno zobrazení aktivních klientů (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveClients = [], isLoading: inactiveLoading } = useInactiveClients(!active)
    const deactivateClients = useDeactivateClients()

    const isLoading = (): boolean => (active ? clientsActiveContext.isLoading : inactiveLoading)

    const getClientsData = (): ClientType[] =>
        active ? clientsActiveContext.clients : inactiveClients

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
        let label = "klientů"
        if (count === 1) {
            label = "klienta"
        } else if (count < 5) {
            label = "klienty"
        }
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

    const staleText = React.useMemo(() => {
        if (staleClients.length === 1) {
            return "aktivní klient nemá"
        }
        if (staleClients.length < 5) {
            return "aktivní klienti nemají"
        }
        return "aktivních klientů nemá"
    }, [staleClients.length])

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.klienti.title}{" "}
                        {!isLoading() && (
                            <Badge color="gray" radius="xl">
                                {getClientsData().length}
                            </Badge>
                        )}
                    </>
                }
                buttons={
                    <>
                        <ActiveSwitcher onChange={refresh} active={active} source="clients_page" />
                        <ModalClients refresh={refreshFromModal} source="clients_page" />
                    </>
                }
                isFetching={
                    active
                        ? clientsActiveContext.isFetching && clientsActiveContext.clients.length > 0
                        : false
                }
            />
            {active && !clientsActiveContext.isLoading && staleClients.length > 0 && (
                <Alert color="yellow" className={styles.staleAlert}>
                    <Group justify="space-between" wrap="wrap" gap="sm">
                        <Group gap="sm" wrap="nowrap">
                            <FontAwesomeIcon icon={faHourglassEnd} />
                            <span>
                                {staleClients.length} {staleText} lekci déle než{" "}
                                {DAYS_WITHOUT_LECTURE_WARNING} dní.
                            </span>
                        </Group>
                        <Button
                            color="yellow"
                            size="sm"
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
            {isLoading() ? (
                <div className={styles.tableSection}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} h={36} mb="xs" radius="sm" />
                    ))}
                </div>
            ) : getClientsData().length > 0 ? (
                <Table.ScrollContainer minWidth={560} className={styles.tableSection}>
                    <Table striped highlightOnHover verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Příjmení a jméno</Table.Th>
                                <Table.Th className={styles.hiddenBelowMd}>Telefon</Table.Th>
                                <Table.Th className={`${styles.emailHeader} ${styles.hiddenBelowMd}`}>
                                    E-mail
                                </Table.Th>
                                <Table.Th className={styles.hiddenBelowSm}>Poznámka</Table.Th>
                                <Table.Th ta="right">Akce</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {getClientsData().map((client) => (
                                <Table.Tr key={client.id} data-qa="client">
                                    <Table.Td className={styles.nameCell}>
                                        <ClientName client={client} link />{" "}
                                        {client.active &&
                                            isStaleActive(client.last_lecture_date) && (
                                                <Tooltip
                                                    placement="right"
                                                    size="1x"
                                                    icon={faHourglassEnd}
                                                    text={TEXTS.WARNING_STALE_CLIENT}
                                                />
                                            )}
                                    </Table.Td>
                                    <Table.Td className={`${styles.phoneCell} ${styles.hiddenBelowMd}`}>
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
            ) : (
                <Text c="dimmed" ta="center">
                    Žádní {active ? "aktivní" : "neaktivní"} klienti
                </Text>
            )}
        </Container>
    )
}

export default Clients
