---
cheatsheet:
  - label: 'Definicja'
    formula: '$|x|=x$ dla $x\ge 0$, $|x|=-x$ dla $x<0$'
  - label: 'Równość modułów'
    formula: '$|a|=|b|\iff a=\pm b$'
  - label: 'Nierówność modułów'
    formula: '$|a|<|b|\iff a^{2}<b^{2}$'
  - label: 'Nierówność trójkąta'
    formula: '$|a+b|\le|a|+|b|$'
title: 'Wartość bezwzględna: równania i nierówności'
summary:
  - 'Równania z kilkoma modułami rozwiązujemy w przedziałach wyznaczonych przez miejsca zerowe wyrażeń pod modułami.'
  - 'W każdym przedziale opuszczamy moduł ze znakiem $+$ lub $-$ i sprawdzamy, czy rozwiązanie należy do przedziału.'
  - '$|a|=|b|\iff a=b\ \lor\ a=-b$; $|a|<|b|\iff a^{2}<b^{2}$.'
  - 'Wykres $y=|f(x)|$: części pod osią $Ox$ odbijamy w górę.'
mistakes:
  - 'Brak sprawdzenia, czy rozwiązanie należy do rozpatrywanego przedziału.'
  - 'Zgubienie przypadku na granicy przedziałów.'
  - 'Podnoszenie do kwadratu stron nierówności o różnych znakach.'
reviewed: false
updatedAt: '2026-10-27'
---

**Metoda przedziałów.** Równanie $|x-1|+|x+2|=5$: miejsca zerowe $1$ i $-2$ dzielą oś na trzy przedziały.

- $x<-2$: $-(x-1)-(x+2)=5$, $-2x-1=5$, $x=-3$ (należy do przedziału).
- $-2\le x<1$: $-(x-1)+(x+2)=3\neq 5$ — brak rozwiązań.
- $x\ge 1$: $(x-1)+(x+2)=5$, $2x+1=5$, $x=2$.

Rozwiązania: $x=-3$ lub $x=2$.

**Interpretacja geometryczna.** $|x-1|+|x+2|$ to suma odległości $x$ od $1$ i od $-2$. Najmniejsza wartość to $3$ (dla $x$ między nimi).
