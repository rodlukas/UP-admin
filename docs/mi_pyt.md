# Semestrální práce MI-PYT
* Cílem je rozšířit stávající a v současné době používanou webovou aplikaci pro projekt [Úspěšný prvňáček](https://uspesnyprvnacek.cz/).
* **Veškeré info o aplikaci je dostupné v [docs/README.md](README.md).** Tam je také na konci popsána struktura celého repozitáře.
* Kódy řešení budou opět v tomto repozitáři.

## Úkol
**Kompletní pokrytí celé aplikace testy:**
* aplikace v současné době obsahuje pouze několik jednoduchých *smoke* testů
    * viz. [/admin/tests](/admin/tests) a [/api/tests](/api/tests) - 
    otestuje se, zda funguje vykreslení stránky a zda lze přidat klienta skrze model a pak skrze API s autentizací
    * nepoužívání testů je samozřejmě špatně, protože při jakékoliv změně není pod kontrolou, zda se nerozbouralo něco, co předtím fungovalo, 
    navíc se počítá s dalším rozšiřováním a refaktoringem a je tedy potřeba mít k dispozici berličku, 
    která bude hlídat funkčnost aplikace během dalšího vývoje
* testovat se bude **REST API a frontend**
* vysoké pokrytí kódu je nutné, **nikoliv ale postačující** - 
lze ho dosáhnout poměrně snadno, cílem testů je ale skutečně otestovat, že se aplikace ve všech případech (**včetně** hraničních!) chová správně
    * z toho důvodu budou vytvořeny scénáře, které pokrývají všechny funkce aplikace a k nim budou vytvořeny odpovídající testy,
     které otestují, zda aplikace funguje dle scénáře (knihovna [behave](https://github.com/behave/behave))
