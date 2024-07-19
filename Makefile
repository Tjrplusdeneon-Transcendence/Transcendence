DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_FILE = docker-compose.yml

# Colors
BLUE  = \033[36m
GREEN = \033[32m
YELLOW = \033[33m
RED = \033[31m
NC = \033[0m

# Gradient
COLOR1 = \033[38;5;196m
COLOR2 = \033[38;5;202m
COLOR3 = \033[38;5;208m
COLOR4 = \033[38;5;214m
COLOR5 = \033[38;5;220m
COLOR6 = \033[38;5;226m
COLOR7 = \033[38;5;118m
COLOR8 = \033[38;5;82m
COLOR9 = \033[38;5;46m
COLOR10 = \033[38;5;51m
COLOR11 = \033[38;5;57m
COLOR12 = \033[38;5;93m
COLOR13 = \033[38;5;129m

# Make par defaut
.DEFAULT_GOAL := help

.PHONY: help build up down logs clean rebuild banner

BANNER := "\n\
$(COLOR1)███████╗████████╗  ████████╗██████╗  █████╗ ███╗   ██╗███████╗ $(COLOR1)██████╗███████╗███╗   ██╗██████╗ ███████╗███╗   ██╗ ██████╗███████╗\033[0m\n\
$(COLOR3)██╔════╝╚══██╔══╝  ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝$(COLOR4)██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝████╗  ██║██╔════╝██╔════╝\033[0m\n\
$(COLOR5)█████╗     ██║        ██║   ██████╔╝███████║██╔██╗ ██║███████╗$(COLOR6)██║     █████╗  ██╔██╗ ██║██║  ██║█████╗  ██╔██╗ ██║██║     █████╗  \033[0m\n\
$(COLOR8)██╔══╝     ██║        ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║$(COLOR8)██║     ██╔══╝  ██║╚██╗██║██║  ██║██╔══╝  ██║╚██╗██║██║     ██╔══╝  \033[0m\n\
$(COLOR10)██║        ██║███████╗██║   ██║  ██║██║  ██║██║ ╚████║███████║$(COLOR10)╚██████╗███████╗██║ ╚████║██████╔╝███████╗██║ ╚████║╚██████╗███████╗\033[0m\n\
$(COLOR12)╚═╝        ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ $(COLOR12)╚═════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝\033[0m\n\
\n"



help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build the Docker containers
	@echo "$(YELLOW)Building Docker containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build
	@echo "$(GREEN)Build complete!$(NC)"

up: banner ## Build and run the Docker containers
	@echo "$(YELLOW)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up --build -d
	@echo "$(GREEN)Containers are up and running!$(NC)"

down: ## Stop the Docker containers
	@echo "$(YELLOW)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down
	@echo "$(GREEN)Containers stopped!$(NC)"

logs: ## Display logs from the Docker containers
	@echo "$(YELLOW)Displaying Docker logs...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f

clean: ## Remove Docker containers and images
	@echo "$(YELLOW)Cleaning Docker environment...$(NC)"
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --rmi all --volumes --remove-orphans
	@echo "$(GREEN)Clean complete!$(NC)"

rebuild: clean build up ## Clean, build and run the Docker containers
	@echo "$(YELLOW)Rebuilding Docker containers...$(NC)"
	@$(MAKE) clean
	@$(MAKE) build
	@$(MAKE) up
	@echo "$(GREEN)Rebuild complete!$(NC)"

banner: ## Display the ASCII art banner
	@echo -e $(BANNER)
