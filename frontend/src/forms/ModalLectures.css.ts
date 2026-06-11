import { style } from "@vanilla-extract/css"

export const button = style({
    // 0.375rem (6px) — záměrně mimo škálu tokenů, mezi `radius.sm` (4px) a `radius.md` (8px);
    // zaoblená jen levá strana — pravou hranou tlačítko přiléhá k okraji hlavičky lekce
    borderRadius: "0.375rem 0 0 0.375rem",
})
