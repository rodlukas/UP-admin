export function getAppUrl() {
    return window.location.hostname.split(".")[0]
}

export function isHosted() {
    return isEnvStaging() || isEnvTesting() || isEnvProduction()
}

export function isEnvStaging() {
    return getAppUrl() === "uspesnyprvnacek-staging"
}

export function isEnvTesting() {
    return getAppUrl() === "uspesnyprvnacek-testing"
}

export function isEnvDevelopment() {
    return getEnvName() === "development"
}

export function isEnvProduction() {
    return getAppUrl() === "uspesnyprvnacek"
}

export function getEnvName() {
    return isEnvStaging() ? "staging" : isEnvTesting() ? "testing" : process.env.NODE_ENV
}

export function getEnvNameShort() {
    return isEnvStaging() ? "STAGE" : isEnvTesting() ? "TEST" : isEnvProduction() ? "PROD" : "DEV"
}
