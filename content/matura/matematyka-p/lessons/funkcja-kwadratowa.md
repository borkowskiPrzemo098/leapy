---
title: Funkcja kwadratowa
summary:
  - 'Postać ogólna $f(x)=ax^{2}+bx+c$, $a\neq 0$. Wykres to parabola.'
  - '$a>0$: ramiona w górę, funkcja ma najmniejszą wartość. $a<0$: ramiona w dół, ma największą.'
  - 'Wierzchołek $W=(p,q)$: $p=-\frac{b}{2a}$, $q=f(p)$ albo $q=-\frac{\Delta}{4a}$.'
  - 'Postać kanoniczna $f(x)=a(x-p)^{2}+q$ od razu pokazuje wierzchołek.'
mistakes:
  - 'Zły znak $p$: dla $f(x)=(x+2)^{2}-1$ wierzchołek to $(-2,-1)$, a nie $(2,-1)$.'
  - 'Szukanie najmniejszej wartości na przedziale tylko w wierzchołku, gdy wierzchołek leży poza przedziałem.'
  - 'Pomylenie $q$ z wyrazem wolnym $c$.'
cheatsheet:
  - label: 'Wierzchołek'
    formula: '$p=-\frac{b}{2a},\ q=-\frac{\Delta}{4a}$'
  - label: 'Postać kanoniczna'
    formula: '$f(x)=a(x-p)^{2}+q$'
  - label: 'Postać iloczynowa'
    formula: '$f(x)=a(x-x_{1})(x-x_{2})$'
  - label: 'Oś symetrii'
    formula: '$x=p=\frac{x_{1}+x_{2}}{2}$'
reviewed: false
updatedAt: 2026-10-27
---

Najwięcej informacji o paraboli daje wierzchołek. Dla $f(x)=x^{2}-6x+5$: $p=-\frac{-6}{2}=3$, $q=f(3)=9-18+5=-4$. Wierzchołek to $(3,-4)$, a ramiona idą w górę, więc najmniejsza wartość funkcji to $-4$, a zbiór wartości $[-4,\infty)$.

**Monotoniczność.** Przy $a>0$ funkcja maleje na $(-\infty,p]$ i rośnie na $[p,\infty)$. Przy $a<0$ odwrotnie.

**Wartość najmniejsza i największa na przedziale.** Liczymy wartości na końcach przedziału i w wierzchołku, **jeśli wierzchołek należy do przedziału**. Wybieramy najmniejszą i największą z nich.

**Oś symetrii** przechodzi przez środek między miejscami zerowymi: dla miejsc $1$ i $5$ to $x=3$.
