import ReactGA from "react-ga4"

type EventName =
    | "login"
    | "logout"
    | "client_created"
    | "client_updated"
    | "client_deleted"
    | "group_created"
    | "group_updated"
    | "group_deleted"
    | "lecture_created"
    | "lecture_updated"
    | "lecture_deleted"
    | "application_created"
    | "application_updated"
    | "application_deleted"
    | "course_created"
    | "course_updated"
    | "course_deleted"
    | "attendance_state_created"
    | "attendance_state_updated"
    | "attendance_state_deleted"
    | "attendance_state_changed"
    | "attendance_paid_toggled"
    | "diary_navigated"
    | "search_used"
    | "active_filter_toggled"
    | "client_deactivated"
    | "group_deactivated"

export type AnalyticsSource =
    | "applications_form"
    | "applications_page"
    | "client_card"
    | "clients_page"
    | "dashboard"
    | "diary"
    | "group_card"
    | "groups_form"
    | "groups_page"
    | "lecture_wizard"
    | "search"
    | "settings_page"

export type EventParams = Record<string, string | number | boolean>

let initialized = false
let lastPagePath: string | undefined

/**
 * Search parametry, které neidentifikují stránku, ale nesou jednorázový pokyn pro UI —
 * do `page_path` nepatří. `lecture` říká diáři, na kterou lekci se má zarolovat
 * (`UpcomingLectures.tsx`), a ten si ho hned po použití z URL smaže (`DashboardDay.tsx`).
 * Bez tohohle odfiltrování by každá lekce vyrobila v GA4 vlastní URL (a poslala do ní
 * interní id) a jeden proklik by se napočítal dvakrát: jednou s parametrem, podruhé po
 * jeho úklidu. Dedupe níž to sám neodchytí — porovnává celou cestu, a ta se liší.
 */
const TRANSIENT_SEARCH_PARAMS = ["lecture"]

/** Cesta stránky pro GA4 — bez parametrů, které jsou jen pokynem pro UI. */
function getPagePath(): string {
    const params = new URLSearchParams(globalThis.location.search)
    for (const param of TRANSIENT_SEARCH_PARAMS) {
        params.delete(param)
    }
    const search = params.toString()
    return globalThis.location.pathname + (search === "" ? "" : `?${search}`)
}

/** Odešle GA4 custom event. Na neprodukčních prostředích je volání ignorováno (ReactGA není inicializováno). */
export function trackEvent(name: EventName, params?: EventParams): void {
    if (!initialized) {
        return
    }
    ReactGA.event(name, params)
}

/**
 * Inicializuje Google Analytics 4. Voláno pouze na produkci s platným Measurement ID.
 * @param measurementId GA4 Measurement ID (formát G-XXXXXXXXXX)
 * @param onRouteResolved Callback pro registraci page_view při změně routy
 */
export function initAnalytics(
    measurementId: string,
    onRouteResolved: (handler: () => void) => void,
): void {
    if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
        // eslint-disable-next-line no-console
        console.info("GA not initialized")
        return
    }

    ReactGA.initialize(measurementId, {
        gaOptions: { send_page_view: false, cookie_domain: globalThis.location.hostname },
    })
    initialized = true
    onRouteResolved(() => {
        const pagePath = getPagePath()
        // Proklik z „Nejbližší lekce" vyrobí DVĚ vyřešení trasy na jedné stránce: router
        // nejdřív vyřeší adresu s `?lecture=`, a teprve po doběhnutí dotazu si ji diář
        // uklidí (`DashboardDay.tsx`). Po odfiltrování výše mají obě shodnou cestu, takže
        // je tenhle dedupe sloučí do jednoho zobrazení — bez něj by se každý takový proklik
        // počítal dvakrát.
        if (pagePath === lastPagePath) {
            return
        }
        lastPagePath = pagePath
        ReactGA.send({ hitType: "pageview", page_path: pagePath })
    })
}
