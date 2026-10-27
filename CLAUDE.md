# Leapy: zasady projektu

Polskojęzyczna PWA do nauki i egzaminów. Hasło: „Skocz na wyższy poziom.”
Wymagania: [docs/brief.md](docs/brief.md) · plan etapów: [docs/plan.md](docs/plan.md) · decyzje: [docs/decisions.md](docs/decisions.md) · produkt: [PRODUCT.md](PRODUCT.md) · system wizualny: [DESIGN.md](DESIGN.md)

## Ograniczenia, których nie łamiemy

- **0 zł**: żadnych płatnych API, serwera ani bazy. Żadnego AI/LLM w działającej aplikacji; treść jest statyczna i powstaje przy budowie.
- **Bez kont na MVP**: postęp w IndexedDB (Dexie) za interfejsem `ProgressStore` w `src/storage/`. Eksport i import JSON.
- **Treści wyłącznie oryginalne.** Nie kopiujemy arkuszy CKE, podręczników ani baz pytań. Linkujemy do cke.gov.pl. Nie sugerujemy powiązań z CKE/MEN/uczelniami.
- **Każde nowe zadanie ma `reviewed: false`.** Obliczenia weryfikujemy skryptem (Node, mathjs). Błędna treść blokuje build.
- **RODO**: brak ciasteczek śledzących, tylko Cloudflare Web Analytics, fonty lokalnie (Fontsource), żadnych Google Fonts ani CDN.
- **Nie zmyślamy**: żadnych opinii, liczb użytkowników ani obietnic wyników. Przykładowe dane w UI oznaczamy jako przykładowe.
- **Jakość**: Lighthouse mobile ≥ 95, WCAG 2.2 AA, `prefers-reduced-motion`, motyw jasny i ciemny, pełna obsługa klawiatury, cele dotykowe ≥ 48 px.

## Stack

Vite 6 + React 18 + TypeScript strict · Tailwind v4 (tokeny jako zmienne CSS) · React Router · Zustand · Dexie · Zod · vite-plugin-pwa · KaTeX · vite-react-ssg (strony publiczne) · Vitest + Testing Library · Playwright · ESLint 9 + Prettier · GitHub Actions · hosting Cloudflare Pages.

## Komendy

| Komenda                 | Co robi                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | serwer deweloperski (port domyślny Vite)                                                                        |
| `npm run build`         | typecheck + build produkcyjny do `dist/`                                                                        |
| `npm run check`         | typecheck + lint + format:check + testy (to samo co CI)                                                         |
| `npm test`              | testy jednostkowe Vitest                                                                                        |
| `npm run test:e2e`      | testy Playwright na buildzie produkcyjnym (360×640, 390×844, desktop, offline)                                  |
| `npm run format`        | Prettier na całym repo                                                                                          |
| `npm run content:check` | waliduje treść (schemat, verify, duplikaty, stabilność id), nic nie zapisuje                                    |
| `npm run content:build` | to samo + zapis `public/data`, `content/ids.lock.json`, `docs/content-report.md` (odpala się przed dev i build) |
| `npm run brand:build`   | generuje wszystkie pliki logo, ikony PWA, favicon i obraz OG z `src/brand/geometry.js`                          |

Po każdym etapie: `npm run check` i `npm run build` muszą przejść, potem krótki commit i push.

## Konwencje

- Komponenty czytają **wyłącznie tokeny** (`bg-brand`, `text-ink-2`, `rounded-xl` itd.). Surowe kolory hex tylko w `src/styles/tokens.css` i w `src/brand/geometry.js`.
- Kolor marki (fiolet) niesie duże pola. Żółty (`reward`) tylko dla nagród, serii i postępu. Zielony i czerwony tylko dla poprawnej lub błędnej odpowiedzi i zawsze razem z ikoną.
- Ikony: `lucide-react`. Emoji i znaki Unicode nie zastępują ikon.
- Logo: geometria w `src/brand/geometry.js` jest jedynym źródłem. Nie edytuj ręcznie plików w `brand/final/` ani `public/icons/`: zmień geometrię i uruchom `npm run brand:build`.
- Animacje trwają `--dur-*` i znikają przy `prefers-reduced-motion` albo `data-motion="reduce"`.
- Teksty w UI po polsku, w formie neutralnej płciowo („Wracasz do tematu…”, a nie „skończyłeś”).
- Importy z aliasem `@/` (`src/`). Importy typów zawsze przez `import type`.
- Pliki testów obok kodu: `*.test.ts(x)`. Testy E2E w `tests/e2e/`.
- Ekrany aplikacji w `src/routes/` (lazy, poza Start), owinięte w `<Page>` (tytuł, fokus na nagłówku po nawigacji). Nawigacja w `src/app/nav.ts`, jedno źródło dla dolnego paska i panelu bocznego.
- Przycisk, który prowadzi do innego ekranu, to `<ButtonLink>`, nie `<Button onClick={navigate}>`.
- Przewodnik po komponentach: `/dev/ui` (nielinkowany z aplikacji).

## Treść

Szczegóły: [docs/content-guide.md](docs/content-guide.md). Najważniejsze:

- Hierarchia: Egzamin → Przedmiot → Dział → Temat → Lekcja + Zadania. Nowy egzamin = nowe pliki w `content/`, bez zmian w kodzie.
- ID zadań są stabilne (`<egzamin>.<przedmiot>.<temat>.NNN`). Nigdy ich nie zmieniaj ani nie usuwaj bez wpisu w `content/renames.json`.
- Każde nowe zadanie i lekcja: `source: "original"`, `reviewed: false`. Zadania obliczeniowe dostają `verify`.
- Treść generujemy partiami. Po każdej partii `npm run content:build` i przegląd `docs/content-report.md`.

## Architektura w skrócie

- `src/content/schema.ts`: Zod dla treści (build i typy; aplikacja nie importuje go w czasie działania, stała wersji jest w `version.ts`).
- `src/content/data.ts`: wczytywanie `/data/*.json` + `useResource`.
- `src/engine/`: czyste funkcje: ocenianie 7 typów zadań, losowanie, sesja, powtórki (`srs.ts`, SM-2 za interfejsem `Scheduler`), egzamin próbny (`mock.ts`), statystyki (`stats.ts`, dni lokalne). Bez Reacta, bez IndexedDB i bez odczytu zegara: `now` zawsze przychodzi z zewnątrz.
- `src/features/study/queries.ts`: łączy magazyn z treścią (co na dziś do powtórki, błędy, zadania po id) i zapisuje powtórki (`recordReview`).
- Stan SRS jest w tabeli `srs` (klucz: id zadania albo fiszki, fiszki mają `.card.` w id). Rozpoczęty egzamin próbny leży w `kv` pod `mock:active`, ostatni oddany pod `mock:last`.
- `src/storage/`: interfejs `ProgressStore` + implementacja Dexie + format kopii zapasowej. UI woła tylko `progress()`.
- Zapisy do IndexedDB nigdy wewnątrz updatera `setState` (StrictMode wywołuje je dwa razy).
- Dexie ładujemy dynamicznie (`import('@/storage')`) tam, gdzie kod trafia do pierwszego ekranu.
