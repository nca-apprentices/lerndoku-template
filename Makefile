MISE   = mise
ZOLA   = $(MISE) exec -- zola
PY     = $(MISE) exec -- python3
DPRINT = $(MISE) exec dprint@0.54.0 -- dprint
RUMDL  = $(MISE) exec rumdl@0.2.9 -- rumdl
RUFF   = $(MISE) exec ruff@0.15.3 -- ruff

DIST = dist
BASE_URL_FLAG = $(if $(BASE_URL),--base-url $(BASE_URL))
MAX_IMG_KB = 2048

.PHONY: build serve check check-images badge fmt fmt-check lint test setup clean

build:
	rm -rf $(DIST)
	$(ZOLA) build --output-dir $(DIST) $(BASE_URL_FLAG)
	rm -rf $(DIST)/pagefind
	$(MISE) exec -- pagefind --site $(DIST) --glob "dokus/*/index.html"
	$(PY) scripts/badge.py --out $(DIST)/badge.json

# zola serve does not run Pagefind, so build the index once into static/
# (gitignored) where the dev server picks it up. It reflects the state at
# `make serve` time; rerun to refresh it.
serve: build
	rm -rf static/pagefind
	cp -R $(DIST)/pagefind static/pagefind
	$(ZOLA) serve

check: build check-images
	test -f $(DIST)/index.html
	test -f $(DIST)/regeln/index.html
	test -f $(DIST)/badge.json
	test -d $(DIST)/pagefind
	@echo "check ok"

check-images:
	@big=$$(find content static -type f \( -iname '*.png' -o -iname '*.jpg' \
	  -o -iname '*.jpeg' -o -iname '*.gif' -o -iname '*.webp' \) -size +$(MAX_IMG_KB)k); \
	if [ -n "$$big" ]; then \
	  echo "Images larger than $(MAX_IMG_KB) KB found - please shrink:"; \
	  echo "$$big"; exit 1; fi

badge:
	$(PY) scripts/badge.py --out /dev/stdout

fmt:
	$(DPRINT) fmt
	$(RUMDL) fmt .

fmt-check:
	$(DPRINT) check
	$(RUMDL) check .

lint:
	$(RUFF) check scripts
	$(RUFF) format --check scripts

test:
	$(PY) -m unittest discover -s scripts

setup:
	sh scripts/setup.sh

clean:
	rm -rf $(DIST) public static/processed_images static/pagefind
