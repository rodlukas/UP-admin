import * as React from "react"
import { Col, Container, Row } from "reactstrap"

import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { toISODate } from "../global/funcDateTime"
/** Stránka s hlavním přehledem - dnešní lekce a banka. */
const Dashboard: React.FC = () => {
    return (
        <Container>
            <Row className="justify-content-center">
                <Col sm="11" md="8" lg="8" xl="6">
                    <Heading
                        title={
                            <>
                                Dnešní lekce <ModalLecturesWizard />
                            </>
                        }
                    />
                    <DashboardDay date={toISODate(new Date())} withoutWaiting />
                </Col>
                <Col sm="11" md="8" lg="8" xl="6">
                    <Heading title="Bankovní účet" />
                    <Bank />
                </Col>
            </Row>
        </Container>
    )
}

export default Dashboard
