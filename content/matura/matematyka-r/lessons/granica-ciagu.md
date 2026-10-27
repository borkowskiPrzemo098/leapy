---
cheatsheet:
  - label: 'Podstawowe'
    formula: '$\lim\frac{1}{n}=0$'
  - label: 'Iloraz wielomianów, ten sam stopień'
    formula: 'iloraz współczynników przy najwyższych potęgach'
  - label: 'Ciąg geometryczny'
    formula: '$\lim q^{n}=0$ dla $|q|<1$'
  - label: 'Liczba e'
    formula: '$\lim\left(1+\frac{1}{n}\right)^{n}=e$'
title: 'Granica ciągu'
summary:
  - 'Granica ciągu to liczba, do której wyrazy zbliżają się dowolnie blisko dla dużych $n$.'
  - 'Dla ilorazu wielomianów: porównujemy najwyższe potęgi; dzielimy licznik i mianownik przez najwyższą potęgę $n$ z mianownika.'
  - '$\lim\frac{1}{n}=0$, $\lim q^{n}=0$ dla $|q|<1$.'
  - 'Wyrażenia z pierwiastkami: mnożymy przez sprzężenie.'
mistakes:
  - 'Podstawianie $n=\infty$ jako liczby.'
  - 'Zgubienie współczynników przy najwyższych potęgach.'
  - 'Uznanie $\infty-\infty=0$.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** $\lim\frac{3n^{2}+1}{n^{2}-5n}$: dzielimy przez $n^{2}$: $\frac{3+\frac{1}{n^{2}}}{1-\frac{5}{n}}\to\frac{3}{1}=3$.

**Różne stopnie.** $\lim\frac{2n+1}{n^{2}+3}=0$ (mianownik rośnie szybciej).

**Sprzężenie.** $\lim(\sqrt{n^{2}+n}-n)=\lim\frac{n}{\sqrt{n^{2}+n}+n}=\frac{1}{2}$.
