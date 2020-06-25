import { Method } from "axios"

/** Oddělovač v URL na API. */
export const API_DELIM = "/"
/** Klíč query stringu používaný pro změnu řazení na API. */
export const API_ORDERING = "ordering"

/** URL adresy API včetně možností řazení a filtrování. */
export const API_URLS = Object.freeze({
    applications: {
        url: `applications${API_DELIM}`,
    },
    attendanceStates: {
        url: `attendancestates${API_DELIM}`,
    },
    clients: {
        url: `clients${API_DELIM}`,
        filters: {
            active: "active",
        },
    },
    lectures: {
        url: `lectures${API_DELIM}`,
        filters: {
            date: "date",
            client: "client",
            group: "group",
        },
        ordering: {
            start: "start",
        },
    },
    courses: {
        url: `courses${API_DELIM}`,
        filters: {
            visible: "visible",
        },
    },
    groups: {
        url: `groups${API_DELIM}`,
        filters: {
            client: "client",
            active: "active",
        },
    },
    attendances: {
        url: `attendances${API_DELIM}`,
    },
    memberships: {
        url: `memberships${API_DELIM}`,
    },
    login: {
        url: "jwt-",
        action: {
            refresh: "refresh",
            authenticate: "auth",
        },
    },
    bank: {
        url: `bank${API_DELIM}`,
    },
})

/** Metody, které poskytuje API. */
export const API_METHODS: { [key: string]: Method } = Object.freeze({
    get: "get",
    post: "post",
    patch: "patch",
    remove: "delete",
    put: "put",
})
