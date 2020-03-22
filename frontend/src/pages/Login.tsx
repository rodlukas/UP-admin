import * as React from "react"
import { Redirect } from "react-router-dom"
import { Card, Col, Container, Form, FormGroup, Input, Label, Row } from "reactstrap"
import APP_URLS from "../APP_URLS"
import { AuthContext } from "../auth/AuthContext"
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
    } = React.useContext(AuthContext)

    const [values, handleChange, handleSubmit] = useForm<AuthorizationType>(
        {
            username: "",
            password: "",
        },
        login
    )

    function login(): void {
        authContextLogin(values)
    }

    React.useEffect(() => {
        // pokud dojde k přesměrování po neúspěšném požadavku (401), je potřeba okamžitě zjistit, zda je potřeba
        // upravit stav AuthContext (jinak cyklení)
        authContextIsAuthenticated(false)
    }, [authContextIsAuth, authContextIsAuthenticated])

    const redirectedFrom = props.location.state ? props.location.state.from : "/"
    if (authContextIsAuth) return <Redirect to={redirectedFrom} />
    if (authContextIsLoading) return <Loading text="Probíhá přihlašování" />
    return (
        <Container>
            <Heading content={APP_URLS.prihlasit.title} />
            <Row className="justify-content-center pageContent">
                <Col md="9" lg="7">
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
