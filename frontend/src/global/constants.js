/** ULR adresa API. */
export const API_URL = "/api/v1/"

/** Texty notifikací. */
export const NOTIFY_TEXT = Object.freeze({
    ERROR: "Chyba při provádění požadavku",
    ERROR_TIMEOUT: "Aplikace je přetížena (požadavek trval moc dlouho), pokračujte za chvíli"
})

/** Typ úpravy v nastavení - rozlišujeme práci se stavem účasti a s kurzem. */
export const EDIT_TYPE = Object.freeze({
    STATE: 0,
    COURSE: 1
})

/** Prefix hlavičky s JWT tokenem. */
export const JWT_HEADER_PREFIX = "Bearer "

/** Texty používané napříč aplikací. */
export const TEXTS = Object.freeze({
    NO_RESULTS: "Nic nenalezeno"
})

/** Výchozí délka trvání lekce. */
export const DEFAULT_DURATION = 30

/** Výchozí barva kurzu. */
export const DEFAULT_COLOR = "#000"

/** URL adresa bankovnictví. */
export const BANKING_URL = "https://ib.fio.cz/"

/** Datum narozenin lektorky. */
export const USER_BIRTHDAY = Object.freeze({
    date: 1,
    month: 10
})

/** Datum svátku lektorky. */
export const USER_NAMEDAY = Object.freeze({
    date: 24,
    month: 4
})

/** Typ oslavy v příslušném dni v kalendáři - buď se slaví svátek nebo narozeniny, jinak nic. */
export const USER_CELEBRATION = Object.freeze({
    NOTHING: 0,
    BIRTHDAY: 1,
    NAMEDAY: 2
})

/** Výchozí měna. */
export const CURRENCY = "Kč"

/** URL adresa GitHub repozitáře s aplikací. */
export const GITHUB_REPO_URL = "https://github.com/rodlukas/UP-admin"
