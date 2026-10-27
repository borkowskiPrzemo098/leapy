# Monetyzacja: plan bez wdrożonych płatności

Stan na 2026-10-27. Leapy jest w całości darmowe. Ten dokument opisuje, jak dodać plan płatny bez łamania zasad projektu (0 zł kosztów stałych, brak serwera, brak kont, uczciwość wobec ucznia). **Nic z tego nie jest wdrożone**; w kodzie istnieją tylko feature flags (`src/flags/flags.ts`).

## Zasady

1. **To, co jest dziś darmowe, zostaje darmowe.** Plan płatny tylko dodaje.
2. **Nauka nigdy nie jest zablokowana w połowie.** Żadnych limitów typu „5 zadań dziennie”, żadnych paywalli w środku sesji, żadnych odliczających się „promocji”.
3. **Bez kont na MVP.** Licencja musi działać na urządzeniu, offline.
4. **Bez kosztów stałych.** Płatności obsługuje zewnętrzna platforma, która pobiera prowizję tylko od sprzedaży.
5. **Uczciwy cennik.** Cena, zakres i okres widoczne przed zakupem. Rezygnacja jednym kliknięciem.

## Co mogłoby być płatne (flagi `tier: 'premium'`)

| Flaga             | Pomysł                                                                        | Uwagi                                                                         |
| ----------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `offlinePacks`    | Pakiety offline całych przedmiotów pobierane na żądanie                       | Dziś wszystkie paczki są precache'owane; przy dużej treści to i tak konieczne |
| `extraMockSheets` | Dodatkowe arkusze próbne z ustaloną puli zadań (powtarzalne, porównywalne)    | Arkusz podstawowy zostaje darmowy                                             |
| (przyszłe)        | Plan nauki do daty egzaminu, eksport raportu postępów dla rodzica/nauczyciela | Liczone lokalnie, bez serwera                                                 |

## Weryfikacja licencji bez serwera

### Wariant A (zalecany): podpisany klucz licencyjny

1. Uczeń kupuje dostęp na platformie z wbudowanym sklepem i kluczami (np. Lemon Squeezy, Gumroad, Paddle; wybór po porównaniu prowizji i obsługi VAT w Polsce).
2. Platforma wysyła e-mail z kluczem. Klucz to krótki token: `LEAPY-<dane>-<podpis>`, gdzie `dane` = plan, data ważności, losowy identyfikator (bez danych osobowych), a `podpis` = Ed25519 nad `dane`.
3. Klucz generuje **jednorazowy skrypt** właściciela (lokalnie, `scripts/license/issue.mjs`, klucz prywatny poza repozytorium) albo webhook platformy wywołujący funkcję Cloudflare Worker w darmowym limicie. Worker to jedyny „serwer” i działa tylko przy zakupie.
4. Aplikacja ma w kodzie **klucz publiczny**. Uczeń wkleja klucz w Profilu, aplikacja sprawdza podpis i datę przez Web Crypto (`crypto.subtle.verify('Ed25519', …)`), offline. Wynik zapisuje w `kv` (`license`), więc licencja jedzie z kopią zapasową.
5. `currentTier()` w `src/flags/flags.ts` zwraca `premium`, gdy w `kv` jest ważna licencja.

Zalety: działa offline, bez kont, bez bazy, jedno urządzenie i kopia zapasowa przenoszą dostęp. Wada: klucz można przekazać innej osobie. Przy cenie rzędu kilkunastu złotych to akceptowalne; można dodać miękki limit (identyfikator licencji widoczny w kopii, ręczne unieważnianie listą w aktualizacji aplikacji).

### Wariant B: weryfikacja przez API platformy

Aplikacja przy aktywacji pyta API platformy o ważność klucza (Lemon Squeezy ma publiczny endpoint aktywacji licencji). Prostsze unieważnianie, ale wymaga internetu przy aktywacji i wysyła klucz do zewnętrznej usługi: trzeba to opisać w polityce prywatności.

### Czego nie robimy

- Własnego backendu z kontami i bazą danych (koszty i RODO).
- Sprawdzania licencji przy każdym uruchomieniu przez sieć (psuje offline).
- Zaciemniania kodu „przeciw piractwu”. Uczciwi uczniowie płacą, reszta i tak znajdzie obejście.

## Prawo i podatki (do sprawdzenia przed startem)

- Sprzedaż usług cyfrowych konsumentom w UE: VAT OSS albo platforma jako „merchant of record” (Paddle, Lemon Squeezy przejmują VAT).
- Prawo odstąpienia od umowy dla treści cyfrowych: zgoda na rozpoczęcie świadczenia przed upływem 14 dni.
- Regulamin i polityka prywatności: dopisać sprzedaż, dane przekazywane platformie płatności.
- Konsultacja z księgowym i prawnikiem przed pierwszą sprzedażą.

## Kolejność wdrożenia (gdy przyjdzie czas)

1. Pomiar zainteresowania bez sprzedaży: przycisk „Powiadom mnie” w cenniku prowadzący do formularza platformy newsletterowej z darmowym planem.
2. Jedna funkcja premium za flagą, testy z nadpisaniem `leapy:flags`.
3. Klucze licencyjne (wariant A), ekran „Aktywuj Leapy Plus” w Profilu.
4. Aktualizacja cennika, regulaminu i polityki prywatności.
