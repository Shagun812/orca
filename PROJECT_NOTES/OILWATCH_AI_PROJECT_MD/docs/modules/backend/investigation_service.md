# Investigation Service & Handlers

**Purpose**: Manages the core entity of the platform (`Investigation`), grouping related spills, vessels, and evidence into a single case file.

## Modules
- **`src/repositories/investigation_repo.rs`**: Contains raw SQLx queries to select, insert, update, and delete investigations in PostgreSQL.
- **`src/handlers/investigation_handler.rs`**: Provides REST endpoints mapping to the repository operations. Enforces authentication by requiring JWT claims.
- **`src/routes/mod.rs`**: Wires the endpoints to `/api/v1/investigations`.

## Inputs/Outputs
- **Inputs**: `CreateInvestigation` and `UpdateInvestigation` JSON payloads.
- **Outputs**: Serialized `Investigation` models containing UUIDs, titles, descriptions, and timestamps.

## Dependencies
- Requires `AuthMiddleware` to resolve the `user_id` context.
- Depends on `PgPool` for Postgres connection.
