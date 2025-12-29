import { FuseResult } from "fuse.js"
import * as React from "react"
import { Badge, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
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
    /** Výsledky vyhledávání klientů. */
    foundResults: FuseResult<ClientActiveType>[]
    /** Vyhledávaný výraz. */
    searchVal: string
    /** Funkce pro zahájení vyhledávání klientů. */
    search: fEmptyVoid
    /** Funkce zrušení vyhledávání klientů. */
    resetSearch: fEmptyVoid
}

/** Komponenta zobrazující výsledky vyhledávání - seznam klientů. */
const Search: React.FC<Props> = ({ foundResults, searchVal, search, resetSearch }) => {
    const clientsActiveContext = useClientsActiveContext()

    return (
        <>
            {searchVal !== "" && (
                <Container>
                    <Heading
                        title={
                            <>
                                Vyhledaní klienti{" "}
                                <Badge color="secondary" pill>
                                    {foundResults.length}
                                </Badge>
                            </>
                        }
                        buttons={<BackButton onClick={resetSearch} content="Zrušit vyhledávání" />}
                    />
                    <ListGroup>
                        {clientsActiveContext.isLoading ? (
                            <Loading />
                        ) : (
                            <>
                                {foundResults.map(({ item }) => (
                                    <ListGroupItem key={item.id}>
                                        <Row className="align-items-center">
                                            {" "}
                                            <Col md="6">
                                                <h5 className="mb-0 d-inline-block">
                                                    <ClientName client={item} link />
                                                </h5>
                                                {item.note !== "" && (
                                                    <span className="text-secondary">
                                                        {" "}
                                                        &ndash; {item.note}
                                                    </span>
                                                )}
                                            </Col>
                                            <Col md="2">
                                                {item.phone && (
                                                    <ClientPhone phone={item.phone} icon />
                                                )}
                                            </Col>
                                            <Col md="3">
                                                {item.email && <ClientEmail email={item.email} />}
                                            </Col>
                                            <Col className="text-end mt-1 mt-md-0" md="1">
                                                <ModalClients
                                                    currentClient={item}
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

export default Search
