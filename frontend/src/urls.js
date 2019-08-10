let page = function(url, title) {
    this.url = url
    this.title = title
}

const APP_URLS = {
    prihlasit: new page("/prihlasit", "Přihlášení"),
    skupiny: new page("/skupiny", "Skupiny"),
    diar: new page("/diar", "Diář"),
    klienti: new page("/klienti", "Klienti"),
    nastaveni: new page("/nastaveni", "Nastavení"),
    zajemci: new page("/zajemci", "Zájemci"),
    prehled: new page("/", "Přehled"),
    nenalezeno: new page("/nenalezeno", "Nenalezeno") // smerovani ostatnich neznamych pozadavku, ktere zobrazi nenalezeno
}

export default APP_URLS
