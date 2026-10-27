---
title: Wyrażenia wymierne
summary:
  - 'Wyrażenie wymierne to iloraz dwóch wielomianów, np. $\frac{x+1}{x-2}$.'
  - 'Dziedzina: wszystkie liczby, dla których mianownik jest różny od zera.'
  - 'Skracać wolno tylko **czynniki**, nigdy składniki: najpierw rozłóż licznik i mianownik.'
  - 'Dodawanie i odejmowanie: sprowadź do wspólnego mianownika, jak przy ułamkach.'
mistakes:
  - 'Skracanie składników: $\frac{x+2}{x}\neq 2$.'
  - 'Pominięcie dziedziny: po skróceniu $\frac{x^{2}-4}{x-2}=x+2$ nadal $x\neq 2$.'
  - 'Zgubiony nawias przy odejmowaniu: $\frac{1}{x}-\frac{x-1}{x}=\frac{1-(x-1)}{x}$.'
cheatsheet:
  - label: 'Dziedzina'
    formula: '$\frac{W(x)}{Q(x)}:\ Q(x)\neq 0$'
  - label: 'Dodawanie'
    formula: '$\frac{a}{b}+\frac{c}{d}=\frac{ad+bc}{bd}$'
  - label: 'Mnożenie'
    formula: '$\frac{a}{b}\cdot\frac{c}{d}=\frac{ac}{bd}$'
  - label: 'Dzielenie'
    formula: '$\frac{a}{b}:\frac{c}{d}=\frac{a}{b}\cdot\frac{d}{c}$'
  - label: 'Równanie wymierne'
    formula: '$\frac{W(x)}{Q(x)}=0\iff W(x)=0\ \land\ Q(x)\neq 0$'
reviewed: false
updatedAt: 2026-10-27
---

Z wyrażeniami wymiernymi liczymy tak jak z ułamkami zwykłymi. Różnica jest jedna: w mianowniku stoi wyrażenie z $x$, więc trzeba pilnować, żeby nie dzielić przez zero.

**Dziedzina** to pierwszy krok w każdym zadaniu. Dla $\frac{3}{x^{2}-9}$ mianownik zeruje się dla $x=3$ i $x=-3$, więc dziedzina to $\mathbb{R}\setminus\{-3,3\}$.

**Skracanie.** Rozkładamy na czynniki i skracamy te same czynniki: $\frac{x^{2}-9}{x+3}=\frac{(x-3)(x+3)}{x+3}=x-3$ dla $x\neq -3$.

**Równanie wymierne.** Ułamek jest równy zeru, gdy zeruje się licznik, a mianownik nie. W $\frac{x^{2}-1}{x-1}=0$ licznik zeruje się dla $x=\pm 1$, ale $x=1$ nie należy do dziedziny, więc jedynym rozwiązaniem jest $x=-1$.
