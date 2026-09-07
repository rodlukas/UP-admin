import { style } from "@vanilla-extract/css"

import { vars } from "../theme/tokens"

/**
 * Pořadové číslo lekce jako odznak. Samotný ordinál („35.") jen visel vedle času a nebylo
 * poznat, že jde o údaj sám o sobě — odznak mu dá hranici.
 *
 * Podklad se odvozuje z `currentColor`, ne z pevné barvy: komponenta žije ve dvou různých
 * kontextech — v syté barvě kurzu v pruhu lekce (diář, přehled), kde je text bílý nebo
 * inkoustový podle kontrastu, a na bílé ploše karty klienta. Průsvitná bílá by na kartě
 * zmizela, průsvitná černá zase na tmavém pruhu; mix s `currentColor` sedí v obou.
 */
export const lectureNumber = style({
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    borderRadius: vars.radius.pill,
    backgroundColor: "color-mix(in srgb, currentColor 16%, transparent)",
    padding: "0.05rem 0.45rem",
    maxWidth: "9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    // `lecture.number` nemusí být číslo — serializer bez výchozího stavu účasti vrátí
    // varovnou větu ("⚠ není zvolen výchozí stav účasti…", viz LectureType). V nezalamovacím
    // flex řádku hlavičky lekce (`lectureHeader`) by celá věta protrhla layout; strop šířky
    // s elipsou drží odznak v rozumné velikosti stejně, jako to dřív dělal Mantine `Badge`.
    color: "inherit",
    fontSize: "1rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
})
