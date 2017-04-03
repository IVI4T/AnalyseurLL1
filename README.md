# AnalyseurLL1

Lien vers l'application: https://ivi4t.github.io/AnalyseurLL1/

Attention, si un symbole apparait dans la partie droite d'une règle il est considéré comme non terminal et inversement. 

Utilisation
-----------

Exemple d'utilisation :

Séparateur : -->

Mot vide : ^ 

Axiome : A

```
A --> AA b
A --> ^
AA --> c
```
Premiers :

| A | AA |
|---|---|
| ∅	| ∅ |
|∅	|c|
|c|	c|
|c|	c|

Suivants :

|A|	AA|
|---|---|
|$|	∅|
|$|	b|
|$|	b|

Symboles Directeurs :

|A|	ALPHA|	SD|	Calcul|
|--|----|--|----|
|A|	AA b|	c|	premiers(AA)|
|A	|^	|$	|suivants( A)|
|AA	|c	|c	|premiers(c)|

Calcul donne la manière dont le SD est calculé pour la règle A --> ALPHA.

