#

.PHONY: $(shell egrep -o ^[a-zA-Z_-]+: $(MAKEFILE_LIST) | sed 's/://')

PKG_NAME=remo_watch

default: help

build: ## Build docker
	docker build -t ${PKG_NAME} .

run: ## Run docker
	docker rm ${PKG_NAME} || true
	docker run -d --name ${PKG_NAME} --volume=`pwd`/config:/config:ro ${PKG_NAME}

stop: ## Stop docker
	docker kill ${PKG_NAME} || true
	docker rm ${PKG_NAME} || true

logs: ## Show docker logs
	docker logs ${PKG_NAME}

lint: ## Run eslint
	npm run lint

dev: ## Run localy
	npm run dev

create-table: ## Create table
	npx ts-node src/tables/create_table.ts ./

drop-table: ## Drop table
	npx ts-node src/tables/drop_table.ts ./

clean: ## Clean docker container, images
	docker ps -a | grep -v "CONTAINER" | awk '{print $$1}' | xargs docker rm
	docker images -a | grep "^<none>" | awk '{print $$3}' | xargs docker rmi

help: ## This help
	@grep -Eh '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
