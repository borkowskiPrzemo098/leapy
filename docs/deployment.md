# Wdrożenie: Cloudflare Pages

Leapy to statyczne pliki z `dist/`. Hosting Cloudflare Pages (plan darmowy) wystarcza w całości: bez serwera, bez bazy, bez płatnych usług.

## 1. Projekt w Cloudflare Pages

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**. Wybierz repozytorium `leapy`, gałąź `main`.
2. Ustawienia buildu:

   | Pole                   | Wartość         |
   | ---------------------- | --------------- |
   | Framework preset       | None            |
   | Build command          | `npm run build` |
   | Build output directory | `dist`          |

3. **Settings → Environment variables** (Production i Preview):

   | Zmienna         | Wartość                                      | Po co                                                     |
   | --------------- | -------------------------------------------- | --------------------------------------------------------- |
   | `NODE_VERSION`  | `22`                                         | ta sama wersja co w CI (plik `.nvmrc` też ją podaje)      |
   | `VITE_SITE_URL` | `https://leapy.pages.dev` albo własna domena | adresy kanoniczne, `sitemap.xml`, `robots.txt`, obrazy OG |

4. Zapisz i uruchom pierwszy deploy. Każdy push na `main` wdraża produkcję, każda inna gałąź dostaje adres podglądu.

Build sam generuje to, czego Pages potrzebuje:

- czyste adresy jako pliki `ścieżka.html` (np. `/egzaminy/matura` → `egzaminy/matura.html`),
- `_redirects`: `/app/*` kieruje na powłokę aplikacji `app.html`,
- `404.html` (z `noindex`), `sitemap.xml`, `robots.txt`,
- service worker (`sw.js`) i manifest PWA.

## 2. Własna domena

1. Pages → projekt → **Custom domains → Set up a custom domain**, np. `leapy.pl`.
   - Domena w Cloudflare: rekordy DNS dodadzą się same.
   - Domena u innego rejestratora: dodaj rekord `CNAME` z `www` (albo z apeksu, jeśli rejestrator wspiera CNAME flattening) na `<projekt>.pages.dev`, albo przenieś DNS do Cloudflare (darmowe).
2. Zmień `VITE_SITE_URL` na nowy adres (bez ukośnika na końcu) i uruchom **Retry deployment**. Bez tego kanoniczne adresy i sitemap dalej wskazują `pages.dev`.
3. Opcjonalnie przekieruj `leapy.pages.dev` na domenę: **Rules → Redirect Rules** (301 z hosta `*.pages.dev` na domenę), żeby wyszukiwarki indeksowały jeden adres.
4. Zgłoś `https://<domena>/sitemap.xml` w Google Search Console i Bing Webmaster Tools.

## 3. Analityka (Cloudflare Web Analytics)

Jedyna dopuszczona analityka: bez ciasteczek i bez danych osobowych, więc nie wymaga banera zgody.

1. Pages → projekt → **Metrics → Web Analytics → Enable**. Cloudflare sam wstrzykuje skrypt przy następnym deployu; w kodzie nic nie zmieniamy.
2. Polityka prywatności (`content/pages/prywatnosc.md`) już opisuje Web Analytics. Jeśli analityki nie włączasz, usuń ten akapit.

Nie dodajemy Google Analytics, pikseli reklamowych ani innych skryptów zewnętrznych (RODO, patrz `CLAUDE.md`).

## 4. Przed pierwszą publikacją

- [ ] Uzupełnij `[UZUPEŁNIJ: …]` w `content/pages/prywatnosc.md` i `content/pages/regulamin.md` (dane administratora). Najlepiej z prawnikiem.
- [ ] Ustaw `VITE_SITE_URL` na docelowy adres.
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
