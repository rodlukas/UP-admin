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
import { ClientType, CourseType, LectureType, LectureTypeWithDate } from "../types/models"

import { AXIS_LABEL, AXIS_TICK, GRID_STROKE, LEGEND_FONT, MONTH_LABELS } from "./charts"
import * as styles from "./ClientAnalysis.css"

type Props = {
    clientId: ClientType["id"]
    lectures: LectureType[]
}

type CourseInfo = {
    id: CourseType["id"]
    name: CourseType["name"]
    color: CourseType["color"]
}

const CHART_MARGIN = { top: 8, right: 8, left: 4, bottom: 8 } as const

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
            <div className="fw-semibold mb-1">{label}</div>
            {payload.map((entry) => (
                <div key={entry.name} style={{ color: entry.color }}>
                    {entry.name}: <strong>{entry.value}</strong>
                </div>
            ))}
            {payload.length > 1 && (
                <div className="mt-1 border-top pt-1">
                    Celkem: <strong>{total}</strong>
                </div>
            )}
        </div>
    )
}

/** Analýza docházky klienta — souhrn a graf proběhlých lekcí po měsících s rozlišením kurzů. */
const ClientAnalysis: React.FC<Props> = ({ clientId, lectures }) => {
    const { attendancestates } = useAttendanceStatesContext()

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

        // Sesbírej unikátní kurzy v pořadí výskytu
        const courseMap = new Map<number, CourseInfo>()
        for (const lecture of happened) {
            if (!courseMap.has(lecture.course.id)) {
                courseMap.set(lecture.course.id, {
                    id: lecture.course.id,
                    name: lecture.course.name,
                    color: lecture.course.color,
                })
            }
        }
        const courses = Array.from(courseMap.values())

        // Počty lekcí per kurz per měsíc
        const monthMap = new Map<string, Record<string, number>>()
        for (const lecture of happened) {
            const date = new Date(lecture.start)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
            const monthData = monthMap.get(key) ?? {}
            const courseKey = String(lecture.course.id)
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

    if (analysis.scheduled.length === 0) {
        return null
    }

    const multiCourse = analysis.courses.length > 1

    return (
        <div className={styles.chartPanel}>
            <div className="d-flex flex-wrap justify-content-around mb-3 gap-2 pt-1">
                <div className="text-center">
                    <div className="fw-bold h5 mb-0">{analysis.happened.length}</div>
                    <div className="text-muted small">Proběhlé</div>
                </div>
                <div className="text-center">
                    <div className="fw-bold h5 mb-0">{analysis.excused.length}</div>
                    <div className="text-muted small">Omluvené</div>
                </div>
                <div className="text-center">
                    <div className="fw-bold h5 mb-0">
                        {analysis.notHappened.length - analysis.excused.length}
                    </div>
                    <div className="text-muted small">Zrušené</div>
                </div>
                <div className="text-center">
                    <div className="fw-bold h5 mb-0">
                        {analysis.paid.length}/{analysis.happened.length}
                    </div>
                    <div className="text-muted small">Zaplaceno</div>
                </div>
            </div>
            {analysis.monthlyData.length >= 1 && (
                <div className="border-top mt-2 pt-3">
                    <ResponsiveContainer width="100%" height={multiCourse ? 190 : 160}>
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
                                width={44}
                                label={{
                                    value: "Počet lekcí",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 4,
                                    ...AXIS_LABEL,
                                }}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            {multiCourse && <Legend wrapperStyle={LEGEND_FONT} />}
                            {analysis.courses.map((course, index) => (
                                <Bar
                                    key={course.id}
                                    dataKey={String(course.id)}
                                    fill={course.color}
                                    name={course.name}
                                    stackId="a"
                                    {...(index === 0 && !multiCourse
                                        ? {
                                              radius: [3, 3, 0, 0] as [
                                                  number,
                                                  number,
                                                  number,
                                                  number,
                                              ],
                                          }
                                        : {})}
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
