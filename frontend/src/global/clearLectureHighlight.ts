import { type useNavigate } from "@tanstack/react-router"

/**
 * Smaže z URL zvýrazňovací parametr `?lecture=` (`UpcomingLectures.tsx`).
 *
 * Uklízí ho dvojí vlastník a musí to dělat shodně, proto je volání tady: sloupec, který lekci
 * našel (`DashboardDay`), a diář, když ji nemá ani jeden sloupec v týdnu (`Diary`).
 *
 * Maže se cíleně jen `lecture`, ne `search: {}`: parametr, který `validateSearch` routy
 * nezmíní, projde routerem beze změny (ověřeno) — prázdný objekt by tedy smazal i to, co sem
 * přišlo odjinud, třeba z odkazu zvenčí.
 *
 * `resetScroll: false` je nutné: tanstack router jinak po KAŽDÉ navigaci (i jen změně search
 * parametru) sám vynuluje scroll na 0 (`resetScroll` má default `true`), což by doskrolování
 * na zvýrazněnou lekci smazalo — na mobilu, kde dny stojí pod sebou a scroll bývá o stovky
 * pixelů delší než na desktopu, to bylo vidět pokaždé.
 */
export function clearLectureHighlight(navigate: ReturnType<typeof useNavigate>): void {
    void navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({ ...prev, lecture: undefined }),
        replace: true,
        resetScroll: false,
    })
}
