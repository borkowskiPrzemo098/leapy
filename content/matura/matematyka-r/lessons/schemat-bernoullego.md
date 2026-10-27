---
cheatsheet:
  - label: 'Dokładnie k sukcesów'
    formula: '$\binom{n}{k}p^{k}q^{n-k}$, $q=1-p$'
  - label: 'Co najmniej jeden'
    formula: '$1-q^{n}$'
  - label: 'Same sukcesy'
    formula: '$p^{n}$'
title: 'Schemat Bernoulliego'
summary:
  - 'Schemat Bernoulliego: $n$ niezależnych prób, w każdej sukces z prawdopodobieństwem $p$.'
  - 'Prawdopodobieństwo dokładnie $k$ sukcesów: $P_{n}(k)=\binom{n}{k}p^{k}(1-p)^{n-k}$.'
  - '„Co najmniej jeden sukces”: $1-(1-p)^{n}$.'
  - 'Próby muszą być niezależne i mieć to samo $p$.'
mistakes:
  - 'Pominięcie $\binom{n}{k}$.'
  - 'Zamiana $p$ i $1-p$.'
  - 'Stosowanie schematu dla losowania bez zwracania.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** Rzucamy $4$ razy monetą. Prawdopodobieństwo dokładnie $2$ orłów: $\binom{4}{2}\left(\frac{1}{2}\right)^{4}=\frac{6}{16}=\frac{3}{8}$.

**Kostka.** Rzucamy $3$ razy. Co najmniej jedna szóstka: $1-\left(\frac{5}{6}\right)^{3}=1-\frac{125}{216}=\frac{91}{216}$.

W schemacie liczy się liczba sukcesów, a $\binom{n}{k}$ to liczba sposobów ich rozmieszczenia.
