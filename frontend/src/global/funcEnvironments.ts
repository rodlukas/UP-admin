/** Vrátí název domény třetího řádu (subdomény) aktuální aplikace. */
export function getAppUrl(): string {
    return window.location.hostname.split(".")[0]
}

/** Zjistí, jestli aktuální aplikace běží na staging prostředí. */
export function isEnvStaging(): boolean {
    return getAppUrl() === "uspesnyprvnacek-staging"
}

/** Zjistí, jestli aktuální aplikace běží na testing prostředí. */
export function isEnvTesting(): boolean {
    return getAppUrl() === "uspesnyprvnacek-testing"
}

/** Zjistí, jestli aktuální aplikace běží na production prostředí. */
export function isEnvProduction(): boolean {
    return getAppUrl() === "uspesnyprvnacek"
}

/** Zjistí název prostředí, kde běží aktuální aplikace. */
export function getEnvName(): string {
    return isEnvStaging()
        ? "staging"
        : isEnvTesting()
        ? "testing"
        : process.env.NODE_ENV
        ? process.env.NODE_ENV
        : "development"
}

/** Zjistí, jestli aktuální aplikace běží na development prostředí. */
export function isEnvDevelopment(): boolean {
    return getEnvName() === "development"
}

/** Zjistí krátký název prostředí, kde běží aktuální aplikace. */
export function getEnvNameShort(): string {
    return isEnvStaging() ? "STAGE" : isEnvTesting() ? "TEST" : isEnvProduction() ? "PROD" : "DEV"
}

/** Zjistí, jestli je aktuální aplikace nasazená. */
export function isHosted(): boolean {
    return isEnvStaging() || isEnvTesting() || isEnvProduction()
}
