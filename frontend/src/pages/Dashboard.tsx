import { Container, SimpleGrid } from "@mantine/core"
import * as React from "react"

import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { toISODate } from "../global/funcDateTime"

import * as styles from "./Dashboard.css"

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
const Dashboard: React.FC = () => {
    return (
        <Container size="xl">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" verticalSpacing="lg">
                <div className={styles.dashboardSection}>
                    <Heading
                        title="Dnešní lekce"
                        buttons={<ModalLecturesWizard source="dashboard" />}
                    />
                    <DashboardDay date={toISODate(new Date())} withoutWaiting source="dashboard" />
                </div>
                <div className={styles.dashboardSection}>
                    <Heading title="Bankovní účet" />
                    <Bank />
                </div>
            </SimpleGrid>
        </Container>
    )
}

export default Dashboard
