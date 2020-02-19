import { faPenNib } from "@fortawesome/pro-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as Sentry from "@sentry/browser"
import React, { Component, Fragment } from "react"
import { withRouter } from "react-router-dom"
import { Alert, Col, Container, Row } from "reactstrap"
import { Token } from "../auth/AuthContext"
import CustomButton from "../components/buttons/CustomButton"
import Heading from "../components/Heading"

/**
 * Stránka s diářem.
 * Vychází z: https://docs.sentry.io/platforms/javascript/react/#error-boundaries
 */
class ErrorBoundary extends Component {
    state = {
        eventId: null,
        error: null,
        errorInfo: null
    }

    constructor(props) {
        super(props)
        // aby fungoval react-router pri nejake chybe
        this.props.history.listen(() => {
            if (this.state.hasError) this.setState({ hasError: false })
        })
    }

    static getDerivedStateFromError() {
        // v pripade, ze doslo k chybe pri otvirani formulare, odstran tento priznak z body
        // jinak bude pro body nastaveno overflow: hidden a nepujde scrollovat
        document.body.classList.remove("modal-open")
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        Sentry.withScope(scope => {
            scope.setExtras(errorInfo)
            const eventId = Sentry.captureException(error)
            this.setState({ eventId, error, errorInfo })
        })
    }

    getToken = () => {
        const token = Token.get()
        let decodedToken = {
            email: "",
            username: ""
        }
        if (token) decodedToken = Token.decodeToken(token)
        return decodedToken
    }

    render() {
        const decodedToken = this.getToken()
        if (this.state.hasError) {
            // render fallback UI
            return (
                <div className="text-center">
                    <Heading content="Chyba aplikace" />
                    <p>Nastala neočekávaná chyba v aplikaci. Zkuste tuto stránku načíst znovu.</p>
                    <CustomButton
                        onClick={() =>
                            Sentry.showReportDialog({
                                title: "Došlo k chybě v aplikaci",
                                user: {
                                    email: decodedToken.email,
                                    name: decodedToken.username
                                },
                                labelName: "Jméno",
                                labelClose: "Zavřít",
                                labelSubmit: "Odeslat",
                                labelComments: "Co se stalo?",
                                eventId: this.state.eventId,
                                subtitle: "Administrátor byl upozorněn na chybu.",
                                subtitle2: "Pokud chcete pomoct, níže napište, co se stalo.",
                                successMessage: "Vaše zpětná vazba byla odeslána. Díky!",
                                errorFormEntry:
                                    "Některá pole nejsou validní. Opravte, prosím, chyby a odešlete formulář znovu.",
                                errorGeneric:
                                    "Při odesílání formuláře nastala neznámá chyba. Zkuste to znovu."
                            })
                        }
                        content={
                            <Fragment>
                                Odeslat zpětnou vazbu{" "}
                                <FontAwesomeIcon icon={faPenNib} transform="right-2" />
                            </Fragment>
                        }
                    />
                    <Container className="mt-3">
                        <Row className="justify-content-center">
                            <Col className="col-auto">
                                <Alert color="danger">
                                    <h4 className="alert-heading">Popis chyby</h4>
                                    <details
                                        className="text-left"
                                        style={{ whiteSpace: "pre-wrap" }}>
                                        <summary className="font-weight-bold">
                                            {this.state.error && this.state.error.toString()}
                                        </summary>
                                        <small>
                                            {this.state.errorInfo &&
                                                this.state.errorInfo.componentStack}
                                        </small>
                                    </details>
                                </Alert>
                            </Col>
                        </Row>
                    </Container>
                </div>
            )
        }
        // kdyz neni problem, renderuj potomka
        return this.props.children
    }
}

export default withRouter(ErrorBoundary)
