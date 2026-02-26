import { FuseResult } from "fuse.js"
import * as React from "react"
import { Badge, CloseButton, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap"

import { useClientsActiveContext } from "../contexts/ClientsActiveContext"
import ModalClients from "../forms/ModalClients"
import { ClientActiveType } from "../types/models"
import { fEmptyVoid } from "../types/types"

import ClientEmail from "./ClientEmail"
import ClientName from "./ClientName"
import ClientPhone from "./ClientPhone"
import Heading from "./Heading"
import Loading from "./Loading"
import * as styles from "./Search.css"

type Props = {
    /** Výsledky vyhledávání klientů. */
    foundResults: FuseResult<ClientActiveType>[]
    /** Hledaný výraz. */
    searchVal: string
    /** Funkce pro zahájení vyhledávání klientů. */
    search: fEmptyVoid
    /** Funkce zrušení vyhledávání klientů. */
    resetSearch: fEmptyVoid
}

/** Komponenta zobrazující výsledky vyhledávání - seznam klientů. */
const Search: React.FC<Props> = ({ foundResults, searchVal, search, resetSearch }) => {
    const clientsActiveContext = useClientsActiveContext()
    const dialogRef = React.useRef<HTMLDivElement>(null)

    // Focus trap - zajistí, že focus zůstane uvnitř dialogu
    React.useEffect(() => {
        if (searchVal === "" || !dialogRef.current) {
            return undefined
        }

        const dialog = dialogRef.current
        const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

        const getFocusableElements = (): HTMLElement[] => {
            return Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(
                (el) => !el.hasAttribute("disabled") && !el.hasAttribute("aria-hidden"),
            )
        }

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key !== "Tab") {
                return
            }

            // Pokud je otevřený Bootstrap modal, necháme ho zpracovat Tab sám
            const openModal = document.querySelector(".modal.show")
            if (openModal) {
                return
            }

            const focusableElements = getFocusableElements()
            if (focusableElements.length === 0) {
                return
            }

            const firstElement = focusableElements[0]
            const lastElement = focusableElements.at(-1)!
            const activeElement = document.activeElement as HTMLElement

            // Pokud není žádný prvek ve focusu nebo je mimo dialog, nastav focus na první
            if (!activeElement || !dialog.contains(activeElement)) {
                e.preventDefault()
                firstElement.focus()
                return
            }

            // Cyklická navigace: poslední -> první (Tab) nebo první -> poslední (Shift+Tab)
            const isAtFirst = activeElement === firstElement
            const isAtLast = activeElement === lastElement

            if ((!e.shiftKey && isAtLast) || (e.shiftKey && isAtFirst)) {
                e.preventDefault()
                ;(e.shiftKey ? lastElement : firstElement).focus()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [searchVal])

    React.useEffect(() => {
        if (searchVal === "") {
            return undefined
        }
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
    }, [searchVal])

    return (
        <>
            {searchVal !== "" && (
                <div
                    className={styles.searchOverlay}
                    onMouseDown={(e) => {
                        // Zavři dialog pouze pokud byl klik na overlay, ne na kontejner
                        if (e.target === e.currentTarget) {
                            resetSearch()
                        }
                    }}
                    role="presentation"
                    aria-label="Výsledky vyhledávání">
                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                    <div
                        ref={dialogRef}
                        className={styles.searchContainer}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === "Escape" && !document.querySelector(".modal.show")) {
                                resetSearch()
                            }
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="search-dialog-title">
                        <Container>
                            <Heading
                                title={
                                    <span id="search-dialog-title">
                                        Nalezení klienti{" "}
                                        <Badge color="secondary" pill>
                                            {foundResults.length}
                                        </Badge>
                                    </span>
                                }
                                buttons={
                                    <CloseButton
                                        onClick={resetSearch}
                                        aria-label="Zavřít vyhledávání"
                                    />
                                }
                            />
                            {clientsActiveContext.isLoading && <Loading />}
                            {foundResults.length > 0 && !clientsActiveContext.isLoading && (
                                <ListGroup>
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
                                                    {item.email && (
                                                        <ClientEmail email={item.email} />
                                                    )}
                                                </Col>
                                                <Col className="text-end mt-1 mt-md-0" md="1">
                                                    <ModalClients
                                                        currentClient={item}
                                                        refresh={search}
                                                        source="search"
                                                    />
                                                </Col>
                                            </Row>
                                        </ListGroupItem>
                                    ))}
                                </ListGroup>
                            )}
                            {foundResults.length === 0 && !clientsActiveContext.isLoading && (
                                <p className="text-muted text-center">Žádní klienti nenalezeni</p>
                            )}
                        </Container>
                    </div>
                </div>
            )}
        </>
    )
}

export default Search
