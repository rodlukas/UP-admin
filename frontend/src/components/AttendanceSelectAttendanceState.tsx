import { Select } from "@mantine/core"
import * as React from "react"

import { type AnalyticsSource, trackEvent } from "../analytics"
import { usePatchAttendance } from "../api/hooks"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { type AttendanceStateType, type AttendanceType } from "../types/models"

import * as styles from "./AttendanceSelectAttendanceState.css"

type Props = {
    /** ID účasti. */
    attendanceId: AttendanceType["id"]
    /** ID stavu účasti. */
    value: AttendanceStateType["id"]
    /** Identifikace místa, odkud byla akce provedena (pro analytiku). */
    source: AnalyticsSource
}

/** Komponenta zobrazující box pro výběr stavu účasti klienta na dané lekci. */
const AttendanceSelectAttendanceState: React.FC<Props> = (props) => {
    const { attendancestates, isLoading, hasData } = useAttendanceStatesContext()
    const patchAttendance = usePatchAttendance({
        successMessage: "Stav účasti klienta uložen",
    })

    const onChange = React.useCallback(
        (val: string | null): void => {
            if (!val) {
                return
            }
            patchAttendance.mutate(
                { id: props.attendanceId, attendancestate: Number(val) },
                {
                    onSuccess: () =>
                        trackEvent("attendance_state_changed", { source: props.source }),
                },
            )
        },
        [props.attendanceId, props.source, patchAttendance],
    )

    const data = React.useMemo(
        () =>
            attendancestates
                .filter((s) => s.visible || s.id === props.value)
                .map((s) => ({ value: s.id.toString(), label: s.name })),
        [attendancestates, props.value],
    )

    // Stavy se nenačetly (chyba, offline) — název toho aktuálního znát nejde, známe jen jeho
    // ID, takže Select místo tichého prázdna/chybné hodnoty raději zablokujeme a dáme najevo,
    // že se stav nepodařilo načíst. `!isLoading` je tu nutné: dokud první dotaz běží, `hasData`
    // je taky `false` — bez tý podmínky by blok naskočil na každém běžném načtení.
    if (!isLoading && !hasData) {
        return (
            <Select
                data={[]}
                value={null}
                placeholder="Nepodařilo se načíst"
                disabled
                size="md"
                variant="unstyled"
                classNames={{ input: styles.ruledInput }}
                aria-label="Stav účasti se nepodařilo načíst"
                data-qa="lecture_select_attendance_attendancestate"
            />
        )
    }

    return (
        <Select
            data={data}
            value={props.value.toString()}
            onChange={onChange}
            // md (1rem), ne sm (0.875rem) — v aplikaci není text menší než 1rem;
            // vyšší řádek vyrovnává `variant="unstyled"`, který ubírá rámeček a pozadí
            size="md"
            variant="unstyled"
            classNames={{ input: styles.ruledInput }}
            allowDeselect={false}
            // select nemá viditelný label — přístupný název pro čtečky obrazovky
            aria-label="Výběr stavu účasti klienta na lekci"
            data-qa="lecture_select_attendance_attendancestate"
        />
    )
}

export default AttendanceSelectAttendanceState
