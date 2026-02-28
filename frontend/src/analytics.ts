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
        return
    }

    ReactGA.initialize(measurementId, { gaOptions: { send_page_view: false } })
    initialized = true
    onRouteResolved(() =>
        ReactGA.send({
            hitType: "pageview",
            page_path: globalThis.location.pathname + globalThis.location.search,
        }),
    )
}
