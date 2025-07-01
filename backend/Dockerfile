FROM golang:1.24.4-alpine3.22 AS builder

WORKDIR /go/src/code

# Install openssl, a prerequisite for generating certificates for local dev
RUN apk add --no-cache openssl

# Generate self-signed certs for local development.
# These are NOT used in production but prevent local runs from failing.
RUN mkdir certs &amp;&amp; \
    openssl genpkey -algorithm Ed25519 -out certs/private.pem &amp;&amp; \
    openssl pkey -in certs/private.pem -pubout -out certs/public.pem

# Copy go modules files and download dependencies
COPY go.* ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application as a staticly linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o app .


FROM alpine:3.22

# Install su-exec, a lightweight tool for dropping root privileges.
RUN apk add --no-cache su-exec

# Create a non-root user for security
ARG USER_NAME=alpine
ARG USER_ID=1000
RUN addgroup ${USER_NAME} &amp;&amp; adduser --system -u ${USER_ID} -g ${USER_NAME} --no-create-home ${USER_NAME}

WORKDIR /app

# Copy the compiled application binary from the builder stage
COPY --from=builder --chown=${USER_NAME}:${USER_NAME} /go/src/code/app .

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# The container will run the entrypoint script.
# The script handles preparing secrets and then executing the app.
ENTRYPOINT ["./entrypoint.sh"]

# The CMD is now empty as the ENTRYPOINT handles execution.
CMD []
