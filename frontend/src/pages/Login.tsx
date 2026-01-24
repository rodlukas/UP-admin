import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLock, faUser } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Navigate } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"
import {
    Card,
    Container,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
} from "reactstrap"

import APP_URLS from "../APP_URLS"
import { useAuthContext } from "../auth/AuthContext"
import SubmitButton from "../components/buttons/SubmitButton"
import useForm from "../hooks/useForm"
import { AuthorizationType } from "../types/models"

import * as styles from "./Login.css"

/** Stránka s přihlášením. */
const Login: React.FC = () => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const {
        isAuth: authContextIsAuth,
        isAuthenticated: authContextIsAuthenticated,
        login: authContextLogin,
        isLoading: authContextIsLoading,
    } = useAuthContext()

    const usernameField = React.useRef<HTMLInputElement | null>(null)
    const passwordField = React.useRef<HTMLInputElement | null>(null)

    const [values, handleChange, handleSubmit] = useForm<AuthorizationType>(
        {
            username: "",
            password: "",
        },
        login,
    )

    function login(): void {
        // workaround kvuli https://github.com/facebook/react/issues/1159
        // - nefunkcni autocomplete v nekterych prohlizecich (predevsim mobily)
        // - v idealnim svete zde bude jen: authContextLogin(values)
        const valuesCurrent: AuthorizationType = {
            username: usernameField.current ? usernameField.current.value : values.username,
            password: passwordField.current ? passwordField.current.value : values.password,
        }
        void authContextLogin(valuesCurrent)
    }

    React.useEffect(() => {
        // pokud dojde k přesměrování po neúspěšném požadavku (401), je potřeba okamžitě zjistit, zda je potřeba
        // upravit stav AuthContext (jinak cyklení)
        void authContextIsAuthenticated(false)
    }, [authContextIsAuth, authContextIsAuthenticated])

    const redirectFromSearch = React.useMemo(
        () =>
            new URLSearchParams(globalThis.location?.search ?? "").get("redirect") ??
            undefined,
        [],
    )
    const redirectedFrom = redirectFromSearch ?? APP_URLS.prehled.url
    if (authContextIsAuth) {
        return <Navigate to={redirectedFrom} replace />
    }
    return (
        <Container className={styles.loginContainer}>
            <Card className={styles.loginCard}>
                <div className={styles.logoContainer}>
                    <img
                        src="/static/admin/android-chrome-512x512.png"
                        alt="ÚPadmin logo"
                        className={styles.logo}
                    />
                </div>
                <h1 className={styles.title}>
                    ÚP<sub>admin</sub>
                </h1>
                <p className={classNames(styles.subtitle, "text-muted")}>
                    Přihlaste se do administračního systému
                </p>
                <Form onSubmit={handleSubmit} data-qa="form_login">
                    <FormGroup>
                        <InputGroup>
                            <InputGroupText>
                                <Label for="username">
                                    <FontAwesomeIcon icon={faUser} fixedWidth />
                                </Label>
                            </InputGroupText>
                            <Input
                                type="text"
                                id="username"
                                value={values.username}
                                innerRef={usernameField}
                                onChange={handleChange}
                                required
                                autoCapitalize="none"
                                autoFocus
                                placeholder="Uživatelské jméno"
                                data-qa="login_field_username"
                            />
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <InputGroup>
                            <InputGroupText>
                                <Label for="password">
                                    <FontAwesomeIcon icon={faLock} fixedWidth />
                                </Label>
                            </InputGroupText>
                            <Input
                                type="password"
                                id="password"
                                value={values.password}
                                innerRef={passwordField}
                                onChange={handleChange}
                                required
                                placeholder="Heslo"
                                data-qa="login_field_password"
                            />
                        </InputGroup>
                    </FormGroup>
                    <SubmitButton
                        data-qa="button_submit_login"
                        content="Přihlásit"
                        className={styles.submitButton}
                        loading={authContextIsLoading}
                    />
                </Form>
            </Card>
        </Container>
    )
}

export default Login
