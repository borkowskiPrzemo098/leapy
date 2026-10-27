---
cheatsheet:
  - label: 'Bézout'
    formula: '$W(a)=0\iff (x-a)\mid W(x)$'
  - label: 'Reszta'
    formula: 'reszta z dzielenia przez $(x-a)$ to $W(a)$'
  - label: 'Pierwiastki całkowite'
    formula: 'dzielniki $a_{0}$ (gdy współczynniki całkowite)'
  - label: 'Grupowanie'
    formula: '$x^{3}-2x^{2}-x+2=(x-2)(x^{2}-1)$'
title: 'Wielomiany'
summary:
  - 'Wielomian stopnia $n$: $W(x)=a_{n}x^{n}+\ldots+a_{1}x+a_{0}$, $a_{n}\neq 0$.'
  - 'Twierdzenie Bézouta: $x_{0}$ jest pierwiastkiem $W$ wtedy i tylko wtedy, gdy $(x-x_{0})$ dzieli $W(x)$; reszta z dzielenia przez $(x-a)$ to $W(a)$.'
  - 'Pierwiastki całkowite wielomianu o współczynnikach całkowitych są dzielnikami wyrazu wolnego.'
  - 'Rozkład na czynniki: wyłączanie przed nawias, grupowanie, wzory skróconego mnożenia, schemat Hornera.'
mistakes:
  - 'Szukanie pierwiastków wymiernych poza dzielnikami wyrazu wolnego (dla $a_{n}=1$).'
  - 'Błąd znaku w twierdzeniu o reszcie: reszta z dzielenia przez $(x+2)$ to $W(-2)$.'
  - 'Pominięcie krotności pierwiastka.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład rozkładu.** $W(x)=x^{3}-2x^{2}-x+2$. Grupujemy: $x^{2}(x-2)-(x-2)=(x-2)(x^{2}-1)=(x-2)(x-1)(x+1)$. Pierwiastki: $2, 1, -1$.

**Reszta.** Reszta z dzielenia $W(x)=x^{3}+2x-5$ przez $(x-2)$ to $W(2)=8+4-5=7$.

**Parametr.** Jeśli $x=1$ jest pierwiastkiem $x^{3}+mx-4$, to $1+m-4=0$, więc $m=3$.
