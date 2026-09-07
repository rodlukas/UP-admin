import { faCalendar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { Link } from "@tanstack/react-router"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { useLecturesFromDate } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { addDays, prettyDateWithDayYearIfDiff, prettyTime, toISODate } from "../global/funcDateTime"
import { contrastingTextColor } from "../global/utils"

import ClientName from "./ClientName"
import CourseName from "./CourseName"
import * as dayStyles from "./DashboardDay.css"
import EmptyState from "./EmptyState"
import GroupName from "./GroupName"
import * as lectureStyles from "./Lecture.css"
import LectureTypeIcon from "./LectureTypeIcon"
import { LectureListSkeleton } from "./Skeletons"
import * as styles from "./UpcomingLectures.css"

/** Kolik nejbližších lekcí ukázat. Přehled má být rozcestník, ne druhý diář. */
const UPCOMING_COUNT = 4

/**
 * Nejbližší příští lekce. Zobrazuje se na Přehledu jako vlastní sekce vedle "Dnešní lekce",
 * když dnes žádná lekce není — jinak by tam zůstalo jen "Volno" a nejdůležitější obrazovka
 * neřekla nic o tom, co je dál. Každá lekce vede na svůj týden v diáři.
 *
 * Nadpis sekce ("Nejbližší lekce") dodává až volající stránka (`Heading`), tahle komponenta
 * je jen obsah panelu — stejně jako `Bank` nedodává nadpis "Bankovní účet" sama.
 *
 * Vzhled řádku je stejný recept jako u skutečné lekce (`lectureHeader`/`lectureBody`
 * v DashboardDay.css.ts) — pruh v barvě kurzu s ikonou typu, pod ním jméno.
 */
const UpcomingLectures: React.FC = () => {
    // od zitrka: dnesni lekce uz ma na starost sousedni sloupec (a kdyz zadna neni,
    // tenhle fallback se zobrazuje prave proto).
    // Zamerne bez `useMemo`: s prazdnymi zavislostmi by datum zamrzlo na dni, kdy se
    // komponenta prvne vykreslila, kdezto sousedni `DashboardDay` si dnesek prepocitava
    // pri kazdem renderu — v zalozce nechane pres pulnoc by se ty dva rozesly. Vysledkem
    // je retezec, takze prepocet klic dotazu nemeni.
    const tomorrow = toISODate(addDays(new Date(), 1))
    // omezení počtu i vyfiltrování zrušených řeší API (viz `getAllFromDateOrdered`):
    // rozsah `dateFrom` je otevřený, takže bez `limit` by přehled stahoval celý kalendář,
    // a zrušená lekce se nesmí nabídnout jako nejbližší příští, protože se nekoná
    const {
        data: lectures = [],
        isLoading,
        isError,
    } = useLecturesFromDate(tomorrow, UPCOMING_COUNT)

    if (isLoading) {
        return <LectureListSkeleton count={2} bodyLines={1} />
    }

    // selhaný dotaz nesmí tvrdit, že nic naplánováno není — `lectures` je při chybě
    // prázdné stejně jako když opravdu nic není (viz stejná past v Diary.tsx u `isSuccess`)
    if (lectures.length === 0 && !isError) {
        return (
            <EmptyState
                icon={faCalendar}
                title="Žádné naplánované lekce"
                description="Dnes ani v dalších dnech není naplánovaná žádná lekce."
                action={<ModalLecturesWizard source="dashboard" dropdownLabel="Přidat lekci" />}
            />
        )
    }

    if (lectures.length === 0 && isError) {
        return (
            <EmptyState
                icon={faCalendar}
                title="Nejbližší lekce se nepodařilo načíst"
                description="Zkuste to prosím znovu později."
            />
        )
    }

    return (
        <ul className={styles.list}>
            {lectures.map((lecture) => {
                const start = new Date(lecture.start)
                return (
                    <li
                        key={lecture.id}
                        className={classNames(dayStyles.lectureBlock, dayStyles.dashboardDayItem)}>
                        <Link
                            to={`${APP_URLS.diar.url}/$year/$month/$day`}
                            params={{
                                year: String(start.getFullYear()),
                                month: String(start.getMonth() + 1),
                                day: String(start.getDate()),
                            }}
                            className={classNames(dayStyles.lectureHeader, styles.itemLink)}
                            style={assignInlineVars(lectureStyles.lectureVars, {
                                courseColor: lecture.course.color,
                                courseText: contrastingTextColor(lecture.course.color),
                            })}>
                            <span
                                className={classNames(lectureStyles.lectureTitle, styles.itemDate)}>
                                <strong>{prettyDateWithDayYearIfDiff(start)}</strong>
                            </span>
                            <span
                                className={classNames(lectureStyles.lectureTitle, styles.itemTime)}>
                                {/* `lectureTitle` samo dá jen 600 — čas v diáři je
                                        navíc v `<strong>` (prohlížečové tučné, 700),
                                        proto vychází vizuálně tučnější než tahle třída. */}
                                <strong>{prettyTime(start)}</strong>
                            </span>
                            <CourseName
                                course={lecture.course}
                                withDot={false}
                                className={dayStyles.lectureHeaderCourse}
                            />
                            <LectureTypeIcon lecture={lecture} />
                        </Link>
                        <div className={dayStyles.lectureBody}>
                            {/* Bez jména je řádek nepoužitelný: pruh řekne kdy a jaký
                                    kurz, ale ne s kým ta lekce je, a přitom právě to je
                                    důvod, proč se člověk na nejbližší lekce dívá. */}
                            <span className={styles.itemWho}>
                                {lecture.group ? (
                                    <GroupName group={lecture.group} link />
                                ) : (
                                    lecture.attendances[0]?.client && (
                                        <ClientName client={lecture.attendances[0].client} link />
                                    )
                                )}
                            </span>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default UpcomingLectures
