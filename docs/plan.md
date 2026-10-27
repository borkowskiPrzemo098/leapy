# Leapy — plan budowy

Status: do akceptacji właściciela (2026-10-27). Decyzje i uzasadnienia: [decisions.md](decisions.md). Wymagania: [brief.md](brief.md).

## 1. Architektura w jednym zdaniu

Jedna statyczna aplikacja Vite + React 18 + TS, prerenderowana (vite-react-ssg) dla stron publicznych i działająca jako PWA offline dla części „aplikacyjnej". Treść to pliki w `content/`, walidowane Zod w czasie builda i kompilowane do porcji JSON (per przedmiot), które service worker cache'uje. Postęp ucznia żyje tylko w IndexedDB za interfejsem `ProgressStore`.

```
content/*.json|md ──(content:build: Zod + verify + dedupe + coverage)──▶ public/data/<exam>/<subject>.json
                                                                         │
     src/ (React) ── routes publiczne (prerender, SEO) ──────────────────┤
                  └─ routes /app/* (CSR, offline) ── engine ── storage (Dexie) ── backup JSON
```

## 2. Struktura folderów

```
leapy/
├─ brand/                 logo: concepts/A|B|C.svg, final/ (poziome, pionowe, znak, mono, dark), README.md
├─ content/
│  ├─ exams/<exam>.json            metadane egzaminu (nazwa, format próbnego egzaminu, przedmioty)
│  └─ <exam>/<subject>/
│     ├─ subject.json              działy → tematy (kolejność, nazwy, slugi)
│     ├─ lessons/<topic>.md        frontmatter + notatka, „30 sekund", typowe błędy, ściąga
│     ├─ tasks/<topic>.json        tablica zadań
│     └─ flashcards/<deck>.json
├─ scripts/
│  ├─ content/  check.ts, build.ts, coverage.ts, dedupe.ts
│  ├─ verify/   verifiers per typ (obliczenia: mathjs Fraction/BigNumber)
│  └─ brand/    generowanie PNG/ikon/OG z SVG (sharp/resvg)
├─ src/
│  ├─ app/          shell, router, layout (tab bar ↔ sidebar), providers
│  ├─ routes/       public/ (home, egzamin, przedmiot, temat, FAQ, blog, prawne, cennik) + app/ (start, egzaminy, cwicz, postepy, profil, sesja, egzamin-probny, onboarding)
│  ├─ features/     task-player, session, srs, mock-exam, stats, gamification, share-cards, search, onboarding, settings, reminders
│  ├─ content/      schema.ts (Zod, współdzielony ze skryptami), loader, typy
│  ├─ storage/      ProgressStore (interfejs), dexie/ implementacja, backup (eksport/import + Zod)
│  ├─ flags/        feature flags free/premium (bez płatności)
│  ├─ ui/           komponenty bazowe (Button, Card, Ring, ProgressBar, Sheet, Toast, Skeleton, Empty)
│  ├─ styles/       tokens.css (light/dark), tailwind entry, fonts (Fontsource, lokalnie)
│  └─ lib/          markdown+KaTeX render, date, a11y, motion
├─ blog/            *.mdx
├─ tests/  e2e/ (Playwright 360×640, 390×844, desktop)
├─ docs/   decisions.md, monetization.md, deployment.md, content-guide.md, marketing/
└─ CLAUDE.md, README.md, .github/workflows/ci.yml
```

## 3. Model danych

**Treść (Zod, `src/content/schema.ts`)** — zgodnie z briefem: `Task { id, exam, subject, topic, type: single|multi|truefalse|numeric|ordering|match|short, difficulty 1–5, prompt, options?, answer, explanation, hint?, tags, source: "original", reviewed, updatedAt, verify? }`. Schemat `answer` jest dyskryminowany po `type` (np. `numeric` ma `value` + `tolerance` + akceptowane formy, `short` ma listę akceptowanych odpowiedzi po normalizacji). Opcjonalne pole `verify` to wyrażenie liczone przez skrypt i porównywane z `answer`. Lekcja: frontmatter `{ topic, title, summary30s, mistakes[], cheatsheet[] }` + treść Markdown.

**ID**: `<exam>.<subject>.<topic>.<nnn>` (np. `matura.mat-p.funkcja-kwadratowa.014`) — stabilne, bo od nich zależą postępy w IndexedDB.

**Postęp (Dexie)**:

- `attempts` (taskId, ts, correct, ms, mode) — surowa historia
- `srs` (taskId, ease, interval, due, reps, lapses) — stan powtórek
- `sessions` (id, mode, start, end, scope, wynik)
- `profile` (singleton: egzaminy, data egzaminu, cel dzienny, ustawienia, XP, serie, zamrożenia)
- `bookmarks`, `badges`, `mockExams`
- `meta` (schemaVersion — migracje Dexie + wersja kopii zapasowej)

