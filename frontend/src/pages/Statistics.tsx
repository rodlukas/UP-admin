import { Container, SegmentedControl, SimpleGrid, Table, Title } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

import { useStatistics } from "../api/hooks"
import APP_URLS from "../APP_URLS"
import * as segmented from "../components/buttons/segmented.css"
import {
    AXIS_LABEL,
    AXIS_TICK,
    ChartMargin,
    GRID_STROKE,
    LEGEND_FONT,
    MONTH_LABELS,
} from "../components/charts"
import ClientName from "../components/ClientName"
import Heading from "../components/Heading"
import {
    ChartSkeleton,
    RankingTableSkeleton,
    SkeletonShell,
    StatCardsSkeleton,
} from "../components/Skeletons"
import { tableFlat } from "../global/surfaces.css"
import { vars } from "../theme/tokens"
import { StatisticsType } from "../types/models"

import * as styles from "./Statistics.css"

/** Sjednocené okraje a mřížka napříč Recharts. */
const CHART_MARGIN: ChartMargin = { top: 12, right: 16, left: 4, bottom: 34 }
/** Okraje pro grafy s legendou dole – extra bottom pro legendu + XAxis popisek. */
const CHART_MARGIN_BOTTOM_LEGEND: ChartMargin = { top: 12, right: 16, left: 4, bottom: 66 }
const CHART_MARGIN_BAR_VERTICAL: ChartMargin = { top: 12, right: 16, left: 8, bottom: 66 }

function formatStackedBarLegend(value: string): string {
    if (value === "individual") {
        return "Individuální"
    }
    if (value === "group") {
        return "Skupinové"
    }
    if (value === "canceled_count") {
        return "Zrušené"
    }
    return value
}

type ChartMetric = "lectures" | "hours"

/**
 * Hodnota „bez filtru roku" v přepínači rozsahu. `SegmentedControl` pracuje s řetězci,
 * takže `null` (= celá historie) potřebuje vlastní sentinel — roky jsou čísla, tenhle
 * klíč se s nimi tedy nemůže potkat.
 */
const YEAR_ALL = "all"

const CHART_METRIC_LABEL: Record<ChartMetric, string> = {
    lectures: "Počet lekcí",
    hours: "Odučené hodiny",
}

/** Formátuje hodiny (desetinné číslo) na řetězec s jedním desetinným místem (česky). */
const formatHours = (hours: number): string =>
    `${hours.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u202fh`

/** Formátuje minuty jako hodiny – převede a zavolá formatHours. */
const formatMinutesAsHours = (minutes: number): string => formatHours(minutes / 60)

type EntityStatCardRow = {
    label: React.ReactNode
    value: React.ReactNode
    /** Barva puntíku před popiskem – jen tam, kde odpovídá barvě jinde v appce
     *  (viz komentář u `EntityStatCard`). Bez ní řádek zůstává bez puntíku. */
    dotColor?: string
}

type EntityStatCardProps = {
    title: string
    total?: number
    rows: EntityStatCardRow[]
    note?: string
}

type ChartSectionProps = {
    title: string
    caption?: string
    headerAction?: React.ReactNode
    children: React.ReactNode
}

type MetricToggleProps = {
    value: ChartMetric
    onChange: (value: ChartMetric) => void
}

/** Nadpis a volitelný popis u grafu. */
const ChartSection: React.FC<ChartSectionProps> = ({ title, caption, headerAction, children }) => (
    <section className={styles.chartSection}>
        <div className={styles.chartTitleRow}>
            <Title order={2} className={styles.chartTitle}>
                {title}
            </Title>
            {headerAction}
        </div>
        {caption ? <p className={styles.chartCaption}>{caption}</p> : null}
        <div className={styles.chartPanel}>{children}</div>
    </section>
)

/** Přepínač metriky pro grafy (počet lekcí / odučené hodiny). */
const MetricToggle: React.FC<MetricToggleProps> = ({ value, onChange }) => (
    // stejny `SegmentedControl` jako prepinac Aktivni/Neaktivni — v aplikaci je jeden
    // segmentovy ovladac a jeden jeho vzhled (segmented.css.ts)
    <SegmentedControl
        value={value}
        onChange={(next) => onChange(next)}
        data={[
            { value: "lectures", label: CHART_METRIC_LABEL.lectures },
            { value: "hours", label: CHART_METRIC_LABEL.hours },
        ]}
        classNames={{
            root: `${segmented.segmentedRoot} ${styles.metricToggle}`,
            indicator: segmented.segmentedIndicator,
            label: segmented.segmentedLabel,
        }}
    />
)

