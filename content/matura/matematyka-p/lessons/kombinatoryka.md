---
title: Kombinatoryka
summary:
  - 'Reguła mnożenia: wybór w kilku krokach to iloczyn liczby możliwości w każdym kroku.'
  - 'Permutacje $n$ elementów (ustawienia w kolejności): $n!=1\cdot 2\cdot\ldots\cdot n$.'
  - 'Wariacje bez powtórzeń ($k$ z $n$, kolejność ważna): $n\cdot(n-1)\cdot\ldots\cdot(n-k+1)$.'
  - 'Kombinacje ($k$ z $n$, kolejność nieważna): $\binom{n}{k}=\frac{n!}{k!(n-k)!}$.'
mistakes:
  - 'Liczenie kombinacji tam, gdzie kolejność ma znaczenie (np. podium, kod PIN).'
  - 'Dodawanie zamiast mnożenia dla kolejnych kroków wyboru.'
  - 'Pominięcie, że liczba nie może zaczynać się od $0$.'
cheatsheet:
  - label: 'Silnia'
    formula: '$n!=1\cdot 2\cdot\ldots\cdot n,\ 0!=1$'
  - label: 'Wariacje bez powtórzeń'
    formula: '$\frac{n!}{(n-k)!}$'
  - label: 'Wariacje z powtórzeniami'
    formula: '$n^{k}$'
  - label: 'Kombinacje'
    formula: '$\binom{n}{k}=\frac{n!}{k!(n-k)!}$'
reviewed: false
updatedAt: 2026-10-27
---

Kluczowe pytanie w każdym zadaniu: **czy kolejność ma znaczenie** i **czy elementy mogą się powtarzać**.

- Kod PIN z $4$ cyfr: kolejność ważna, powtórzenia dozwolone: $10^{4}=10\,000$.
- Podium (złoto, srebro, brąz) z $8$ zawodników: kolejność ważna, bez powtórzeń: $8\cdot 7\cdot 6=336$.
- Wybór $2$ osób do delegacji z $5$: kolejność nieważna: $\binom{5}{2}=10$.

**Reguła mnożenia.** Strój z $3$ koszulek i $4$ par spodni: $3\cdot 4=12$ zestawów.

**Liczby z warunkiem.** Liczb trzycyfrowych o różnych cyfrach jest $9\cdot 9\cdot 8=648$: pierwsza cyfra bez zera, druga dowolna poza pierwszą, trzecia poza dwiema.
