import { Box, Text, Title, Tooltip } from "@mantine/core"
import { useReducedMotion } from "@mantine/hooks"
import { useNavigate } from "@tanstack/react-router"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import classNames from "classnames"
import * as React from "react"

import { type AnalyticsSource } from "../analytics"
import { useLecturesFromDay } from "../api/hooks"
import { useAttendanceStatesContext } from "../contexts/AttendanceStatesContext"
import ModalLectures from "../forms/ModalLectures"
import ModalLecturesWizard from "../forms/ModalLecturesWizard"
import { clearLectureHighlight } from "../global/clearLectureHighlight"
import {
    isToday,
    isUserCelebrating,
    prettyDateWithLongDayYearIfDiff,
    prettyTime,
} from "../global/funcDateTime"
import { inlineBlockNowrap, mb0, srOnly } from "../global/utility.css"
import { contrastingTextColor, courseDuration } from "../global/utils"
import { DEFAULT_DELAY, useDelayedValue } from "../hooks/useDelayedValue"

import Attendances from "./Attendances"
import Celebration from "./Celebration"
import CourseName from "./CourseName"
import * as styles from "./DashboardDay.css"
import GroupName from "./GroupName"
import * as lectureStyles from "./Lecture.css"
import LectureNumber from "./LectureNumber"
import LectureTypeIcon from "./LectureTypeIcon"
import { LectureListSkeleton } from "./Skeletons"

/** Jak dlouho zůstane po příchodu z "Nejbližší lekce" vidět zvýraznění cílové lekce. */
export const HIGHLIGHT_DURATION_MS = 2500

type Props = {
    /** Při požadavcích na API nedělej prodlevu (true) - prodleva se hodí při rychlém překlikávání mezi dny v diáři. */
    withoutWaiting?: boolean
    /** Datum pro zobrazované lekce. */
    date: string
    /** Identifikace místa, odkud je komponenta použita (pro analytiku). */
    source: AnalyticsSource
    /**
     * Lekce, na kterou se má sloupec zarolovat a zvýraznit ji, přišla-li v `?lecture=`
     * (`UpcomingLectures.tsx`). Komponenta si ji schválně nečte z routeru sama: parametr míří
     * jen na mřížku diáře, ale `useSearch({ strict: false })` vydá i parametr, který
     * `validateSearch` routy vůbec nezmiňuje (ověřeno — validace se přes syrový search jen
     * slučuje, nenahrazuje ho). Routa Přehledu žádný `validateSearch` nemá, takže by sem
     * `/prehled?lecture=<id dnešní lekce>` dosáhlo a rozjelo rolování, zvýraznění i přepis
     * URL na stránce, které se to netýká.
     *
     * Povinné i s `undefined`: volající tím musí říct, jestli o zvýrazňování stojí. Sloupec,
     * který ho tiše nedostane, se sice vykreslí správně, ale nezaroluje, nezvýrazní a hlavně
     * parametr neuklidí — a `Diary` ho neuklidí taky, protože ta maže jen když lekce v týdnu
     * NENÍ. `?lecture=` by pak v URL visel napořád.
     */
    highlightLectureId: number | undefined
}

