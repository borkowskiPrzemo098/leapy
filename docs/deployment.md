# Wdrożenie: GitHub Pages

Leapy to statyczne pliki z `dist/`, publikowane za darmo na GitHub Pages z publicznego repozytorium.

Adres: **https://borkowskiprzemo098.github.io/leapy/**

## 1. Jak to działa

- `.github/workflows/pages.yml` uruchamia się po zielonym CI na `main` (albo ręcznie: Actions → Deploy to GitHub Pages → Run workflow).
- Build dostaje `VITE_BASE=/leapy/` i `VITE_SITE_URL=https://borkowskiprzemo098.github.io/leapy`. Wszystkie ścieżki (kod, dane, service worker, manifest, linki w treści, kanoniczne adresy, sitemap) biorą bazę z `src/lib/env.ts`.
- Lokalnie i w testach baza to `/`, więc `npm run dev`, `npm run preview` i testy E2E działają jak wcześniej.
- Ustawienie w repozytorium: Settings → Pages → Source: **GitHub Actions**.

GitHub Pages nie ma przekierowań, więc:

- czyste adresy działają, bo GitHub serwuje `/egzaminy/matura` z `egzaminy/matura.html`;
- wejście z linku prosto w aplikację (np. `/leapy/app/cwicz`) trafia na `404.html`. Ta strona to publiczne „nie znaleziono”, a na ścieżkach `/app/*` skrypt podmienia ją na aplikację. Działa, ale pierwsze takie wejście ma status HTTP 404 (dla wyszukiwarek bez znaczenia, bo `/app` ma `noindex`). Po instalacji service workera wszystkie adresy `/app/*` obsługuje on sam;
- `_redirects` w `dist/` jest ignorowany (przydaje się tylko na Cloudflare Pages).

## 2. Własna domena (opcjonalnie)

1. U rejestratora dodaj rekord `CNAME` z `www` na `borkowskiprzemo098.github.io` (dla domeny głównej rekordy `A` na adresy GitHub Pages z dokumentacji GitHuba).
2. Settings → Pages → Custom domain → wpisz domenę, zaznacz **Enforce HTTPS**.
3. W `pages.yml` ustaw `VITE_BASE: /` i `VITE_SITE_URL: https://twoja-domena.pl`, dodaj plik `public/CNAME` z nazwą domeny i wypchnij zmiany.

## 3. Analityka (Cloudflare Web Analytics)

Jedyna dopuszczona analityka: bez ciasteczek i bez danych osobowych, więc nie wymaga banera zgody. Na GitHub Pages skrypt trzeba dodać ręcznie:

1. Załóż darmowe konto Cloudflare → Analytics & Logs → Web Analytics → Add a site → wpisz adres strony. Dostaniesz token.
2. Daj znać, a dopiszę skrypt z tym tokenem do `index.html` (strony publiczne i aplikacja).

Polityka prywatności (`content/pages/prywatnosc.md`) już opisuje Web Analytics. Jeśli analityki nie włączasz, usuń ten akapit. Akapit o hostingu w polityce prywatności opisuje już GitHub Pages.

## Alternatywa: Cloudflare Pages

Działa też z prywatnym repozytorium: Workers & Pages → Connect to Git, build `npm run build`, katalog `dist`, zmienne `NODE_VERSION=22` i `VITE_SITE_URL` (bez `VITE_BASE`). Tam `_redirects` obsługuje `/app/*` bez strony 404.

## 4. Przed ogłoszeniem strony

- [ ] Uzupełnij `[UZUPEŁNIJ: …]` w `content/pages/prywatnosc.md` i `content/pages/regulamin.md` (dane administratora). Najlepiej z prawnikiem.
- [ ] Włącz Web Analytics (albo usuń wzmiankę z polityki prywatności).
- [ ] Sprawdź po deployu: strona główna, `/app`, tryb offline (DevTools → Network → Offline, odśwież `/app`), `sitemap.xml`.
- [ ] Treści mają `reviewed: false`: zaplanuj przegląd merytoryczny (raport `docs/content-report.md`).

## 5. Kontrola jakości przed wydaniem

```bash
npm run check          # typecheck, lint, format, testy jednostkowe
npm run build
npm run test:e2e       # 3 viewporty + offline + axe (WCAG 2.2 AA, jasny i ciemny motyw)
npm run preview -- --port 4173   # w drugim terminalu
npm run audit:lighthouse         # mobile, mediana 3 przebiegów, próg 95
```

Wyniki Lighthouse lądują w `.impeccable/review/lighthouse/`.

## 6. Aktualizacje aplikacji

Service worker działa w trybie `prompt`: po wdrożeniu nowej wersji użytkownik widzi komunikat „Jest nowa wersja Leapy.” i sam decyduje o odświeżeniu. Postęp (IndexedDB) zostaje. Zmiana formatu danych wymaga podbicia `DATA_VERSION` w `src/content/version.ts`.
