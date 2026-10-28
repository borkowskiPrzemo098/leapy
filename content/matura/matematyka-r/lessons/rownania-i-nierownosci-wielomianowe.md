---
cheatsheet:
  - label: 'Iloczyn równy zero'
    formula: '$AB=0\iff A=0\ \lor\ B=0$'
  - label: 'Dwukwadratowe'
    formula: '$x^{4}+bx^{2}+c=0$, $t=x^{2}\ge 0$'
  - label: 'Krotność parzysta'
    formula: 'znak się nie zmienia'
title: 'Równania i nierówności wielomianowe'
summary:
  - 'Równanie wielomianowe: rozkładamy na czynniki i przyrównujemy każdy do zera.'
  - 'Nierówność: rozkład na czynniki, pierwiastki na osi, „wężyk” od prawej strony od znaku współczynnika przy najwyższej potędze.'
  - 'Przy pierwiastku krotności parzystej wykres odbija się od osi (znak się nie zmienia).'
  - 'Podstawienie $t=x^{2}$ upraszcza równania dwukwadratowe.'
mistakes:
  - 'Dzielenie przez wyrażenie z $x$ (gubią się pierwiastki).'
  - 'Zmiana znaku przy pierwiastku parzystej krotności.'
  - 'Odrzucanie ujemnych $t$ dopiero po powrocie do $x$ — trzeba je odrzucić od razu ($t=x^{2}\ge 0$).'
reviewed: false
updatedAt: '2026-10-27'
---

**Nierówność.** $(x-1)(x+2)(x-3)\ge 0$. Pierwiastki $-2, 1, 3$; współczynnik przy $x^{3}$ dodatni, więc „wężyk” zaczynamy od góry z prawej. Rozwiązanie: $[-2,1]\cup[3,\infty)$.

**Krotność.** $(x-2)^{2}(x+1)<0$: przy $x=2$ znak się nie zmienia. Wartości ujemne dla $x<-1$.

**Dwukwadratowe.** $x^{4}-5x^{2}+4=0$: $t^{2}-5t+4=0$, $t=1$ lub $t=4$, więc $x\in\{-2,-1,1,2\}$.
