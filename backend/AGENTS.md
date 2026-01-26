# Agent Instructions for `drmanager/backend`

This document provides instructions for AI agents working in the `drmanager/backend` repository.

## Project Overview

This is a Go backend service for a doctor management application. It's built with the [Fiber](https://gofiber.io/) web framework, uses MongoDB for the database, and provides a RESTful API. The project is containerized using Docker.

## Essential Commands

The project uses a `Makefile` for common tasks.

*   **Setup**: `make setup` - Generates JWT certificates and installs dependencies.
*   **Run**: `make run` - Runs the application locally.
*   **Build**: `make build` - Builds the application binary.
*   **Test**: `make test` - Runs all tests. There are also targets for coverage (`make test-coverage`) and race detection (`make test-race`).
*   **Lint**: `make lint` - Runs the linter (`golangci-lint`).
*   **Format**: `make fmt` - Formats the Go code.
*   **Docker Build**: `make docker-build` - Builds the Docker image.
*   **Docker Run**: `make docker-run` - Runs the application in a Docker container.

## Code Organization

The codebase is organized into the following main directories:

*   `api/`: Contains the API layer, with subdirectories for `controllers`, `middlewares`, `routers`, and `serializers`. The code is further organized by feature (e.g., `api/controllers/auth`).
*   `common/`: Shared components like configuration, logging, and response helpers.
*   `database/`: MongoDB-related code, including models and queries.
*   `job/`: Asynchronous job handling.
*   `utilities/`: Helper packages for JWT, hashing, task queues, etc.
*   `main.go`: The application entry point.

## Naming Conventions and Style Patterns

*   **Interfaces**: Interfaces are used to decouple components, especially in the controller layer (e.g., `Controller` interface in `api/controllers/auth/controller.go`).
*   **Dependency Injection**: `New()` functions are used to create instances of controllers and other components.
*   **Error Handling**: Functions return errors, which are propagated up to the Fiber error handler. Custom error types are defined in `common/response/error`.
*   **Validation**: Request validation is handled by a `Validate()` method on serializer structs.
*   **Database Queries**: Database logic is abstracted into `queries` packages (e.g., `database/mongo/queries`).
*   **Configuration**: Configuration is loaded from a global `cfg` object, initialized from environment variables.
*   **Logging**: A global logger (Zerolog) is used for logging.

## Testing Approach

*   Tests are located in the same package as the code they test, with a `_test.go` suffix.
*   The `make test` command runs all tests.

## Important Gotchas

*   The application requires JWT certificates to be generated (`make generate-certs`) before running.
*   Configuration is managed through environment variables. Refer to the `common/configure` package for details.
*   The project uses `golangci-lint` for linting. Make sure it's installed (`make install`) or run `make lint` which has a fallback to `go vet`.
