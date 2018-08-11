export function getAppUrl() {
    return window.location.hostname.split(".")[0]
}

export function isEnvStaging() {
    return getAppUrl() === "uspesnyprvnacek-staging"
}

export function isEnvDevelopment() {
    return getEnvName() === "development"
}

export function isEnvProduction() {
    return !isEnvStaging() && getEnvName() === "production"
}

export function getEnvName() {
    return isEnvStaging() ? "staging" : process.env.NODE_ENV
}