/** Karta se statistikami entity nebo skupiny metrik. */
const EntityStatCard: React.FC<EntityStatCardProps> = ({ title, total, rows, note }) => (
    <div className={styles.statCard}>
        <div className={styles.statCardTitle}>{title}</div>
        {note ? <div className={styles.statNote}>{note}</div> : null}
        {total !== undefined && (
            <>
                <div className={styles.metricValue}>{total}</div>
                <div className={styles.totalLabel}>celkem</div>
            </>
        )}
        {/* Puntík je jen tam, kde stejnou barvu nese i něco jiného na stránce: stavy
            klientů/skupin drží barvy `iconSuccess`/`iconWarning` odjinud z appky, řádky
            lekcí barvy legendy grafů níže (`--up-chart-series-*`). Kde takový protějšek
            není („odučeno"), zůstává řádek bez puntíku, ne s barvou jen do počtu. */}
        {rows.map((row, i) => (
            <div
                key={typeof row.label === "string" ? `${title}-${row.label}` : String(i)}
                className={i < rows.length - 1 ? styles.breakdownRowSpaced : styles.breakdownRow}>
                <span className={styles.breakdownLabel}>
                    {row.dotColor ? (
                        <span
                            className={styles.breakdownDot}
                            style={assignInlineVars({
                                [styles.breakdownDotColor]: row.dotColor,
                            })}
                        />
                    ) : null}
                    {row.label}
                </span>
                <span className={styles.breakdownValue}>{row.value}</span>
            </div>
        ))}
    </div>
)

type YearTooltipProps = {
    active?: boolean
    payload?: {
        payload: NonNullable<
            NonNullable<ReturnType<typeof useStatistics>["data"]>["lectures"]["by_year"]
        >[number]
    }[]
    label?: number
}

type LectureTooltipMetrics = {
    individual: number
    group: number
    total: number
    canceled_count: number
    canceled_rate: number
    excused_not_happened_count: number
    total_minutes: number
}

function renderLectureTooltip(label: React.ReactNode, d: LectureTooltipMetrics) {
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div>
                Individuální: <strong>{d.individual}</strong>
            </div>
            <div>
                Skupinové: <strong>{d.group}</strong>
            </div>
            <div>
                Proběhlé celkem: <strong>{d.total}</strong>
            </div>
            <div>
                Zrušené: <strong>{d.canceled_count}</strong> (
                {d.canceled_rate.toLocaleString("cs-CZ", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                })}{" "}
                %)
            </div>
            <div>
                Z toho omluvené: <strong>{d.excused_not_happened_count}</strong>
            </div>
            <div>
                Odučeno:{" "}
                <strong>
                    {(d.total_minutes / 60).toLocaleString("cs-CZ", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                    })}
                    {"\u202f"}h
                </strong>
            </div>
        </div>
    )
}

/** Tooltip pro graf po letech se všemi dostupnými metrikami. */
const YearTooltip: React.FC<YearTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null
    }
    return renderLectureTooltip(label, payload[0].payload)
}

type CourseTooltipProps = {
    active?: boolean
    payload?: {
        payload: NonNullable<
            ReturnType<typeof useStatistics>["data"]
        >["lectures"]["by_course"][number]
    }[]
    label?: string
}

/** Tooltip pro graf po kurzech se všemi dostupnými metrikami. */
const CourseTooltip: React.FC<CourseTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null
    }
    const [firstPayload] = payload
    return firstPayload ? renderLectureTooltip(label, firstPayload.payload) : null
}

type CourseYAxisTickProps = {
    x?: number
    y?: number
    payload?: { value: string }
    courses: NonNullable<ReturnType<typeof useStatistics>["data"]>["lectures"]["by_course"]
}

/** Tick osy Y pro graf po kurzech – zobrazuje barevný kroužek kurzu před názvem. */
const CourseYAxisTick: React.FC<CourseYAxisTickProps> = ({ x = 0, y = 0, payload, courses }) => {
    const color =
        courses.find((c) => c.course_name === payload?.value)?.course_color ??
        "var(--mantine-color-gray-5)"
    return (
        <g transform={`translate(${x},${y})`}>
            <circle cx={-8} cy={0} r={5} fill={color} />
            <text
                x={-16}
                y={0}
                dy={4}
                textAnchor="end"
                fill="var(--up-chart-tick-fill)"
                fontSize={AXIS_TICK.fontSize}>
                {payload?.value}
            </text>
        </g>
    )
}

