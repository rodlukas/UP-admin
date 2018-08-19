import React, {Component} from "react"
import Heading from "../components/Heading"
import {Alert, Container, Row, Col} from "reactstrap"
import {withRouter} from "react-router-dom"

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            info: null
        }
        // aby fungoval react-router pri nejake chybe
        this.props.history.listen(() => {
            if (this.state.hasError)
                this.setState({hasError: false})
        })
    }

    componentDidCatch(error, info) {
        this.setState({
            hasError: true,
            error: error,
            errorInfo: info})
    }

    render() {
        const HeadingContent = () =>
            "Chyba aplikace"
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

export default withRouter(ErrorBoundary)
