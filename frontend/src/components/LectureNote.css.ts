import { globalStyle, style } from "@vanilla-extract/css"

/**
 * Poznámka k účasti. Je to uživatelský text libovolné délky a musí být vidět celá —
 * Mantine `Badge` je ale ve výchozím stavu jednořádkový (pevná výška, `nowrap`
 * a ellipsis na vnitřním `label`), text centruje a sází ho výrazně pod 1 rem.
 *
 * Rozměry se přenastavují přes proměnné Mantine (`--badge-*`), ne přepisem hotových
 * deklarací — tím se drží i to, co si komponenta odvozuje sama (výška, odsazení).
 * Velikost písma je 1 rem: v aplikaci není text menší (viz vizuální jazyk v AGENTS.md)
 * a poznámka je obsah, ne štítek. Odznak proto musí být hubený spíš obalem než písmem —
 * s výchozím odsazením a řádkováním 1,35 byl vyšší (28 px) než jméno klienta vedle něj
 * (24 px) a působil kvůli tomu předimenzovaně, přestože text měl stejnou velikost.
 */
export const lectureNote = style({
    display: "inline-flex",
    // odsazení řeší `gap` řádku účastníka, vlastní margin by odznak v řádku rozhodil
    justifyContent: "flex-start",
    padding: "0.05rem 0.45rem",
    height: "auto",
    overflow: "visible",
    textAlign: "left",
    textTransform: "none",
    // poznamka je uzivatelsky obsah - default uppercase Mantine Badge by ji deformoval
    whiteSpace: "normal",
    fontWeight: 500,
    vars: {
        "--badge-fz": "1rem",
        "--badge-height": "auto",
        "--badge-padding-x": "0.45rem",
        "--badge-lh": "1.25",
    },
})

/**
 * Vnitřní `label` odznaku má vlastní `overflow: hidden`, ellipsis a centrování — bez
 * tohohle by zalomení ani zarovnání doleva na obalu nestačilo.
 */
globalStyle(`${lectureNote} .mantine-Badge-label`, {
    display: "block",
    overflow: "visible",
    textAlign: "left",
    textOverflow: "clip",
    whiteSpace: "normal",
})
