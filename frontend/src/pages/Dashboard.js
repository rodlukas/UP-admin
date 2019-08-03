import React, {Component, Fragment} from "react"
import {Col, Container, Row} from "reactstrap"
import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesFast from "../forms/ModalLecturesFast"
import {toISODate} from "../global/funcDateTime"

export default class Dashboard extends Component {
    getDate = () => toISODate(new Date())

    render() {
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content={
                            <Fragment>
                                Dnešní přehled
                                {' '}
                                <ModalLecturesFast refresh={this.setRefreshState}/>
                            </Fragment>
                        }/>
                        <DashboardDay date={this.getDate()} withoutWaiting/>
                    </Col>
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content="Bankovní účet"/>
                        <Bank/>
                    </Col>
                </Row>
            </Container>
        )
    }
}