type YearCourseLineTooltipProps = {
    active?: boolean
    payload?: { name?: string; value?: number; color?: string; dataKey?: string | number }[]
    label?: string | number
}

/** Tooltip pro čarový graf vývoje kurzů po letech – seřazeno podle počtu. */
const YearCourseLineTooltip: React.FC<YearCourseLineTooltipProps> = ({
    active,
    payload,
    label,
}) => {
    if (!active || !payload?.length) {
        return null
    }
    const rows = [...payload]
        .filter((p) => (p.value ?? 0) > 0)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    if (rows.length === 0) {
        return null
    }
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>Rok {label}</div>
            {rows.map((p) => (
                <div key={String(p.dataKey)} className={styles.tooltipRow}>
                    <span
                        className={styles.tooltipSeriesEntry}
                        style={assignInlineVars({
                            [styles.tooltipSeriesColor]: p.color ?? "inherit",
                        })}>
                        {p.name}
                    </span>
                    <strong>{p.value}</strong>
                </div>
            ))}
        </div>
    )
}

type HoursYearTooltipProps = {
    active?: boolean
    payload?: { payload: { year: number; hours: number } }[]
    label?: number
}

/** Tooltip pro plošný graf odučených hodin podle roku. */
const HoursYearTooltip: React.FC<HoursYearTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null
    }
    const [firstPayload] = payload
    if (!firstPayload) {
        return null
    }
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>Rok {label}</div>
            <div>
                Odučeno: <strong>{formatHours(firstPayload.payload.hours)}</strong>
            </div>
        </div>
    )
}

type MonthTooltipProps = {
    active?: boolean
    payload?: { payload: { label: string; value: number } }[]
    label?: string
    chartMetric: ChartMetric
}

/** Tooltip pro sloupcový graf lekcí/hodin podle měsíce – respektuje zvolenou metriku. */
const MonthTooltip: React.FC<MonthTooltipProps> = ({ active, payload, label, chartMetric }) => {
    if (!active || !payload?.length) {
        return null
    }
    const [firstPayload] = payload
    if (!firstPayload) {
        return null
    }
    const { value } = firstPayload.payload
    return (
        <div className={styles.chartTooltip}>
            <div className={styles.tooltipLabel}>{label}</div>
            <div>
                {CHART_METRIC_LABEL[chartMetric]}:{" "}
                <strong>{chartMetric === "hours" ? formatHours(value) : value}</strong>
            </div>
        </div>
    )
}

const courseLineDataKey = (courseId: number): string => `course_${courseId}`

type YearCourseLinesChartProps = {
    byYearCourse: NonNullable<StatisticsType["lectures"]["by_year_course"]>
    compact: boolean
}

