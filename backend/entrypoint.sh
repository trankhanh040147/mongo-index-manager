#!/bin/sh
# entrypoint.sh - Prepares the container environment and executes the application.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Secret Handling ---
# The /etc/secrets volume is read-only and owned by root.
# We copy the secrets to a writable location, change ownership to our app user,
# and point the configuration to the new paths.

# Define source (read-only) and destination (writable) paths
SOURCE_SECRETS_DIR="/etc/secrets"
RUNTIME_SECRETS_DIR="/app/run/secrets"

# Create the writable directory for our secrets
mkdir -p "${RUNTIME_SECRETS_DIR}"

# Copy the secret files from the read-only mount
# We check if the files exist in the source before copying
if [ -f "${SOURCE_SECRETS_DIR}/private.pem" ]; then
    cp "${SOURCE_SECRETS_DIR}/private.pem" "${RUNTIME_SECRETS_DIR}/private.pem"
fi
if [ -f "${SOURCE_SECRETS_DIR}/public.pem" ]; then
    cp "${SOURCE_SECRETS_DIR}/public.pem" "${RUNTIME_SECRETS_DIR}/public.pem"
fi

# Change ownership of the entire writable runtime directory to the 'alpine' user
chown -R alpine:alpine /app/run

# --- Environment Configuration ---
# Override the environment variables to point to the new, accessible secret paths.
# The Go application will now read these paths instead of the original ones.
export TOKEN_PUBLIC_KEY_PATH="${RUNTIME_SECRETS_DIR}/public.pem"
export TOKEN_PRIVATE_KEY_PATH="${RUNTIME_SECRETS_DIR}/private.pem"

# --- Application Execution ---
# Drop root privileges and execute the main application process.
# 'exec' replaces the shell process, ensuring the app is the main process (PID 1),
# which is crucial for correct signal handling (e.g., SIGTERM for graceful shutdown).
echo "==> Secrets prepared. Dropping privileges and starting application..."
exec su-exec alpine ./app
