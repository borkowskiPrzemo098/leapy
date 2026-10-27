---
cheatsheet:
  - label: 'Potęga'
    formula: "$(x^{n})'=nx^{n-1}$"
  - label: 'Iloczyn'
    formula: "$(fg)'=f'g+fg'$"
  - label: 'Iloraz'
    formula: '$\left(\frac{f}{g}\right)''=\frac{f''g-fg''}{g^{2}}$'
  - label: 'Styczna'
    formula: "$y=f'(x_{0})(x-x_{0})+f(x_{0})$"
title: 'Pochodna funkcji'
summary:
  - "Pochodna $f'(x_{0})$ to współczynnik kierunkowy stycznej do wykresu w punkcie $x_{0}$."
  - "Wzory: $(x^{n})'=nx^{n-1}$, $(c)'=0$, $(f+g)'=f'+g'$, $(cf)'=cf'$."
  - 'Iloczyn i iloraz: $(fg)''=f''g+fg''$, $\left(\frac{f}{g}\right)''=\frac{f''g-fg''}{g^{2}}$.'
  - "$f'>0$ — funkcja rośnie; $f'<0$ — maleje; ekstremum tam, gdzie $f'$ zmienia znak."
mistakes:
  - "Uznanie każdego $f'(x)=0$ za ekstremum (musi być zmiana znaku)."
  - 'Zły wzór na pochodną ilorazu (kolejność w liczniku).'
  - 'Równanie stycznej bez wartości $f(x_{0})$.'
reviewed: false
updatedAt: '2026-10-27'
---

**Przykład.** $f(x)=x^{3}-3x$: $f'(x)=3x^{2}-3=3(x-1)(x+1)$. $f'$ zmienia znak z $+$ na $-$ w $x=-1$ (maksimum $f(-1)=2$) i z $-$ na $+$ w $x=1$ (minimum $f(1)=-2$).

**Styczna.** Do $f(x)=x^{2}$ w punkcie $x_{0}=3$: $f'(3)=6$, $f(3)=9$, więc $y=6(x-3)+9=6x-9$.
