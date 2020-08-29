import * as React from "react"
import { Col, Container, Row } from "reactstrap"
import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { DASHBOARDDAY_UPDATE_TYPE } from "../global/constants"
import { toISODate } from "../global/funcDateTime"
import { CustomRouteComponentProps } from "../types/types"

type Props = CustomRouteComponentProps

type State = {
    /** Typ aktualizace komponenty se dnem - pro propagaci aktualizací dalších dní. */
    updateType: number
}

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
export default class Dashboard extends React.Component<Props, State> {
    state: State = {
        updateType: DASHBOARDDAY_UPDATE_TYPE.NONE,
    }

    getDate = (): string => toISODate(new Date())

    setUpdateType = (): void =>
        this.setState({ updateType: DASHBOARDDAY_UPDATE_TYPE.DAY_UNCHANGED }, () =>
            this.setState({ updateType: DASHBOARDDAY_UPDATE_TYPE.NONE })
        )

    render(): React.ReactNode {
        return (
            <Container>
                <Row className="justify-content-center">
                    <Col sm="11" md="8" lg="8" xl="6">
                        <Heading
                            title={
                                <>
                                    Dnešní lekce{" "}
                                    <ModalLecturesWizard refresh={this.setUpdateType} />
                                </>
                            }
                        />
                        <DashboardDay
                            date={this.getDate()}
                            setUpdateType={this.setUpdateType}
                            updateType={this.state.updateType}
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
