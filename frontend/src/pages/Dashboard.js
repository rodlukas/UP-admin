import React, {Component} from "react"
import {Container, Row, Col} from "reactstrap"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import {toISODate} from "../global/funcDateTime"
import Bank from "../components/Bank"

export default class Dashboard extends Component {
    getDate = () => toISODate(new Date())

    render() {
        const HeadingContentDay = () =>
            "Dnešní přehled"
        const HeadingContentBank = () =>
            "Bankovní účet"
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content={<HeadingContentDay/>}/>
                        <DashboardDay date={this.getDate()}/>
                    </Col>
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content={<HeadingContentBank/>}/>
                        <Bank/>
                    </Col>
                </Row>
            </Container>
        )
    }
}
