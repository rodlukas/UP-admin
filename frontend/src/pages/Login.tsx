import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import { faLock, faUser } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Navigate } from "@tanstack/react-router"
import * as React from "react"

import APP_URLS from "../APP_URLS"
import { useAuthContext } from "../auth/AuthContext"
import SubmitButton from "../components/buttons/SubmitButton"
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

    const form = useForm<AuthorizationType>({
        initialValues: {
            username: "",
            password: "",
        },
    })

    function login(): void {
        // workaround kvuli https://github.com/facebook/react/issues/1159
        // - nefunkcni autocomplete v nekterych prohlizecich (predevsim mobily)
        // - v idealnim svete zde bude jen: authContextLogin(form.values)
        const valuesCurrent: AuthorizationType = {
            username: usernameField.current ? usernameField.current.value : form.values.username,
            password: passwordField.current ? passwordField.current.value : form.values.password,
        }
        void authContextLogin(valuesCurrent)
    }

    React.useEffect(() => {
        // pokud dojde k přesměrování po neúspěšném požadavku (401), je potřeba okamžitě zjistit, zda je potřeba
        // upravit stav AuthContext (jinak cyklení)
        void authContextIsAuthenticated(false)
    }, [authContextIsAuth, authContextIsAuthenticated])

    const redirectFromSearch = React.useMemo(
        () => new URLSearchParams(globalThis.location?.search ?? "").get("redirect") ?? undefined,
        [],
    )
    const redirectedFrom = redirectFromSearch ?? APP_URLS.prehled.url
    if (authContextIsAuth) {
        return <Navigate to={redirectedFrom} replace />
    }
    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.logoContainer}>
                    <img
                        src="/static/admin/android-chrome-512x512.png"
                        alt="ÚPadmin logo"
                        className={styles.logo}
                    />
                </div>
                <Title order={1} className={styles.title}>
                    ÚP<sub>admin</sub>
                </Title>
                <p className={styles.subtitle}>Přihlaste se do administračního systému</p>
                <form onSubmit={form.onSubmit(login)} data-qa="form_login">
                    <div className={styles.fieldWrapper}>
                        <TextInput
                            leftSection={<FontAwesomeIcon icon={faUser} fixedWidth />}
                            type="text"
                            id="username"
                            name="username"
                            {...form.getInputProps("username")}
                            ref={usernameField}
                            required
                            autoCapitalize="none"
                            autoComplete="username"
                            autoFocus
                            aria-label="Uživatelské jméno"
                            placeholder="Uživatelské jméno"
                            data-qa="login_field_username"
                        />
                    </div>
                    <div className={styles.fieldWrapper}>
                        <TextInput
                            leftSection={<FontAwesomeIcon icon={faLock} fixedWidth />}
                            type="password"
                            id="password"
                            name="password"
                            {...form.getInputProps("password")}
                            ref={passwordField}
                            required
                            autoComplete="current-password"
                            aria-label="Heslo"
                            placeholder="Heslo"
                            data-qa="login_field_password"
                        />
                    </div>
                    <SubmitButton
                        data-qa="button_submit_login"
                        content="Přihlásit"
                        className={styles.submitButton}
                        loading={authContextIsLoading}
                    />
                </form>
            </div>
        </div>
    )
}

export default Login
