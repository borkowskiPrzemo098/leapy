# Jak dodawać treści do Leapy

Treść to wyłącznie pliki w `content/`. Żeby dodać egzamin, przedmiot, lekcję albo zadanie, nie trzeba zmieniać kodu. Każdy build uruchamia `npm run content:build`. Błąd w treści zatrzymuje build i wypisuje plik oraz przyczynę.

```
content/
  exams/<egzamin>.json                 egzamin: nazwa, odbiorcy, lista przedmiotów
  <egzamin>/<przedmiot>/subject.json   działy i tematy
  <egzamin>/<przedmiot>/lessons/<temat>.md
  <egzamin>/<przedmiot>/tasks/<temat>.json
  ids.lock.json                        lista id zadań (generowana, commitujemy)
  renames.json                         stare id → nowe id albo null (wycofane)
```

## Komendy

| Komenda                 | Co robi                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------- |
| `npm run content:check` | sprawdza wszystko, nic nie zapisuje                                                   |
| `npm run content:build` | sprawdza i zapisuje `public/data/`, `content/ids.lock.json`, `docs/content-report.md` |

Po każdej partii treści uruchom `content:build`. W [content-report.md](content-report.md) zobaczysz pokrycie i listę zadań do sprawdzenia przez człowieka.

## Nowy egzamin

1. Dodaj `content/exams/<id>.json` (`id`, `name`, `short`, `audience`, `order`, `phase`, `subjects`, opcjonalnie `officialUrl` i `disclaimer`).
2. Dla każdego przedmiotu z listy dodaj `content/<id>/<przedmiot>/subject.json` z działami i tematami.
3. Uruchom `npm run content:build`. Egzamin od razu pojawi się w aplikacji, z tematami „w przygotowaniu”.

Egzamin próbny: w `subject.json` możesz podać `"mock": { "tasks": 15, "minutes": 40 }`. Bez tego arkusz ma do 20 zadań i ok. 2,5 minuty na zadanie. Gdy zadań w przedmiocie jest mniej, czas skaluje się proporcjonalnie. Zadania rozkładają się równo między tematy, a punkty biorą się z pola `points` (zadanie za 1 pkt: wszystko albo nic, za więcej: częściowo).

Identyfikatory (`id`) piszemy małymi literami, bez polskich znaków, ze słowami połączonymi myślnikiem: `funkcja-kwadratowa`.

## Lekcja

Plik `lessons/<temat>.md` to frontmatter YAML i notatka w Markdownie.

```markdown
---
title: Logarytmy
summary: # „Najważniejsze w 30 sekund”, 2–5 punktów
  - '$\log_{a}b=c$ znaczy dokładnie $a^{c}=b$.'
mistakes: # typowe błędy, 1–6 punktów
  - 'Logarytm sumy rozbity na sumę logarytmów.'
cheatsheet: # mini-ściąga, opcjonalna
  - label: 'Logarytm iloczynu'
    formula: '$\log_{a}(xy)=\log_{a}x+\log_{a}y$'
reviewed: false
updatedAt: 2026-10-27
---

Treść notatki. Wzory: $x^2$ w tekście, $$x^2$$ jako osobny blok.
```

W YAML-u wzory zapisuj w pojedynczych cudzysłowach, żeby ukośniki zostały bez zmian.

### Fiszki

Każda pozycja `cheatsheet` staje się fiszką (`label` na awersie, `formula` na rewersie). Gdy sama etykieta wyglądałaby na słówko do przetłumaczenia („Zakaz”, „Początek”), dodaj pytanie na awers: `card: 'Jak wyrazić zakaz?'`; `card: false` pomija fiszkę (np. wskazówki strategiczne). Id fiszki zawsze pochodzi z `label`. Dodatkowe fiszki (definicje, daty, słówka) dopisz w polu `cards`:

```yaml
cards:
  - front: 'Logarytm dziesiętny'
    back: '$\log x$ to $\log_{10}x$'
```

Id fiszki powstaje z awersu: `matura.matematyka-p.logarytmy.card.logarytm-dziesietny`. Od niego zależą powtórki ucznia, więc **nie zmieniaj awersu istniejącej fiszki** bez potrzeby. Dwie fiszki o tym samym awersie w jednym temacie to błąd.

## Zadania

Plik `tasks/<temat>.json` to tablica zadań albo (zalecana) **krótka forma**:

```json
{
  "updatedAt": "2026-10-27",
  "tasks": [
    {
      "id": "001",
      "type": "single",
      "difficulty": 2,
      "prompt": "…",
      "options": ["…"],
      "answer": 0,
      "explanation": "…"
    }
  ]
}
```

W krótkiej formie `exam`, `subject` i `topic` wynikają ze ścieżki pliku, `"001"` zamienia się na pełne id, a `source: "original"`, `reviewed: false` i `updatedAt` (z nagłówka pliku) dopisują się same. Pole wpisane jawnie zawsze wygrywa.

### Narzędzia do partii treści

