---
title: Równania i nierówności kwadratowe
summary:
  - 'Równanie $ax^{2}+bx+c=0$ rozwiązujemy przez wyróżnik $\Delta=b^{2}-4ac$.'
  - '$\Delta>0$: dwa rozwiązania, $\Delta=0$: jedno, $\Delta<0$: brak rozwiązań rzeczywistych.'
  - 'Gdy brakuje $b$ albo $c$, szybciej jest rozłożyć na czynniki niż liczyć $\Delta$.'
  - 'Nierówność kwadratową odczytujemy z wykresu: parabola nad osią ($>0$) albo pod osią ($<0$).'
mistakes:
  - 'Dzielenie przez $x$ w $x^{2}=3x$: gubi się rozwiązanie $x=0$.'
  - 'Zły znak w $\Delta$, gdy $c$ jest ujemne: $-4ac$ staje się dodatnie.'
  - 'Odczytanie przedziału odwrotnie: dla $a>0$ nierówność $<0$ ma rozwiązania **między** pierwiastkami.'
cheatsheet:
  - label: 'Wyróżnik'
    formula: '$\Delta=b^{2}-4ac$'
  - label: 'Pierwiastki'
    formula: '$x_{1,2}=\frac{-b\pm\sqrt{\Delta}}{2a}$'
  - label: 'Pierwiastek podwójny'
    formula: '$\Delta=0:\ x_{0}=-\frac{b}{2a}$'
  - label: 'Postać iloczynowa'
    formula: '$a(x-x_{1})(x-x_{2})$'
  - label: 'Wzory Viète’a'
    formula: '$x_{1}+x_{2}=-\frac{b}{a},\ x_{1}x_{2}=\frac{c}{a}$'
reviewed: false
updatedAt: 2026-10-27
---

Równanie kwadratowe ma najwyżej dwa rozwiązania. Najpierw sprawdź, czy da się je rozwiązać bez $\Delta$:

- $x^{2}-9=0$: $x^{2}=9$, więc $x=3$ lub $x=-3$;
- $x^{2}-5x=0$: $x(x-5)=0$, więc $x=0$ lub $x=5$.

W pozostałych przypadkach liczymy $\Delta$. Dla $x^{2}-5x+6=0$: $\Delta=25-24=1$, $x_{1}=\frac{5-1}{2}=2$, $x_{2}=\frac{5+1}{2}=3$.

**Nierówność** $x^{2}-5x+6<0$. Ramiona paraboli są skierowane w górę ($a=1>0$), miejsca zerowe to $2$ i $3$. Parabola jest pod osią między miejscami zerowymi: $x\in(2,3)$. Dla $x^{2}-5x+6\ge 0$ bierzemy resztę osi razem z końcami: $(-\infty,2]\cup[3,\infty)$.
