# Claude instructions

This repository is a Lerndokumentation (apprenticeship learning journal) for the
Informatiker/in EFZ apprenticeship: a Zola static site published to GitHub
Pages, with a monthly progress badge. Apprentices write Markdown entries, and
everything else is automation.

## Language

- Site content under `content/` is written in **German**.
- Everything else (README, code, comments, commit messages, tool output) is
  written in **English**.
- Do not use em dashes, en dashes, or semicolons in prose. Use commas,
  parentheses, or separate sentences instead.

## Commands

Use the Makefile for every task:

- `make serve` - local preview
- `make check` - full build plus checks, same as CI
- `make fmt` / `make fmt-check` - format / verify formatting (dprint + rumdl)
- `make lint` / `make test` - ruff and unittest for `scripts/`
- `make badge` - print the progress badge JSON

## Entries

- One entry = one page bundle `content/dokus/YYYY-MM-topic/index.md` with TOML
  frontmatter: `title`, `date`, optional `description`.
- Images live next to `index.md` and are embedded with the `img` shortcode
  (`{{ img(src="...", alt="...", caption="...") }}`). Source images must stay
  under 2 MB, and the build converts them to WebP.
- The badge (`scripts/badge.py`) counts distinct entry months against
  `[extra].lerndoku_start` in `zola.toml`.

## Repository rules

- Keep the site minimal. No tracking, analytics, third-party embeds, or external
  runtime dependencies.
- Keep JavaScript limited to small progressive enhancements (`static/search.js`,
  `static/copy.js`). Everything must work without JS.
- Do not commit `dist/`, `public/`, or `static/processed_images/`.
- Do not remove untracked files unless explicitly instructed.
- Formatting is enforced by the pre-commit hook and CI. Run `make fmt` before
  committing. `dprint` reflows Markdown to 80 columns.
- Workflows pin every action to a full commit SHA with a version comment
  (`uses: owner/repo@<sha> # vX.Y.Z`). Keep it that way when updating.
- Commits go directly to `main`, and history is linear (no force pushes).
- `scripts/badge.py` is stdlib-only by design. Do not add dependencies.
