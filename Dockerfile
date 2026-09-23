# Use official Rust image for building
FROM rust:1.80-bookworm AS builder

WORKDIR /app
COPY . .

# Build the application
RUN cargo build --release

# Use a minimal image for the final container
FROM debian:bookworm-slim

# Install OpenSSL, CA certificates, and required dependencies
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from the builder stage
COPY --from=builder /app/target/release/backend /app/backend

# Ensure migrations are available in production if needed
COPY --from=builder /app/migrations /app/migrations

# Make the binary executable
RUN chmod +x /app/backend

# The PORT is supplied by Koyeb (usually 8000)
ENV PORT=8000
EXPOSE ${PORT}

CMD ["/app/backend"]
