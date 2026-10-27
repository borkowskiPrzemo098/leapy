---
cheatsheet:
  - label: 'Kombinacje'
    formula: '$\binom{n}{k}$'
  - label: 'Permutacje z powtórzeniami'
    formula: '$\frac{n!}{n_{1}!\cdots n_{k}!}$'
  - label: 'Włączenia i wyłączenia'
    formula: '$|A\cup B|=|A|+|B|-|A\cap B|$'
title: 'Kombinatoryka (poziom rozszerzony)'
summary:
  - 'Kombinacje: $\binom{n}{k}=\frac{n!}{k!(n-k)!}$; własność $\binom{n}{k}=\binom{n}{n-k}$.'
  - 'Permutacje z powtórzeniami: $\frac{n!}{n_{1}!n_{2}!\ldots}$ (np. anagramy słowa z powtarzającymi się literami).'
  - 'Zasada włączeń i wyłączeń: $|A\cup B|=|A|+|B|-|A\cap B|$.'
  - 'Rozmieszczenia: ustal, czy obiekty i miejsca są rozróżnialne.'
mistakes:
  - 'Liczenie układów z powtórzeniami jak różnych.'
  - 'Pomylenie wyboru z ustawieniem.'
  - 'Podwójne liczenie przypadków przy sumowaniu.'
reviewed: false
updatedAt: '2026-10-27'
---

**Anagramy.** Słowo MAMA ma $\frac{4!}{2!2!}=6$ różnych ustawień liter.

**Wybór z warunkiem.** Z $6$ chłopców i $4$ dziewcząt wybieramy $3$ osoby, w tym co najmniej jedną dziewczynę: $\binom{10}{3}-\binom{6}{3}=120-20=100$.

**Włączenia i wyłączenia.** Liczb od $1$ do $100$ podzielnych przez $2$ lub $3$: $50+33-16=67$.
