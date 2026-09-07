import { Container, SimpleGrid } from "@mantine/core"
import * as React from "react"

import { useLecturesFromDay } from "../api/hooks"
import Bank from "../components/Bank"
import DashboardDay from "../components/DashboardDay"
import Heading from "../components/Heading"
import UpcomingLectures from "../components/UpcomingLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { toISODate } from "../global/funcDateTime"

import * as styles from "./Dashboard.css"

/** Stránka s hlavním přehledem - dnešní lekce a banka. */
const Dashboard: React.FC = () => {
    const today = toISODate(new Date())
    // stejný klíč dotazu jako uvnitř `DashboardDay` (`withoutWaiting`/`asc` výchozí `true`),
    // takže se výsledek sdílí přes cache React Query a na server nejde požadavek navíc —
    // zjišťuje se tím jen to, jestli se má vedle "Dnešní lekce" zobrazit i "Nejbližší lekce"
    const { data: todayLectures = [], isSuccess: isTodaySuccess } = useLecturesFromDay(today, true)
    // zrušená lekce se nekoná (stejné pravidlo jako u `getAllFromDateOrdered`), takže den,
    // kde je zrušená úplně všechno, se pro tenhle účel počítá jako prázdný.
    // Podmínka čeká na `isSuccess`, ne jen na dojetí `isLoading`: selhaný dotaz nechá
    // `todayLectures` prázdné taky, a `[].every(...)` je `true` — bez téhle podmínky by
    // výpadek API tvrdil, že dnešek je volný, a přiotevřel druhou sekci navrch.
    const showUpcoming = isTodaySuccess && todayLectures.every((lecture) => lecture.canceled)

    return (
        <Container size="xl">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" verticalSpacing="lg">
                <div className={styles.dashboardSection}>
                    {/* jediný h1 stránky (osnova pro čtečky / axe page-has-heading-one);
                        vizuálně zůstává h2, aby ladil se sousední sekcí Bankovní účet */}
                    <Heading
                        title="Dnešní lekce"
                        order={1}
                        size="h2"
                        buttons={
                            <ModalLecturesWizard source="dashboard" dropdownLabel="Přidat lekci" />
                        }
                    />
                    <div className={styles.lecturesPanel}>
                        <DashboardDay date={today} withoutWaiting source="dashboard" />
                    </div>
                    {/*
                     * Samostatná sekce, ne fallback uvnitř `DashboardDay`: nejbližší lekce
                     * nejsou z dnešního dne, takže nepatří do jeho sloupce (dřív zdědily
                     * jeho chrome — lepící se hlavičku dne i linku značící dnešek, která
                     * pak trčela vedle nadpisu "Nejbližší lekce", ač se týkala celého sloupce).
                     */}
                    {showUpcoming && (
                        <>
                            <Heading title="Nejbližší lekce" order={2} />
                            <div className={styles.lecturesPanel}>
                                <UpcomingLectures />
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.dashboardSection}>
                    <Heading title="Bankovní účet" order={2} />
                    <Bank />
                </div>
            </SimpleGrid>
        </Container>
    )
}

export default Dashboard
