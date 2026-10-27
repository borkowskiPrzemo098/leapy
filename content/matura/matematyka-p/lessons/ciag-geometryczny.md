---
title: Ciąg geometryczny
summary:
  - 'W ciągu geometrycznym każdy wyraz powstaje z poprzedniego przez pomnożenie przez tę samą liczbę $q$ (iloraz).'
  - 'Wyraz ogólny: $a_{n}=a_{1}\cdot q^{n-1}$.'
  - 'Suma $n$ początkowych wyrazów dla $q\neq 1$: $S_{n}=a_{1}\cdot\frac{1-q^{n}}{1-q}$.'
  - 'Trzy kolejne wyrazy $a,\ b,\ c$: $b^{2}=a\cdot c$.'
mistakes:
  - 'Wzór $a_{n}=a_{1}\cdot q^{n}$ zamiast $q^{n-1}$.'
  - 'Zgubienie ujemnego ilorazu: z $q^{2}=4$ wynika $q=2$ **lub** $q=-2$.'
  - 'Użycie wzoru na sumę dla $q=1$: wtedy po prostu $S_{n}=n\cdot a_{1}$.'
cheatsheet:
  - label: 'Iloraz'
    formula: '$q=\frac{a_{n+1}}{a_{n}}$'
  - label: 'Wyraz ogólny'
    formula: '$a_{n}=a_{1}q^{n-1}$'
  - label: 'Suma'
    formula: '$S_{n}=a_{1}\cdot\frac{1-q^{n}}{1-q},\ q\neq 1$'
  - label: 'Własność trzech wyrazów'
    formula: '$b^{2}=ac$'
reviewed: false
updatedAt: 2026-10-27
---

Ciąg $3, 6, 12, 24, \dots$ jest geometryczny: każdy wyraz jest dwa razy większy od poprzedniego. Iloraz $q=2$, więc $a_{n}=3\cdot 2^{n-1}$, a $a_{6}=3\cdot 32=96$.

**Suma.** $S_{5}=3\cdot\frac{1-2^{5}}{1-2}=3\cdot\frac{-31}{-1}=93$. Sprawdzenie: $3+6+12+24+48=93$.

**Ujemny iloraz.** Ciąg $2, -6, 18, -54, \dots$ ma $q=-3$: znaki wyrazów się przeplatają.

**Procent składany** to ciąg geometryczny: kapitał po każdym roku mnożymy przez $1+\frac{p}{100}$.
