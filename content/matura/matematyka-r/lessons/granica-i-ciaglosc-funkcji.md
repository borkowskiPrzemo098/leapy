---
cheatsheet:
  - label: 'Ciągłość'
    formula: '$\lim_{x\to x_{0}}f(x)=f(x_{0})$'
  - label: 'Symbol 0/0'
    formula: '$\lim_{x\to 2}\frac{x^{2}-4}{x-2}=\lim(x+2)=4$'
  - label: 'Granica jednostronna'
    formula: '$\lim_{x\to x_{0}^{-}}$, $\lim_{x\to x_{0}^{+}}$'
title: 'Granica i ciągłość funkcji'
summary:
  - 'Granica funkcji w punkcie: wartość, do której zbliża się $f(x)$, gdy $x\to x_{0}$.'
  - 'Funkcja jest ciągła w $x_{0}$, gdy $\lim_{x\to x_{0}}f(x)=f(x_{0})$.'
  - 'Symbol $\frac{0}{0}$: rozkładamy na czynniki i skracamy.'
  - 'Granice jednostronne muszą być równe, żeby istniała granica.'
mistakes:
  - 'Podstawienie dającego $\frac{0}{0}$ i uznanie, że granica nie istnieje.'
  - 'Brak sprawdzenia granic jednostronnych dla funkcji „sklejanej”.'
  - 'Mylenie ciągłości z różniczkowalnością.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** $\lim_{x\to 3}\frac{x^{2}-9}{x-3}$: podstawienie daje $\frac{0}{0}$. Rozkład: $\frac{(x-3)(x+3)}{x-3}=x+3\to 6$.

**Ciągłość z parametrem.** $f(x)=\begin{cases}x^{2}, & x<1\\ ax+1, & x\ge 1\end{cases}$ jest ciągła, gdy $1=a+1$, czyli $a=0$.
