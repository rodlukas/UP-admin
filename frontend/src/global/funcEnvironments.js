export function getAppUrl() {
    return window.location.hostname.split(".")[0]
}

export function isEnvStage() {
    return getAppUrl() === "uspesnyprvnacek-staging"
}

export function isEnvDevelopment() {
    return getEnvName() === "development"
}

export function isEnvProduction() {
    return !isEnvStage() && getEnvName() === "production"
}

export function getEnvName() {
    return isEnvStage() ? "staging" : process.env.NODE_ENV
}
