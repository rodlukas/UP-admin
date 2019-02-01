# Seznam nevydaných změn a novinek
* **refaktoring `serializers.py`** (#56)
    * respektování DRY - kód se konečně neopakuje a žádná logika není duplikována
* oprava špatné doby trvání náhradní lekce kurzu (nyní je v souladu se zadanou dobou trvání příslušného kurzu)
* **vylepšení lekcí bez účastníků a skupin bez členů:** (#58)
    * ve skupině bez členů je místo počítadel předplacených lekcí zobrazeno "Žádní účastníci"
    * lekce bez účastníků se už neoznačují automaticky jako zrušené
    * ve formuláři pro lekci bez účastníků se zobrazuje místo účastí "Žádní účastníci"
