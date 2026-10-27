---
title: Prawdopodobieństwo
summary:
  - 'Klasyczna definicja: $P(A)=\frac{|A|}{|\Omega|}$, czyli zdarzenia sprzyjające przez wszystkie możliwe (równie prawdopodobne).'
  - 'Prawdopodobieństwo jest liczbą z przedziału $[0,1]$.'
  - "Zdarzenie przeciwne: $P(A')=1-P(A)$."
  - 'Przy dwóch rzutach kostką $|\Omega|=36$; przy dwóch rzutach monetą $|\Omega|=4$.'
mistakes:
  - 'Liczenie wyników „2 i 5” oraz „5 i 2” jako jednego, gdy rzucamy dwiema kostkami.'
  - 'Wynik większy od $1$ to zawsze sygnał błędu.'
  - 'Liczenie „co najmniej jeden” wprost zamiast przez zdarzenie przeciwne.'
cheatsheet:
  - label: 'Definicja klasyczna'
    formula: '$P(A)=\frac{|A|}{|\Omega|}$'
  - label: 'Zdarzenie przeciwne'
    formula: "$P(A')=1-P(A)$"
  - label: 'Suma zdarzeń'
    formula: '$P(A\cup B)=P(A)+P(B)-P(A\cap B)$'
reviewed: false
updatedAt: 2026-10-27
---

Prawdopodobieństwo liczymy w dwóch krokach: ile jest wszystkich wyników ($|\Omega|$) i ile z nich nam sprzyja ($|A|$).

**Kostka.** W rzucie kostką szansa na liczbę parzystą to $\frac{3}{6}=\frac{1}{2}$.

**Dwie kostki.** Wyniki to pary $(a,b)$, razem $6\cdot 6=36$. Suma oczek równa $7$ wypada dla $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$: $P=\frac{6}{36}=\frac{1}{6}$.

**Zdarzenie przeciwne.** „Co najmniej jeden orzeł w trzech rzutach monetą” to przeciwieństwo „same reszki”: $1-\frac{1}{8}=\frac{7}{8}$.
