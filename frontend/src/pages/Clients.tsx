import * as React from "react"
import { Badge, Container, Table } from "reactstrap"

import { useInactiveClients } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ActiveSwitcher from "../components/buttons/ActiveSwitcher"
import ClientEmail from "../components/ClientEmail"
import ClientName from "../components/ClientName"
import ClientNote from "../components/ClientNote"
import ClientPhone from "../components/ClientPhone"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ModalClientsData } from "../types/components"
import { ClientType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps

/** Stránka s klienty. */
const Clients: React.FC<Props> = () => {
    const clientsActiveContext = useClientsActiveContext()
    /** Je vybráno zobrazení aktivních klientů (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveClients = [], isLoading: inactiveLoading } = useInactiveClients(!active)

    const isLoading = (): boolean => (active ? clientsActiveContext.isLoading : inactiveLoading)

    const getClientsData = (): ClientType[] =>
        active ? clientsActiveContext.clients : inactiveClients

    const refresh = (newActive: boolean = active): void => {
        setActive(newActive)
    }

    const refreshFromModal = (data: ModalClientsData): void => {
        if (data?.active !== undefined) {
            refresh(data.active)
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
                        <ActiveSwitcher onChange={refresh} active={active} />
                        <ModalClients refresh={refreshFromModal} />
                    </>
                }
                isFetching={
                    active
                        ? clientsActiveContext.isFetching && clientsActiveContext.clients.length > 0
                        : false
                }
            />
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
                                            <ClientName client={client} link />
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
                <p className="text-muted text-center">Žádní klienti</p>
            )}
        </Container>
    )
}

export default Clients
