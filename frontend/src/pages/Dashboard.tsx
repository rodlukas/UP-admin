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

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
const Dashboard: React.FC<Props> = () => {
    /** Typ aktualizace komponenty se dnem - pro propagaci aktualizací dalších dní. */
    const [updateType, setUpdateTypeState] = React.useState<DASHBOARDDAY_UPDATE_TYPE>(
        DASHBOARDDAY_UPDATE_TYPE.NONE,
    )

    const getDate = React.useCallback((): string => toISODate(new Date()), [])

    const setUpdateType = React.useCallback((): void => {
        setUpdateTypeState(DASHBOARDDAY_UPDATE_TYPE.DAY_UNCHANGED)
    }, [])

    React.useEffect(() => {
        if (updateType === DASHBOARDDAY_UPDATE_TYPE.DAY_UNCHANGED) {
            setUpdateTypeState(DASHBOARDDAY_UPDATE_TYPE.NONE)
        }
    }, [updateType])

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
                    <DashboardDay
                        date={getDate()}
                        setUpdateType={setUpdateType}
                        updateType={updateType}
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

export default Dashboard
