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
const Attendance: React.FC<AttendanceProps> = ({ attendance, showClient = false, source }) => (
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
                    stejne jako cislo lekce (LectureNumber). Drive obtazena pilulka, ktera
                    u kazdeho jmena delala dalsi objekt navic. */}
                {attendance.number && (
                    <span className={styles.attendanceNumber} title={`${attendance.number}. lekce`}>
                        {attendance.number}.
                    </span>
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
        {/* Poznámka má vlastní řádek pod jménem, ikonami i stavem. Vedle nich soutěžila
            o šířku a delší text rozhodil celý slot: jméno zůstalo nahoře, ikony spadly
            pod něj a řádky sousedních klientů přestaly lícovat. Přes celou šířku se
            vejde v klidu a nic kolem se nehne. */}
        <LectureNote attendance={attendance} className={styles.attendanceNote} />
    </li>
)

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
