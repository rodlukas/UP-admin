export function getAppUrl() {
    return window.location.hostname.split(".")[0]
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
    return !isEnvStaging() && !isEnvTesting() && getEnvName() === "production"
}

export function getEnvName() {
    return isEnvStaging() ? "staging"
        : (isEnvTesting() ? "testing"
            : process.env.NODE_ENV)
}
