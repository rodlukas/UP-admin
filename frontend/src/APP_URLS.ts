type Page = {
    url: string
    title: string
}

/** Vrátí objekt s danou url adresou a názvem stránky. */
function page(url: string, title: string): Page {
    return { url, title }
}

/** URL adresy a názvy stránek v aplikaci. */
const APP_URLS = Object.freeze({
    prihlasit: page("/prihlasit", "Přihlášení"),
    skupiny: page("/skupiny", "Skupiny"),
    diar: page("/diar", "Diář"),
    klienti: page("/klienti", "Klienti"),
    nastaveni: page("/nastaveni", "Nastavení"),
    zajemci: page("/zajemci", "Zájemci"),
    prehled: page("/", "Přehled"),
    nenalezeno: page("/nenalezeno", "Nenalezeno"), // smerovani ostatnich neznamych pozadavku, ktere zobrazi nenalezeno
})

export default APP_URLS
