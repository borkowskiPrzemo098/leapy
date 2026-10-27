# Leapy

**Skocz na wyższy poziom.** Polskojęzyczna platforma PWA (mobile-first) do nauki i przygotowania do egzaminów: egzamin ósmoklasisty i matura na start. Darmowa, bez konta, działa offline. Postęp zostaje na urządzeniu.

> Status: **E5 ukończony**: treść Fazy 1 (177 lekcji, 1141 zadań, egzamin ósmoklasisty i matura), prerenderowane strony publiczne (SEO, JSON-LD, sitemap), blog, FAQ, cennik, polityka prywatności i regulamin, `docs/monetization.md`, `docs/marketing/`. Wcześniej (E4): XP i stopnie, seria z zamrożeniami, 12 odznak, cele dzienny i tygodniowy, onboarding z testem na start, karty do udostępniania (post i relacja), przypomnienia (kalendarz .ics i powiadomienie w otwartej aplikacji), feature flags. Wcześniej (E3): powtórki SM-2, tryb „Moje błędy”, fiszki z mini-ściąg, egzamin próbny z czasem i punktacją, statystyki z kalendarzem nauki. Wcześniej (E2): model treści z walidacją, silnik zadań (7 typów), sesje, zapis postępów i kopia zapasowa. Na start jest 30 przykładowych zadań z matematyki (matura, poziom podstawowy). Dalsze etapy: [docs/plan.md](docs/plan.md).

## Szybki start

```bash
npm install
npm run dev
```

| Komenda                 | Opis                                          |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | serwer deweloperski                           |
| `npm run build`         | typecheck + build do `dist/`                  |
| `npm run check`         | typecheck, lint, format, testy (jak w CI)     |
| `npm test`              | testy jednostkowe                             |
| `npm run test:e2e`      | testy Playwright (360, 390, desktop, offline) |
| `npm run content:check` | waliduje treść                                |
| `npm run content:build` | waliduje i kompiluje treść do `public/data`   |
| `npm run brand:build`   | regeneruje logo, ikony i obraz OG             |

## Struktura

```
brand/        koncepcje logo, gotowe pliki marki, README marki
content/      treść: egzaminy, przedmioty, lekcje (.md), zadania (.json)
docs/         brief, plan, decyzje, przewodnik po treści, raport pokrycia
public/       favicon, ikony PWA, obraz OG
scripts/      pipeline treści (content/), marka (brand/), zrzuty do przeglądu (dev/)
tests/e2e/    testy Playwright
src/
  app/        router, układ (dolny pasek / panel boczny), przewodnik /dev/ui
  features/   moduły funkcji (pwa: offline, aktualizacje, instalacja)
  routes/     ekrany: Start, Egzaminy, Ćwicz, Postępy, Profil, 404
  state/      ustawienia urządzenia i wybór egzaminu (Zustand)
  engine/     ocenianie zadań, losowanie, sesje (czyste funkcje)
  storage/    ProgressStore: IndexedDB (Dexie), kopia zapasowa
  brand/      geometria logo (jedno źródło) + komponent Logo
  lib/        motyw i narzędzia
  styles/     tokens.css (jasny/ciemny) + index.css (Tailwind)
  ui/         komponenty bazowe
```

Dodawanie treści: [docs/content-guide.md](docs/content-guide.md). Zasady projektu: [CLAUDE.md](CLAUDE.md). Produkt: [PRODUCT.md](PRODUCT.md). System wizualny: [DESIGN.md](DESIGN.md). Marka: [brand/README.md](brand/README.md).

Leapy nie jest powiązane z CKE, MEN ani żadną uczelnią.
