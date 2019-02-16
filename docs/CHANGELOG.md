# Seznam nevydaných změn a novinek
* upgrade js deps:
    * upgrade bootstrapu resi nektere drobne UI problemy, napr. prebarveni spodni hrany `list-group-item` u modreho 
    zvyrazneni, take problikavani, ktere se nekdy objevilo u modal oken (na macOS)
    * oprava nefunkcnich testu kvuli upgradu react-selectu
* **asynchronní načítání bundle souboru s JS** - diky tomu nedojde k blokovani nacitani dalsich externich souboru, 
predevsim CSS - dochazi k tomu, ze CSS soubor se nacte obvykle az po JS a tedy nejdrive problikne stranka bez stylu
