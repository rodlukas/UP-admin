import { globalStyle, style } from "@vanilla-extract/css"

import { RAIL_ICON_INSET } from "./global/constants"
import { vars } from "./theme/tokens"

/**
 * Výška slim hlavičky. Ta existuje **jen pod breakpointem `md`** — na desktopu aplikace
 * žádné horní chrome nemá, navigace je celá v inkoustovém pruhu vlevo. Hodnota je v rem,
 * aby škálovala s uživatelskou velikostí písma, a předává se do `AppShell.header.height`
 * (offset obsahu tedy počítá Mantine, ne my).
 */
export const MOBILE_HEADER_HEIGHT = "3.5rem"

/**
 * Plocha obsahu. `AppShell` dostává `padding={0}`, protože vodorovné odsazení řeší
 * `Container` na stránkách a týdenní mřížka diáře jde záměrně přes celou šířku.
 * Svislé odsazení ale plocha potřebuje — bez něj sedí hlavička stránky na hraně okna.
 */
export const plane = style({
    paddingTop: "0.5rem",
    paddingBottom: "2rem",
    "@media": {
        /**
         * Pod breakpointem `md` existuje slim hlavička (viz `MOBILE_HEADER_HEIGHT`) a je
         * `position: fixed`. Pevné `paddingTop` výše přebíjí offset, který by jinak Mantine
         * na plochu dopočítal z výšky hlavičky, takže bez tohohle by obsah (nadpis stránky)
         * mizel pod hlavičkou. Na mobilu proto k odsazení připočítáme výšku hlavičky.
         */
        "(max-width: 61.99em)": {
            paddingTop: `calc(${MOBILE_HEADER_HEIGHT} + 0.5rem)`,
        },
    },
})

/** Slim hlavička pro mobil: stejný inkoust jako pruh, aby chrome aplikace byl jedna barva. */
export const shellHeader = style({
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    borderBottom: `1px solid ${vars.border.rail}`,
    backgroundColor: vars.bg.rail,
    padding: "0 0.85rem",
})

/** Označení prostředí ve slim hlavičce sedí u pravé hrany, mimo burger a značku. */
export const headerEnv = style({
    marginInlineStart: "auto",
})

/**
 * Odznak označení prostředí (`EnvBadge`) je vědomá výjimka z pravidla „žádný text
 * pod 1rem" (viz `--badge-fz` v index.css.ts, kde má jinak KAŽDÝ odznak v aplikaci
 * natvrdo 1rem): je to meta-informace pro vývojáře/testera o tom, na jaké verzi běží
 * appka, ne obsah, který čte běžný uživatel při práci s klienty/lekcemi. V úzkém
 * pruhu (`RAIL_WIDTH_LABELS`, 12rem) navíc i po zkrácení popisku („TEST", ne
 * "Testing" — viz EnvBadge.tsx) působilo 1rem písmo v tak stísněném místě nepřiměřeně
 * velké. Cílí se přes potomka, ne globální proměnnou — ta zůstává 1rem pro všechny
 * ostatní odznaky v appce beze změny.
 */
globalStyle(`${headerEnv} .mantine-Badge-root`, {
    vars: {
        "--badge-fz": "0.8rem",
    },
})

/**
 * Inkoustový pruh — jediné chrome aplikace.
 * `border.rail` na pravé hraně není dekorace: v tmavém režimu má pruh proti ploše jen
 * 1.2:1 (#0b0f16 vs #1a2230), takže bez té linky by hranice nebyla vidět. Ve světlém
 * režimu je krok 12:1 a linka je tam jen pro konzistenci.
 */
export const rail = style({
    display: "flex",
    flexDirection: "column",
    borderRight: `1px solid ${vars.border.rail}`,
    backgroundColor: vars.bg.rail,
    padding: "0.9rem 0 0.85rem",
    /**
     * Pojistka proti přetečení: položky mají `white-space: nowrap`, takže neobvykle dlouhý
     * popisek by jinak vylezl z pruhu na plochu. `clip` místo `hidden`, aby ze sloupce
     * nevznikl scroll kontejner.
     */
    overflow: "clip",
})

