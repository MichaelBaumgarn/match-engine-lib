# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Run tests in watch mode (Vitest)
- `npm run test` - Run all tests once
- `npm run dev:server` - Start development server with file watching (tsx)
- `npm run build` - Build library (TypeScript + TypeORM entities)
- `npm run start` - Start the built application
- `npm run start:test` - Start test server
- `npm run start:with-db-test` - Start with database test
- `npm run migrate:up` - Run database migrations up
- `npm run migrate:down` - Run database migrations down
- `npm run start:with-migrations` - Run migrations then start server

## Testing

- Uses **Vitest** as the test framework
- Tests are located in the `/test` directory
- Configuration in package.json under `vitest` field
- Run single test file: `npx vitest run path/to/test.ts`

## Architecture

This is a **TypeScript library for player matchmaking and lobby management** following **Hexagonal Architecture** (ports and adapters pattern):

### Core Structure

- `src/core/LobbyService.ts` - Main business logic for lobby operations
- `src/models/` - Domain models (Lobby, Player, Club)
- `src/application/` - Use cases layer (LobbyUseCases, PlayerUseCases, ClubUseCases)
- `src/store/` - Persistence adapters and repositories
- `src/entities/` - TypeORM entities for database persistence
- `src/routes/` - Express API routes
- `src/schemas/` - Zod validation schemas

### Key Concepts

- **Lobby**: Game sessions with configurable max players per side (default 2v2)
- **Player**: Basic identity with ID and name
- **Club**: Optional venue/location for games
- **Side**: "left" or "right" team positioning
- **LobbyStatus**: "open" or "confirmed"

### Database

- Uses **TypeORM** with PostgreSQL
- Database migrations in `/migrations` directory
- Connection configured via environment variables
- Test database setup available via Docker Compose

### Build System

- **tsup** for building (outputs both ESM and CJS)
- **TypeScript** with strict mode enabled
- Outputs to `dist/` directory with type declarations

## Environment Setup

The application supports both in-memory and PostgreSQL persistence:

1. **Development with in-memory store**: Just run `npm run dev`
2. **Development with database**: 
   - Start PostgreSQL: `docker-compose up -d postgres`
   - Run migrations: `npm run migrate:up`
   - Start with DB: `npm run start:with-db-test`

## Key Files to Understand

- `src/core/LobbyService.ts` - Core lobby business logic
- `src/application/LobbyUseCases.ts` - Application layer for lobby operations
- `src/models/Lobby.ts` - Lobby domain model
- `src/index.ts` - Main entry point and Express server setup
- `package.json` - All available scripts and dependencies