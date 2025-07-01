FROM golang:1.23.9-alpine3.21 AS builder

WORKDIR /go/src/code

# Install openssl, a prerequisite for generating certificates
RUN apk add --no-cache openssl

# Generate the Ed25519 private and public keys in the 'certs' directory
RUN mkdir certs && \
    openssl genpkey -algorithm Ed25519 -out certs/private.pem && \
    openssl pkey -in certs/private.pem -pubout -out certs/public.pem

# Copy go modules files and download dependencies
COPY go.* ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application as a staticly linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app .


FROM alpine:3.21.3

# Install su-exec, a lightweight tool for dropping root privileges.
RUN apk add --no-cache su-exec

# Create a non-root user for security
ARG USER_NAME=alpine
ARG USER_ID=1000
RUN addgroup ${USER_NAME} && adduser --system -u ${USER_ID} -g ${USER_NAME} --no-create-home ${USER_NAME}
# DO NOT switch user here. The container will start as root to fix permissions.

WORKDIR /app

# Copy the generated certificates from the builder stage
# Note: These will be overridden by Render's Secret Files if paths match.
# This setup allows local development and Render deployment to coexist.
COPY --from=builder --chown=${USER_NAME}:${USER_NAME} /go/src/code/certs ./certs

# Copy the compiled application binary from the builder stage
COPY --from=builder --chown=${USER_NAME}:${USER_NAME} /go/src/code/app .

# This CMD does three things:
# 1. Changes ownership of the runtime-mounted /etc/secrets to our app user.
# 2. Drops root privileges using su-exec to become the non-root 'alpine' user.
# 3. Executes the application.
CMD ["sh", "-c", "chown -R alpine:alpine /etc/secrets && su-exec alpine ./app"]
