.PHONY: be fe db help

be:
	pipenv run python manage.py runserver 0.0.0.0:8000

fe:
	cd frontend && npm run dev

db:
	docker start postgresql_cz

help:
	@echo "Dostupné příkazy:"
	@echo "  make be    - spustí Django development server na 0.0.0.0:8000"
	@echo "  make fe    - spustí Frontend webpack development server"
	@echo "  make db    - spustí PostgreSQL databázi v Docker kontejneru"

