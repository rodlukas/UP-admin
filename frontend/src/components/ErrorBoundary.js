import React, {Component, Fragment} from "react"
import Heading from "./Heading"
import {Alert, Container, Row, Col} from "reactstrap"

export default class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
        info: null
    }

    componentDidCatch(error, info) {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: info})
    }

    render() {
        const HeadingContent = () =>
            <Fragment>
                Chyba aplikace
            </Fragment>
        if (this.state.hasError) {
            return (
                <div className="text-center">
                    <Heading content={<HeadingContent/>}/>
                    <p>
                        Nastala neočekávaná chyba v aplikaci. Zkuste tuto stránku načíst znovu.
                    </p>
                    <Container>
                        <Row>
                            <Col>
                                <Alert color="danger" className="text-left" style={{whiteSpace: 'pre-wrap'}}>
                                    {this.state.error && this.state.error.toString()}
                                    <br/>
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
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
