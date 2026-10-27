---
cheatsheet:
  - label: 'Zmiana podstawy'
    formula: '$\log_{a}b=\frac{\log_{c}b}{\log_{c}a}$'
  - label: 'Odwrotność'
    formula: '$\log_{a}b=\frac{1}{\log_{b}a}$'
  - label: 'Potęga i logarytm'
    formula: '$a^{\log_{a}b}=b$'
  - label: 'Nierówność, $0<a<1$'
    formula: '$\log_{a}x>\log_{a}y\iff x<y$'
title: 'Logarytmy (poziom rozszerzony)'
summary:
  - 'Zmiana podstawy: $\log_{a}b=\frac{\log_{c}b}{\log_{c}a}$.'
  - 'Równania logarytmiczne: najpierw dziedzina (argumenty dodatnie, podstawa dodatnia i różna od $1$).'
  - 'Funkcja $\log_{a}x$ rośnie dla $a>1$ i maleje dla $0<a<1$ — od tego zależy kierunek nierówności.'
  - '$a^{\log_{a}b}=b$ oraz $\log_{a}a^{x}=x$.'
mistakes:
  - 'Pominięcie dziedziny w równaniu logarytmicznym.'
  - 'Brak zmiany zwrotu nierówności dla podstawy z przedziału $(0,1)$.'
  - '$\log(a+b)=\log a+\log b$.'
reviewed: false
updatedAt: '2026-10-27'
---

**Równanie.** $\log_{2}(x+1)+\log_{2}(x-1)=3$. Dziedzina: $x>1$. Łączymy: $\log_{2}(x^{2}-1)=3$, czyli $x^{2}-1=8$, $x=\pm 3$. Dziedzinę spełnia tylko $x=3$.

**Nierówność.** $\log_{\frac{1}{2}}(x-2)>-1$. Dziedzina $x>2$. Podstawa $<1$, więc zmieniamy zwrot: $x-2<2$, $x<4$. Wynik: $(2,4)$.

**Zmiana podstawy** przydaje się przy obliczeniach: $\log_{4}8=\frac{\log_{2}8}{\log_{2}4}=\frac{3}{2}$.
