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
