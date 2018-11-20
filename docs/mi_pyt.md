# Semestrální práce MI-PYT
* Cílem je rozšířit stávající a v současné době používanou webovou aplikaci pro projekt [Úspěšný prvňáček](https://uspesnyprvnacek.cz/).
* **Veškeré info o aplikaci je dostupné v [docs/README.md](README.md).** Tam je také na konci popsána struktura celého repozitáře.
* Kódy řešení budou opět v tomto repozitáři.

## Úkol
**Kompletní pokrytí celé aplikace testy:**
* aplikace v současné době obsahuje pouze několik jednoduchých *smoke* testů
    * viz. [/admin/tests](/admin/tests) a [/api/tests](/api/tests) - otestuje se, zda funguje vykreslení stránky a zda lze přidat klienta skrze model a pak skrze API s autentizací
    * nepoužívání testů je samozřejmě špatně, protože při jakékoliv změně není pod kontrolou, zda se nerozbouralo něco, co předtím fungovalo, 
    navíc se počítá s dalším rozšiřováním a je tedy potřeba mít k dispozici berličku, která bude hlídat funkčnost aplikace během dalšího vývoje
* je potřeba vytvořit testy jak pro API, tak pro vnitřní fungování (tedy testovat API i např. modely)
* vysoké pokrytí kódu je nutné, **nikoliv ale postačující** - lze ho dosáhnout poměrně snadno, cílem testů je ale skutečně otestovat, že se aplikace ve všech případech (**včetně** hraničních!) chová správně

---

> Zadání lze případně doplnit o:
> * refaktoring [/api/serializers.py](/api/serializers.py) - odstranění dlouhých metod, duplicitních kódů atd. (to lze samozřejmě provést až po vytvoření kvalitních testů, aby nedošlo k zanesení nových chyb)
> * dodání stránkování do API
> * vytvoření schéma API
