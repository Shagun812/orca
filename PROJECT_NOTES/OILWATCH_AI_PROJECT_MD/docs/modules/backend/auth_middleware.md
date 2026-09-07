# Auth Middleware & Service

**Purpose**: Secures API routes and handles user identity verification using JWTs.

## Modules
- **`src/middleware/auth.rs`**: Extracts `Authorization: Bearer <token>`, decodes the JWT using `jsonwebtoken` crate, validates the signature and expiration, and extracts the `Claims`. Injects claims into the `Request` extensions for downstream handlers.
- **`src/handlers/auth_handler.rs`**: 
  - `register`: Hashes passwords using `bcrypt` and creates a `User` in PostGIS via `UserRepository`.
  - `login`: Verifies password and generates a JWT with a 24-hour expiration.

## Inputs/Outputs
- **Input**: `AuthPayload` (email/password) or Bearer Token.
- **Output**: `AuthResponse` (JWT string) or `AppError::Unauthorized`.

## Dependencies
- Uses `jsonwebtoken` for token signing/validation.
- Uses `bcrypt` for password hashing.
- Depends on `UserRepository` and Postgres DB.
