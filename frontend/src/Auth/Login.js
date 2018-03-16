import React, {Component} from "react"
import {Route, Redirect, withRouter} from "react-router-dom"
import axios from "axios"
import {Col, Form, FormGroup, Label, Button, Input, Container} from 'reactstrap'

export class Login extends Component {
    constructor(props) {
        super(props)
        this.title = "Přihlášení"
        this.state = {
            redirectToReferrer: false,
            username: '',
            password: ''
        }
    }

    login = () => {
        AuthService.authenticate(this.state.username, this.state.password, () => {
            this.setState({redirectToReferrer: true})
        })
    }

    onChange = (e) => {
        const state = this.state
        state[e.target.name] = e.target.value
        this.setState(state)
    }

    onSubmit = (e) => {
        e.preventDefault()
        this.login()
    }

    render() {
        const {from} = this.props.location.state || {from: {pathname: "/"}}
        const {redirectToReferrer, username, password} = this.state
        if (redirectToReferrer) {
            return <Redirect to={from}/>}
        return (
            <Container>
                <h1 className="text-center mb-4">{this.title}</h1>
                <Form onSubmit={this.onSubmit}>
                    <FormGroup row>
                        <Label for="username" sm={2}>Uživatelské jméno</Label>
                        <Col sm={10}>
                            <Input type="text" name="username" id="username" value={username} onChange={this.onChange} required="true"/>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="password" sm={2}>Heslo</Label>
                        <Col sm={10}>
                            <Input type="password" name="password" id="password" value={password} onChange={this.onChange} required="true"/>
                        </Col>
                    </FormGroup>
                    <Button color="primary" type="submit">Přihlásit</Button>
                </Form>
            </Container>
        )
    }
}

export const PrivateRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            AuthService.isAuthenticated() ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/prihlasit",
                        state: {from: props.location}}}
                />)}
    />
)

export const AuthButton = withRouter(
    ({history}) =>
        AuthService.isAuthenticated() &&
            <Button color="secondary" onClick={() => AuthService.signout(() => history.push("/"))}>Odhlásit</Button>
)

const AuthService = {
    is_authenticated: false,
    isAuthenticated() {
        if(localStorage.getItem("jwt"))
            this.is_authenticated = true
        return this.is_authenticated
    },
    authenticate(username, password, callback) {
        axios.post('/api/v1/api-jwt-auth/', {username, password})
            .then((response) => {
                this.is_authenticated = true
                localStorage.setItem("jwt", response.data.token)
                callback()
            })
            .catch((error) => {
                console.log(error)
                alert("Špatné jméno nebo heslo!")
                this.props.history.push("/login")
            })
    },
    signout(callback) {
        this.is_authenticated = false
        localStorage.clear()
        callback()
    }
}
