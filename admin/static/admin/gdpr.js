// funkce pro anonymizaci (random daty) dat na strance
function anonymize() {
    const firstnames = [
        "Jan",
        "Petr",
        "Jakub",
        "Tomáš",
        "Martin",
        "Lucie",
        "Eva",
        "Anna",
        "Marie",
        "Jana",
        "Pavel",
        "Jiří",
        "Michal",
        "Ondřej",
        "Tereza",
        "Kateřina",
        "Lenka",
        "Barbora",
        "Věra",
        "Zdeněk",
    ]
    const surnames = [
        "Novák",
        "Svoboda",
        "Novotný",
        "Dvořák",
        "Černý",
        "Procházka",
        "Kučera",
        "Veselý",
        "Blažek",
        "Horák",
        "Pospíšil",
        "Šimánek",
        "Konečný",
        "Kovář",
        "Marek",
        "Fiala",
        "Sedláček",
        "Doležal",
    ]
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
    const randPhone = () =>
        Array.from({ length: 3 }, () => String(Math.floor(Math.random() * 900) + 100)).join(" ")

    document.querySelectorAll('[data-qa="client_name"]').forEach((el) => {
        const surnameSpan = el.querySelector("span")
        if (!surnameSpan) return

        const spans = el.querySelectorAll("span")
        const firstnameSpan = spans.length > 1 ? spans[1] : null
        const firstnameTextNode = !firstnameSpan
            ? [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
            : null

        surnameSpan.textContent = rand(surnames)
        if (firstnameSpan) {
            firstnameSpan.textContent = rand(firstnames)
        } else if (firstnameTextNode) {
            firstnameTextNode.textContent = " " + rand(firstnames)
        }
    })

    document.querySelectorAll('a[data-qa="client_phone"]').forEach((el) => {
        const textNode = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE)
        if (textNode) textNode.textContent = randPhone()
    })

    const removeDiacritics = (str) => str.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    document.querySelectorAll('a[data-qa="client_email"]').forEach((el) => {
        el.textContent =
            removeDiacritics(rand(firstnames)).toLowerCase() +
            "." +
            removeDiacritics(rand(surnames)).toLowerCase() +
            "@example.com"
    })

    document.querySelectorAll('[data-qa="bank_account_owner"]').forEach((el) => {
        if (el.textContent.trim() !== "---") {
            el.textContent = rand(surnames) + " " + rand(firstnames)
        }
    })

    const loremSentences = [
        "platba za lekce",
        "úhrada lekcí",
        "lekce říjen",
        "lekce listopad",
        "lekce prosinec",
        "lekce grafomotoriky",
        "nápravná péče",
        "logopedická lekce",
        "lekce čtení",
        "rozvoj jemné motoriky",
        "lekce předškolní přípravy",
        "doučování čtení a psaní",
        "pomůcky ke kroužku",
        "pracovní sešit",
        "nákup pomůcek",
        "pastelky a sešity",
        "výtvarné potřeby",
        "speciální tužky",
        "záloha na lekce",
        "příspěvek na pomůcky",
    ]
    const randLorem = () => rand(loremSentences)

    document.querySelectorAll('[data-qa="bank_transaction_message"]').forEach((el) => {
        if (el.textContent.trim() !== "---") {
            el.textContent = randLorem()
        }
    })
}

// funkce pro prepnuti modu skryti soukromych informaci klientu
function toggleGdpr() {
    const gdprAttr = "gdpr"
    // zapni/vypni soukromy mod (pokud ma body prislusnou tridu, vypni mod - odstran ji, jinak zapni - pridej ji)
    if (document.body.classList.contains(gdprAttr)) {
        document.body.classList.remove(gdprAttr)
        return "soukromý režim VYPNUTÝ"
    } else {
        document.body.classList.add(gdprAttr)
        return "soukromý režim ZAPNUTÝ"
    }
}
