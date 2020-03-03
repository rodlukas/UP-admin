import * as React from "react"
import { Badge, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ClientActiveType } from "../types/models"
import { fEmptyVoid } from "../types/types"
import BackButton from "./buttons/BackButton"
import ClientEmail from "./ClientEmail"
import ClientName from "./ClientName"
import ClientPhone from "./ClientPhone"
import Heading from "./Heading"
import Loading from "./Loading"

type Props = {
    foundResults: Array<ClientActiveType>
    searchVal: string
    search: fEmptyVoid
    resetSearch: fEmptyVoid
}

/** Komponenta zobrazující výsledky vyhledávání - seznam klientů. */
const SearchResults: React.FunctionComponent<Props> = ({
    foundResults,
    searchVal,
    search,
    resetSearch
}) => {
    const clientsActiveContext = React.useContext(ClientsActiveContext)

    React.useEffect(() => {
        if (clientsActiveContext.isLoaded && searchVal !== "") search()
    }, [clientsActiveContext.isLoaded, search, searchVal])

    return (
        <>
            {searchVal !== "" && (
                <Container>
                    <Heading
                        content={
                            <>
                                <BackButton onClick={resetSearch} content="Zrušit" /> Vyhledaní
                                klienti{" "}
                                <Badge color="secondary" pill>
                                    {" "}
                                    {foundResults.length}
                                </Badge>
                            </>
                        }
                    />
                    <ListGroup>
                        {!clientsActiveContext.isLoaded ? (
                            <Loading />
                        ) : (
                            <>
                                {foundResults.map(client => (
                                    <ListGroupItem key={client.id}>
                                        <Row className="align-items-center">
                                            {" "}
                                            <Col md="6">
                                                <h5 className="mb-0 d-inline-block">
                                                    <ClientName client={client} link />
                                                </h5>
                                                {client.note !== "" && (
                                                    <span className="text-secondary">
                                                        {" "}
                                                        &ndash; {client.note}
                                                    </span>
                                                )}
                                            </Col>
                                            <Col md="2">
                                                {client.phone && (
                                                    <ClientPhone phone={client.phone} icon />
                                                )}
                                            </Col>
                                            <Col md="3">
                                                {client.email && (
                                                    <ClientEmail email={client.email} />
                                                )}
                                            </Col>
                                            <Col className="text-right mt-1 mt-md-0" md="1">
                                                <ModalClients
                                                    currentClient={client}
                                                    refresh={search}
                                                />
                                            </Col>
                                        </Row>
                                    </ListGroupItem>
                                ))}
                                {foundResults.length === 0 && (
                                    <p className="text-muted text-center">
                                        Žádní klienti nenalezeni
                                    </p>
                                )}
                            </>
                        )}
                    </ListGroup>
                </Container>
            )}
        </>
    )
}

export default SearchResults
