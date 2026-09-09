/** ULR adresa API. */
export const API_URL = "/api/v1/"

/**
 * localStorage klíč pro uložené barevné schéma (Mantine `localStorageColorSchemeManager`).
 * POZOR: stejný literál musí používat i FOUC init skript `admin/static/admin/color-scheme-init.js`,
 * který schéma čte ještě před startem Reactu (je to plain ES5 skript a nemůže tento modul importovat).
 * Jde o explicitní override – Mantine má jinak výchozí klíč „mantine-color-scheme-value".
 */
export const COLOR_SCHEME_STORAGE_KEY = "mantine-color-scheme"

/** localStorage klíč pro naposledy otevřené karty, které nabízí paleta příkazů (⌘K). */
export const RECENT_RECORDS_STORAGE_KEY = "upadmin-recent-records"

/**
 * Šířka inkoustového pruhu navigace. Pruh je vždy takhle široký — nesbaluje se.
 * Žije tady, a ne v `.css.ts`: ten soubor prochází child kompilací vanilla-extractu
 * a na export hodnot pro `.tsx` se nehodí.
 */
export const RAIL_WIDTH_LABELS = "12rem"

/**
 * Levý okraj sloupce ikon, měřeno od hrany pruhu. Drží ho značka i položky navigace,
 * takže ikony a text stojí na jedné svislé ose.
 *
 * Schválně v `rem`, ne `em` — značka má jinou velikost písma než položky a v `em`
 * by jí vyšel jiný sloupec.
 */
export const RAIL_ICON_INSET = "1.5rem"

/**
 * Breakpoint, pod kterým se inkoustový pruh chová jako mobilní drawer (viz `Main.tsx`,
 * `navbar.breakpoint`). JEDINÝ zdroj pravdy pro tuhle hranici — `Main.tsx` ho posílá
 * přímo do `AppShell`u (typ `breakpoint` u Mantine přijímá i syrový CSS rozměr, ne jen
 * klíč `theme.breakpoints`, viz `AppShell.types.d.ts`), `Main.css.ts` ho použije
 * v `@media` pro `plane` a `Main.tsx`'s vlastní `useMediaQuery` z něj postaví JS dotaz.
 *
 * Dřív byly tyhle tři na sobě nezávislé (`"(max-width: 61.99em)"` v JS/CSS vs. klíč
 * `"md"` = `62em` v AppShellu) a neshodovaly se: Mantine navíc počítá DVĚ různé mezní
 * hodnoty podle stavu drawer (otevřený: přesně breakpoint, zavřený: breakpoint − 0.1px,
 * viz `assign-navbar-variables`), takže žádná jedna ručně vypsaná JS konstanta nemohla
 * sedět na obojí. Řešení není napodobit Mantine výpočet (interní detail, může se změnit
 * mezi verzemi), ale sdílet TUTO hodnotu jako breakpoint přímo — pak se JS dotaz shoduje
 * aspoň s "otevřeným" stavem Mantine přesně, a rozdíl proti "zavřenému" stavu je jen
 * 0.1px (neprakticky malé okno, ne celý em rozdíl jako dřív).
 */
export const NAVBAR_BREAKPOINT = "62em"

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
    WARNING_STALE_CLIENT = "Klient je aktivní, ale naposledy měl lekci před více než 60 dny. Zvažte přesunutí do neaktivních.",
    WARNING_STALE_GROUP = "Skupina je aktivní, ale naposledy měla lekci před více než 60 dny. Zvažte přesunutí do neaktivních.",
    WARNING_NO_ATTENDANCE_STATES = "Nejsou nastaveny žádné stavy účasti — lekci nelze uložit. Přidejte alespoň jeden stav v Nastavení.",
}

/** Počet dní bez lekce, po kterých se aktivní klient/skupina považuje za „stale" a zobrazí se varování. */
export const DAYS_WITHOUT_LECTURE_WARNING = 60

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
