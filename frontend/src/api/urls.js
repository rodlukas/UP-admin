export const API_DELIM = '/'
export const API_ORDERING = 'ordering'

export const API_URLS = {
    Applications: {
        url: 'applications' + API_DELIM
    },
    AttendanceStates: {
        url: 'attendancestates' + API_DELIM
    },
    Clients: {
        url: 'clients' + API_DELIM,
        filters: {
            active: 'active'
        }
    },
    Lectures: {
        url: 'lectures' + API_DELIM,
        filters: {
            date: 'date',
            client: 'client',
            group: 'group'
        },
        ordering: {
            start: 'start'
        }
    },
    Courses: {
        url: 'courses' + API_DELIM,
        filters: {
            visible: 'visible'
        }
    },
    Groups: {
        url: 'groups' + API_DELIM,
        filters: {
            client: 'client',
            active: 'active'
        }
    },
    Attendances: {
        url: 'attendances' + API_DELIM
    },
    Memberships: {
        url: 'memberships' + API_DELIM
    },
    Login: {
        url: 'jwt-',
        action: {
            refresh: 'refresh',
            authenticate: 'auth'
        }
    },
    Bank: {
        url: 'bank' + API_DELIM
    }
}

export const API_METHODS = {
    get: 'get',
    post: 'post',
    patch: 'patch',
    remove: 'delete',
    put: 'put'
}
