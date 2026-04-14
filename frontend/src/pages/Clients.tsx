import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinnerThird } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as React from "react"
import { Alert, Badge, Button, Container, Table } from "reactstrap"

import { useDeactivateClients, useInactiveClients } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { DAYS_WITHOUT_LECTURE_WARNING, TEXTS } from "../global/constants"
import { isStaleActive } from "../global/utils"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"
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
        const label = count === 1 ? "klienta" : count < 5 ? "klienty" : "klientů"
        if (globalThis.confirm(`Opravdu chcete přesunout ${count} ${label} do neaktivních?`)) {
            deactivateClients.mutate(staleClients.map((c) => c.id))
        }
    }

    return (
        <Container>
            <Heading
                title={
                    <>
                        {APP_URLS.klienti.title}{" "}
                        {!isLoading() && (
                            <Badge color="secondary" pill>
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
                <Alert
                    color="warning"
                    className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <span>
                        {staleClients.length}{" "}
                        {staleClients.length === 1
                            ? "aktivní klient nemá"
                            : staleClients.length < 5
                              ? "aktivní klienti nemají"
                              : "aktivních klientů nemá"}{" "}
                        lekci déle než {DAYS_WITHOUT_LECTURE_WARNING} dní.
                    </span>
                    <Button
                        color="warning"
                        size="sm"
                        disabled={deactivateClients.isPending}
                        onClick={handleDeactivateAll}>
                        Přesunout do neaktivních
                        {deactivateClients.isPending && (
                            <FontAwesomeIcon icon={faSpinnerThird} spin className="ms-2" />
                        )}
                    </Button>
                </Alert>
            )}
            {getClientsData().length > 0 && (
                <Table striped size="sm" responsive className="table-custom">
                    <thead className="table-light">
                        <tr>
                            <th>Příjmení a jméno</th>
                            <th className="d-none d-md-table-cell">Telefon</th>
                            <th
                                style={{ wordBreak: "keep-all" }}
                                className="d-none d-md-table-cell">
                                E-mail
                            </th>
                            <th className="d-none d-sm-table-cell">Poznámka</th>
                            <th className="text-end text-md-end">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading() ? (
                            <tr>
                                <td colSpan={5}>
                                    <Loading />
                                </td>
                            </tr>
                        ) : (
                            <>
                                {getClientsData().map((client) => (
                                    <tr key={client.id} data-qa="client">
                                        <td style={{ minWidth: "13em", width: "13em" }}>
                                            <ClientName client={client} link />{" "}
                                            {client.active &&
                                                isStaleActive(client.last_lecture_date) && (
                                                    <Tooltip
                                                        postfix={`Client_StaleActive_${client.id}`}
                                                        placement="right"
                                                        size="1x"
                                                        text={TEXTS.WARNING_STALE_CLIENT}
                                                    />
                                                )}
                                        </td>
                                        <td
                                            style={{ minWidth: "7em" }}
                                            className="d-none d-md-table-cell">
                                            <ClientPhone phone={client.phone} />
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            <ClientEmail email={client.email} />
                                        </td>
                                        <td className="d-none d-sm-table-cell">
                                            <ClientNote note={client.note} />
                                        </td>
                                        <td className="text-end text-md-end">
                                            <ModalClients
                                                currentClient={client}
                                                refresh={refreshFromModal}
                                                source="clients_page"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </Table>
            )}
            {getClientsData().length === 0 && !isLoading() && (
                <p className="text-muted text-center">
                    Žádní {active ? "aktivní" : "neaktivní"} klienti
                </p>
            )}
        </Container>
    )
}

export default Clients
