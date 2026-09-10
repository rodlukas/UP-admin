import { Tooltip } from "@mantine/core"
import * as React from "react"

import { AnalyticsSource } from "../analytics"
import { AttendanceType, LectureType } from "../types/models"

import AttendancePaidButton from "./AttendancePaidButton"
import AttendanceRemindPay from "./AttendanceRemindPay"
import * as styles from "./Attendances.css"
import AttendanceSelectAttendanceState from "./AttendanceSelectAttendanceState"
import ClientName from "./ClientName"
import LectureNote from "./LectureNote"

type AttendanceProps = {
    /** Účast klienta na lekci. */
    attendance: AttendanceType
    /** Zobraz jméno klienta (true). */
    showClient: boolean
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující jednotlivou účast klienta na dané lekci. */
const Attendance: React.FC<AttendanceProps> = ({ attendance, showClient = false, source }) => {
    // `attendance.number` může být místo čísla i varovná VĚTA (chybějící výchozí stav
    // účasti, viz `LectureNumberOrWarning`) — v tom případě se zobrazí beze změny, bez
    // tečky a bez „lekce" navíc (jinak by výsledek byl „⚠ … nastavení. lekce").
    // `String(...)`: `aria-label` musí být string, `attendance.number` (mimo `isOrdinal`
    // větev) je ale pořád typovaný jako union — `isOrdinal` je samostatná proměnná, ne
    // type guard přímo na `attendance.number`, takže TS ho tady nezúží automaticky.
    const isOrdinal = typeof attendance.number === "number"
    const label =
        attendance.number === undefined
            ? undefined
            : String(isOrdinal ? `${attendance.number}. lekce` : attendance.number)
    return (
        <li data-qa="lecture_attendance">
            <div className={styles.attendanceMain}>
                {showClient && (
                    <ClientName client={attendance.client} link className={styles.clientName} />
                )}
                <span className={styles.attendanceBadges}>
                    {/* Upozorneni na platbu jde PRED platbu, prestoze je podminene: skupina se
                        zarovnava doprava (`margin-left: auto`), takze podmineny prvek na konci
                        by pri kazdem vyskytu odsunul platbu i cislo doleva a rady by mezi sebou
                        odskakovaly. Vpredu roste do volneho mista a kotvy vpravo zustanou stat. */}
                    <AttendanceRemindPay attendance={attendance} />
                    <AttendancePaidButton
                        paid={attendance.paid}
                        attendanceId={attendance.id}
                        source={source}
                    />
                    {/* Poradove cislo ucasti klienta — tlumene radove cislo tabulkovymi cislicemi,
                        stejne jako cislo lekce (LectureNumber). Obarvena pilulka by u kazdeho
                        jmena v seznamu ucastniku pridala dalsi objekt navic. */}
                    {attendance.number && (
                        <Tooltip label={label}>
                            {/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- trigger
                                tooltipu musí být fokusovatelný, jinak je obsah jen pro myš
                                (WAI-ARIA tooltip pattern); bloková forma, protože -next-line
                                nedosáhne na atribut o 2 řádky níž */}
                            <span
                                className={styles.attendanceNumber}
                                tabIndex={0}
                                aria-label={label}>
                                {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
                                {isOrdinal ? `${attendance.number}.` : attendance.number}
                            </span>
                        </Tooltip>
                    )}
                </span>
            </div>
            <div className={styles.attendanceState}>
                <AttendanceSelectAttendanceState
                    value={attendance.attendancestate}
                    attendanceId={attendance.id}
                    source={source}
                />
            </div>
            {/* vlastní řádek přes celou šířku — důvod viz `attendanceNote` v Attendances.css.ts */}
            <LectureNote attendance={attendance} className={styles.attendanceNote} />
        </li>
    )
}

type AttendancesProps = {
    /** Lekce, jejíž účasti se zobrazí. */
    lecture: LectureType
    /** Zobraz jméno klienta (true). */
    showClient?: boolean
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující účasti všech klientů na dané lekci. */
const Attendances: React.FC<AttendancesProps> = ({ lecture, showClient = false, source }) => {
    return (
        <ul className={styles.attendances}>
            {lecture.attendances.map((attendance) => (
                <Attendance
                    attendance={attendance}
                    key={attendance.id}
                    showClient={showClient}
                    source={source}
                />
            ))}
        </ul>
    )
}

export default Attendances
