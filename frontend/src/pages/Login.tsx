import * as React from "react"
import { Redirect } from "react-router-dom"
import { Card, Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap"

import APP_URLS from "../APP_URLS"
import { useAuthContext } from "../auth/AuthContext"
import SubmitButton from "../components/buttons/SubmitButton"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import useForm from "../hooks/useForm"
import { AuthorizationType } from "../types/models"
import { CustomRouteComponentProps } from "../types/types"

/** Stránka s přihlášením. */
const Login: React.FC<CustomRouteComponentProps> = (props) => {
    // destructuring kvuli useEffect deps (viz https://github.com/rodlukas/UP-admin/issues/96)
    const {
        isAuth: authContextIsAuth,
        isAuthenticated: authContextIsAuthenticated,
        login: authContextLogin,
        isLoading: authContextIsLoading,
    } = useAuthContext()

    const usernameField = React.useRef<HTMLInputElement>(null)
    const passwordField = React.useRef<HTMLInputElement>(null)

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

    const redirectedFrom = props.location.state ? props.location.state.from : "/"
    if (authContextIsAuth) {
        return <Redirect to={redirectedFrom} />
    }
    if (authContextIsLoading) {
        return <Loading text="Probíhá přihlašování" />
    }
    return (
        <Container>
            <Heading title={APP_URLS.prihlasit.title} />
            <Row>
                <Col md="9" lg="6">
                    <Card className="p-4">
                        <Form onSubmit={handleSubmit} data-qa="form_login">
                            <FormGroup row>
                                <Label for="username" sm={4}>
                                    Uživatelské jméno
                                </Label>
                                <Col sm={8}>
                                    <Input
                                        type="text"
                                        id="username"
                                        value={values.username}
                                        innerRef={usernameField}
                                        onChange={handleChange}
                                        required
                                        autoCapitalize="none"
                                        autoFocus
                                        data-qa="login_field_username"
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="password" sm={4}>
                                    Heslo
                                </Label>
                                <Col sm={8}>
                                    <Input
                                        type="password"
                                        id="password"
                                        value={values.password}
                                        innerRef={passwordField}
                                        onChange={handleChange}
                                        required
                                        data-qa="login_field_password"
                                    />
                                </Col>
                            </FormGroup>
                            <SubmitButton data-qa="button_submit_login" content="Přihlásit" />
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Login
