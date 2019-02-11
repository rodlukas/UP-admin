# Seznam nevydaných změn a novinek
* **zavedení aktivních a neaktivních klientů a skupin**
    * přepínání klientů a skupin, aby v přehledech klientů a skupin nepřekáželi klienti,
    kteří aktuálně na lekce nedochází
    * neaktivním klientům a skupinám nelze přiřadit lekce
    * neaktivní klienty nelze přiřadit do skupin (UI je ani nezobrazí ve výběru)
    * × neaktivní klienty lze ale samozřejmě vést jako zájemce o kurzy
    * příslušné úpravy modelů, API apod.
* zavedení komponenty `Tooltip` (DRY) pro informace ve formulářích
* ve formuláři pro skupiny už se zobrazují jen viditelné kurzy
* **testy:**
    * příslušné úpravy testů a doplnění o kompletní testy aktivity
    * vylepšení tagů
    * opravy testů, které sice fungovaly, ale při testu selhání testovaly jiné selhání než měly
    * drobný refaktoring a méně opakování kódu
