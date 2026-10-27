---
title: Wartość bezwzględna
summary:
  - '$|x|$ to odległość liczby $x$ od zera na osi liczbowej, więc nigdy nie jest ujemna.'
  - '$|x|=x$ dla $x\ge 0$ oraz $|x|=-x$ dla $x<0$.'
  - '$|x-a|$ to odległość między $x$ a $a$. Stąd $|x-a|<r$ to przedział $(a-r,\ a+r)$.'
  - 'Równanie $|x|=c$ ma dwa rozwiązania dla $c>0$, jedno dla $c=0$ i żadnego dla $c<0$.'
mistakes:
  - 'Zapis $|-x|=x$ dla każdego $x$. Prawdziwe jest $|-x|=|x|$.'
  - 'Zgubienie drugiego rozwiązania: z $|x-3|=5$ wychodzi $x=8$ **lub** $x=-2$.'
  - 'Pomylenie kierunku: $|x|>2$ to $x<-2$ lub $x>2$, a nie przedział $(-2,2)$.'
cheatsheet:
  - label: 'Definicja'
    formula: '$|x|=\begin{cases}x, & x\ge 0\\ -x, & x<0\end{cases}$'
  - label: 'Równanie'
    formula: '$|x-a|=r\iff x=a-r\ \lor\ x=a+r$'
  - label: 'Nierówność „mniejsze”'
    formula: '$|x-a|<r\iff a-r<x<a+r$'
  - label: 'Nierówność „większe”'
    formula: '$|x-a|>r\iff x<a-r\ \lor\ x>a+r$'
  - label: 'Iloczyn i iloraz'
    formula: '$|xy|=|x|\cdot|y|,\ \left|\frac{x}{y}\right|=\frac{|x|}{|y|}$'
reviewed: false
updatedAt: 2026-10-27
---

Najprościej myśleć o wartości bezwzględnej jako o **odległości**. Liczby $5$ i $-5$ leżą tak samo daleko od zera, więc $|5|=|-5|=5$.

Ta sama myśl rozwiązuje równania i nierówności. Zapis $|x-2|=3$ czytamy: „$x$ jest odległe od $2$ o $3$”. Na osi od punktu $2$ idziemy o $3$ w prawo i w lewo: $x=5$ albo $x=-1$.

Nierówność $|x-2|<3$ to punkty bliżej niż $3$ od liczby $2$, czyli przedział $(-1,5)$. Nierówność $|x-2|\ge 3$ to wszystko poza tym przedziałem: $x\le -1$ lub $x\ge 5$.

**Pierwiastek z kwadratu.** Dla każdej liczby $\sqrt{x^{2}}=|x|$. Dlatego $\sqrt{(1-\sqrt{3})^{2}}=|1-\sqrt{3}|=\sqrt{3}-1$, bo $1-\sqrt{3}<0$.
