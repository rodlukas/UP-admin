/** Oddělovač v URL na API. */
export const API_DELIM = "/"
/** Klíč query stringu používaný pro změnu řazení na API. */
export const API_ORDERING = "ordering"

/** URL adresy API včetně možností řazení a filtrování. */
export const API_URLS = Object.freeze({
    Applications: {
        url: "applications" + API_DELIM
    },
    AttendanceStates: {
        url: "attendancestates" + API_DELIM
    },
    Clients: {
        url: "clients" + API_DELIM,
        filters: {
            active: "active"
        }
    },
    Lectures: {
        url: "lectures" + API_DELIM,
        filters: {
            date: "date",
            client: "client",
            group: "group"
        },
        ordering: {
            start: "start"
        }
    },
    Courses: {
        url: "courses" + API_DELIM,
        filters: {
            visible: "visible"
        }
    },
    Groups: {
        url: "groups" + API_DELIM,
        filters: {
            client: "client",
            active: "active"
        }
    },
    Attendances: {
        url: "attendances" + API_DELIM
    },
    Memberships: {
        url: "memberships" + API_DELIM
    },
    Login: {
        url: "jwt-",
        action: {
            refresh: "refresh",
            authenticate: "auth"
        }
    },
    Bank: {
        url: "bank" + API_DELIM
    }
})

/** Metody, které poskytuje API. */
export const API_METHODS = Object.freeze({
    get: "get",
    post: "post",
    patch: "patch",
    remove: "delete",
    put: "put"
})
