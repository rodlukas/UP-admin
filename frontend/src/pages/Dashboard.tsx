import * as React from "react"
import { Col, Container, Row } from "reactstrap"
import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { toISODate } from "../global/funcDateTime"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps

type State = {
    /** Komponentu se dnem je potřeba znovu načíst (true) - provedla se v ní aktualizace. */
    shouldRefresh: boolean
}

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
export default class Dashboard extends React.Component<Props, State> {
    state: State = {
        shouldRefresh: false,
    }

    getDate = (): string => toISODate(new Date())

    setRefreshState = (): void =>
        this.setState({ shouldRefresh: true }, () => this.setState({ shouldRefresh: false }))

    render(): React.ReactNode {
        return (
            <Container>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="6">
                        <Heading
                            title={
                                <>
                                    Dnešní lekce{" "}
                                    <ModalLecturesWizard refresh={this.setRefreshState} />
                                </>
                            }
                        />
                        <DashboardDay
                            date={this.getDate()}
                            setRefreshState={this.setRefreshState}
                            shouldRefresh={this.state.shouldRefresh}
                            withoutWaiting
                        />
                    </Col>
                    <Col sm="11" md="8" lg="8" xl="6">
                        <Heading title="Bankovní účet" />
                        <Bank />
                    </Col>
                </Row>
            </Container>
        )
    }
}
