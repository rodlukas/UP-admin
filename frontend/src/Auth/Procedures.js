export function saveToken(token) {
    localStorage.setItem('jwt', token)
}

export function getToken() {
    return localStorage.getItem('jwt')
}

export function headers() {
    return headers['Authorization'] = 'JWT ' + this.getToken()
}
