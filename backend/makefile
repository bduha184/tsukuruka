.PHONY: $(MAKECMDGOALS)

APP_NAME=tsukuruka
MODULE=github.com/bduha184/$(APP_NAME)

GO_VERSION=1.23
GO_IMAGE=golang:$(GO_VERSION)-alpine
TTY=$(shell test -t 0 && echo "-it")
DOCKER_RUN=docker run --rm $(TTY) -v "$$PWD:/app" -w /app $(GO_IMAGE)

GO_DEPS=\
	github.com/go-chi/chi/v5 \
	github.com/go-chi/cors \
	github.com/jackc/pgx/v5@v5.7.4 \
	github.com/99designs/gqlgen@v0.17.50

# --------------------
# all
# --------------------
all: generate
	@echo "✅ Go backend setup complete"

# --------------------
# init
# --------------------
init:
	@if [ ! -f go.mod ]; then \
		$(DOCKER_RUN) go mod init $(MODULE); \
	fi

# --------------------
# deps
# --------------------
deps: init
	$(DOCKER_RUN) sh -c '\
		for dep in $(GO_DEPS); do \
			go get $$dep; \
		done \
	'

# --------------------
# tidy
# --------------------
tidy: deps
	$(DOCKER_RUN) go mod tidy

# --------------------
# gqlgen init
# --------------------
gqlgen-init: tidy
	@if [ ! -f gqlgen.yml ]; then \
		$(DOCKER_RUN) go run github.com/99designs/gqlgen init; \
	fi

# --------------------
# generate
# --------------------
generate: gqlgen-init
	$(DOCKER_RUN) go run github.com/99designs/gqlgen generate

# --------------------
# clean
# --------------------
clean:
	rm -rf graph generated gqlgen.yml schema.graphql schema.graphqls tools.go
