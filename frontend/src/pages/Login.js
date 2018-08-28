import React, {Component} from "react"
import {Redirect} from "react-router-dom"
import {Col, Form, FormGroup, Label, Input, Container, Row, Card} from "reactstrap"
import SubmitButton from "../components/buttons/SubmitButton"
import Heading from "../components/Heading"
import {WithAuthContext} from "../auth/AuthContext"
import Loading from "../components/Loading"

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: ''
        }
        // pokud dojde k přesměrování po neúspěšném požadavku (401), je potřeba okamžitě zjistit, zda je potřeba upravit stav AuthContext (jinak cyklení)
        this.props.authContext.isAuthenticated()
    }

    login = () => {
        const {username, password} = this.state
        this.props.authContext.login(
            username,
            password
        )
    }

    onChange = e => {
        const target = e.target
        const value = target.type === 'checkbox' ? target.checked : target.value
        this.setState({[target.id]: value})
    }

    onSubmit = e => {
        e.preventDefault()
        this.login()
    }

    render() {
        const {from} = this.props.location.state || {from: {pathname: "/"}}
        const {username, password} = this.state
        if (this.props.authContext.IS_AUTH)
            return <Redirect to={from}/>
        const HeadingContent = () =>
            "Přihlášení"
        if (this.props.authContext.IS_LOADING)
            return <Loading text="Probíhá přihlašování"/>
        return (
            <Container>
                <Heading content={<HeadingContent/>}/>
                <Row className="justify-content-center">
                    <Col md="9" lg="7">
                        <Card className="p-4">
                            <Form onSubmit={this.onSubmit}>
                                <FormGroup row>
                                    <Label for="username" sm={4}>
                                        Uživatelské jméno
                                    </Label>
                                    <Col sm={8}>
                                        <Input type="text" id="username" value={username} onChange={this.onChange}
                                               required/>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="password" sm={4}>
                                        Heslo
                                    </Label>
                                    <Col sm={8}>
                                        <Input type="password" id="password" value={password} onChange={this.onChange}
                                               required/>
                                    </Col>
                                </FormGroup>
                                <SubmitButton content="Přihlásit"/>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default WithAuthContext(Login)
