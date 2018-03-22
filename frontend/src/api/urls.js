export const API_DELIM = '/'
export const API_ORDERING = 'ordering'

export const API_URLS = {
    AttendanceStates: {
        url: 'attendancestates' + API_DELIM
    },
    Clients: {
        url: 'clients' + API_DELIM
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
        url: 'courses' + API_DELIM
    },
    Groups: {
        url: 'groups' + API_DELIM,
        filters: {
            client: 'client'
        }
    },
    Attendances: {
        url: 'attendances' + API_DELIM
    },
    Login: {
        url: 'jwt-',
        action: {
            refresh: 'refresh',
            authenticate: 'auth'
        }
    }
}

export const API_METHODS = {
    get: 'get',
    post: 'post',
    patch: 'patch',
    remove: 'delete',
    put: 'put'
}
