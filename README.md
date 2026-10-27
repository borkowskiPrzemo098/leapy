# Leapy

**Skocz na wyższy poziom.** Polskojęzyczna platforma PWA (mobile-first) do nauki i przygotowania do egzaminów: egzamin ósmoklasisty i matura na start. Darmowa, bez konta, działa offline. Postęp zostaje na urządzeniu.

> Status: **E1 ukończony**: powłoka aplikacji, dolna nawigacja i panel boczny, ustawienia, PWA działająca offline. Dalsze etapy w [docs/plan.md](docs/plan.md).

## Szybki start

```bash
npm install
npm run dev
```

| Komenda               | Opis                                          |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | serwer deweloperski                           |
| `npm run build`       | typecheck + build do `dist/`                  |
| `npm run check`       | typecheck, lint, format, testy (jak w CI)     |
| `npm test`            | testy jednostkowe                             |
| `npm run test:e2e`    | testy Playwright (360, 390, desktop, offline) |
| `npm run brand:build` | regeneruje logo, ikony i obraz OG             |

## Struktura

```
brand/        koncepcje logo, gotowe pliki marki, README marki
docs/         brief, plan, decyzje (później: wdrożenie, monetyzacja, marketing)
public/       favicon, ikony PWA, obraz OG
scripts/      skrypty budowania (marka; od E2 pipeline treści)
tests/e2e/    testy Playwright
src/
  app/        router, układ (dolny pasek / panel boczny), przewodnik /dev/ui
  features/   moduły funkcji (pwa: offline, aktualizacje, instalacja)
  routes/     ekrany: Start, Egzaminy, Ćwicz, Postępy, Profil, 404
  state/      ustawienia urządzenia (Zustand)
  brand/      geometria logo (jedno źródło) + komponent Logo
  lib/        motyw i narzędzia
  styles/     tokens.css (jasny/ciemny) + index.css (Tailwind)
  ui/         komponenty bazowe
```

Zasady projektu: [CLAUDE.md](CLAUDE.md). Produkt: [PRODUCT.md](PRODUCT.md). System wizualny: [DESIGN.md](DESIGN.md). Marka: [brand/README.md](brand/README.md).

Leapy nie jest powiązane z CKE, MEN ani żadną uczelnią.
