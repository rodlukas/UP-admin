import { createThemeContract, globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

import { courseName } from "./CourseName.css"

// Společné styly pro lekce používané v Card a DashboardDay

export const lectureVars = createThemeContract({
    /** Barva kurzu (uživatelský hex z Nastavení). */
    courseColor: "",
    /** Barva textu čitelná na `courseColor` — dopočítává `contrastingTextColor`. */
    courseText: "",
})

/**
 * Lekce je blok na ploše, ne karta. Na kartě klienta/skupiny nese příslušnost ke kurzu
 * nadpis skupiny lekcí, v diáři a přehledu pruh hlavičky (`lectureHeader`
 * v DashboardDay.css.ts) — samotný blok proto žádnou barvu nenese.
 */
export const lecture = style({
    position: "relative",
    padding: "0.6rem 0.85rem 0.75rem",
})

export const lectureCanceled = style({
    backgroundColor: vars.statusTint.danger,
})

/**
 * Nadpis lekce a jméno skupiny se cílí přes třídy, ne přes `h4`/`h5` — jejich sémantická
 * úroveň se odvíjí od nadpisů kolem (stránka vs. karta), vzhled se ale měnit nesmí.
 *
 * Čas je kotva celého bloku: tabulkové číslice srovnají časy ve sloupci pod sebou.
 */
export const lectureTitle = style({
    margin: 0,
    letterSpacing: "-0.01em",
    color: vars.text.heading,
    fontSize: "1.3rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
})

export const lectureSubtitle = style({
    marginTop: "0.1rem",
    // odstup k prvnímu klientovi pod nadpisem; seznam účastníků sám žádný margin nemá
    marginBottom: "0.3rem",
    fontSize: "1.25rem",
    // stejná váha jako křestní jméno klienta (`clientName` v Attendances.css.ts) —
    // název skupiny je pro lekci obdobně důležitý údaj jako jméno klienta u lekce jednotlivce
    fontWeight: 600,
})

/**
 * Odstín šrafování zrušené lekce. Přepíná se schématem stejným vzorem jako proměnné
 * grafů v charts.css.ts.
 */
globalStyle(":root", {
    vars: { "--up-lecture-canceled-hatch": "rgb(158 30 30 / 0.09)" },
})

globalStyle(":root[data-mantine-color-scheme='dark']", {
    vars: { "--up-lecture-canceled-hatch": "rgb(255 154 154 / 0.085)" },
})

/**
 * Šrafování zrušeného slotu. Perioda 20px je kompromis: hustší vzor působí na širokém
 * slotu přehledu (kolem 1000px) neklidně až jako moaré, řidší už nečte jako plocha,
 * ale jako pár nesouvisejících čar.
 */
const CANCELED_HATCH = `repeating-linear-gradient(135deg,
    transparent 0 10px,
    var(--up-lecture-canceled-hatch) 10px 20px)`

/**
 * Zrušená lekce: **šrafování přes celý slot** plus přeškrtnutý čas a název kurzu.
 *
 * Předchůdcem byla jedna úhlopříčka od rohu k rohu přes celý blok. Na slotu diáře by ještě
 * fungovala, jenže slot na přehledu je zhruba 1000×140 px — úhlopříčka je na tom poměru
 * skoro vodorovná a čte jako náhodné škrábnutí přes text, ne jako značka. Šrafování je na
 * poměru stran nezávislé, je to ustálený způsob, jak označit „neplatné/nedostupné" (stejně
 * to dělají kalendáře), a hlavně nekříží text — jména a stavy účastníků zůstanou čitelné.
 *
 * Vlastní „přeškrtnutí" nese `line-through` na čase a názvu kurzu. Na rozdíl od úhlopříčky
 * je čitelné při jakékoli velikosti bloku a nesahá na řádky účastníků, které je potřeba
 * číst i u zrušené lekce.
 *
 * Šrafování je pseudoelement s `inset: 0`, takže drží přesně na bloku i když vyroste,
 * a `pointer-events: none` nechává tužku a select pod ním klikatelné.
 *
 * Pruh hlavičky kvůli tomu zesvětlal (viz `lectureHeaderCanceled`): na sytě červeném pruhu
 * šrafování ani přeškrtnutí nejsou vidět. Se světlým pruhem drží celý slot jednu světlost.
 *
 * Stav nesmí nést jen vzhled (WCAG 1.4.1): značku čtečka obrazovky nehlásí, proto
 * blok navíc obsahuje skrytý text „Zrušeno" (`srOnly` v global/utility.css.ts).
 */
export const lectureCanceledStruck = style({
    position: "relative",
})

globalStyle(`${lectureCanceledStruck}::before`, {
    position: "absolute",
    zIndex: 2,
    inset: 0,
    background: CANCELED_HATCH,
    pointerEvents: "none",
    content: '""',
})

globalStyle(`${lectureCanceledStruck} ${lectureTitle}, ${lectureCanceledStruck} ${courseName}`, {
    textDecoration: "line-through",
    textDecorationThickness: "2px",
})

/**
 * Řádek s časem, ikonou typu, pořadím a tužkou.
 *
 * `center`, ne `baseline`: v řádku stojí vedle 1,3rem textu ještě ikona, odznak pořadí
 * a `ActionIcon`. Ani jeden z nich nemá vlastní účaří, takže si ho prohlížeč dopočítá
 * ze spodní hrany boxu — tlačítko tužky (2,25 rem) se pak o svou výšku vytáhlo nad řádek
 * a odznak pořadí naopak klesl pod ikonu. Pruh lekce v diáři (`lectureHeader`
 * v DashboardDay.css.ts) má stejné obsazení a rovná na střed.
 */
export const lectureHeading = style({
    display: "flex",
    flexFlow: "row",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.1rem",
})

export const lectureContent = style({
    marginTop: "0.35rem",
})

export const lectureNumber = style({
    marginLeft: "auto",
})
