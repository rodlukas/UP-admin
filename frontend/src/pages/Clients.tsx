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
import {
    ClientsActiveContextProps,
    WithClientsActiveContext,
} from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ClientType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps & ClientsActiveContextProps

/** Stránka s klienty. */
const Clients: React.FC<Props> = (props) => {
    /** Je vybráno zobrazení aktivních klientů (true). */
    const [active, setActive] = React.useState(true)
    const { data: inactiveClients = [], isLoading: inactiveLoading } = useInactiveClients(!active)

    const isLoading = (): boolean =>
        active
            ? props.clientsActiveContext.isLoading &&
              props.clientsActiveContext.clients.length === 0
            : inactiveLoading && inactiveClients.length === 0

    const getClientsData = (): ClientType[] =>
        active ? props.clientsActiveContext.clients : inactiveClients

    const refresh = React.useCallback(
        (newActive: boolean = active): void => {
            setActive(newActive)
        },
        [active],
    )

    const refreshFromModal = React.useCallback(
        (data: { active?: boolean } | null): void => {
            if (data?.active !== undefined) {
                refresh(data.active)
            }
        },
        [refresh],
    )

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
                        ? props.clientsActiveContext.isFetching &&
                          props.clientsActiveContext.clients.length > 0
                        : false
                }
            />
            <Table striped size="sm" responsive className="table-custom">
                <thead className="thead-light">
                    <tr>
                        <th>Příjmení a jméno</th>
                        <th className="d-none d-md-table-cell">Telefon</th>
                        <th style={{ wordBreak: "keep-all" }} className="d-none d-md-table-cell">
                            E-mail
                        </th>
                        <th className="d-none d-sm-table-cell">Poznámka</th>
                        <th className="text-right text-md-right">Akce</th>
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
                                    <td className="text-right text-md-right">
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
            {getClientsData().length === 0 && !isLoading() && (
                <p className="text-muted text-center">Žádní klienti</p>
            )}
        </Container>
    )
}

export default WithClientsActiveContext(Clients)
