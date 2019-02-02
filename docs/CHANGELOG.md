# Seznam nevydaných změn a novinek
* **refaktoring `serializers.py`** (#56)
    * respektování DRY - kód se konečně neopakuje a žádná logika není duplikována
* oprava špatné doby trvání náhradní lekce kurzu (nyní je v souladu se zadanou dobou trvání příslušného kurzu)
* **vylepšení lekcí bez účastníků a skupin bez členů:** (#58)
    * ve skupině bez členů je místo počítadel předplacených lekcí zobrazeno "Žádní účastníci"
    * lekce bez účastníků se už neoznačují automaticky jako zrušené
    * ve formuláři pro lekci bez účastníků se zobrazuje místo účastí "Žádní účastníci"
* **oprava řazení napříč aplikací** - řadí se podle české abecedy, tedy např. klienti už jsou konečně ve správném pořadí
 i vzhledem k diakritice
* barevně odlišené řádky s transakcemi v bankovnictví
* úprava stavových kódu API pro bankovnictví - už vrací jen 200/500, ostatní chyby jsou zahrnuty v 500 a
 podrobnější informace jsou přiloženy do JSONu rovnou na serveru (tedy na frontendu není žádná logika navíc)
* oprava náhodně občas nefungujících testů na CI (po každém scénáři je smazána localstorage)
