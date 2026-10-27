---
cheatsheet:
  - label: 'Warunek'
    formula: '$|q|<1$'
  - label: 'Suma'
    formula: '$S=\frac{a_{1}}{1-q}$'
  - label: 'Ułamek okresowy'
    formula: '$0{,}(ab)=\frac{ab}{99}$'
title: 'Szereg geometryczny'
summary:
  - 'Suma nieskończonego ciągu geometrycznego istnieje, gdy $|q|<1$.'
  - 'Wtedy $S=\frac{a_{1}}{1-q}$.'
  - 'Ułamek okresowy zamienia się na zwykły jako suma szeregu: $0{,}(3)=\frac{1}{3}$.'
  - 'W zadaniach z parametrem trzeba sprawdzić warunek $|q|<1$.'
mistakes:
  - 'Liczenie sumy dla $|q|\ge 1$.'
  - 'Pomylenie $a_{1}$ z $q$ we wzorze.'
  - 'Pominięcie warunku zbieżności przy parametrze.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** $1+\frac{1}{2}+\frac{1}{4}+\ldots$: $a_{1}=1$, $q=\frac{1}{2}$, $S=\frac{1}{1-\frac{1}{2}}=2$.

**Ułamek okresowy.** $0{,}(7)=0{,}7+0{,}07+\ldots=\frac{0{,}7}{1-0{,}1}=\frac{7}{9}$.

**Parametr.** Szereg $1+x+x^{2}+\ldots$ jest zbieżny dla $x\in(-1,1)$ i ma sumę $\frac{1}{1-x}$.
