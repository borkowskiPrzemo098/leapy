# Decyzje projektowe

Format: data — decyzja — uzasadnienie. Zmiana decyzji = nowy wpis, starych nie kasujemy.

- **2026-10-27 — Repozytorium GitHub prywatne (`borkowskiPrzemo098/leapy`).** Produkt komercyjny z przyszłym premium; Cloudflare Pages obsługuje prywatne repo za darmo. Można upublicznić w każdej chwili, odwrotnie (po indeksacji) już nie.
- **2026-10-27 — React 18.3 (nie 19).** Zgodnie z briefem; ekosystem (vite-react-ssg, Testing Library) stabilny na 18.
- **2026-10-27 — Prerender: vite-react-ssg zamiast Astro.** Jeden stos, jeden router i współdzielone komponenty dla stron publicznych i aplikacji. Astro dałby lepszy wynik HTML-first, ale wymusiłby dwa systemy budowania i duplikację komponentów. Fallback, jeśli vite-react-ssg okaże się niestabilne: własny skrypt `renderToString` dla listy tras publicznych.
- **2026-10-27 — Weryfikacja obliczeń w Node (mathjs Fraction/BigNumber), nie Python/sympy.** Na maszynie właściciela nie ma Pythona; `content:check` musi działać identycznie lokalnie i w CI. Dla nielicznych przypadków symbolicznych (np. pochodne na studiach w Fazie 2) można dodać opcjonalny job CI z sympy.
- **2026-10-27 — SRS: wariant SM-2 za interfejsem `Scheduler`.** Prosty, przewidywalny, w pełni testowalny bez danych treningowych, których FSRS potrzebuje. Interfejs pozwala podmienić na FSRS po zebraniu historii.
- **2026-10-27 — Treść kompilowana do porcji JSON per przedmiot.** Service worker cache'uje tylko przedmioty wybrane przez ucznia (szybki pierwszy start); „pakiety offline całych przedmiotów" to naturalny punkt podziału free/premium.
- **2026-10-27 — Statystyki liczone z `attempts`, nie przechowywane.** Jedno źródło prawdy, trywialny eksport/import i migracje.
- **2026-10-27 — Font: Plus Jakarta Sans (Fontsource, self-hosted), subset latin-ext.** Pełne polskie znaki, zaokrąglony charakter, dobra czytelność w małych rozmiarach; Nunito wygląda bardziej dziecinnie, co kłóci się z grupą maturzystów/studentów.
- **2026-10-27 — Wypracowania i dłuższe odpowiedzi otwarte = samoocena z kryteriami.** Bez AI w runtime nie da się ich rzetelnie oceniać automatycznie.
