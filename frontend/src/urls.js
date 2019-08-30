function page(url, title) {
    return { url, title }
}

const APP_URLS = {
    prihlasit: page("/prihlasit", "Přihlášení"),
    skupiny: page("/skupiny", "Skupiny"),
    diar: page("/diar", "Diář"),
    klienti: page("/klienti", "Klienti"),
    nastaveni: page("/nastaveni", "Nastavení"),
    zajemci: page("/zajemci", "Zájemci"),
    prehled: page("/", "Přehled"),
    nenalezeno: page("/nenalezeno", "Nenalezeno") // smerovani ostatnich neznamych pozadavku, ktere zobrazi nenalezeno
}

export default APP_URLS
