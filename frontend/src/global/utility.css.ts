import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Globální utility třídy pro běžné jednoslovné styly.
 * Použij místo inline `style={{...}}`, které jsou v tomto codebase zakázané (vanilla-extract only).
 */

export const nowrap = style({
    whiteSpace: "nowrap",
})

export const inlineBlock = style({
    display: "inline-block",
})

export const inlineBlockNowrap = style([inlineBlock, nowrap])

export const bold = style({
    fontWeight: 700,
})

export const mb0 = style({
    marginBottom: 0,
})

export const mb1 = style({
    marginBottom: "1rem",
})

export const ml05 = style({
    marginLeft: "0.5rem",
})

export const mr025 = style({
    marginRight: "0.25rem",
})

export const middle = style({
    verticalAlign: "middle",
})

export const top = style({
    verticalAlign: "top",
})

export const dimmedText = style({
    color: vars.text.muted,
})

export const iconAfterText = style([middle, ml05])

export const iconBeforeText = style([middle, mr025])

export const italic = style({
    fontStyle: "italic",
})

export const textCenter = style({
    textAlign: "center",
})

export const dimmedTextCenter = style([dimmedText, textCenter])

/** Ikona v sémantické barvě — místo inline `color={vars…}` na FontAwesomeIcon. */
export const iconSuccess = style({
    color: vars.colors.success,
})

export const iconWarning = style({
    color: vars.colors.warning,
})

export const iconDanger = style({
    color: vars.colors.danger,
})

/** Buňka s číslem — tabulkové číslice, aby se hodnoty ve sloupci srovnaly pod sebe. */
export const numericCell = style({
    fontVariantNumeric: "tabular-nums",
})

export const iconInlineX = style({
    marginRight: "0.25rem",
    marginLeft: "0.25rem",
})

/**
 * Text jen pro čtečky obrazovky — vizuálně skrytý, ale v přístupnostním stromu zůstává.
 * Záměrně ne `display: none` ani `visibility: hidden`, těmi by o něj čtečka přišla.
 *
 * Používá se tam, kde stav nese vizuálně netextový prostředek (např. přeškrtnutí zrušené
 * lekce): kresba je pro oko, tenhle text pro čtečku, takže význam nenese jen vzhled.
 */
export const srOnly = style({
    position: "absolute",
    clipPath: "inset(50%)",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    whiteSpace: "nowrap",
})