Statystyki, poziomy i przewidywany wynik liczone są z `attempts`, a nie zapisywane osobno (jedno źródło prawdy, łatwy import).

## 4. Etapy (każdy kończy się: lint + testy + build + commit + push)

| Etap   | Zakres                                                                                                                                                                                       | Kryterium „gotowe"                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **E0** | Scaffold Vite/TS strict, Tailwind + tokeny, Fontsource, ESLint/Prettier, Vitest, CI, `CLAUDE.md`, komponenty bazowe, 3 koncepcje logo → wybór + pełny zestaw assetów                         | CI zielone, strona z komponentami/logo działa w obu motywach     |
| **E1** | Shell, tab bar ↔ sidebar, routing, safe-area/100dvh, PWA (manifest, SW, offline, baner instalacji, aktualizacje), motyw jasny/ciemny/auto, przejścia i skeletony                             | instalacja + offline działa, nawigacja klawiaturą                |
| **E2** | Schemat Zod, `content:check`/`content:build` (dedupe, braki, pokrycie, weryfikatory) blokujące build, silnik zadań (7 typów), sesja, Dexie + eksport/import                                  | testy silnika i zapisu, próbna partia treści przechodzi pipeline |
| **E3** | SRS (SM-2, w pełni testowany), powtórka błędów, fiszki, egzamin próbny z timerem i punktacją, statystyki + wykresy SVG, kalendarz aktywności                                                 | testy SRS, egzamin próbny end-to-end                             |
| **E4** | XP, poziomy-stopnie, serie + zamrożenie, odznaki, cele tygodniowe, onboarding 30 s z testem diagnostycznym, karty do udostępniania (canvas, Web Share), lokalne przypomnienia, feature flags | ścieżka nowego użytkownika od zera do pierwszej karty            |
| **E5** | Treści Fazy 1 partiami (po przedmiocie), strony SEO, blog MDX, sitemap/robots/JSON-LD/OG, FAQ, prawne, cennik-szkielet, `docs/monetization.md`, `docs/marketing/`                            | raport pokrycia: ≥25 zadań/dział, 1 lekcja/temat                 |
| **E6** | WCAG 2.2 AA audit, Lighthouse ≥95, Playwright smoke na 3 viewportach, polish, README + instrukcja Cloudflare Pages + domena, raport końcowy                                                  | Definition of Done z briefu                                      |

Realnie E0–E4 to kod (kilka sesji), E5 to głównie treść i będzie najdłuższy.

## 5. Skala treści Fazy 1 (szacunek)

E8: 3 przedmioty, Matura: 5 wariantów przedmiotów → ok. 50–60 działów. Przy 25–40 zadaniach na dział daje to **ok. 1500–2200 zadań** i ok. 200–250 lekcji. Generowane partiami po jednym dziale, każda partia przez `content:check` + weryfikatory; wszystko z `reviewed: false`.

## 6. Ryzyka

1. **Weryfikacja treści przez człowieka** — 2000 zadań to tygodnie przeglądu. Mitygacja: raport `content:report` sortuje po ryzyku (typy nieweryfikowalne maszynowo, język polski, wysoka trudność), UI pokazuje znaczek „niezweryfikowane" tylko w trybie deweloperskim, przycisk „Zgłoś błąd" zbiera uwagi.
2. **Język polski / angielski** — odpowiedzi otwarte (`short`) nie dają się dobrze oceniać bez AI. Mitygacja: przewaga typów zamkniętych, `short` tylko dla jednoznacznych odpowiedzi; wypracowania jako samoocena z kryteriami (bez automatycznej oceny).
3. **Lighthouse ≥95 przy KaTeX i React** — mitygacja: KaTeX ładowany leniwie tylko na ekranach z wzorami, prerender stron publicznych, podział kodu per trasa, budżet bundla w CI.
4. **iOS PWA** — ograniczone powiadomienia i Web Share plików; mitygacja: wykrywanie wsparcia i pobranie pliku jako fallback.
5. **Rozjazd ID treści a postępów** — zmiana ID kasuje historię. Mitygacja: `content:check` porównuje z poprzednim manifestem i blokuje usunięcie/zmianę ID bez wpisu w `content/renames.json`.
6. **Format egzaminów** — punktacja próbnych egzaminów „zbliżona" do realnej, opis formatu z jawnym zastrzeżeniem i linkiem do cke.gov.pl.

## 7. Otwarte kwestie (nieblokujące, wrócę do nich w E5/E6)

- Dane administratora do polityki prywatności i regulaminu (imię/firma, e-mail kontaktowy) — do tego czasu placeholdery oznaczone `TODO-OWNER`.
- E-mail do „Zgłoś błąd" — j.w.
- Własna domena — instrukcja w README, podpięcie po stronie właściciela.
