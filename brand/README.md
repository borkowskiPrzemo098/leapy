# Marka Leapy: logo

Wszystkie pliki powstają z jednej geometrii: [`src/brand/geometry.js`](../src/brand/geometry.js). Po zmianie uruchom `npm run brand:build`. Plików w `final/`, `public/icons/` i `public/*.png` nie edytuj ręcznie.

Wordmark `leapy` jest monoline: kreślone linie środkowe z zaokrąglonymi końcami (wysokość x 40, grubość 13). Dzięki temu nie zależy od fontu, a każda litera ma ten sam przyjazny, okrągły charakter co Plus Jakarta Sans w interfejsie.

## Trzy koncepcje (`concepts/`)

|     | Koncepcja                       | Pomysł                                                                                                                | Ocena                                                                                                                                     |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A   | [Skok L](concepts/A-skok-l.svg) | Litera l wybija się i kropkowanym łukiem przelatuje nad „eap”. Ląduje jako y, stopień wyżej (schodkowa linia bazowa). | Najlepiej opowiada skok. Potrzebuje jednak szerokości: w kwadratowej ikonie i favikonie się nie mieści.                                   |
| B   | [Schody](concepts/B-schody.svg) | Każda litera stoi stopień wyżej, p jest w trakcie skoku z „obłoczkiem” pod spodem.                                    | Czytelne na dużych formatach. W małych rozmiarach uniesione p wygląda jak literówka („leaPy”).                                            |
| C   | [Ikona](concepts/C-ikona.svg)   | Zaokrąglony kwadrat z literą L. Jej stopa odbija się kropkowanym łukiem, który kończy się iskrą poziom wyżej.         | **Rekomendacja.** Jedyna koncepcja czytelna od 16 px. Działa jako ikona PWA, favikona i awatar fanpage'a. Obok znaku stoi pełny wordmark. |

## Dlaczego C

Leapy żyje głównie na ekranie głównym telefonu i w kanałach społecznościowych. W obu miejscach marka jest najpierw kwadratem 48–180 px: ikoną aplikacji albo awatarem profilu. Koncepcje A i B są wordmarkami i w kwadracie tracą swój pomysł. C przenosi skok w samym znaku: L (poziom startowy), łuk (skok), iskra (wyższy poziom, nagroda w kolorze `reward`). Tę samą metaforę wykorzystują drabinka poziomów i schody w interfejsie.

## Gotowy zestaw (`final/` i `public/`)

| Plik                                                           | Użycie                                                                            |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `final/logo-horizontal.svg` / `-dark` / `-mono` / `-on-violet` | logo poziome: jasne tło, ciemne tło, jeden kolor (`currentColor`), fioletowe pole |
| `final/logo-vertical.svg` / `-dark` / `-mono`                  | logo pionowe                                                                      |
| `final/mark.svg` / `-dark` / `-mono`                           | sam znak (ikona)                                                                  |
| `final/wordmark.svg` / `-dark` / `-mono`                       | sam napis                                                                         |
| `final/png/mark-1024.png`                                      | znak w wysokiej rozdzielczości (awatar FB/IG)                                     |
| `public/favicon.svg`, `public/favicon-32.png`                  | favikona                                                                          |
| `public/icons/pwa-192.png`, `pwa-512.png`                      | ikony PWA (`purpose: any`)                                                        |
| `public/icons/maskable-512.png`                                | ikona PWA (`purpose: maskable`), znak w bezpiecznej strefie 72%                   |
| `public/apple-touch-icon.png`                                  | 180×180, pełne pole (iOS sam zaokrągla rogi)                                      |
| `public/og-default.png`                                        | domyślny obraz Open Graph 1200×630                                                |

Wersje `-mono` używają `currentColor`, a znak jest w nich wycięty maską. Kolor ustawiasz przez CSS `color`.

## Zasady użycia

- Pole ochronne wokół logo: co najmniej połowa wysokości znaku.
- Minimalny rozmiar: znak 16 px, logo poziome 96 px szerokości.
- Na fioletowym tle używaj `logo-horizontal-on-violet.svg` (biały kafelek), żeby znak nie zlał się z tłem.
- Iskra jest zawsze żółta (`#ffc531`), chyba że cały znak jest jednokolorowy.
- Nie obracaj, nie rozciągaj i nie dodawaj cieni ani gradientów. Nie przestawiaj liter wordmarku.
- Kolory: fiolet `#5b3df5`, głęboki fiolet `#2f1a9e`, atrament `#17123a`, słońce `#ffc531`.
