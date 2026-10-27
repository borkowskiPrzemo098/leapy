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
- **2026-10-27 — Tailwind CSS v4 (CSS-first `@theme inline`).** Tokens żyją wyłącznie jako zmienne CSS w `src/styles/tokens.css`; Tailwind tylko je aliasuje, więc motyw ciemny to podmiana zmiennych, bez wariantów `dark:` w komponentach.
- **2026-10-27 — Vite 6 + Vitest 3 (nie Vite 7).** Najszerzej wspierana linia przez vite-plugin-pwa i vite-react-ssg w momencie startu.
- **2026-10-27 — Motyw: `data-theme` na `<html>`, „auto” rozwiązywane skryptem inline przed pierwszym malowaniem.** Brak mignięcia złego motywu; jedna definicja tokenów ciemnych.
- **2026-10-27 — Logo: koncepcja C „Ikona” wybrana.** Jedyna czytelna od 16 px; ikona aplikacji i awatar social to główne miejsca kontaktu z marką. Uzasadnienie w `brand/README.md`.
- **2026-10-27 — Wordmark monoline z kreślonych ścieżek, nie z fontu.** Niezależny od fontu, generowany z jednego pliku geometrii razem z ikonami.
- **2026-10-27 — Rastry (PNG, OG) renderowane Playwright/Chromium.** Playwright i tak jest w stosie (testy E2E); render zgodny z przeglądarką, fonty z lokalnego Fontsource.
- **2026-10-27 — Przyciski z „wargą” (twardy dolny cień, który znika przy wciśnięciu).** Świadome odstępstwo od reguły „bez twardych cieni”: brief wymaga energii Duolingo, a warga daje dotykowe potwierdzenie tapnięcia. Tylko na przyciskach i kafelkach odpowiedzi, nigdy na kartach.
- **2026-10-27 — E-mail kontaktowy: rob.lewandowski987@gmail.com** (decyzja właściciela) dla „Zgłoś błąd” i stron prawnych.
- **2026-10-27 — Odbiorcy: ósmoklasiści i maturzyści po równo** (decyzja właściciela). Ton neutralny, ani szkolny, ani dziecinny; neutralne płciowo formy w UI.
- **2026-10-27 — Aplikacja pod `/app/*`, publiczne strony SEO pod `/`.** Rozdział pozwala w E5 prerenderować strony publiczne bez dotykania części offline. Do E5 `/` przekierowuje do `/app`. Ścieżki po polsku: `/app/egzaminy`, `/app/cwicz`, `/app/postepy`, `/app/profil`.
- **2026-10-27 — Ustawienia wyglądu (motyw, rozmiar tekstu, animacje) w localStorage, nie w Dexie.** Skrypt w `index.html` musi je odczytać synchronicznie przed pierwszym malowaniem. Postępy nauki trafią do Dexie (E2).
- **2026-10-27 — Service worker w trybie `prompt`.** Nowa wersja czeka, aż uczeń stuknie „Odśwież”, więc aktualizacja nigdy nie przerwie sesji w połowie. Sprawdzanie aktualizacji co godzinę.
- **2026-10-27 — Baner instalacji jako karta na ekranie Start, nie pop-up.** Chrome/Android: przycisk „Zainstaluj” (beforeinstallprompt). iOS: instrukcja „Udostępnij → Do ekranu początkowego”. Odrzucenie ukrywa kartę na 30 dni.
- **2026-10-27 — Testy E2E Playwright już od E1** (360×640, 390×844, desktop) na buildzie produkcyjnym, z testem pracy offline. Uruchamiane w CI jako osobny job.
- **2026-10-27 — Wybór egzaminu i przedmiotów działa już w E1** (`src/state/study.ts`, localStorage `leapy:study`). Start i Ćwicz pokazują zapisany wybór. W E2 ta sama struktura przechodzi do profilu w Dexie; w E4 onboarding korzysta z tego samego magazynu.
- **2026-10-27 — Kierunek wizualny przypięty briefem, bez losowania koncepcji (impeccable concept roll).** Brief właściciela określa paletę, kształty, font i charakter (Duolingo + Notion), więc nie generowałem alternatywnych światów wizualnych. Do potwierdzenia przez właściciela.
- **2026-10-27 — Treść kompilowana w buildzie do HTML z gotowym KaTeX.** Aplikacja nie zawiera parsera Markdown ani KaTeX JS (tylko `katex.css` ładowany na ekranach z wzorami). Szybsze ekrany zadań, mniej JS na telefonie.
- **2026-10-27 — Pipeline treści w TypeScripcie uruchamiany przez `tsx`.** Ten sam schemat Zod (`src/content/schema.ts`) waliduje treść w buildzie i opisuje typy w aplikacji.
- **2026-10-27 — `content/ids.lock.json` w repozytorium.** Build blokuje usunięcie lub zmianę id zadania bez wpisu w `content/renames.json`, bo od id zależą postępy uczniów.
- **2026-10-27 — Paczki treści (JSON) precache'owane przez service worker.** Przy obecnej wielkości (kilkadziesiąt kB) to najprostsze pełne offline. Gdy treść urośnie do kilku MB, przechodzimy na cache w locie per wybrany przedmiot (punkt podziału free/premium).
- **2026-10-27 — Wybór egzaminu i przedmiotów w IndexedDB (tabela `kv`), Dexie ładowany dynamicznie.** Wybór trafia do kopii zapasowej razem z postępami; Dexie poza głównym bundlem (pierwszy ekran ~82 kB gzip).
- **2026-10-27 — Kopia zapasowa: plik JSON walidowany Zodem przed zapisem; import zastępuje dane po potwierdzeniu.** Tryb „merge” istnieje w ProgressStore (pod przyszłą synchronizację), w UI na razie tylko „zastąp”, żeby nie mylić ucznia.
- **2026-10-27 — Sesja: 10 zadań, kolejność: nowe → ostatnio błędne → najdawniej widziane, potem od łatwiejszych.** Prosta heurystyka do czasu SRS w E3. Typ `single` sprawdza się po stuknięciu, pozostałe typy przyciskiem „Sprawdź”.
- **2026-10-27 — „Zgłoś błąd” = gotowy e-mail z id zadania i wersją aplikacji.** Zero kosztów, a zgłoszenie od razu wskazuje konkretne zadanie.
