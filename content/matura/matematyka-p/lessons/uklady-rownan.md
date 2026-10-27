---
title: Układy równań liniowych
summary:
  - 'Rozwiązanie układu to para liczb $(x,y)$, która spełnia **oba** równania naraz.'
  - 'Metoda podstawiania: wyznacz jedną niewiadomą z jednego równania i wstaw do drugiego.'
  - 'Metoda przeciwnych współczynników: dodaj równania tak, żeby jedna niewiadoma zniknęła.'
  - 'Układ może mieć jedno rozwiązanie, żadnego (proste równoległe) albo nieskończenie wiele (ta sama prosta).'
mistakes:
  - 'Wstawienie wyniku z powrotem do tego samego równania, z którego wyznaczono niewiadomą: zawsze wyjdzie tożsamość.'
  - 'Pomnożenie tylko jednej strony równania przy metodzie przeciwnych współczynników.'
  - 'Podanie samego $x$ bez $y$.'
cheatsheet:
  - label: 'Podstawianie'
    formula: '$y=2x-1\Rightarrow$ wstaw do drugiego równania'
  - label: 'Przeciwne współczynniki'
    formula: '$\begin{cases}x+y=5\\ x-y=1\end{cases}\Rightarrow 2x=6$'
  - label: 'Układ sprzeczny'
    formula: '$\begin{cases}x+y=1\\ x+y=3\end{cases}$'
  - label: 'Układ nieoznaczony'
    formula: '$\begin{cases}x+y=1\\ 2x+2y=2\end{cases}$'
reviewed: false
updatedAt: 2026-10-27
---

Każde równanie liniowe z dwiema niewiadomymi to prosta na płaszczyźnie. Rozwiązanie układu to punkt wspólny dwóch prostych.

**Przykład podstawiania.** Z $\begin{cases}y=2x-1\\ 3x+y=9\end{cases}$ wstawiamy $y$ do drugiego równania: $3x+2x-1=9$, czyli $5x=10$, $x=2$. Wtedy $y=2\cdot 2-1=3$. Rozwiązanie: $(2,3)$.

**Przykład przeciwnych współczynników.** $\begin{cases}2x+3y=12\\ 2x-y=4\end{cases}$. Odejmujemy równania: $4y=8$, $y=2$, a z drugiego $2x=6$, $x=3$.

Na końcu sprawdź oba równania. To trwa kilka sekund i wyłapuje większość pomyłek w znakach.
