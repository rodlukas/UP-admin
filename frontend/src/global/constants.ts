/** ULR adresa API. */
export const API_URL = "/api/v1/"

/** Texty notifikací. */
export enum NOTIFY_TEXT {
    ERROR = "Chyba při provádění požadavku",
    ERROR_TIMEOUT = "Aplikace je přetížena (požadavek trval moc dlouho), pokračujte za chvíli",
}

/** Typ úpravy v nastavení - rozlišujeme práci se stavem účasti a s kurzem. */
export enum EDIT_TYPE {
    STATE = 0,
    COURSE = 1,
}

/** Typ aktualizace komponent DashboardDay. */
export enum DASHBOARDDAY_UPDATE_TYPE {
    /** Neproběhla žádná aktualizace. */
    NONE = 0,
    /** Aktualizace proběhla a změnil se den, který komponenta zobrazuje. */
    DAY_CHANGED = 1,
    /** Aktualizace proběhla, ale NEzměnil se den, který komponenta zobrazuje. */
    DAY_UNCHANGED = 2,
}

/** Prefix hlavičky s JWT tokenem. */
export const JWT_HEADER_PREFIX = "Bearer "

/** Texty používané napříč aplikací. */
export enum TEXTS {
    NO_RESULTS = "Nic nenalezeno",
    WARNING_INACTIVE_CLIENT_GROUP = "Klient není aktivní (přestože skupina aktivní je) – přidáním nové lekce se změní na aktivního.",
    WARNING_INACTIVE_CLIENT_INFO = "Přidáním nové lekce se klient stane opět aktivním.",
    WARNING_INACTIVE_CLIENT = "Klient není aktivní – přidáním nové lekce se klient stane opět aktivním.",
    WARNING_INACTIVE_GROUP = "Skupina není aktivní – nelze jí tedy přidávat nové lekce.",
    WARNING_ACTIVE_GROUP_WITH_INACTIVE_CLIENTS = "Ve skupině jsou neaktivní klienti – přidáním nové lekce se změní na aktivní.",
}

/** Výchozí délka trvání lekce jednotlivce. */
export const DEFAULT_LECTURE_DURATION_SINGLE = 30

/** Výchozí délka trvání skupinové lekce. */
export const DEFAULT_LECTURE_DURATION_GROUP = 45

/** Výchozí barva kurzu. */
export const DEFAULT_COLOR = "#000"

/** URL adresa bankovnictví. */
export const BANKING_URL = "https://ib.fio.cz/"

/** Datum narozenin lektorky. */
export const USER_BIRTHDAY = new Date(1964, 10, 1)

/** Datum svátku lektorky. */
export const USER_NAMEDAY = new Date(1964, 4, 24)

/** Typ oslavy v příslušném dni v kalendáři - buď se slaví svátek nebo narozeniny, jinak nic. */
export enum USER_CELEBRATION {
    NOTHING = 0,
    BIRTHDAY = 1,
    NAMEDAY = 2,
}

/** URL adresa GitHub repozitáře s aplikací. */
export const GITHUB_REPO_URL = "https://github.com/rodlukas/UP-admin"

/** Jazyk pro formátování výstupu. */
export const LOCALE_CZ = "cs-CZ"
