---
title: Ciąg arytmetyczny
summary:
  - 'W ciągu arytmetycznym każdy wyraz powstaje z poprzedniego przez dodanie tej samej liczby $r$ (różnicy).'
  - 'Wyraz ogólny: $a_{n}=a_{1}+(n-1)r$.'
  - 'Suma $n$ początkowych wyrazów: $S_{n}=\frac{a_{1}+a_{n}}{2}\cdot n$.'
  - 'Trzy kolejne wyrazy $a,\ b,\ c$: środkowy to średnia sąsiadów, $b=\frac{a+c}{2}$.'
mistakes:
  - 'Wzór $a_{n}=a_{1}+nr$ zamiast $a_{1}+(n-1)r$.'
  - 'Liczenie różnicy w złą stronę: $r=a_{2}-a_{1}$, nie $a_{1}-a_{2}$.'
  - 'Mylenie $a_{n}$ (jeden wyraz) z $S_{n}$ (suma wyrazów).'
cheatsheet:
  - label: 'Różnica'
    formula: '$r=a_{n+1}-a_{n}$'
  - label: 'Wyraz ogólny'
    formula: '$a_{n}=a_{1}+(n-1)r$'
  - label: 'Suma'
    formula: '$S_{n}=\frac{a_{1}+a_{n}}{2}\cdot n$'
  - label: 'Suma (druga postać)'
    formula: '$S_{n}=\frac{2a_{1}+(n-1)r}{2}\cdot n$'
  - label: 'Własność trzech wyrazów'
    formula: '$2b=a+c$'
reviewed: false
updatedAt: 2026-10-27
---

Ciąg $3, 7, 11, 15, \dots$ jest arytmetyczny: każdy kolejny wyraz jest o $4$ większy. Różnica $r=4$, pierwszy wyraz $a_{1}=3$, więc $a_{n}=3+(n-1)\cdot 4=4n-1$. Sprawdzenie: $a_{4}=15$.

**Suma.** Suma $10$ początkowych wyrazów: $a_{10}=39$, $S_{10}=\frac{3+39}{2}\cdot 10=210$. Wzór działa, bo wyrazy z początku i końca łączą się w pary o tej samej sumie.

**Dwa dowolne wyrazy.** Gdy znamy $a_{3}=10$ i $a_{7}=22$, to między nimi są $4$ kroki: $4r=12$, $r=3$, a $a_{1}=a_{3}-2r=4$.