/**
 * Značka v pruhu.
 *
 * Levé odsazení je `RAIL_ICON_INSET`, tedy tentýž sloupec, na kterém stojí ikony položek —
 * značka tak s navigací pod sebou lícuje. Vlastní odsazení 1 rem by nestačilo: ikony
 * položek odsazuje ještě 3px linka aktivní položky, takže by značka začínala o 3 px vlevo
 * od nich a působilo by to jako překlep v zarovnání.
 */
export const railBrand = style({
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    marginBottom: "1.1rem",
    padding: `0 1rem 0 ${RAIL_ICON_INSET}`,
    height: "2.1rem",
    textDecoration: "none",
    lineHeight: 1,
    color: vars.text.railStrong,
    fontSize: "1.3rem",
    fontWeight: 600,
    ":hover": {
        textDecoration: "none",
        color: "#ffffff",
    },
})

/** Značka ve slim hlavičce (mobil) — menší, vedle burgeru. */
export const headerBrand = style([
    railBrand,
    {
        marginBottom: 0,
        padding: 0,
        fontSize: "1.15rem",
    },
])

/**
 * „admin" sedí o kousek níž než „ÚP" — stejně jako v masteru, kde to zařizoval Bootstrap
 * reboot (`sub { position: relative; bottom: -0.25em }`).
 *
 * Posouvá se **relativním pozicováním, ne `vertical-align`**: `railBrand` je flex kontejner,
 * takže „ÚP" i `<sub>` jsou flex items a na těch se `vertical-align` (včetně výchozího
 * `sub` od prohlížeče) ignoruje — proto značka vypadala zarovnaná na jednu základnu.
 * Relativní posun se naproti tomu aplikuje až po rozvržení, takže na flex item platí.
 */
globalStyle(`${railBrand} sub`, {
    position: "relative",
    bottom: "-0.25em",
    opacity: 0.72,
    // `rem`, ne `em`: značka má v pruhu 1,3 rem a ve slim hlavičce 1,15 rem, takže
    // relativní velikost by v jedné z nich spadla pod 1 rem. Podřízenost drží
    // průhlednost a váha písma, ne zdrobnění.
    fontSize: "1rem",
    fontWeight: 400,
})

/** Prostor mezi navigací a patičkou pruhu — patička tak sedí dole bez absolutního pozicování. */
export const railSpacer = style({
    flex: 1,
    minHeight: "1rem",
})

export const railFoot = style({
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    borderTop: `1px solid ${vars.border.rail}`,
    paddingTop: "0.7rem",
})

/**
 * Označení prostředí (vývojová verze / testing s commitem / demo) na dně pruhu.
 * Odsazení zleva je `RAIL_ICON_INSET`, tedy tentýž sloupec jako značka a ikony položek.
 */
export const railEnv = style({
    display: "flex",
    alignItems: "center",
    margin: "0.7rem 0 0",
    padding: `0 1rem 0 ${RAIL_ICON_INSET}`,
    lineHeight: 1.3,
    color: "rgb(233 238 247 / 0.5)",
    fontSize: "1rem",
})

/** Stejná výjimka jako u `headerEnv` výše — viz komentář tam. */
globalStyle(`${railEnv} .mantine-Badge-root`, {
    vars: {
        "--badge-fz": "0.8rem",
    },
})

// Mantine žádný `[data-mantine-modal]` atribut nevykresluje — obsah modalu je
// v `.mantine-Modal-content` (stejný selektor používá i FormBase.css.ts).
globalStyle(".main a, .mantine-Modal-content a", {
    textDecoration: "none",
})

globalStyle(".main a:hover, .mantine-Modal-content a:hover", {
    textDecoration: "underline",
})