| Komenda                                                                  | Co robi                                                                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `node scripts/content/append-tasks.mjs <egzamin>/<przedmiot> plik.json`  | dopisuje zadania `{ "<temat>": [zadania bez id] }` z kolejnymi wolnymi id                                                       |
| `node scripts/content/write-lessons.mjs <egzamin>/<przedmiot> plik.json` | tworzy lekcje z JSON-a (YAML generuje biblioteka, więc cudzysłowy są zawsze poprawne); istniejących nie nadpisuje bez `--force` |

Pola wspólne:

| Pole          | Opis                                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | `egzamin.przedmiot.temat.NNN`, np. `matura.matematyka-p.logarytmy.007`. **Nigdy nie zmieniaj istniejącego id**: od niego zależą postępy uczniów. Jeśli musisz, wpisz zmianę do `renames.json`. |
| `type`        | `single`, `multi`, `truefalse`, `numeric`, `ordering`, `match`, `short`                                                                                                                        |
| `difficulty`  | 1–5                                                                                                                                                                                            |
| `prompt`      | polecenie (Markdown + KaTeX)                                                                                                                                                                   |
| `explanation` | wyjaśnienie krok po kroku (najlepiej lista numerowana)                                                                                                                                         |
| `hint`        | podpowiedź, opcjonalna                                                                                                                                                                         |
| `tags`        | tagi (identyfikatory)                                                                                                                                                                          |
| `source`      | zawsze `"original"`                                                                                                                                                                            |
| `reviewed`    | `false`, dopóki człowiek nie sprawdzi zadania                                                                                                                                                  |
| `updatedAt`   | data `RRRR-MM-DD`                                                                                                                                                                              |
| `points`      | punkty w egzaminie próbnym (domyślnie 1)                                                                                                                                                       |
| `verify`      | wyrażenie matematyczne (składnia mathjs) do automatycznego sprawdzenia, opcjonalne                                                                                                             |

Pola zależne od typu:

| Typ         | `options`                                                            | `answer`                                                                                     |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `single`    | 2–6 odpowiedzi                                                       | indeks poprawnej (od 0)                                                                      |
| `multi`     | 3–8 odpowiedzi                                                       | lista indeksów poprawnych                                                                    |
| `truefalse` | 1–4 zdania                                                           | lista `true`/`false` dla każdego zdania                                                      |
| `numeric`   | brak                                                                 | `{ "value": 12 }` albo `{ "value": "3/4", "tolerance": 0.01, "unit": "zł" }`                 |
| `ordering`  | 3–7 elementów                                                        | indeksy w poprawnej kolejności                                                               |
| `match`     | `{ "left": [...], "right": [...] }` (w `right` mogą być dystraktory) | dla każdego `left[i]` indeks w `right`                                                       |
| `short`     | brak                                                                 | lista akceptowanych odpowiedzi (wielkość liter, spacje i kropka na końcu nie mają znaczenia) |

Aplikacja sama losuje kolejność odpowiedzi, więc poprawna odpowiedź może zawsze stać na pierwszym miejscu.

### Automatyczna weryfikacja (`verify`)

Dla zadań obliczeniowych dodaj `verify`. Pipeline liczy wyrażenie z dokładnością do 64 cyfr i porównuje wynik z odpowiedzią:

- `numeric`: `answer.value` musi być równe wyrażeniu;
- `single`: poprawna opcja musi być równa wyrażeniu i **żadna inna opcja nie może być mu równa** (wyłapuje niejednoznaczne dystraktory).

Przykłady: `"2^10 * 4^3 / 8^5"`, `"log(54, 3) - log(2, 3)"`, `"nthRoot(54, 3) - nthRoot(16, 3)"`, `"2000 * 1.05^2"`.

### Czego pipeline pilnuje

- zgodności ze schematem (`src/content/schema.ts`) i indeksów odpowiedzi;
- tego, że `id` pasuje do ścieżki pliku i jest unikalne;
- lekcji dla każdego tematu, który ma zadania;
- poprawności wzorów KaTeX;
- identycznych treści (błąd) i bardzo podobnych zadań w jednym temacie (ostrzeżenie);
- tego, że żadne wcześniej opublikowane `id` nie zniknęło bez wpisu w `renames.json`.

## Strony publiczne, blog i FAQ

- `content/blog/<slug>.md`: frontmatter `title`, `description` (70–170 znaków), `date`, `tags`, opcjonalnie `exam`, `reviewed`; treść co najmniej 1500 znaków.
- `content/pages/<slug>.md`: strony stałe (`prywatnosc`, `regulamin` są wymagane, `o-leapy`).
- `content/faq.yaml`: lista `{ q, a }`, odpowiedzi w Markdownie.

Wszystko trafia do `public/data/site.json` i do prerenderowanych stron (`npm run build`).

## Zasady treści

- Piszemy **własne** zadania w duchu wymagań egzaminacyjnych. Nie kopiujemy arkuszy CKE, podręczników ani baz pytań.
- Oficjalne arkusze tylko linkujemy (cke.gov.pl).
- Każde nowe zadanie i lekcja ma `reviewed: false`. Na `true` zmienia je człowiek po sprawdzeniu.
- Wyjaśnienie prowadzi krok po kroku i, jeśli to możliwe, nazywa typowy błąd.
