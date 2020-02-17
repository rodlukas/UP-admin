import React, { Fragment, useContext, useEffect } from "react"
import { Badge, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"
import { ClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import BackButton from "./buttons/BackButton"
import ClientName from "./ClientName"
import Email from "./Email"
import Heading from "./Heading"
import Loading from "./Loading"
import Phone from "./Phone"

const SearchResults = ({ foundResults, searchVal, search, resetSearch }) => {
    const clientsActiveContext = useContext(ClientsActiveContext)

    useEffect(() => {
        if (clientsActiveContext.isLoaded && searchVal !== "") search()
    }, [clientsActiveContext.isLoaded, search, searchVal])

    return (
        <Fragment>
            {searchVal !== "" && (
                <Container>
                    <Heading
                        content={
                            <Fragment>
                                <BackButton onClick={resetSearch} content="Zrušit" /> Vyhledaní
                                klienti{" "}
                                <Badge color="secondary" pill>
                                    {" "}
                                    {foundResults.length}
                                </Badge>
                            </Fragment>
                        }
                    />
                    <ListGroup>
                        {!clientsActiveContext.isLoaded ? (
                            <Loading />
                        ) : (
                            <Fragment>
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
                                                    <Phone phone={client.phone} icon />
                                                )}
                                            </Col>
                                            <Col md="3">
                                                {client.email && <Email email={client.email} />}
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
                            </Fragment>
                        )}
                    </ListGroup>
                </Container>
            )}
        </Fragment>
    )
}

export default SearchResults
