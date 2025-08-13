# match-engine-lib

> A modular TypeScript library for player matchmaking, lobby management, and team formation — built for sports like beach volleyball, padel, and more.

---

## 🚀 Features

- 🧠 Core logic for managing lobbies and matches
- 🧩 Pluggable interfaces (e.g. for persistence, events)
- ♻️ Reusable in services, apps, or CLI tools
- 🔍 Fully type-safe, testable, and framework-agnostic
- 🧪 Comes with Vitest for easy testing

---

## 📦 Installation

```bash
npm install match-engine-lib
```

Or for development:

```bash
git clone https://github.com/yourname/match-engine-lib.git
cd match-engine-lib
npm install
```

---

## 🛠 Usage Example

```ts
import LobbyService, { LobbyStatusEnum } from "match-engine-lib/core/LobbyService";
import Player from "match-engine-lib/models/Player";

const host: Player = { id: "player1", name: "Anna" };
const lobby = new LobbyService("abc123", host);

lobby.addPlayer({ id: "player2", name: "Bob" }, "right");
lobby.addPlayer({ id: "player3", name: "Cara" }, "left");
lobby.addPlayer({ id: "player4", name: "Dan" }, "right");

console.log(lobby.status); // LobbyStatusEnum.CONFIRMED
```

---

## 🧩 Architecture

This package follows a **Hexagonal Architecture**:

- `LobbyService`: core business logic
- `LobbyStore`: pluggable persistence interface
- `InMemoryLobbyStore`: default adapter (for testing/dev)
- `MatchProposal`, `Player`, `Slot`, etc.: domain models

---

## 🧪 Scripts

```bash
npm run dev     # Watch tests
npm run test    # Run all tests
npm run build   # Build dist/ with types, CJS, ESM
```

---

## 📁 Folder Structure

```
src/
├── adapters/       # In-memory and other adapters
├── core/           # Core services like LobbyService
├── models/         # Domain models (Lobby, Player, etc.)
├── ports/          # Interface contracts (e.g. LobbyStore)
└── index.ts        # Entry point / public API
```

---

## 🧑‍💻 Development

After cloning the repository, install dependencies with `npm install`.

### Running tests

```bash
npm test       # Run all tests once
npm run dev    # Watch tests
```

### Building

```bash
npm run build
```

### Optional: Postgres for adapters

If you want to experiment with a database-backed lobby store, a Postgres service is defined in `docker-compose.yml`:

```bash
docker-compose up -d postgres
```

---

## 📋 Roadmap

- [ ] Postgres adapter
- [ ] Redis queue support
- [ ] Match proposal engine
- [ ] Auto-confirmation policies
- [ ] Player reliability tracking
- [ ] Ratings (Elo / Glicko)

---

## 📄 License

MIT © [Your Name](https://github.com/yourname)
