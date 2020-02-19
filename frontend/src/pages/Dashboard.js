import React, { Component, Fragment } from "react"
import { Col, Container, Row } from "reactstrap"
import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { toISODate } from "../global/funcDateTime"

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
export default class Dashboard extends Component {
    state = {
        shouldRefresh: false
    }

    getDate = () => toISODate(new Date())

    setRefreshState = () =>
        this.setState({ shouldRefresh: true }, () => this.setState({ shouldRefresh: false }))

    render() {
        return (
            <Container fluid>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading
                            content={
                                <Fragment>
                                    Dnešní přehled{" "}
                                    <ModalLecturesWizard refresh={this.setRefreshState} />
                                </Fragment>
                            }
                        />
                        <DashboardDay
                            date={this.getDate()}
                            setRefreshState={this.setRefreshState}
                            shouldRefresh={this.state.shouldRefresh}
                            withoutWaiting
                        />
                    </Col>
                    <Col sm="11" md="8" lg="8" xl="5">
                        <Heading content="Bankovní účet" />
                        <Bank />
                    </Col>
                </Row>
            </Container>
        )
    }
}
