import { isEnvProduction } from "./global/funcEnvironments"

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        dataLayer: unknown[]
        gtag?(...args: unknown[]): void
    }
}

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

export type AnalyticsSource =
    | "applications_form"
    | "applications_page"
    | "client_card"
    | "clients_page"
    | "dashboard"
    | "dashboard_day"
    | "diary"
    | "diary_heading"
    | "group_card"
    | "groups_form"
    | "groups_page"
    | "lecture_wizard"
    | "search"
    | "settings_page"

type EventParams = Record<string, string | number | boolean>

/** Odešle GA4 custom event. Na neprodukčních prostředích je volání ignorováno (gtag není načteno). */
export function trackEvent(name: EventName, params?: EventParams): void {
    window.gtag?.("event", name, params)
}

let isInitialized = false

/**
 * Inicializuje Google Analytics 4. Voláno pouze na produkci s platným Measurement ID.
 * @param measurementId GA4 Measurement ID (formát G-XXXXXXXXXX)
 * @param onRouteResolved Callback pro registraci page_view při změně routy
 */
export function initAnalytics(
    measurementId: string,
    onRouteResolved: (handler: () => void) => void,
): void {
    if (!isEnvProduction() || !/^G-[A-Z0-9]+$/.test(measurementId) || isInitialized) {
        return
    }
    isInitialized = true

    window.dataLayer = window.dataLayer || []
    // Musí být function declaration, ne arrow function – gtag.js rozlišuje Arguments objekt
    // od plain pole; spread vytvoří pole, které se zpracuje jiným (GTM-compat) kódem v gtag.js.
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag("js", new Date())
    window.gtag("config", measurementId, { send_page_view: false })

    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.onerror = (): void => {
        // Selhání načtení (blokátor reklam, CSP) nesmí narušit chod aplikace – trackEvent
        // zůstane no-op díky optional chaining v každém volání.
        // Reset umožní případný retry (např. po obnovení připojení).
        isInitialized = false
    }
    document.head.appendChild(script)

    onRouteResolved(() => {
        window.gtag?.("event", "page_view", { page_location: window.location.href })
    })
}
