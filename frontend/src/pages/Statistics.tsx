import { Link } from "@tanstack/react-router"
import classNames from "classnames"
import * as React from "react"
import { Button, Col, Container, Row, Table } from "reactstrap"
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
import ClientName from "../components/ClientName"
import Heading from "../components/Heading"
import Loading from "../components/Loading"
import { StatisticsType } from "../types/models"

import * as styles from "./Statistics.css"

/** Sjednocené okraje a mřížka napříč Recharts. */
const CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 12 } as const
/** Okraje pro grafy s legendou dole – extra bottom pro legendu + XAxis popisek. */
const CHART_MARGIN_BOTTOM_LEGEND = { top: 12, right: 16, left: 4, bottom: 48 } as const
const CHART_MARGIN_BAR_VERTICAL = { top: 12, right: 16, left: 8, bottom: 48 } as const
const AXIS_TICK = { fontSize: 12, fill: "#6c757d" }
const AXIS_LABEL = { fontSize: 11, fill: "#6c757d" } as const
const GRID_STROKE = "#e9ecef"
const LEGEND_FONT = { fontSize: 12 }

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

/** Krátké názvy měsíců pro osu X grafu podle měsíců. */
const MONTH_LABELS_SHORT = [
    "Led",
    "Úno",
    "Bře",
    "Dub",
    "Kvě",
    "Čvn",
    "Čvc",
    "Srp",
    "Zář",
    "Říj",
    "Lis",
    "Pro",
] as const

type ChartMetric = "lectures" | "hours"

const CHART_METRIC_LABEL: Record<ChartMetric, string> = {
    lectures: "Počet lekcí",
    hours: "Odučené hodiny",
}

/** Formátuje hodiny (desetinné číslo) na řetězec s jedním desetinným místem (česky). */
const formatHours = (hours: number): string =>
    `${hours.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u202fh`

/** Formátuje minuty jako hodiny – převede a zavolá formatHours. */
const formatMinutesAsHours = (minutes: number): string => formatHours(minutes / 60)

const toNumberOrNull = (
    value: number | string | readonly (number | string)[] | undefined | null,
): number | null => {
    if (value === undefined || value === null) {
        return null
    }
    if (Array.isArray(value)) {
        return null
    }
    const n = typeof value === "number" ? value : Number(value)
    return Number.isFinite(n) ? n : null
}

type EntityStatCardRow = { badge: React.ReactNode; badgeColor: string; value: React.ReactNode }

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
    <section className={classNames("mb-4", styles.chartSection)}>
        <div className={styles.chartTitleRow}>
            <h2 className={styles.chartTitle}>{title}</h2>
            {headerAction}
        </div>
        {caption ? <p className={styles.chartCaption}>{caption}</p> : null}
        <div className={styles.chartPanel}>{children}</div>
    </section>
)

/** Přepínač metriky pro grafy (počet lekcí / odučené hodiny). */
const MetricToggle: React.FC<MetricToggleProps> = ({ value, onChange }) => (
    <div className={classNames("btn-group btn-group-sm", styles.metricToggle)}>
        <Button
            color="secondary"
            outline={value !== "lectures"}
            active={value === "lectures"}
            onClick={() => onChange("lectures")}>
            {CHART_METRIC_LABEL.lectures}
        </Button>
        <Button
            color="secondary"
            outline={value !== "hours"}
            active={value === "hours"}
            onClick={() => onChange("hours")}>
            {CHART_METRIC_LABEL.hours}
        </Button>
    </div>
)

