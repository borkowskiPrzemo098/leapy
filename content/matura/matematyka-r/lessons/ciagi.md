---
cheatsheet:
  - label: 'Monotoniczność'
    formula: 'znak $a_{n+1}-a_{n}$'
  - label: 'Arytmetyczny'
    formula: '$2a_{n}=a_{n-1}+a_{n+1}$'
  - label: 'Geometryczny'
    formula: '$a_{n}^{2}=a_{n-1}a_{n+1}$'
title: 'Ciągi (poziom rozszerzony)'
summary:
  - 'Ciąg rosnący: $a_{n+1}-a_{n}>0$ dla każdego $n$; badamy znak różnicy.'
  - 'Ciąg określony rekurencyjnie: kolejny wyraz z poprzednich, np. $a_{n+1}=2a_{n}+1$.'
  - 'Indukcja matematyczna dowodzi własności dla wszystkich $n\in\mathbb{N}$.'
  - 'Ciąg arytmetyczny i geometryczny łączą się w zadaniach: np. trzy liczby tworzą oba ciągi.'
mistakes:
  - 'Badanie monotoniczności na kilku pierwszych wyrazach zamiast ogólnie.'
  - 'Pominięcie warunku początkowego w rekurencji.'
  - 'Mylenie $a_{n+1}$ z $a_{n}+1$.'
reviewed: false
updatedAt: '2026-10-27'
---

**Monotoniczność.** $a_{n}=\frac{n}{n+1}$: $a_{n+1}-a_{n}=\frac{n+1}{n+2}-\frac{n}{n+1}=\frac{1}{(n+1)(n+2)}>0$. Ciąg jest rosnący.

**Rekurencja.** $a_{1}=1$, $a_{n+1}=2a_{n}+1$: $1, 3, 7, 15, \ldots$ — wyraz ogólny $a_{n}=2^{n}-1$ (można dowieść indukcyjnie).

**Oba ciągi.** Liczby $a, b, c$ tworzą jednocześnie ciąg arytmetyczny i geometryczny tylko wtedy, gdy $a=b=c$.
