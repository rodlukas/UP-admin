import React, {useContext, useEffect} from "react"
import {Redirect} from "react-router-dom"
import {Card, Col, Container, Form, FormGroup, Input, Label, Row} from "reactstrap"
import {AuthContext} from "../auth/AuthContext"
import SubmitButton from "../components/buttons/SubmitButton"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import useForm from "../hooks/useForm"
import APP_URLS from "../urls"

export default function Login(props) {
    const [values, handleChange, handleSubmit] = useForm({
        username: '',
        password: ''
    }, login)

    const authContext = useContext(AuthContext)

    useEffect(() => {
        // pokud dojde k přesměrování po neúspěšném požadavku (401), je potřeba okamžitě zjistit, zda je potřeba upravit stav AuthContext (jinak cyklení)
        authContext.isAuthenticated(false)
    }, [authContext.IS_AUTH])

    function login() {
        authContext.login(values)
    }

    const {from} = props.location.state || {from: {pathname: "/"}}
    if (authContext.IS_AUTH)
        return <Redirect to={from}/>
    if (authContext.IS_LOADING)
        return <Loading text="Probíhá přihlašování"/>
    return (
        <Container>
            <Heading content={APP_URLS.prihlasit.title}/>
            <Row className="justify-content-center pageContent">
                <Col md="9" lg="7">
                    <Card className="p-4">
                        <Form onSubmit={handleSubmit} data-qa="form_login">
                            <FormGroup row>
                                <Label for="username" sm={4}>
                                    Uživatelské jméno
                                </Label>
                                <Col sm={8}>
                                    <Input type="text" id="username" value={values.username} onChange={handleChange}
                                           required autoCapitalize="none" autoFocus data-qa="login_field_username"/>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="password" sm={4}>
                                    Heslo
                                </Label>
                                <Col sm={8}>
                                    <Input type="password" id="password" value={values.password}
                                           onChange={handleChange}
                                           required data-qa="login_field_password"/>
                                </Col>
                            </FormGroup>
                            <SubmitButton
                                data-qa="button_submit_login"
                                content="Přihlásit"/>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
