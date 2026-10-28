# Leapy: raport końcowy (E0–E6)

Stan na 2026-10-28. Aplikacja jest publikowana na GitHub Pages: https://leapy.pl ([deployment.md](deployment.md)). Przed publikacją właściciel musi uzupełnić dane w polityce prywatności i regulaminie.

## Co jest zbudowane

| Obszar           | Stan                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PWA              | instalowalna, działa offline (powłoka, katalog, wyszukiwarka, wybrane przedmioty), aktualizacja za zgodą użytkownika                                                       |
| Treść Fazy 1     | 177 lekcji, 1141 zadań, egzamin ósmoklasisty (polski, matematyka, angielski) i matura (6 wariantów); każdy dział ≥ 25 zadań; 314 zadań z automatyczną weryfikacją obliczeń |
| Nauka            | sesje tematu, szybka sesja, diagnoza, powtórki SM-2, „Moje błędy”, fiszki, egzamin próbny z czasem                                                                         |
| Postępy          | statystyki z kalendarzem, XP i stopnie, seria z zamrożeniami, cele, 12 odznak, karty do udostępniania                                                                      |
| Wyszukiwarka     | MiniSearch po tematach (nazwa, miejsce w katalogu, początek lekcji), bez polskich znaków też działa, offline                                                               |
| Strony publiczne | prerenderowane: strona główna, katalog egzaminów i tematów, blog, FAQ, cennik, prywatność, regulamin; JSON-LD, sitemap, robots                                             |
| Dane             | bez kont, IndexedDB, eksport i import JSON                                                                                                                                 |
| Monetyzacja      | feature flags free/premium, opis w `monetization.md`, bez płatności                                                                                                        |
| Marketing        | `docs/marketing/`: wytyczne marki, 30 postów, szablony, darmowe narzędzia                                                                                                  |

## Jakość (Definition of Done)

| Wymaganie                                              | Wynik                                                                                                                                                                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse mobile ≥ 95                                 | Strony publiczne: wydajność 96–100, dostępność, dobre praktyki i SEO 100. Ekrany aplikacji: dostępność i dobre praktyki 100, wydajność 94–96 (mediana 3 przebiegów, zimny start bez service workera). Patrz „Znane ograniczenia”. |
| WCAG 2.2 AA                                            | axe (tagi wcag2a/aa, 21a/aa, 22aa) bez naruszeń na 19 ekranach i w sesji z oceną odpowiedzi, w motywie jasnym i ciemnym, na 3 viewportach: `tests/e2e/a11y.spec.ts`                                                               |
| Testy                                                  | 108 testów jednostkowych, 190 testów E2E (360×640, 390×844, desktop, offline, axe)                                                                                                                                                |
| Reduced motion, ciemny motyw, klawiatura, cele ≥ 48 px | tak; przewijane wzory dostają fokus z klawiatury                                                                                                                                                                                  |
| RODO                                                   | brak ciasteczek śledzących, fonty lokalne, tylko Cloudflare Web Analytics (włączane w panelu Pages)                                                                                                                               |
| Koszt                                                  | 0 zł: statyczny hosting, brak API i serwera                                                                                                                                                                                       |

## Poprawki z audytu E6

- Kontrast: drugorzędny tekst na fiolecie (`on-brand-2`) i fiolet w ciemnym motywie (`#6447f5`) mają teraz ≥ 5:1.
- Wzory: KaTeX generuje także MathML, więc czytniki ekranu czytają formuły (wcześniej były ukryte). Przewijane wzory są osiągalne z klawiatury.
- Odpowiedzi testowe mają literę w nazwie dostępnej (opcja będąca samym wzorem nie była nazwana).
- Ściąga w lekcji to poprawna lista definicji (`dt`/`dd`).
- Wydajność: strony publiczne są hydratowane zamiast renderowane od nowa; preload fontu tekstu i dwóch fontów KaTeX usuwa przesunięcie układu; ekran tematu w aplikacji czyta mały plik tematu zamiast całej paczki przedmiotu; dane i kod startują równolegle przy wejściu z linku; dalsze sekcje lekcji renderują się dopiero przy przewinięciu.
- Brakująca wyszukiwarka z briefu dodana w E6.

## Znane ograniczenia i ryzyka

1. **Wydajność ekranów aplikacji w laboratorium 94–96.** To aplikacja renderowana w przeglądarce: pierwszy zimny start musi pobrać JS i dane. Przy kolejnych wejściach service worker podaje wszystko lokalnie. Dalsza poprawa wymagałaby prerenderu powłoki aplikacji; strony, które oceniają wyszukiwarki, są prerenderowane i mają 96–100.
2. **Treść nie jest zweryfikowana przez człowieka** (`reviewed: false` wszędzie). Obliczenia w 314 zadaniach sprawdza skrypt; resztę trzeba przejrzeć. Przycisk „Zgłoś błąd” jest przy każdym zadaniu.
3. **Dane administratora** w `content/pages/prywatnosc.md` i `regulamin.md` są do uzupełnienia (`[UZUPEŁNIJ: …]`).
4. **Paczki przedmiotów** mają do ~4,6 MB (około 210 KB po kompresji) z powodu gotowego HTML i MathML wzorów. Działa, ale przy dużym przyroście treści warto dzielić paczki na działy.
5. `npm audit` zgłasza ostrzeżenia w zależnościach deweloperskich (Lighthouse, narzędzia buildu); nie trafiają do aplikacji.

## Następne kroki (propozycja)

1. Wdrożenie według `deployment.md`, uzupełnienie danych prawnych, domena.
2. Przegląd merytoryczny treści, zaczynając od najczęściej używanych tematów.
3. Faza 2 treści (pozostałe przedmioty), zgodnie z `docs/plan.md`.
