# Seznam nevydaných změn a novinek
* oprava nefunkčního vyhledávání v react-selectu
* CI - mazání nepotřebných souborů před nasazením
* zobrazení načítání při všech operacích za všech případů - dříve někdy záviselo jen na načtení nejnáročnější komponenty 
 apod., tedy nově je načítání  zobrazeno např. i po úpravě/přidání klienta/skupiny a
 lépe se ukazuje (závisí na načtení všech prvků aktuálního zobrazení) např. v nastavení,
 kartě klienta, formuláři pro lekce (v nastavení se např. čeká i na načtění příslušných stavů účasti z kontextu)
* název tlačítka Přidat stav -> Přidat stav účasti
* před načtením klienta se už v kartě neukazuje jméno "undefined undefined"
* lepší konfigurace webpack serveru - už se správně zvolí IP adresa na lokální síti a nezávisí např. na virtuálním adaptéru pro Virtualbox
* **vylepšená validace:**
    * *neviditelné kurzy:* nelze přidat skupina nebo zájemce ke kurzu, který je neviditelný
    * *duplicity:* nelze přidat skupinu, kurz a stav účasti s již existujícím názvem
    * *unikátní zájemci o kurz:* každý klient může mít zájem o kurz nejvýše jednou
* zobrazení tel. čísel klientů v zájemcích o kurz
* přehlednější seznam zájemců o kurzy
* tel. čísla už se nerozdělují na více řádků
* *kurzy mají nastavitelnou dobu trvání* - při výběru kurzu pro danou lekci už tedy není potřeba vždy dokola vybírat
 dobu trvání, když je pokaždé stejná - automaticky se nastaví podle zvolného kurzu, přesto je možnost nastavit 
 pro daný kurz stále vlastní hodnotu
* *vytvoření testů pro API a UI (behave, Selenium) pro všechny části aplikace*
* klikací labely u položek formulářů napříč celou aplikací
* drobná vylepšení a úpravy UI
* už není potřeba zasílat na API pro lekce i kurz, pokud se jedná o skupinu (je povinný jen u lekcí jednotlivců) - 
 skupina má už rovnou kurz přiřazený a lekce jiných kurzů už nejsou možné
* čitelnější datum při oznámení časových konfliktů
