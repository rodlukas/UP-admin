import {faPenNib} from "@fortawesome/pro-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import * as Sentry from "@sentry/browser"
import React, {Component, Fragment} from "react"
import {withRouter} from "react-router-dom"
import {Alert, Col, Container, Row} from "reactstrap"
import {Token} from "../auth/AuthContext"
import CustomButton from "../components/buttons/CustomButton"
import Heading from "../components/Heading"

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
        // aby fungoval react-router pri nejake chybe
        this.props.history.listen(() => {
            if (this.state.hasError)
                this.setState({hasError: false})
        })
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: errorInfo
        })
    }

    getToken = () => {
        const token = Token.get()
        let decodedToken = {
            email: '',
            username: ''
        }
        if (!!token)
            decodedToken = Token.decodeToken(token)
        return decodedToken
    }

    render() {
        const decodedToken = this.getToken()
        const HeadingContent = () =>
            "Chyba aplikace"
        if (this.state.hasError) {
            return (
                <div className="text-center">
                    <Heading content={<HeadingContent/>}/>
                    <p>
                        Nastala neočekávaná chyba v aplikaci. Zkuste tuto stránku načíst znovu.
                    </p>
                    <CustomButton onClick={() => Sentry.showReportDialog(
                        {
                            title: "Došlo k chybě v aplikaci",
                            user: {
                                'email': decodedToken.email,
                                'name': decodedToken.username
                            }
                        })} content={
                        <Fragment>
                            Odeslat zpětnou vazbu <FontAwesomeIcon icon={faPenNib} transform="right-2"/>
                        </Fragment>
                    }/>
                    <Container className="mt-3">
                        <Row className="justify-content-center">
                            <Col className="col-auto">
                                <Alert color="danger">
                                    <h4 className="alert-heading">Popis chyby</h4>
                                    <details className="text-left" style={{whiteSpace: 'pre'}}>
                                        <summary className="font-weight-bold">
                                            {this.state.error && this.state.error.toString()}
                                        </summary>
                                        <small>
                                            {this.state.errorInfo && this.state.errorInfo.componentStack}
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