/** Karta se statistikami entity nebo skupiny metrik. */
const EntityStatCard: React.FC<EntityStatCardProps> = ({ title, total, rows, note }) => (
    <div className={styles.statCard}>
        <div className={styles.statCardTitle}>{title}</div>
        {note ? <div className={styles.statNote}>{note}</div> : null}
        {total !== undefined && (
            <>
                <div className={styles.metricValue}>{total}</div>
                <div className="text-muted small mb-3">celkem</div>
            </>
        )}
        {rows.map((row, i) => (
            <div
                key={typeof row.badge === "string" ? `${title}-${row.badge}` : String(i)}
                className={classNames("d-flex justify-content-between align-items-center", {
                    "mb-1": i < rows.length - 1,
                })}>
                <span className={`badge bg-${row.badgeColor} rounded-pill`}>{row.badge}</span>
                <span className="fw-semibold">{row.value}</span>
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

/** Tooltip pro graf po letech se všemi dostupnými metrikami. */
const YearTooltip: React.FC<YearTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null
    }
    const d = payload[0].payload
    return (
        <div className={styles.chartTooltip}>
            <div className="fw-semibold mb-1">{label}</div>
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
    const d = payload[0].payload
    return (
        <div className={styles.chartTooltip}>
            <div className="fw-semibold mb-1">{label}</div>
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

type CourseYAxisTickProps = {
    x?: number
    y?: number
    payload?: { value: string }
    courses: NonNullable<ReturnType<typeof useStatistics>["data"]>["lectures"]["by_course"]
}

/** Tick osy Y pro graf po kurzech – zobrazuje barevný kroužek kurzu před názvem. */
const CourseYAxisTick: React.FC<CourseYAxisTickProps> = ({ x = 0, y = 0, payload, courses }) => {
    const color = courses.find((c) => c.course_name === payload?.value)?.course_color ?? "#999"
    return (
        <g transform={`translate(${x},${y})`}>
            <circle cx={-8} cy={0} r={5} fill={color} />
            <text x={-16} y={0} dy={4} textAnchor="end" fill="#6c757d" fontSize={12}>
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
            <div className="fw-semibold mb-1">Rok {label}</div>
            {rows.map((p) => (
                <div key={String(p.dataKey)} className="d-flex justify-content-between gap-3">
                    <span style={{ color: p.color }}>{p.name}</span>
                    <strong>{p.value}</strong>
                </div>
            ))}
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
                    width={44}
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
                        <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.05} />
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
                    width={44}
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
                <Tooltip
                    formatter={(value) => {
                        const n = toNumberOrNull(value)
                        return n === null ? ["", ""] : [formatHours(n), "Odučeno"]
                    }}
                    labelFormatter={(y) => `Rok ${y}`}
                />
                <Area
                    type="monotone"
                    dataKey="hours"
                    name="Odučeno"
                    stroke="#0d6efd"
                    strokeWidth={2}
                    fill="url(#statsHoursAreaFill)"
                />
            </AreaChart>
        </ResponsiveContainer>
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

    return (
        <Container>
            <Heading title={APP_URLS.statistiky.title} isFetching={statisticsFetching} />

            <p className={styles.pageLead}>
                Souhrn klientů, skupin a lekcí. Počty u <strong>lekcí</strong> níže závisí na
                zvoleném roce (nebo na zobrazení za celou dobu); <strong>klienti</strong> a{" "}
                <strong>skupiny</strong> jsou vždy za celou historii aplikace.
            </p>

            {/* Klienti & Skupiny – globální statistiky (neovlivněny filtrem roku) */}
            {statistics && (
                <Row className="g-3 mb-4">
                    <Col xs={6} md={4} lg={3}>
                        <EntityStatCard
                            title="Klienti"
                            total={statistics.clients.total}
                            rows={[
                                {
                                    badge: "aktivní",
                                    badgeColor: "success",
                                    value: statistics.clients.active,
                                },
                                {
                                    badge: "neaktivní",
                                    badgeColor: "secondary",
                                    value: statistics.clients.inactive,
                                },
                                {
                                    badge: "bez lekce",
                                    badgeColor: "warning",
                                    value: statistics.clients.without_lectures,
                                },
                            ]}
                        />
                    </Col>
                    <Col xs={6} md={4} lg={3}>
                        <EntityStatCard
                            title="Skupiny"
                            total={statistics.groups.total}
                            rows={[
                                {
                                    badge: "aktivní",
                                    badgeColor: "success",
                                    value: statistics.groups.active,
                                },
                                {
                                    badge: "neaktivní",
                                    badgeColor: "secondary",
                                    value: statistics.groups.inactive,
                                },
                            ]}
                        />
                    </Col>
                </Row>
            )}

            {/* Rok – filtr */}
            <div className={styles.filterSection}>
                <div className={styles.filterHeading}>Rozsah lekcí</div>
                <p className={styles.filterHint}>
                    Filtruje karty lekcí, žebříčky klientů a skupin a grafy podle měsíce a kurzu.
                    Grafy vývoje podle roku se zobrazí pouze při výběru <strong>Celkem</strong>.
                </p>
                <div className="d-flex flex-wrap gap-1">
                    <Button
                        size="sm"
                        color="secondary"
                        outline={lecturesYear !== null}
                        active={lecturesYear === null}
                        onClick={() => setLecturesYear(null)}>
                        Celkem
                    </Button>
                    {statistics?.lectures.available_years.map((y) => (
                        <Button
                            key={y}
                            size="sm"
                            color="secondary"
                            outline={lecturesYear !== y}
                            active={lecturesYear === y}
                            onClick={() => setLecturesYear(y)}>
                            {y}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Lekce statistiky – spinner při prvním načtení, dimování při refetchi */}
            {!statistics ? (
                <Loading />
            ) : (
                <div
                    className={classNames({
                        [styles.fetchingOverlay]: statisticsFetching,
                    })}>
                    {/* Lekce – metriky */}
                    <Row className="g-3 mb-4">
                        <Col xs={12} sm={6} md={6}>
                            <EntityStatCard
                                title="Proběhlé lekce"
                                total={statistics.lectures.total}
                                note="Nezrušené lekce, kde se aspoň jeden klient skutečně zúčastnil."
                                rows={[
                                    {
                                        badge: "individuální",
                                        badgeColor: "primary",
                                        value: statistics.lectures.individual,
                                    },
                                    {
                                        badge: "skupinové",
                                        badgeColor: "info",
                                        value: statistics.lectures.group,
                                    },
                                    {
                                        badge: "odučeno",
                                        badgeColor: "dark",
                                        value: formatMinutesAsHours(statistics.lectures.total_minutes),
                                    },
                                ]}
                            />
                        </Col>
                        <Col xs={12} sm={6} md={6}>
                            <EntityStatCard
                                title="Neproběhlé lekce"
                                total={statistics.lectures.not_happened_count}
                                note="Zrušené lekce + skupinové kde nebyl přítomen nikdo. Omluvené jsou podmnožinou zrušených."
                                rows={[
                                    {
                                        badge: "míra zrušení",
                                        badgeColor: "danger",
                                        value: `${statistics.lectures.canceled_rate.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}\u202f%`,
                                    },
                                    {
                                        badge: "z toho omluvené (individuální + skupinové)",
                                        badgeColor: "warning",
                                        value: statistics.lectures.excused_not_happened_count,
                                    },
                                ]}
                            />
                        </Col>
                    </Row>

                    <Row className="g-3 mb-4">
                        <Col lg={6}>
                            <ChartSection title="Nejaktivnější klienti">
                                {statistics.lectures.top_clients.length > 0 ? (
                                    <Table responsive size="sm" hover borderless className="mb-0">
                                        <thead>
                                            <tr className="border-bottom">
                                                <th className="text-muted fw-normal">#</th>
                                                <th className="text-muted fw-normal">Klient</th>
                                                <th className="text-end text-muted fw-normal">
                                                    Lekce
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.lectures.top_clients.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td className="text-muted">{index + 1}</td>
                                                    <td>
                                                        <ClientName
                                                            client={{
                                                                id: row.id,
                                                                firstname: row.firstname,
                                                                surname: row.surname,
                                                            }}
                                                            link
                                                            bold
                                                        />
                                                    </td>
                                                    <td className="text-end fw-semibold">
                                                        {row.lecture_count}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className={styles.chartEmpty}>
                                        Žádná proběhlá lekce v tomto rozsahu.
                                    </p>
                                )}
                            </ChartSection>
                        </Col>
                        <Col lg={6}>
                            <ChartSection title="Nejaktivnější skupiny">
                                {statistics.lectures.top_groups.length > 0 ? (
                                    <Table responsive size="sm" hover borderless className="mb-0">
                                        <thead>
                                            <tr className="border-bottom">
                                                <th className="text-muted fw-normal">#</th>
                                                <th className="text-muted fw-normal">Skupina</th>
                                                <th className="text-end text-muted fw-normal">
                                                    Lekce
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.lectures.top_groups.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td className="text-muted">{index + 1}</td>
                                                    <td>
                                                        <Link
                                                            className="fw-semibold"
                                                            to={`${APP_URLS.skupiny.url}/${row.id}`}>
                                                            {row.name}
                                                        </Link>
                                                    </td>
                                                    <td className="text-end fw-semibold">
                                                        {row.lecture_count}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className={styles.chartEmpty}>
                                        Žádná proběhlá skupinová lekce v tomto rozsahu.
                                    </p>
                                )}
                            </ChartSection>
                        </Col>
                    </Row>

                    <ChartSection
                        title="Lekce podle měsíce"
                        headerAction={
                            <MetricToggle value={chartMetric} onChange={setChartMetric} />
                        }
                        caption={
                            lecturesYear === null
                                ? `${CHART_METRIC_LABEL[chartMetric]} podle kalendářního měsíce začátku napříč celou historií (každý sloupec = součet všech let v daném měsíci). Vhodné pro sezónnost (např. náběh po prázdninách).`
                                : `${CHART_METRIC_LABEL[chartMetric]} v roce ${lecturesYear} podle měsíce začátku lekce.`
                        }>
                        <ResponsiveContainer width="100%" height={compactCharts ? 250 : 280}>
                            <BarChart
                                data={statistics.lectures.by_month.map((row) => ({
                                    label: MONTH_LABELS_SHORT[row.month - 1],
                                    value:
                                        chartMetric === "lectures"
                                            ? row.total
                                            : Number((row.total_minutes / 60).toFixed(1)),
                                }))}
                                margin={CHART_MARGIN}>
                                <CartesianGrid
                                    stroke={GRID_STROKE}
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={AXIS_TICK}
                                    label={
                                        compactCharts
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
                                    width={44}
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
                                        compactCharts
                                            ? undefined
                                            : {
                                                  value:
                                                      chartMetric === "hours"
                                                          ? "Hodiny"
                                                          : "Počet lekcí",
                                                  angle: -90,
                                                  position: "insideLeft",
                                                  offset: 4,
                                                  ...AXIS_LABEL,
                                              }
                                    }
                                />
                                <Tooltip
                                    contentStyle={{ fontSize: "0.8rem" }}
                                    formatter={(value) => {
                                        const n = toNumberOrNull(value)
                                        if (n === null) {
                                            return ["", ""]
                                        }
                                        if (chartMetric === "hours") {
                                            return [formatHours(n), CHART_METRIC_LABEL.hours]
                                        }
                                        return [n, CHART_METRIC_LABEL.lectures]
                                    }}
                                    labelFormatter={String}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#0d6efd"
                                    name={chartMetric}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartSection>

                    {/* Rozklad po kurzech – vždy */}
                    {statistics.lectures.by_course.length > 0 && (
                        <ChartSection title="Proběhlé a zrušené lekce podle kurzu">
                            <ResponsiveContainer
                                width="100%"
                                height={
                                    statistics.lectures.by_course.length * (compactCharts ? 38 : 45) +
                                    (compactCharts ? 56 : 70)
                                }>
                                <BarChart
                                    layout="vertical"
                                    data={statistics.lectures.by_course}
                                    margin={CHART_MARGIN_BAR_VERTICAL}>
                                    <CartesianGrid
                                        stroke={GRID_STROKE}
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />
                                    <XAxis
                                        type="number"
                                        allowDecimals={false}
                                        tick={AXIS_TICK}
                                        label={
                                            compactCharts
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
                                        width={Math.min(
                                            compactCharts ? 132 : 260,
                                            Math.max(
                                                80,
                                                Math.max(
                                                    ...statistics.lectures.by_course.map(
                                                        (c) => c.course_name.length,
                                                    ),
                                                ) *
                                                    7 +
                                                    20,
                                            ),
                                        )}
                                        tick={({ x, y, payload }) => (
                                            <CourseYAxisTick
                                                x={Number(x)}
                                                y={Number(y)}
                                                payload={payload}
                                                courses={statistics.lectures.by_course}
                                            />
                                        )}
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
                                        fill="#0d6efd"
                                        name="individual"
                                    />
                                    <Bar dataKey="group" stackId="a" fill="#0dcaf0" name="group" />
                                    <Bar
                                        dataKey="canceled_count"
                                        stackId="a"
                                        fill="#dc3545"
                                        name="canceled_count"
                                        radius={[0, 3, 3, 0]}
                                        opacity={0.8}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    )}

                    {/* Rozklad po letech – jen při pohledu na všechny roky */}
                    {statistics.lectures.by_year !== null && (
                        <ChartSection
                            title="Lekce v čase (podle roku)"
                            headerAction={
                                <MetricToggle value={chartMetric} onChange={setChartMetric} />
                            }>
                            {statistics.lectures.by_year.length > 0 ? (
                                <>
                                    {chartMetric === "lectures" && (
                                        <ResponsiveContainer
                                            width="100%"
                                            height={compactCharts ? 250 : 280}>
                                            <BarChart
                                                data={[...statistics.lectures.by_year].reverse()}
                                                margin={CHART_MARGIN_BOTTOM_LEGEND}>
                                                <CartesianGrid
                                                    stroke={GRID_STROKE}
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="year"
                                                    tick={AXIS_TICK}
                                                    label={
                                                        compactCharts
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
                                                    width={44}
                                                    tick={AXIS_TICK}
                                                    label={
                                                        compactCharts
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
                                                <Legend
                                                    formatter={formatStackedBarLegend}
                                                    wrapperStyle={LEGEND_FONT}
                                                />
                                                <Bar
                                                    dataKey="individual"
                                                    stackId="a"
                                                    fill="#0d6efd"
                                                    name="individual"
                                                />
                                                <Bar
                                                    dataKey="group"
                                                    stackId="a"
                                                    fill="#0dcaf0"
                                                    name="group"
                                                />
                                                <Bar
                                                    dataKey="canceled_count"
                                                    stackId="a"
                                                    fill="#dc3545"
                                                    name="canceled_count"
                                                    radius={[3, 3, 0, 0]}
                                                    opacity={0.8}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                    {chartMetric === "hours" && (
                                        <HoursByYearChart
                                            byYear={statistics.lectures.by_year}
                                            compact={compactCharts}
                                        />
                                    )}
                                </>
                            ) : (
                                <p className={styles.chartEmpty}>Žádné lekce v datech.</p>
                            )}
                        </ChartSection>
                    )}

                    {/* Vývoj rozložení kurzů po letech – čáry podle roku (osa X = čas) */}
                    {statistics.lectures.by_year_course !== null &&
                        statistics.lectures.by_year_course.length > 0 && (
                            <ChartSection title="Vývoj počtu lekcí podle kurzu">
                                <YearCourseLinesChart
                                    byYearCourse={statistics.lectures.by_year_course}
                                    compact={compactCharts}
                                />
                            </ChartSection>
                        )}
                </div>
            )}
        </Container>
    )
}

export default Statistics
