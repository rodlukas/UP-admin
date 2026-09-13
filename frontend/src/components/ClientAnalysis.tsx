import { faChartBar } from "@rodlukas/fontawesome-pro-solid-svg-icons"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import * as React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import { type ClientType, type CourseType, type LectureType, type LectureTypeWithDate } from "../types/models"

import {
    AXIS_LABEL,
    AXIS_TICK,
    type ChartMargin,
    GRID_STROKE,
    LEGEND_FONT,
    MONTH_LABELS,
} from "./charts"
import * as styles from "./ClientAnalysis.css"
import EmptyState from "./EmptyState"
import NoInfo from "./NoInfo"

type Props = {
    clientId: ClientType["id"]
    lectures: LectureType[]
}

type CourseInfo = {
    key: string
    name: string
    color: CourseType["color"]
}

const CHART_MARGIN: ChartMargin = { top: 8, right: 8, left: 4, bottom: 8 }

type TooltipEntry = {
    color: string
    name: string
    value: number
}

type TooltipContentProps = {
    active?: boolean
    label?: string
    payload?: TooltipEntry[]
}

const ChartTooltip: React.FC<TooltipContentProps> = ({ active, label, payload }) => {
    if (!active || !payload?.length) {
        return null
    }
    const total = payload.reduce((sum, entry) => sum + entry.value, 0)
    return (
        <div className={styles.tooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            {payload.map((entry) => (
                <div
                    key={entry.name}
                    className={styles.tooltipSeriesEntry}
                    style={assignInlineVars({ [styles.tooltipSeriesColor]: entry.color })}>
                    {entry.name}: <strong>{entry.value}</strong>
                </div>
            ))}
            {payload.length > 1 && (
                <div className={styles.tooltipTotal}>
                    Celkem: <strong>{total}</strong>
                </div>
            )}
        </div>
    )
}

/** Analýza docházky klienta — souhrn a graf proběhlých lekcí po měsících s rozlišením kurzů. */
const ClientAnalysis: React.FC<Props> = ({ clientId, lectures }) => {
    // `hasData`, ne `isSuccess`: při SELHANÉM REFETCHI si TanStack Query data z cache nechá,
    // takže `excused` se pořád spočítá správně — schovat čísla za `NoInfo` by zahodilo platné
    // údaje. Opačně (`|| length > 0`) by zas skutečně prázdná konfigurace stavů vypadala jako
    // chyba a správné nuly by se změnily na pomlčky.
    //
    // `!isLoading` tu naopak (na rozdíl od AttendanceSelectAttendanceState.tsx) nepotřebujeme:
    // Card.tsx drží celou kartu pod kostrou, dokud `attendanceStatesContext.isLoading` neskončí,
    // takže tahle komponenta se během načítání vůbec nevykreslí — a kdyby ano, pomlčka je při
    // nedostupných datech správnější než spočítaná nula, která by si vymýšlela.
    const { attendancestates, hasData: attendanceStatesLoaded } = useAttendanceStatesContext()

    const analysis = React.useMemo(() => {
        const scheduled = lectures.filter((l): l is LectureTypeWithDate => l.start !== null)
        const happened = scheduled.filter((l) => !l.canceled)
        const notHappened = scheduled.filter((l) => l.canceled)

        const excused = notHappened.filter((l) => {
            const att = l.attendances.find((a) => a.client.id === clientId)
            return att
                ? (attendancestates.find((s) => s.id === att.attendancestate)?.excused ?? false)
                : false
        })

        const paid = happened.filter((l) => {
            const att = l.attendances.find((a) => a.client.id === clientId)
            return att?.paid === true
        })

        // unikatni kurzy (individualni a skupinove zvlast) v poradi vyskytu
        const courseMap = new Map<string, CourseInfo>()
        for (const lecture of happened) {
            const isGroup = lecture.group !== null
            const courseKey = `${lecture.course.id}_${isGroup ? "g" : "i"}`
            if (!courseMap.has(courseKey)) {
                courseMap.set(courseKey, {
                    key: courseKey,
                    name: isGroup ? `${lecture.course.name} (skup.)` : lecture.course.name,
                    color: lecture.course.color,
                })
            }
        }
        const courses = Array.from(courseMap.values())

        // pocty lekci per kurz per mesic
        const monthMap = new Map<string, Record<string, number>>()
        for (const lecture of happened) {
            const isGroup = lecture.group !== null
            const date = new Date(lecture.start)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            const monthData = monthMap.get(key) ?? {}
            const courseKey = `${lecture.course.id}_${isGroup ? "g" : "i"}`
            monthData[courseKey] = (monthData[courseKey] ?? 0) + 1
            monthMap.set(key, monthData)
        }
        const monthlyData = Array.from(monthMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, courseCounts]) => {
                const parts = key.split("-")
                const year = parts[0] ?? ""
                const monthStr = parts[1] ?? "1"
                return {
                    label: `${MONTH_LABELS[Number(monthStr) - 1]} ${year.slice(2)}`,
                    ...courseCounts,
                }
            })

        return { scheduled, happened, notHappened, excused, paid, courses, monthlyData }
    }, [lectures, clientId, attendancestates])

    // Bez jediné lekce s termínem není z čeho počítat souhrn ani graf. `null` by tu nechalo
    // celou záložku prázdnou, což vypadá stejně jako rozbité načtení (viz Card.tsx).
    if (analysis.scheduled.length === 0) {
        return (
            <EmptyState
                icon={faChartBar}
                title="Není co analyzovat"
                description={
                    lectures.length === 0
                        ? "Klient zatím nemá žádnou lekci."
                        : "Žádná z lekcí klienta nemá termín — analýza počítá jen s naplánovanými."
                }
            />
        )
    }

    return (
        <div className={styles.chartPanel}>
            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryNumber}>{analysis.happened.length}</div>
                    <div className={styles.summaryLabel}>Proběhlé</div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryNumber}>
                        {/* bez načtených stavů účasti nejde poznat, které zrušené lekce byly
                            omluvené — ukázat 0 by vypadalo jako spočtená hodnota, ne chybějící */}
                        {attendanceStatesLoaded ? analysis.excused.length : <NoInfo />}
                    </div>
                    <div className={styles.summaryLabel}>Omluvené</div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryNumber}>
                        {attendanceStatesLoaded ? (
                            analysis.notHappened.length - analysis.excused.length
                        ) : (
                            <NoInfo />
                        )}
                    </div>
                    <div className={styles.summaryLabel}>Zrušené</div>
                </div>
                <div className={styles.summaryItem}>
                    <div className={styles.summaryNumber}>
                        {analysis.paid.length}/{analysis.happened.length}
                    </div>
                    <div className={styles.summaryLabel}>Zaplaceno</div>
                </div>
            </div>
            {analysis.monthlyData.length > 0 && (
                <div className={styles.chartDivider}>
                    <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={analysis.monthlyData} margin={CHART_MARGIN}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={GRID_STROKE}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="label"
                                tick={AXIS_TICK}
                                label={{
                                    value: "Měsíc",
                                    position: "insideBottomRight",
                                    offset: 0,
                                    ...AXIS_LABEL,
                                }}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={AXIS_TICK}
                                width={52}
                                label={{
                                    value: "Počet lekcí",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 4,
                                    ...AXIS_LABEL,
                                }}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={LEGEND_FONT} />
                            {analysis.courses.map((course) => (
                                <Bar
                                    key={course.key}
                                    dataKey={course.key}
                                    fill={course.color}
                                    name={course.name}
                                    stackId="a"
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

export default ClientAnalysis
