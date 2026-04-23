# Webová aplikace pro zobrazazení nově vycházejícího obsahu

Webová aplikace pro sledování anime. Agreguje data ze tří externích API
(**AnimeSchedule**, **AniList**, **Jikan/MyAnimeList**), křížově je ověřuje
a uživatelům umožňuje spravovat si oblíbené, hodnotit, komentovat a sledovat
ostatní uživatele.

## Instalace

Backend a frontend mají vlastní `package.json` — oba je třeba nainstalovat zvlášť:

```bash
cd Backend && npm install (Backend se stahuje trošku dýl "Neleknout se")
cd ../Frontend && npm install
```

---

## Konfigurace

Pro testovací účely repozitář obsahuje .env soubory spolu s API klíčem AnimeSchedule.

### `Backend/.env`

```ini
# auth
JWT_SECRET = "SECRET"

# externí API
ANIME_SCHEDULE_TOKEN = {API KLÍČ} 
```

### `Frontend/.env`

```ini
VITE_API_URL=http://localhost:8000
```

---

## Spuštění

### Backend

```bash
cd Backend
npm run dev     # watch mód
npm start       # produkční start
```

### Frontend

```bash
cd Frontend
npm start       # dev server na http://localhost:3000
npm run build   # produkční build
```

---

## In-memory

### Seedovaní uživatelé

Při každém startu v in-memory se automaticky vytvoří demo uživatelé
a moderátor:

| username    | email            | heslo           | profileId    | role        |
| ----------- | ---------------- | --------------- | ------------ | ----------- |
| Alice       | `alice@local.cz` | `Demo123`       | `@alice`     | `user`      |
| Bob         | `bob@local.cz`   | `Demo123`       | `@bob`       | `user`      |
| Charlie     | `charlie@local.cz`| `Demo123`      | `@charlie`   | `user`      |
| Moderator   | `mod@local.cz`   | `Moderator123`  | `@moderator` | `moderator` |

Moderátor slouží k testování cesty `/animes-validation/` a admin endpointů.

---

## Cross-check systém

`service/crossCheck.js` stahuje anime ze tří zdrojů a křížově je ověřuje:

- **3/3 zdroje souhlasí** → záznam **verified**
- **2/3** → **unverified** (čeká na manuální schválení přes
  `/animes-validation/`)
- **1/3** → neukládá se do databáze

Title matching používá Fuse.js (threshold 0.4 přes `title/native/romaji/english`). Běží na cron
`0 0 * * *` a jednou při startu serveru.

Popisky (`description`) AnimeSchedule často chybí, takže se doplňují
z Jikanu (`synopsis`) nebo AniListu; HTML se stripuje při nahrazení
delším textem.

## Frontend routes

`/` · `/animes` · `/anime/:id` · `/layout` · `/profiles/:profileId` · `/notifications`
· `/auth/login` · `/auth/register` · `/animes-validation/` (moderátor)

---

## Testy

```bash
cd Backend
npm test       # Spustí sekvenční testování
```

---
Backend testy běží proti in-memory databázi —
`jest.setup.js` čistí všechny kolekce před/po. Běží sekvenčně
(`maxWorkers: 1`).

---

