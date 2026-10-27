---
title: Średnia, mediana i dominanta
summary:
  - 'Średnia arytmetyczna: suma danych podzielona przez ich liczbę.'
  - 'Mediana: środkowa wartość po uporządkowaniu danych (przy parzystej liczbie danych: średnia dwóch środkowych).'
  - 'Dominanta (moda): wartość występująca najczęściej.'
  - 'Średnia ważona: każdą wartość mnożymy przez jej wagę, sumę dzielimy przez sumę wag.'
mistakes:
  - 'Szukanie mediany bez uporządkowania danych.'
  - 'Przy parzystej liczbie danych podanie jednej z dwóch środkowych zamiast ich średniej.'
  - 'Średnia z tabeli liczności bez uwzględnienia, ile razy występuje każda wartość.'
cheatsheet:
  - label: 'Średnia'
    formula: '$\bar{x}=\frac{x_{1}+x_{2}+\ldots+x_{n}}{n}$'
  - label: 'Średnia ważona'
    formula: '$\frac{w_{1}x_{1}+\ldots+w_{n}x_{n}}{w_{1}+\ldots+w_{n}}$'
  - label: 'Mediana (n nieparzyste)'
    formula: '$x_{\frac{n+1}{2}}$'
  - label: 'Mediana (n parzyste)'
    formula: '$\frac{x_{\frac{n}{2}}+x_{\frac{n}{2}+1}}{2}$'
reviewed: false
updatedAt: 2026-10-27
---

Te trzy miary opisują „typową” wartość w zestawie danych, każda trochę inaczej.

**Przykład.** Oceny: $2, 5, 3, 5, 4, 5$. Porządkujemy: $2, 3, 4, 5, 5, 5$.

- Średnia: $\frac{24}{6}=4$.
- Mediana: dwie środkowe to $4$ i $5$, więc $4{,}5$.
- Dominanta: $5$ (występuje trzy razy).

**Średnia z tabeli.** Gdy $3$ osoby mają $4$ punkty, a $2$ osoby $9$ punktów, średnia to $\frac{3\cdot 4+2\cdot 9}{5}=6$.

Mediana jest mniej wrażliwa na skrajne wartości niż średnia: dla danych $1, 2, 3, 100$ średnia to $26{,}5$, a mediana $2{,}5$.
