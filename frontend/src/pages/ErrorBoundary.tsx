import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenNib } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import * as Sentry from "@sentry/browser"
import { useRouterState } from "@tanstack/react-router"
import * as React from "react"
import { Alert, Container } from "reactstrap"

import Token from "../auth/Token"
import CustomButton from "../components/buttons/CustomButton"
import Heading from "../components/Heading"
import { TokenDecodedType } from "../types/models"

type Props = {
    children: React.ReactNode
    locationKey: string
}

type State = {
    /** Vyskytla se chyba (true). */
    hasError: boolean
    /** Objekt s dalšími informacemi o chybě (obsahuje componentStack). */
    errorInfo?: React.ErrorInfo
    /** ID chyby ze Sentry. */
    eventId?: string
    /** Konkrétní chyba, která se vyskytla. */
    error?: Error
}

/**
 * Stránka s chybou při neočekávaném problému na klientské části.
 * Vychází z: https://docs.sentry.io/platforms/javascript/react/#error-boundaries
 */
class ErrorBoundary extends React.Component<Props, State> {
    state: State = {
        hasError: false,
        eventId: undefined,
        error: undefined,
        errorInfo: undefined,
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
            this.setState({ hasError: false })
        }
    }

    static getDerivedStateFromError(): Partial<State> {
        // v pripade, ze doslo k chybe pri otvirani formulare, odstran tento priznak z body
        // jinak bude pro body nastaveno overflow: hidden a nepujde scrollovat
        document.body.classList.remove("modal-open")
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        Sentry.withScope((scope) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            scope.setExtras(errorInfo as any)
            const eventId = Sentry.captureException(error)
            this.setState({ eventId, error, errorInfo })
        })
    }

    getToken = (): TokenDecodedType => {
        const token = Token.get()
        const decodedToken: TokenDecodedType = Token.getEmpty()
        if (token) {
            try {
                return Token.decodeToken(token)
            } catch (e) {
                console.error(e)
            }
        }
        return decodedToken
    }

    render(): React.ReactNode {
        const decodedToken = this.getToken()
        if (this.state.hasError) {
            // render fallback UI
            return (
                <Container>
                    <Heading title="Chyba aplikace" />
                    <p>
                        Nastala neočekávaná chyba v aplikaci. Zkuste tuto stránku{" "}
                        <CustomButton
                            content={"načíst znovu"}
                            onClick={() => globalThis.location?.reload()}
                        />
                        .
                    </p>
                    <CustomButton
                        onClick={(): void =>
                            Sentry.showReportDialog({
                                title: "Došlo k chybě v aplikaci",
                                user: {
                                    email: decodedToken.email,
                                    name: decodedToken.username,
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
                                    "Při odesílání formuláře nastala neznámá chyba. Zkuste to znovu.",
                            })
                        }
                        content={
                            <>
                                Odeslat zpětnou vazbu{" "}
                                <FontAwesomeIcon icon={faPenNib} transform="right-2" />
                            </>
                        }
                    />
                    <Alert color="danger" className="mt-4">
                        <h4 className="alert-heading">Popis chyby</h4>
                        <details className="text-start" style={{ whiteSpace: "pre-wrap" }}>
                            <summary className="fw-bold">{this.state.error?.toString()}</summary>
                            <small>{this.state.errorInfo?.componentStack}</small>
                        </details>
                    </Alert>
                </Container>
            )
        }
        // kdyz neni problem, renderuj potomka
        return this.props.children
    }
}

const ErrorBoundaryWithLocation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const locationKey = useRouterState({
        select: (state) => state.location.href,
    })
    return <ErrorBoundary locationKey={locationKey}>{children}</ErrorBoundary>
}

export default ErrorBoundaryWithLocation