/** Komponenta zobrazující lekce pro jeden zadaný den. */
const DashboardDay: React.FC<Props> = (props) => {
    const { source, highlightLectureId } = props
    const attendanceStatesContext = useAttendanceStatesContext()
    const navigate = useNavigate()
    const [highlightedId, setHighlightedId] = React.useState<number | null>(null)
    // `getInitialValueInEffect: false` ze stejného důvodu jako v `Main.tsx` — aplikace běží jen
    // CSR a efekt níž může doskrolovat hned na prvním commitu, takže hodnotu potřebujeme rovnou.
    const prefersReducedMotion = useReducedMotion(false, { getInitialValueInEffect: false })
    const getDate = (): Date => new Date(props.date)

    /** Datum, pro které se má načíst data (může být zpožděno při rychlém překlikávání). */
    const delayedDate = useDelayedValue(props.date, DEFAULT_DELAY, props.withoutWaiting)

    // Datum se do hooku předává tak, jak přišlo — je to už ISO datum. Průchod `new Date()`
    // a zpátky přes `toISODate` by v pásmech se záporným posunem vrátil předchozí den
    // (datum bez času se parsuje jako UTC, `toISODate` čte lokální složky) a rozešel by
    // klíč dotazu s `Dashboard` a `Diary`, které posílají ISO datum přímo.
    const { data, isLoading, isFetching } = useLecturesFromDay(delayedDate, true)
    // `useMemo`, ne prosté `data ?? []`: beze zpevněné reference by zvýrazňovací efekt níže
    // (závislý na `lectures`) běžel při každém renderu, dokud `data` chybí, místo jen tehdy,
    // když se skutečně změní.
    const lectures = React.useMemo(() => data ?? [], [data])

    const title = prettyDateWithLongDayYearIfDiff(getDate())
    const isUserCelebratingResult = isUserCelebrating(getDate())
    const isDayToday = isToday(getDate())

    /**
     * Než prodleva dojede, míří dotaz pořád na předchozí datum — a jeho odpověď bývá v cache,
     * takže `isLoading` je false a sloupec by pod novým datem v hlavičce vykreslil lekce toho
     * minulého (a „Upravit lekci“ by otevřela lekci z jiného týdne). Po dobu prodlevy se proto
     * ukazuje kostra, tedy totéž, co ukazoval dotaz vystřelený okamžitě.
     */
    const isDatePending = delayedDate !== props.date

    const showLoading = isDatePending || isLoading || attendanceStatesContext.isLoading
    const hasLectures = lectures.length > 0

    /**
     * Doskrolování a zvýraznění lekce, na kterou uživatel klikl v "Nejbližší lekce"
     * (`UpcomingLectures.tsx`) — ten odkaz míří jen na týden, ne na konkrétní lekci v mřížce.
     * Beží až po doběhnutí dotazu (`!showLoading`), jinak by `lecture-${id}` ještě nebyl
     * v DOMu. Hledaná lekce nemusí patřit tomuto dni (sloupec pro každý den má vlastní
     * instanci), proto se nejdřív ověří shoda a teprve pak se search parametr smaže —
     * jinak by ho smazal první sloupec, který doběhne, bez ohledu na to, jestli lekci má.
     */
    React.useEffect(() => {
        if (showLoading || highlightLectureId == null) {
            return
        }
        const matchedLecture = lectures.find((lecture) => lecture.id === highlightLectureId)
        if (matchedLecture == null) {
            return
        }
        // `behavior` podle `prefers-reduced-motion`: plynulé doskrolování o stovky pixelů je
        // přesně ten pohyb, kvůli kterému si tu preferenci lidé zapínají, a `"smooth"` ji sám
        // nerespektuje (na rozdíl od CSS přechodů, kde stačí media query — viz DashboardDay.css.ts).
        document.getElementById(`lecture-${matchedLecture.id}`)?.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center",
        })
        setHighlightedId(matchedLecture.id)
        clearLectureHighlight(navigate)
    }, [showLoading, highlightLectureId, lectures, navigate, prefersReducedMotion])

    /** Zvýraznění samo zhasne — nemá zůstat viset, jakmile splnilo svůj účel (ukázat "tady"). */
    React.useEffect(() => {
        if (highlightedId == null) {
            return
        }
        const timeout = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS)
        return () => clearTimeout(timeout)
    }, [highlightedId])

    // Prázdné `lectures` znamená „volno" JEN když dotaz opravdu doběhl. Bez tohohle by při
    // výpadku API (nebo offline, kdy je dotaz `pending`/`paused`, tedy ani `isLoading`, ani
    // chyba) celý diář sebevědomě tvrdil, že je celý týden volný — a je to tvrzení, podle
    // kterého se plánuje. Test na `data`, ne na `isError`: stejné pravidlo jako v Card.tsx
    // a v `hasData` kontextů.
    const lecturesUnavailable = data === undefined
    let content: React.ReactNode
    if (showLoading) {
        content = <LectureListSkeleton count={3} />
    } else if (hasLectures) {
        content = lectures.map((lecture) => {
            return (
                <div
                    key={lecture.id}
                    id={`lecture-${lecture.id}`}
                    data-qa="lecture"
                    className={classNames(styles.lectureBlock, styles.dashboardDayItem, {
                        [lectureStyles.lectureCanceledStruck]: lecture.canceled,
                        [styles.lectureHighlighted]: lecture.id === highlightedId,
                    })}
                    // barvu kurzu nese pruh hlavičky (`lectureHeader`); text v něm musí
                    // zůstat čitelný i na světlém či tmavém uživatelském hexu
                    style={assignInlineVars(lectureStyles.lectureVars, {
                        courseColor: lecture.course.color,
                        courseText: contrastingTextColor(lecture.course.color),
                    })}
                    {...(lecture.canceled && { "data-qa-canceled": "true" })}>
                    <div
                        className={classNames(styles.lectureHeader, {
                            [styles.lectureHeaderCanceled]: lecture.canceled,
                        })}>
                        {/* order/size odděleně: úroveň nadpisu musí navazovat na nadpis
                            dne (h2), vzhled zůstává h4 */}
                        <Title order={3} size="h4" className={lectureStyles.lectureTitle}>
                            <Tooltip label={courseDuration(lecture.duration)}>
                                <strong>{prettyTime(new Date(lecture.start))}</strong>
                            </Tooltip>
                        </Title>
                        <CourseName
                            course={lecture.course}
                            withDot={false}
                            className={styles.lectureHeaderCourse}
                        />
                        <LectureTypeIcon lecture={lecture} />
                        <LectureNumber lecture={lecture} />
                        <ModalLectures
                            object={lecture.group ?? lecture.attendances[0].client}
                            currentLecture={lecture}
                            source={source}
                        />
                    </div>
                    <div
                        className={classNames(styles.lectureBody, {
                            [styles.lectureBodyCanceled]: lecture.canceled,
                        })}>
                        {/* přeškrtnutí je pro oko, tenhle text pro čtečku — bez něj by stav
                            nesl jen vzhled (WCAG 1.4.1) */}
                        {lecture.canceled && <span className={srOnly}>Zrušeno</span>}
                        {lecture.group && (
                            <Title order={4} size="h5" className={lectureStyles.lectureSubtitle}>
                                <GroupName group={lecture.group} title link />
                            </Title>
                        )}
                        <Attendances lecture={lecture} showClient source={source} />
                    </div>
                </div>
            )
        })
    } else if (lecturesUnavailable) {
        content = (
            <div
                className={classNames(
                    lectureStyles.lecture,
                    styles.lectureFree,
                    styles.dashboardDayItem,
                )}>
                <Text c="dimmed" ta="center" fw={500}>
                    Nepodařilo se načíst
                </Text>
            </div>
        )
    } else {
        content = (
            <div
                className={classNames(
                    lectureStyles.lecture,
                    styles.lectureFree,
                    styles.dashboardDayItem,
                )}>
                <Text c="dimmed" ta="center" fw={500}>
                    Volno
                </Text>
            </div>
        )
    }

    return (
        <div className={styles.dashboardDayWrapper}>
            <Box
                className={classNames(styles.dashboardDayDate, {
                    [styles.dashboardDayDateToday]: isDayToday,
                })}>
                <Title
                    order={2}
                    size="h4"
                    // `celebrationNone` (flex: 1; min-width: 0) platí bez ohledu na oslavu —
                    // je to layout hlavičky dne, ne nic specifického pro "bez oslavy" (viz
                    // DashboardDay.css.ts), proto se aplikuje vždy, i ve svátečních dnech.
                    // Vlastní string literál sem nepatří: vanilla-extract exportuje jen
                    // hashované třídy (viz Celebration.css.ts), žádná třída "celebration"
                    // v bundlu neexistuje.
                    className={classNames(styles.celebrationNone, mb0, inlineBlockNowrap)}>
                    <Celebration isUserCelebratingResult={isUserCelebratingResult} /> {title}
                </Title>
                <ModalLecturesWizard
                    date={props.date}
                    dropdownClassName={styles.dashboardDayDateAction}
                    dropdownSize="sm"
                    dropdownVariant="subtle"
                    dropdownDirection="up"
                    isFetching={isFetching && !isLoading}
                    source={source}
                />
            </Box>
            {content}
        </div>
    )
}

export default DashboardDay
