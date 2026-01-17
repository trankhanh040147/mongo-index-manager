.PHONY: help build run test clean install deps fmt lint vet docker-build docker-run docker-stop generate-certs setup

# Variables
APP_NAME := mongo-index-manager-be
BINARY_NAME := app
GO_VERSION := 1.25
MODULE_NAME := doctor-manager-api
BUILD_DIR := build
DOCKER_IMAGE := $(APP_NAME)
DOCKER_TAG := latest
CERT_DIR := certs

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands
setup: generate-certs deps ## Setup development environment (generate certs and install deps)
	@echo "$(GREEN)✓ Development environment setup complete$(NC)"

deps: ## Download Go dependencies
	@echo "$(GREEN)Downloading Go dependencies...$(NC)"
	@go mod download
	@go mod tidy
	@echo "$(GREEN)✓ Dependencies downloaded$(NC)"

install: deps ## Install dependencies and build tools
	@echo "$(GREEN)Installing build tools...$(NC)"
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest || true
	@echo "$(GREEN)✓ Build tools installed$(NC)"

build: ## Build the application
	@echo "$(GREEN)Building application...$(NC)"
	@CGO_ENABLED=0 go build -a -installsuffix cgo -o $(BINARY_NAME) .
	@echo "$(GREEN)✓ Build complete: $(BINARY_NAME)$(NC)"

run: ## Run the application locally
	@echo "$(GREEN)Running application...$(NC)"
	@go run main.go

# Testing Commands
test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	@go test -v -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✓ Coverage report generated: coverage.html$(NC)"

test-race: ## Run tests with race detector
	@echo "$(GREEN)Running tests with race detector...$(NC)"
	@go test -race -v ./...

# Code Quality Commands
fmt: ## Format Go code
	@echo "$(GREEN)Formatting code...$(NC)"
	@go fmt ./...
	@echo "$(GREEN)✓ Code formatted$(NC)"

lint: ## Run linter
	@echo "$(GREEN)Running linter...$(NC)"
	@golangci-lint run ./... || (echo "$(YELLOW)Note: Install golangci-lint with 'make install'$(NC)" && go vet ./...)

vet: ## Run go vet
	@echo "$(GREEN)Running go vet...$(NC)"
	@go vet ./...
	@echo "$(GREEN)✓ Go vet passed$(NC)"

check: fmt vet lint ## Run all code quality checks

# Certificate Generation
generate-certs: ## Generate JWT certificate pair
	@echo "$(GREEN)Generating JWT certificates...$(NC)"
	@mkdir -p $(CERT_DIR)
	@if [ ! -f $(CERT_DIR)/private.pem ] || [ ! -f $(CERT_DIR)/public.pem ]; then \
		openssl genpkey -algorithm Ed25519 -out $(CERT_DIR)/private.pem && \
		openssl pkey -in $(CERT_DIR)/private.pem -pubout -out $(CERT_DIR)/public.pem && \
		echo "$(GREEN)✓ Certificates generated in $(CERT_DIR)/$(NC)"; \
	else \
		echo "$(YELLOW)Certificates already exist in $(CERT_DIR)/$(NC)"; \
	fi

# Docker Commands
docker-build: ## Build Docker image
	@echo "$(GREEN)Building Docker image...$(NC)"
	@docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "$(GREEN)✓ Docker image built: $(DOCKER_IMAGE):$(DOCKER_TAG)$(NC)"

docker-run: ## Run Docker container
	@echo "$(GREEN)Running Docker container...$(NC)"
	@docker run -d \
		--name $(APP_NAME) \
		-p 8216:8216 \
		-e MONGODB_MANAGER_URI=$${MONGODB_MANAGER_URI:-mongodb://localhost:27017} \
		-e REDIS_ADDRESS=$${REDIS_ADDRESS:-redis://127.0.0.1:6379} \
		$(DOCKER_IMAGE):$(DOCKER_TAG)
	@echo "$(GREEN)✓ Container running: $(APP_NAME)$(NC)"

docker-stop: ## Stop Docker container
	@echo "$(GREEN)Stopping Docker container...$(NC)"
	@docker stop $(APP_NAME) || true
	@docker rm $(APP_NAME) || true
	@echo "$(GREEN)✓ Container stopped$(NC)"

docker-logs: ## Show Docker container logs
	@docker logs -f $(APP_NAME)

docker-clean: docker-stop ## Remove Docker image and container
	@echo "$(GREEN)Removing Docker image...$(NC)"
	@docker rmi $(DOCKER_IMAGE):$(DOCKER_TAG) || true
	@echo "$(GREEN)✓ Docker cleanup complete$(NC)"

# Cleanup Commands
clean: ## Clean build artifacts
	@echo "$(GREEN)Cleaning build artifacts...$(NC)"
	@rm -rf $(BINARY_NAME)
	@rm -rf $(BUILD_DIR)
	@rm -rf coverage.out coverage.html
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean docker-clean ## Clean everything including Docker
	@echo "$(GREEN)✓ Full cleanup complete$(NC)"

# Utility Commands
mod-tidy: ## Tidy Go modules
	@echo "$(GREEN)Tidying Go modules...$(NC)"
	@go mod tidy
	@echo "$(GREEN)✓ Go modules tidied$(NC)"

mod-vendor: ## Vendor Go dependencies
	@echo "$(GREEN)Vendoring dependencies...$(NC)"
	@go mod vendor
	@echo "$(GREEN)✓ Dependencies vendored$(NC)"

verify: test vet lint ## Run all verification checks (test, vet, lint)

# Quick development workflow
dev: fmt build run ## Format, build, and run (quick dev cycle)

# Default target
.DEFAULT_GOAL := help
