/** Vrátí název domény třetího řádu (subdomény) aktuální aplikace. */
export function getAppUrl() {
    return window.location.hostname.split(".")[0]
}

/** Zjistí, jestli je aktuální aplikace nasazená. */
export function isHosted() {
    return isEnvStaging() || isEnvTesting() || isEnvProduction()
}

/** Zjistí, jestli aktuální aplikace běží na staging prostředí. */
export function isEnvStaging() {
    return getAppUrl() === "uspesnyprvnacek-staging"
}

/** Zjistí, jestli aktuální aplikace běží na testing prostředí. */
export function isEnvTesting() {
    return getAppUrl() === "uspesnyprvnacek-testing"
}

/** Zjistí, jestli aktuální aplikace běží na development prostředí. */
export function isEnvDevelopment() {
    return getEnvName() === "development"
}

/** Zjistí, jestli aktuální aplikace běží na production prostředí. */
export function isEnvProduction() {
    return getAppUrl() === "uspesnyprvnacek"
}

/** Zjistí název prostředí, kde běží aktuální aplikace. */
export function getEnvName() {
    return isEnvStaging()
        ? "staging"
        : isEnvTesting()
        ? "testing"
        : process.env.NODE_ENV
        ? process.env.NODE_ENV
        : "development"
}

/** Zjistí krátký název prostředí, kde běží aktuální aplikace. */
export function getEnvNameShort() {
    return isEnvStaging() ? "STAGE" : isEnvTesting() ? "TEST" : isEnvProduction() ? "PROD" : "DEV"
}
