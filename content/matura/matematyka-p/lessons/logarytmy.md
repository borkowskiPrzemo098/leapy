---
title: Logarytmy
summary:
  - '$\log_{a}b=c$ znaczy dokładnie $a^{c}=b$. To pytanie: do jakiej potęgi podnieść $a$, żeby dostać $b$?'
  - 'Podstawa: $a>0$ i $a\neq 1$. Liczba logarytmowana: $b>0$.'
  - 'Suma logarytmów to logarytm iloczynu, różnica to logarytm ilorazu.'
  - '$\log$ bez podstawy to logarytm dziesiętny: $\log 100=2$.'
mistakes:
  - 'Logarytm sumy rozbity na sumę: $\log_{2}(4+4)\neq\log_{2}4+\log_{2}4$.'
  - 'Dodawanie logarytmów o różnych podstawach jednym wzorem.'
  - 'Przyjęcie ujemnej podstawy, np. $a=-3$, gdy $a^{4}=81$.'
cheatsheet:
  - label: 'Definicja'
    formula: '$\log_{a}b=c\iff a^{c}=b$'
  - label: 'Logarytm iloczynu'
    formula: '$\log_{a}(xy)=\log_{a}x+\log_{a}y$'
  - label: 'Logarytm ilorazu'
    formula: '$\log_{a}\frac{x}{y}=\log_{a}x-\log_{a}y$'
  - label: 'Logarytm potęgi'
    formula: '$\log_{a}x^{k}=k\log_{a}x$'
  - label: 'Zmiana podstawy'
    formula: '$\log_{a}b=\frac{\log_{c}b}{\log_{c}a}$'
  - label: 'Wartości stałe'
    formula: '$\log_{a}1=0,\ \log_{a}a=1$'
reviewed: false
updatedAt: 2026-10-27
---

Logarytm odwraca potęgowanie. Skoro $2^{5}=32$, to $\log_{2}32=5$. Większość zadań maturalnych z logarytmów sprowadza się do zapisania liczby jako potęgi podstawy.

**Jak liczyć w pamięci.** Zapisz liczbę logarytmowaną jako potęgę podstawy:

$$\log_{3}\frac{1}{9}=\log_{3}3^{-2}=-2,\qquad \log_{4}8=\log_{4}4^{\frac{3}{2}}=\frac{3}{2}$$

**Wzory działają w obie strony.** $\log_{6}4+\log_{6}9$ możesz zwinąć do $\log_{6}36=2$. Odwrotnie, $\log_{3}(9x)$ rozwijasz do $2+\log_{3}x$. Szukaj kierunku, który prowadzi do liczby całkowitej.

**Współczynnik przed logarytmem** przenosisz do wykładnika: $2\log_{5}3=\log_{5}9$. Dopiero wtedy możesz łączyć logarytmy w jeden.

**Szacowanie.** Gdy wynik nie jest całkowity, znajdź dwie sąsiednie potęgi: $2^{3}=8<10<16=2^{4}$, więc $3<\log_{2}10<4$. To wystarcza w zadaniach na porównywanie liczb.
