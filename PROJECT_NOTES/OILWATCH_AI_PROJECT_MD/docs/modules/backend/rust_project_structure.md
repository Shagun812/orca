# Rust Project Structure

**Purpose**: Defines the architectural layers of the OilWatch AI Rust backend.

## Directory Layout
- **`src/main.rs`**: Application entrypoint. Initializes DB pool, starts HTTP server.
- **`src/config/`**: Environment loading and application settings.
- **`src/routes/`**: Wires HTTP routes to handlers.
- **`src/handlers/`**: HTTP layer, mapping requests to service calls and returning JSON responses.
- **`src/services/`**: Core business logic (orchestration). 
- **`src/repositories/`**: Database access layer utilizing SQLx for type-safe Postgres operations.
- **`src/models/`**: Shared structs used across layers (DTOs, domain entities).
- **`src/middleware/`**: Axum middlewares (Auth, logging, request IDs).
- **`src/jobs/`**: Async workers utilizing Tokio and Redis for background processing.
- **`src/websocket/`**: WebSocket connection and event handling logic.
- **`src/errors/`**: Unified application error types mapping to HTTP status codes.

## Dependents
- Consumed by the React Frontend via REST API and WebSockets.
- Depends on PostgreSQL + PostGIS (primary store) and Redis (job state).

---

# Initial Database Schema

**Purpose**: Defines the primary data models and relationships in PostGIS.

## Core Tables
- `users`: Authentication and identity.
- `investigations`: The parent entity representing an attribution case.
- `spills`: Discovered oil spills linked to an investigation.
- `satellite_observations`: Satellite images and bounded areas related to spills.
- `drift_predictions`: Status of drift simulations.
- `origin_zones`: Polygons representing the probable origin of a spill.
- `vessels`: Known vessels tracked via AIS.
- `ais_positions`: Raw positional data with PostGIS point geometry.
- `candidate_vessels`: Scored candidates correlated to a spill.
- `jobs`: Background job state tracking.

## Note
Spatial indexing (`GIST`) is applied to `ais_positions.position` for fast region queries.
