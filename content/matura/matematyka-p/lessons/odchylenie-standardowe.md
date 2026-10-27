---
title: Wariancja i odchylenie standardowe
summary:
  - 'Wariancja mierzy, jak bardzo dane są rozrzucone wokół średniej.'
  - '$\sigma^{2}=\frac{(x_{1}-\bar{x})^{2}+\ldots+(x_{n}-\bar{x})^{2}}{n}$.'
  - 'Odchylenie standardowe to pierwiastek z wariancji: $\sigma=\sqrt{\sigma^{2}}$.'
  - 'Gdy wszystkie dane są równe, odchylenie standardowe jest równe $0$.'
mistakes:
  - 'Podanie wariancji jako odchylenia standardowego (bez pierwiastka).'
  - 'Pominięcie kwadratów: suma odchyleń od średniej zawsze wynosi $0$.'
  - 'Liczenie odchyleń od mediany zamiast od średniej.'
cheatsheet:
  - label: 'Wariancja'
    formula: '$\sigma^{2}=\frac{1}{n}\sum (x_{i}-\bar{x})^{2}$'
  - label: 'Odchylenie standardowe'
    formula: '$\sigma=\sqrt{\sigma^{2}}$'
  - label: 'Wzór skrócony'
    formula: '$\sigma^{2}=\overline{x^{2}}-\bar{x}^{2}$'
reviewed: false
updatedAt: 2026-10-27
---

Dwie klasy mogą mieć tę samą średnią ocen, a zupełnie inny rozrzut. Odchylenie standardowe pokazuje ten rozrzut jedną liczbą.

**Przykład.** Dane $2, 4, 6$. Średnia: $4$. Odchylenia: $-2, 0, 2$, ich kwadraty: $4, 0, 4$. Wariancja: $\frac{8}{3}$, odchylenie standardowe $\sqrt{\frac{8}{3}}\approx 1{,}63$.

**Wzór skrócony.** Średnia kwadratów minus kwadrat średniej: dla $2, 4, 6$ średnia kwadratów to $\frac{4+16+36}{3}=\frac{56}{3}$, a $\frac{56}{3}-16=\frac{8}{3}$. Ten sam wynik.

**Przesunięcie danych.** Dodanie do każdej liczby $10$ nie zmienia odchylenia standardowego, bo rozrzut zostaje taki sam.
