---
cheatsheet:
  - label: 'Warunkowe'
    formula: '$P(A\mid B)=\frac{P(A\cap B)}{P(B)}$'
  - label: 'Niezależność'
    formula: '$P(A\cap B)=P(A)P(B)$'
  - label: 'Całkowite'
    formula: '$P(A)=\sum_{i}P(A\mid B_{i})P(B_{i})$'
title: 'Prawdopodobieństwo warunkowe'
summary:
  - '$P(A\mid B)=\frac{P(A\cap B)}{P(B)}$ — prawdopodobieństwo $A$, gdy wiadomo, że zaszło $B$.'
  - 'Zdarzenia niezależne: $P(A\cap B)=P(A)\cdot P(B)$.'
  - 'Prawdopodobieństwo całkowite: $P(A)=\sum P(A\mid B_{i})P(B_{i})$.'
  - 'Drzewka pomagają przy doświadczeniach wieloetapowych.'
mistakes:
  - 'Mylenie $P(A\mid B)$ z $P(B\mid A)$.'
  - 'Uznanie zdarzeń rozłącznych za niezależne.'
  - 'Pominięcie gałęzi w drzewku.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** Rzut kostką. Wiadomo, że wypadła liczba parzysta. Prawdopodobieństwo, że to $6$: $P=\frac{1}{3}$ (z trzech możliwych: $2, 4, 6$).

**Całkowite.** Urna I: $2$ białe i $3$ czarne, urna II: $4$ białe i $1$ czarna. Rzut monetą wybiera urnę. $P(\text{biała})=\frac{1}{2}\cdot\frac{2}{5}+\frac{1}{2}\cdot\frac{4}{5}=\frac{3}{5}$.
