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
    const label = `${attendance.number}. lekce`
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
                    {/* Poradove cislo ucasti klienta — tlumeny ordinal tabulkovymi cislicemi,
                        stejne jako cislo lekce (LectureNumber). Obarvena pilulka by u kazdeho
                        jmena v seznamu ucastniku pridala dalsi objekt navic. */}
                    {attendance.number && (
                        <Tooltip
                            label={label}
                            // focus + tabIndex: obsah tooltipu musí být dosažitelný i z klávesnice
                            // (WCAG 1.4.13)
                            events={{ hover: true, focus: true, touch: true }}>
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- trigger
                                tooltipu musí být fokusovatelný, jinak je obsah jen pro myš
                                (WAI-ARIA tooltip pattern) */}
                            <span className={styles.attendanceNumber} tabIndex={0} aria-label={label}>
                                {attendance.number}.
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
            {/* Poznámka má vlastní řádek pod jménem, ikonami i stavem: vedle nich by o šířku
                soutěžila a delší text by rozhodil celý slot — jméno by zůstalo nahoře, ikony
                by spadly pod něj a řádky sousedních klientů by přestaly lícovat. Přes celou
                šířku se vejde v klidu a nic kolem se nehne. */}
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
