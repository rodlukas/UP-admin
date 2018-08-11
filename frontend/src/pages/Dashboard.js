import React, {Component, Fragment} from "react"
import {Container, Row, Col} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import {toISODate} from "../global/funcDateTime"

export default class Dashboard extends Component {
    getDate = () => toISODate(new Date())

    render() {
        const HeadingContent = () =>
            <Fragment>
                Dnešní přehled
            </Fragment>
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content={<HeadingContent/>}/>
                        <DashboardDay date={this.getDate()}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}
