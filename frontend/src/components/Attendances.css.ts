import { globalStyle, style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Seznam účastníků je zároveň **kontejner** pro dotazy níže: rozvržení účasti se neřídí
 * šířkou okna, ale šířkou místa, které seznam zrovna dostal — v diáři je to úzký sloupec
 * dne (a ten se navíc rozšiřuje, když se skryjí volné dny), na přehledu a kartě široká
 * plocha. `@media` by tenhle rozdíl nepostihlo.
 *
 * Bez `maxWidth`: seznam jde až k okraji bloku, aby stav docházky končil u hrany a nezůstával
 * po něm pruh prázdna. Jméno se od svých údajů neodtrhne, protože odznaky i stav drží
 * u pravého okraje jako jeden shluk.
 */
export const attendances = style({
    // `<ul>` má od prohlížeče margin 1em nahoře i dole; ve slotu lekce z toho byla nad
    // klientem i pod ním mezera 16 px navíc k odsazení těla, takže blok zbytečně nafukoval
    margin: 0,
    padding: 0,
    verticalAlign: "top",
    containerType: "inline-size",
})

/**
 * Účast v úzkém sloupci: řádek se jménem, poznámkou a odznaky, pod ním stav docházky.
 *
 * Sloupec, ne jeden `flex-wrap` řádek: v zalamovaném řádku si stav vynutí celou šířku
 * a poznámka se zalomí, kam zrovna vyjde, takže u lekce s víc účastníky nezůstane jediná
 * svislá osa, o kterou by se dalo čtení opřít.
 */
globalStyle(`${attendances} li`, {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    listStyleType: "none",
})

/**
 * Je-li místa dost, jde stav na řádek ke jménu. Právě tohle dělá vazbu „stav patří tomuhle
 * klientovi" zřejmou na první pohled — pod sebou se u víc účastníků snadno přečte křížem.
 *
 * Práh je 19 rem (ne 22): sloupec dne v diáři má při pěti dnech ~21 rem, při čtyřech ~23 rem.
 * S vyšším prahem se rozvržení účasti překlápělo podle toho, kolik dnů v týdnu je volných,
 * takže diář vypadal jinak každý týden. S 19 rem je řádek na obou variantách stejný a stacked
 * zůstává jen jako záchrana pro opravdu úzké kontejnery.
 */
globalStyle(`${attendances} li`, {
    "@container": {
        "(min-width: 19rem)": {
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            alignItems: "center",
            columnGap: "0.75rem",
        },
    },
})

/**
 * Účastníky odděluje vlasová linka — u skupinové lekce je hranice mezi klienty jinak
 * jen bílé místo a tři řádky jednoho klienta splývají s řádky dalšího.
 */
globalStyle(`${attendances} li + li`, {
    marginTop: "0.5rem",
    borderTop: vars.borderShort.default,
    paddingTop: "0.5rem",
})

/** Jméno klienta a odznaky. Poznámka je mimo — má vlastní řádek, viz `attendanceNote`. */
export const attendanceMain = style({
    display: "flex",
    alignItems: "center",
    gap: "0.3rem 0.4rem",
    minWidth: 0,
})

/**
 * Poznámka má **vlastní řádek pod jménem, odznaky i stavem** a jde přes celou šířku.
 *
 * Je to uživatelský text libovolné délky: vedle jména by o místo soupeřila, delší text by
 * zalomil řádek, odznaky by spadly pod jméno a sousední účastníci by přestali lícovat.
 * Čí poznámka to je, drží blízkost a linka mezi účastníky.
 */
export const attendanceNote = style({
    minWidth: 0,
    "@container": {
        // v mřížce (široký kontejner) musí přejít přes oba sloupce, jinak by se vecpala
        // do sloupce se jménem a byla zase úzká
        "(min-width: 19rem)": {
            gridColumn: "1 / -1",
        },
    },
})

/**
 * Odznaky (platba, pořadí, upozornění na platbu) drží u pravého okraje — společná pravá osa
 * dělá ze seznamu účastníků uspořádaný sloupec místo ragged textu. Odsazuje je `margin-left`,
 * ne `flex: 1` u jména: mezi jménem a odznaky ještě stojí poznámka, která musí zůstat
 * hned u jména.
 */
export const attendanceBadges = style({
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: "0.25rem",
    marginLeft: "auto",
})

/**
 * Výška ovládacích prvků v řádku účasti. Odpovídá `md` poli Mantine (`--input-height-md`,
 * 42 px), na které aplikaci přepíná `theme.ts` — vedle stavu docházky tak ikony nesedí
 * jako drobky. Kdyby se velikost polí v theme změnila, musí se změnit i tady.
 */
const ATTENDANCE_CONTROL_SIZE = "2.625rem"

/**
 * Slot pro stavovou ikonu účasti. Platba i „příště platit" mají stejný rozměr a stejnou
 * osu — bez společného slotu se ikony navzájem míjejí a řádek při přepnutí stavu poskakuje.
 * Glyfy jsou navíc z jedné rodiny (kroužkované), takže se liší významem a barvou, ne tvarem.
 */
export const attendanceIconSlot = style({
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    width: ATTENDANCE_CONTROL_SIZE,
    height: ATTENDANCE_CONTROL_SIZE,
    // velikost glyfu řídí slot, ne prop u ikony: FontAwesome `size="lg"` je 1,25em,
    // takže se škáluje s písmem kontejneru a obě ikony zůstanou shodné bez dalšího zásahu
    fontSize: "1.3rem",
})

/**
 * V úzkém sloupci stojí stav pod jménem — odsazení zleva ho čitelně přiřadí ke klientovi
 * nad ním (bez něj visí tři řádky pod sebou ve stejné ose a u skupiny se pletou).
 * V širokém sloupci se přesune vedle jména, kde odsazení nedává smysl.
 */
export const attendanceState = style({
    paddingLeft: "0.85rem",
    minWidth: 0,
    "@container": {
        "(min-width: 19rem)": {
            justifySelf: "end",
            paddingLeft: 0,
            width: "6.25rem",
        },
    },
})

globalStyle(`${attendances} p`, {
    margin: 0,
})

/**
 * Pořadové číslo účasti jako odznak — volně stojící „21." vedle jména vypadalo jako
 * zbytek věty. Tlumený, aby nepřebil jméno; hranici mu dá podklad, ne velikost.
 */
export const attendanceNumber = style({
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    borderRadius: vars.radius.pill,
    backgroundColor: vars.bg.control,
    padding: "0.05rem 0.45rem",
    maxWidth: "9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    // Stejný sentinel a stejné riziko protržení layoutu jako u LectureNumber.css.ts
    // (`attendance.number` může být tatáž varovná věta o chybějícím výchozím stavu účasti).
    color: vars.text.muted,
    fontSize: "1rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
})

/**
 * Jméno klienta je v diáři i na přehledu **kotva celého řádku** — podle něj se v hustém
 * seznamu hledá, takže je o stupeň větší než zbytek účasti (poznámka a stav zůstávají
 * na 1 rem). Není to nadpis, jen nejdůležitější údaj řádku.
 *
 * Bez `flex: 1` — odznaky odsouvá doprava vlastní `margin-left: auto`, takže hned za
 * jménem může stát jeho poznámka.
 */
export const clientName = style({
    flexShrink: 1,
    minWidth: 0,
    fontSize: "1.15rem",
    fontWeight: 600,
})
