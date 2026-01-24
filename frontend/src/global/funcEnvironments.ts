/** Vrátí název domény třetího řádu (subdomény) aktuální aplikace. */
export function getAppUrl(): string {
    return (globalThis.location?.hostname ?? "").split(".")[0]
}

/** Zjistí, jestli aktuální aplikace běží na testing prostředí. */
export function isEnvTesting(): boolean {
    return getAppUrl() === "uspesnyprvnacek-test"
}

/** Zjistí, jestli aktuální aplikace běží na demo prostředí. */
export function isEnvDemo(): boolean {
    return getAppUrl() === "up-admin-demo"
}

/** Zjistí, jestli aktuální aplikace běží na production prostředí. */
export function isEnvProduction(): boolean {
    return getAppUrl() === "uspesnyprvnacek"
}

/** Zjistí název prostředí, kde běží aktuální aplikace. */
export function getEnvName(): string {
    return isEnvTesting() ? "testing" : isEnvDemo() ? "demo" : (process.env.NODE_ENV ?? "local")
}

/** Zjistí, jestli aktuální aplikace běží na development prostředí. */
export function isEnvLocal(): boolean {
    return getEnvName() === "local"
}

/** Zjistí krátký název prostředí, kde běží aktuální aplikace. */
export function getEnvNameShort(): string {
    return isEnvTesting() ? "TEST" : isEnvDemo() ? "DEMO" : isEnvProduction() ? "PROD" : "LOCAL"
}

/** Zjistí, jestli je aktuální aplikace nasazená. */
export function isHosted(): boolean {
    return isEnvTesting() || isEnvProduction() || isEnvDemo()
}