/** Čarový graf vývoje počtu lekcí podle kurzu (osa X = rok); dataKey podle ID kurzu kvůli kolizím názvů. */
const YearCourseLinesChart: React.FC<YearCourseLinesChartProps> = ({ byYearCourse, compact }) => {
    const courses = [
        ...new Map(
            byYearCourse.map((r) => [
                r.course_id,
                { id: r.course_id, name: r.course_name, color: r.course_color },
            ]),
        ).values(),
    ]
    const years = [...new Set(byYearCourse.map((r) => r.year))].sort((a, b) => a - b)
    const totalsByYearCourse = new Map<string, number>()
    for (const r of byYearCourse) {
        totalsByYearCourse.set(`${r.year}:${r.course_id}`, r.total)
    }
    const chartData = years.map((year) => {
        const entry: Record<string, number | string> = { year }
        for (const c of courses) {
            entry[courseLineDataKey(c.id)] = totalsByYearCourse.get(`${year}:${c.id}`) ?? 0
        }
        return entry
    })
    const legendRows = Math.max(1, Math.ceil(courses.length / (compact ? 3 : 5)))
    const legendExtraHeight = legendRows * 20
    const chartHeight = (() => {
        if (compact) {
            return (courses.length > 6 ? 300 : 250) + legendExtraHeight
        }
        return (courses.length > 6 ? 340 : 280) + legendExtraHeight
    })()
    return (
        <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData} margin={CHART_MARGIN_BOTTOM_LEGEND}>
                <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="year"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    ticks={years}
                    tick={AXIS_TICK}
                    tickFormatter={String}
                    allowDecimals={false}
                    label={
                        compact
                            ? undefined
                            : {
                                  value: "Rok",
                                  position: "insideBottomRight",
                                  offset: 0,
                                  ...AXIS_LABEL,
                              }
                    }
                />
                <YAxis
                    allowDecimals={false}
                    width={52}
                    tick={AXIS_TICK}
                    label={
                        compact
                            ? undefined
                            : {
                                  value: "Počet lekcí",
                                  angle: -90,
                                  position: "insideLeft",
                                  offset: 4,
                                  ...AXIS_LABEL,
                              }
                    }
                />
                <Tooltip content={<YearCourseLineTooltip />} />
                <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={LEGEND_FONT}
                />
                {courses.map((c) => (
                    <Line
                        key={c.id}
                        type="monotone"
                        dataKey={courseLineDataKey(c.id)}
                        name={c.name}
                        stroke={c.color}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1, fill: c.color }}
                        activeDot={{ r: 5 }}
                        connectNulls
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

type HoursByYearChartProps = {
    byYear: NonNullable<StatisticsType["lectures"]["by_year"]>
    compact: boolean
}

/** Plošný graf odučených hodin podle roku (z agregace délek proběhlých lekcí). */
const HoursByYearChart: React.FC<HoursByYearChartProps> = ({ byYear, compact }) => {
    const data = [...byYear]
        .sort((a, b) => a.year - b.year)
        .map((row) => ({
            year: row.year,
            hours: row.total_minutes / 60,
        }))
    const years = data.map((d) => d.year)
    return (
        <ResponsiveContainer width="100%" height={compact ? 250 : 280}>
            <AreaChart data={data} margin={CHART_MARGIN}>
                <defs>
                    <linearGradient id="statsHoursAreaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--mantine-color-indigo-6)"
                            stopOpacity={0.3}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--mantine-color-indigo-6)"
                            stopOpacity={0.05}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="year"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    ticks={years}
                    tick={AXIS_TICK}
                    tickFormatter={String}
                    allowDecimals={false}
                    label={
                        compact
                            ? undefined
                            : {
                                  value: "Rok",
                                  position: "insideBottomRight",
                                  offset: 0,
                                  ...AXIS_LABEL,
                              }
                    }
                />
                <YAxis
                    width={52}
                    tick={AXIS_TICK}
                    tickFormatter={(v) =>
                        typeof v === "number"
                            ? v.toLocaleString("cs-CZ", { maximumFractionDigits: 0 })
                            : String(v)
                    }
                    label={
                        compact
                            ? undefined
                            : {
                                  value: "Hodiny",
                                  angle: -90,
                                  position: "insideLeft",
                                  offset: 4,
                                  ...AXIS_LABEL,
                              }
                    }
                />
                <Tooltip content={<HoursYearTooltip />} />
                <Area
                    type="monotone"
                    dataKey="hours"
                    name="Odučeno"
                    stroke="var(--mantine-color-indigo-6)"
                    strokeWidth={2}
                    fill="url(#statsHoursAreaFill)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

type TopRankingSectionProps<T extends { id: number; lecture_count: number }> = {
    title: string
    nameHeader: string
    items: T[]
    emptyMessage: string
    renderName: (item: T) => React.ReactNode
}

/** Tabulka žebříčku aktivity – sdílená pro klienty i skupiny. */
function TopRankingSection<T extends { id: number; lecture_count: number }>({
    title,
    nameHeader,
    items,
    emptyMessage,
    renderName,
}: Readonly<TopRankingSectionProps<T>>) {
    return (
        <ChartSection title={title}>
            {items.length > 0 ? (
                <Table.ScrollContainer minWidth={360}>
                    <Table className={tableFlat} mb={0}>
                        <Table.Thead>
                            <Table.Tr className={styles.rankingDivider}>
                                <Table.Th c="dimmed" fw={400}>
                                    #
                                </Table.Th>
                                <Table.Th c="dimmed" fw={400}>
                                    {nameHeader}
                                </Table.Th>
                                <Table.Th ta="right" c="dimmed" fw={400}>
                                    Lekce
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {items.map((row, index) => (
                                <Table.Tr key={row.id}>
                                    <Table.Td c="dimmed">{index + 1}</Table.Td>
                                    <Table.Td>{renderName(row)}</Table.Td>
                                    <Table.Td ta="right" fw={600}>
                                        {row.lecture_count}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            ) : (
                <p className={styles.chartEmpty}>{emptyMessage}</p>
            )}
        </ChartSection>
    )
}

type LecturesMonthSectionProps = {
    byMonth: StatisticsType["lectures"]["by_month"]
    chartMetric: ChartMetric
    onMetricChange: (value: ChartMetric) => void
    compact: boolean
    year: number | null
}

/** Sloupcový graf lekcí nebo hodin podle měsíce s přepínačem metriky. */
const LecturesMonthSection: React.FC<LecturesMonthSectionProps> = ({
    byMonth,
    chartMetric,
    onMetricChange,
    compact,
    year,
}) => {
    const caption =
        year === null
            ? `${CHART_METRIC_LABEL[chartMetric]} podle kalendářního měsíce začátku napříč celou historií (každý sloupec = součet všech let v daném měsíci). Vhodné pro sezónnost (např. náběh po prázdninách).`
            : `${CHART_METRIC_LABEL[chartMetric]} v roce ${year} podle měsíce začátku lekce.`
    const data = byMonth.map((row) => ({
        label: MONTH_LABELS[row.month - 1],
        value: chartMetric === "lectures" ? row.total : Number((row.total_minutes / 60).toFixed(1)),
    }))
    const yAxisLabel = chartMetric === "hours" ? "Hodiny" : "Počet lekcí"
    return (
        <ChartSection
            title="Lekce podle měsíce"
            headerAction={<MetricToggle value={chartMetric} onChange={onMetricChange} />}
            caption={caption}>
            <ResponsiveContainer width="100%" height={compact ? 250 : 280}>
                <BarChart data={data} margin={CHART_MARGIN}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={AXIS_TICK}
                        label={
                            compact
                                ? undefined
                                : {
                                      value: "Měsíc",
                                      position: "insideBottomRight",
                                      offset: 0,
                                      ...AXIS_LABEL,
                                  }
                        }
                    />
                    <YAxis
                        allowDecimals={chartMetric === "hours"}
                        width={52}
                        tick={AXIS_TICK}
                        tickFormatter={(value) =>
                            chartMetric === "hours"
                                ? Number(value).toLocaleString("cs-CZ", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 1,
                                  })
                                : String(value)
                        }
                        label={
                            compact
                                ? undefined
                                : {
                                      value: yAxisLabel,
                                      angle: -90,
                                      position: "insideLeft",
                                      offset: 4,
                                      ...AXIS_LABEL,
                                  }
                        }
                    />
                    <Tooltip content={<MonthTooltip chartMetric={chartMetric} />} />
                    <Bar
                        dataKey="value"
                        fill="var(--mantine-color-indigo-6)"
                        name={chartMetric}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartSection>
    )
}

type LecturesCourseSectionProps = {
    byCourse: StatisticsType["lectures"]["by_course"]
    compact: boolean
}

/** Horizontální sloupcový graf proběhlých a zrušených lekcí podle kurzu. */
const LecturesCourseSection: React.FC<LecturesCourseSectionProps> = ({ byCourse, compact }) => {
    // 9,5 px na znak odpovida sirce prumerneho znaku popisku v `AXIS_TICK` (1rem);
    // +20 px je odsazeni kroužku kurzu pred nazvem (viz `CourseYAxisTick`)
    const yAxisWidth = Math.min(
        compact ? 150 : 290,
        Math.max(80, Math.max(...byCourse.map((c) => c.course_name.length)) * 9.5 + 20),
    )
    return (
        <ChartSection title="Proběhlé a zrušené lekce podle kurzu">
            <ResponsiveContainer
                width="100%"
                height={byCourse.length * (compact ? 38 : 45) + (compact ? 56 : 70)}>
                <BarChart layout="vertical" data={byCourse} margin={CHART_MARGIN_BAR_VERTICAL}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={AXIS_TICK}
                        label={
                            compact
                                ? undefined
                                : {
                                      value: "Počet lekcí",
                                      position: "insideBottomRight",
                                      offset: 0,
                                      ...AXIS_LABEL,
                                  }
                        }
                    />
                    <YAxis
                        type="category"
                        dataKey="course_name"
                        width={yAxisWidth}
                        tick={<CourseYAxisTick courses={byCourse} />}
                    />
                    <Tooltip content={<CourseTooltip />} />
                    <Legend
                        formatter={formatStackedBarLegend}
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={LEGEND_FONT}
                    />
                    <Bar
                        dataKey="individual"
                        stackId="a"
                        fill="var(--up-chart-series-individual)"
                        name="individual"
                    />
                    <Bar
                        dataKey="group"
                        stackId="a"
                        fill="var(--up-chart-series-group)"
                        name="group"
                    />
                    <Bar
                        dataKey="canceled_count"
                        stackId="a"
                        fill="var(--up-chart-series-canceled)"
                        name="canceled_count"
                        radius={[0, 3, 3, 0]}
                        opacity={0.8}
                    />
                </BarChart>
            </ResponsiveContainer>
        </ChartSection>
    )
}

type LecturesYearSectionProps = {
    byYear: NonNullable<StatisticsType["lectures"]["by_year"]>
    chartMetric: ChartMetric
    onMetricChange: (value: ChartMetric) => void
    compact: boolean
}

/** Sekce s vývojem lekcí v čase podle roku – přepíná mezi počtem a odučenými hodinami. */
const LecturesYearSection: React.FC<LecturesYearSectionProps> = ({
    byYear,
    chartMetric,
    onMetricChange,
    compact,
}) => (
    <ChartSection
        title="Lekce v čase (podle roku)"
        headerAction={<MetricToggle value={chartMetric} onChange={onMetricChange} />}>
        {byYear.length > 0 ? (
            <>
                {chartMetric === "lectures" && (
                    <ResponsiveContainer width="100%" height={compact ? 250 : 280}>
                        <BarChart data={[...byYear].reverse()} margin={CHART_MARGIN_BOTTOM_LEGEND}>
                            <CartesianGrid
                                stroke={GRID_STROKE}
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="year"
                                tick={AXIS_TICK}
                                label={
                                    compact
                                        ? undefined
                                        : {
                                              value: "Rok",
                                              position: "insideBottomRight",
                                              offset: 0,
                                              ...AXIS_LABEL,
                                          }
                                }
                            />
                            <YAxis
                                allowDecimals={false}
                                width={52}
                                tick={AXIS_TICK}
                                label={
                                    compact
                                        ? undefined
                                        : {
                                              value: "Počet lekcí",
                                              angle: -90,
                                              position: "insideLeft",
                                              offset: 4,
                                              ...AXIS_LABEL,
                                          }
                                }
                            />
                            <Tooltip content={<YearTooltip />} />
                            <Legend formatter={formatStackedBarLegend} wrapperStyle={LEGEND_FONT} />
                            <Bar
                                dataKey="individual"
                                stackId="a"
                                fill="var(--up-chart-series-individual)"
                                name="individual"
                            />
                            <Bar
                                dataKey="group"
                                stackId="a"
                                fill="var(--up-chart-series-group)"
                                name="group"
                            />
                            <Bar
                                dataKey="canceled_count"
                                stackId="a"
                                fill="var(--up-chart-series-canceled)"
                                name="canceled_count"
                                radius={[3, 3, 0, 0]}
                                opacity={0.8}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                {chartMetric === "hours" && <HoursByYearChart byYear={byYear} compact={compact} />}
            </>
        ) : (
            <p className={styles.chartEmpty}>Žádné lekce v datech.</p>
        )}
    </ChartSection>
)

type LecturesYearCourseSectionProps = {
    byYearCourse: StatisticsType["lectures"]["by_year_course"]
    compact: boolean
}

/** Sekce vývoje počtu lekcí podle kurzu – skryje se pokud nejsou data. */
const LecturesYearCourseSection: React.FC<LecturesYearCourseSectionProps> = ({
    byYearCourse,
    compact,
}) => {
    if (byYearCourse === null || byYearCourse.length === 0) {
        return null
    }
    return (
        <ChartSection title="Vývoj počtu lekcí podle kurzu">
            <YearCourseLinesChart byYearCourse={byYearCourse} compact={compact} />
        </ChartSection>
    )
}

/** Stránka se statistikami aplikace. */
const Statistics: React.FC = () => {
    const [lecturesYear, setLecturesYear] = React.useState<number | null>(null)
    const [chartMetric, setChartMetric] = React.useState<ChartMetric>("lectures")
    const [compactCharts, setCompactCharts] = React.useState(false)

    const { data: statistics, isFetching: statisticsFetching } = useStatistics({
        year: lecturesYear,
    })

    React.useEffect(() => {
        const media = globalThis.matchMedia?.("(max-width: 767px)")
        if (!media) {
            return
        }
        const apply = () => setCompactCharts(media.matches)
        apply()
        media.addEventListener("change", apply)
        return () => media.removeEventListener("change", apply)
    }, [])

    // Rok – filtr. Nezávisí na `statistics` (funguje i s jen "Celkem" před prvním
    // dotažením) — proto se skládá jednou a vkládá beze změny do obou větví níže, ne
    // uvnitř samotné podmínky na `statistics`.
    const yearFilter = (
        <div className={styles.filterSection}>
            <div className={styles.filterHeading}>Rozsah lekcí</div>
            <p className={styles.filterHint}>
                Filtruje karty lekcí, žebříčky klientů a skupin a grafy podle měsíce a kurzu. Grafy
                vývoje podle roku se zobrazí pouze při výběru <strong>Celkem</strong>.
            </p>
            <SegmentedControl
                value={lecturesYear === null ? YEAR_ALL : String(lecturesYear)}
                onChange={(value) => setLecturesYear(value === YEAR_ALL ? null : Number(value))}
                data={[
                    { value: YEAR_ALL, label: "Celkem" },
                    ...(statistics?.lectures.available_years ?? []).map((y) => ({
                        value: String(y),
                        label: String(y),
                    })),
                ]}
                classNames={{
                    root: `${segmented.segmentedRoot} ${styles.yearFilterButtons}`,
                    indicator: segmented.segmentedIndicator,
                    label: segmented.segmentedLabel,
                }}
            />
        </div>
    )

    return (
        <Container>
            <Heading title={APP_URLS.statistiky.title} />

            <p className={styles.pageLead}>
                Souhrn klientů, skupin a lekcí. Počty u <strong>lekcí</strong> níže závisí na
                zvoleném roce (nebo na zobrazení za celou dobu); <strong>klienti</strong> a{" "}
                <strong>skupiny</strong> jsou vždy za celou historii aplikace.
            </p>

            {/*
             * Klienti/Skupiny a Lekce mají odděleně vypadající kostry (dva různé tvary),
             * ale obojí čeká na stejný `statistics` - jeden `SkeletonShell` níže drží celé
             * načítání coby jedinou `aria-live` oblast s jednou pojistkou na 25 s. Dva
             * samostatné `SkeletonShell` by tu při prvním vstupu na stránku byly zároveň
             * (a po 25 s by uživatel dostal dvě totožná hlášení "Načíst stránku znovu").
             */}
            {!statistics && (
                <SkeletonShell>
                    {/* Klienti mají 3 řádky rozpadu (Aktivní/Neaktivní/Bez lekce),
                        Skupiny jen 2 (Aktivní/Neaktivní) */}
                    <StatCardsSkeleton rows={[3, 2]} />
                    {yearFilter}
                    {/* Proběhlé má 3 řádky rozpadu (Individuální/Skupinové/Odučeno) a poznámku,
                        Neproběhlé jen 2 (Míra zrušení/Omluvené) a taky poznámku */}
                    <StatCardsSkeleton rows={[3, 2]} notes={[true, true]} />
                    {/* Žebříčky nejaktivnějších klientů a skupin (TopRankingSection) */}
                    <SimpleGrid cols={{ base: 1, md: 2 }} className={styles.gridMb}>
                        <RankingTableSkeleton />
                        <RankingTableSkeleton />
                    </SimpleGrid>
                    {/* LecturesMonthSection: má přepínač metriky i popisek */}
                    <ChartSkeleton withToggle withCaption />
                    {/* LecturesCourseSection: ani jedno */}
                    <ChartSkeleton />
                    {/* LecturesYearSection: jen přepínač metriky */}
                    <ChartSkeleton withToggle />
                    {/* LecturesYearCourseSection: ani jedno */}
                    <ChartSkeleton />
                </SkeletonShell>
            )}
            {statistics && (
                <SimpleGrid
                    // dve karty ve ctyrsloupcove mrizce nechavaly pulku radku prazdnou;
                    // dvousloupcova mrizka sedi i s dvojici karet lekci nize
                    cols={{ base: 1, xs: 2 }}
                    className={styles.sectionTightTopMb}>
                    <div>
                        <EntityStatCard
                            title="Klienti"
                            total={statistics.clients.total}
                            rows={[
                                {
                                    label: "Aktivní",
                                    value: statistics.clients.active,
                                    dotColor: vars.colors.success,
                                },
                                {
                                    label: "Neaktivní",
                                    value: statistics.clients.inactive,
                                    dotColor: vars.border.strong,
                                },
                                {
                                    label: "Bez lekce",
                                    value: statistics.clients.without_lectures,
                                    dotColor: vars.colors.warning,
                                },
                            ]}
                        />
                    </div>
                    <div>
                        <EntityStatCard
                            title="Skupiny"
                            total={statistics.groups.total}
                            rows={[
                                {
                                    label: "Aktivní",
                                    value: statistics.groups.active,
                                    dotColor: vars.colors.success,
                                },
                                {
                                    label: "Neaktivní",
                                    value: statistics.groups.inactive,
                                    dotColor: vars.border.strong,
                                },
                            ]}
                        />
                    </div>
                </SimpleGrid>
            )}

            {/* `!statistics` má svou vlastní kopii uvnitř sdíleného SkeletonShell výš —
                tahle se vykresluje, jen jakmile jsou data k dispozici, aby se filtr
                nezobrazil dvakrát naráz. */}
            {statistics && yearFilter}

            {/* Lekce statistiky – dimování při refetchi (prvotní načtení řeší sdílený
                SkeletonShell nahoře) */}
            {statistics && (
                <div
                    className={classNames({
                        [styles.fetchingOverlay]: statisticsFetching,
                    })}>
                    {/* Lekce – metriky */}
                    <SimpleGrid cols={{ base: 1, md: 2 }} className={styles.sectionTightTopMb}>
                        <div>
                            <EntityStatCard
                                title="Proběhlé lekce"
                                total={statistics.lectures.total}
                                note="Nezrušené lekce, kde se aspoň jeden klient skutečně zúčastnil."
                                rows={[
                                    {
                                        label: "Individuální",
                                        value: statistics.lectures.individual,
                                        dotColor: "var(--up-chart-series-individual)",
                                    },
                                    {
                                        label: "Skupinové",
                                        value: statistics.lectures.group,
                                        dotColor: "var(--up-chart-series-group)",
                                    },
                                    {
                                        label: "Odučeno",
                                        value: formatMinutesAsHours(
                                            statistics.lectures.total_minutes,
                                        ),
                                    },
                                ]}
                            />
                        </div>
                        <div>
                            <EntityStatCard
                                title="Neproběhlé lekce"
                                total={statistics.lectures.not_happened_count}
                                note="Zrušené lekce + skupinové kde nebyl přítomen nikdo. Omluvené jsou podmnožinou zrušených."
                                rows={[
                                    {
                                        label: "Míra zrušení",
                                        value: `${statistics.lectures.canceled_rate.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u202f%`,
                                        dotColor: "var(--up-chart-series-canceled)",
                                    },
                                    {
                                        label: "Z toho omluvené (individuální + skupinové)",
                                        value: statistics.lectures.excused_not_happened_count,
                                        dotColor: vars.colors.warning,
                                    },
                                ]}
                            />
                        </div>
                    </SimpleGrid>

                    <SimpleGrid cols={{ base: 1, md: 2 }} className={styles.gridMb}>
                        <div>
                            <TopRankingSection
                                title="Nejaktivnější klienti"
                                nameHeader="Klient"
                                items={statistics.lectures.top_clients}
                                emptyMessage="Žádná proběhlá lekce v tomto rozsahu."
                                renderName={(row) => (
                                    <ClientName
                                        client={{
                                            id: row.id,
                                            firstname: row.firstname,
                                            surname: row.surname,
                                        }}
                                        link
                                        bold
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <TopRankingSection
                                title="Nejaktivnější skupiny"
                                nameHeader="Skupina"
                                items={statistics.lectures.top_groups}
                                emptyMessage="Žádná proběhlá skupinová lekce v tomto rozsahu."
                                renderName={(row) => (
                                    <Link
                                        className={styles.breakdownValue}
                                        to={`${APP_URLS.skupiny.url}/${row.id}`}>
                                        {row.name}
                                    </Link>
                                )}
                            />
                        </div>
                    </SimpleGrid>

                    <LecturesMonthSection
                        byMonth={statistics.lectures.by_month}
                        chartMetric={chartMetric}
                        onMetricChange={setChartMetric}
                        compact={compactCharts}
                        year={lecturesYear}
                    />

                    {/* Rozklad po kurzech – vždy */}
                    {statistics.lectures.by_course.length > 0 && (
                        <LecturesCourseSection
                            byCourse={statistics.lectures.by_course}
                            compact={compactCharts}
                        />
                    )}

                    {/* Rozklad po letech – jen při pohledu na všechny roky */}
                    {statistics.lectures.by_year !== null && (
                        <LecturesYearSection
                            byYear={statistics.lectures.by_year}
                            chartMetric={chartMetric}
                            onMetricChange={setChartMetric}
                            compact={compactCharts}
                        />
                    )}

                    {/* Vývoj rozložení kurzů po letech – čáry podle roku (osa X = čas) */}
                    <LecturesYearCourseSection
                        byYearCourse={statistics.lectures.by_year_course}
                        compact={compactCharts}
                    />
                </div>
            )}
        </Container>
    )
}

export default Statistics
