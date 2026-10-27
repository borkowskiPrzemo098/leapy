# Leapy — brief właściciela (źródło wymagań)

Pełny prompt startowy przekazany 2026-10-27. Skrót najważniejszych wymagań:

- PWA mobile-first, PL, hasło „Skocz na wyższy poziom.", motyw skoku (leap).
- Koszt 0 zł: brak AI w runtime, brak serwera, statyczna treść, Cloudflare Pages + GitHub.
- Brak kont na MVP: IndexedDB (Dexie), eksport/import JSON, warstwa `storage` za interfejsem.
- Treści wyłącznie oryginalne, `reviewed: false` do weryfikacji człowieka, skrypty weryfikujące obliczenia, „Zgłoś błąd".
- RODO: bez cookies śledzących, Cloudflare Web Analytics, fonty lokalne, polityka prywatności, regulamin, niezależność od CKE.
- Jakość: Lighthouse mobile ≥ 95, WCAG 2.2 AA, reduced-motion, dark mode, klawiatura.
- Stack: Vite + React 18 + TS strict, React Router, Tailwind (tokeny CSS), Zustand, Dexie, Zod, vite-plugin-pwa, KaTeX, prerender SEO, Vitest, Playwright, ESLint/Prettier, GitHub Actions.
- Logo: 3 koncepcje SVG w `brand/concepts/` (A „Skok L", B „Schody", C „Ikona"), rekomendacja + pełny zestaw assetów.
- Nawigacja: bottom tab bar (Start, Egzaminy, Ćwicz, Postępy, Profil) → sidebar na desktopie.
- Hierarchia: Egzamin → Przedmiot → Dział → Temat → Lekcja + Zadania; nowy egzamin = nowe pliki treści.
- Faza 1: E8 (polski, matematyka, angielski), Matura (mat. podst./rozsz., polski, angielski podst./rozsz.); 25–40 zadań/dział, 1 lekcja/temat.
- Funkcje: onboarding, pulpit, katalog, tryby nauki (SRS, błędy, fiszki, egzamin próbny), ekran zadania, postępy, grywalizacja bez dark patterns, ustawienia, wyszukiwarka (MiniSearch), karty do udostępniania (canvas 1080×1350 / 1080×1920), strony SEO + blog, lokalne przypomnienia.
- Monetyzacja: feature flags free/premium, opis weryfikacji licencji w `docs/monetization.md` — bez wdrażania płatności.
- Marketing: `docs/marketing/` — 30 postów FB/IG, wytyczne marki, szablony, darmowe narzędzia.
- Etapy E0–E6, po każdym: testy, lint, build, commit.
