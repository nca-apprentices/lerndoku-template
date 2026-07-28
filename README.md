# Lerndokumentation

[![CI](https://github.com/nca-apprentices/lerndoku-template/actions/workflows/ci.yml/badge.svg)](https://github.com/nca-apprentices/lerndoku-template/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/nca-apprentices/lerndoku-template/badge)](https://scorecard.dev/viewer/?uri=github.com/nca-apprentices/lerndoku-template)
[![Lerndoku](https://img.shields.io/endpoint?url=https%3A%2F%2Fnca-apprentices.github.io%2Flerndoku-template%2Fbadge.json)](https://nca-apprentices.github.io/lerndoku-template/)

A Lerndokumentation for the Informatiker/in EFZ apprenticeship. You write
Markdown entries in German. A [Zola](https://www.getzola.org) build turns them
into a static site, GitHub Actions publishes it to GitHub Pages, and a badge
tracks how many months you have documented.

## Prerequisites

You need `git`, `gh`, and `mise` on your machine. If you have not set up GitHub,
a package manager, a private commit email, or commit signing yet, work through
[docs/getting-started.md](docs/getting-started.md) first.

## Set up your repository

1. Click **Use this template**, then **Create a new repository**. Make it
   **public**, because GitHub Pages is only free for public repositories.
2. On the first push, the `Bootstrap template` workflow rewrites the URLs and
   badges in `README.md` and `zola.toml` to your repository, then commits the
   result. Wait for it to finish under the _Actions_ tab.
3. Clone the repository and run the one-time setup. `make setup` needs
   `gh auth login` to have run once, and it is idempotent, so running it again
   is safe.

   ```sh
   git clone https://github.com/<your-user>/<your-repo>.git
   cd <your-repo>
   mise install        # fetches Zola, Python, and Pagefind at pinned versions
   make setup          # git hook, Pages source, branch ruleset, About URL
   ```

4. Set `lerndoku_start` under `[extra]` in `zola.toml` to the month your
   apprenticeship began, in `YYYY-MM` form. The badge counts from there.
5. Replace the sample entry in `content/dokus/2026-08-beispiel/` with your first
   real one, then commit and push. Your site appears at the URL printed by
   `make setup`.

Run `make serve` at any point for a local preview at <http://127.0.0.1:1111>.

## Write an entry

One entry is one folder under `content/dokus/`, named `YYYY-MM-topic`:

```text
content/dokus/2025-09-docker-basics/
├── index.md          # your text (German)
└── screenshot.png    # images right next to it
```

Copy `content/dokus/2026-08-beispiel/` and adapt `index.md`. The frontmatter
between the `+++` markers is TOML:

```markdown
+++
title = "Docker Basics"
date = 2025-09-12
description = "Erste Schritte mit Containern."

[extra]
tags = ["Docker", "DevOps"]   # optional
+++

## Ausgangslage

...

## Vorgehen

...

## Reflexion

...
```

`title` and `date` are required. `description` and `[extra].tags` are optional.
The `date` decides which month the entry counts for.

Then commit and push directly to `main`. CI builds the site and publishes it.

The entry list shows the beginning of each entry as its summary. Put
`<!-- more -->` on its own line to mark where the summary ends.

## Images

Put the image file into the entry folder and embed it with the `img` shortcode:

```jinja2
{{ img(src="screenshot.png", alt="Short description", caption="Optional caption") }}
```

`src` and `alt` are required, `caption` is optional. At build time the shortcode
converts the image to WebP, caps the width at 1200 px, and loads it lazily. CI
rejects source files over 2 MB, so crop or shrink large screenshots before
committing them.

## Code blocks

Fenced code blocks are syntax-highlighted. Name the language after the
backticks, and append `,linenos` to show line numbers:

````text
```python,linenos
print("Hallo")
```
````

## The progress badge

The badge shows `done/expected`. One entry per month is expected since
`lerndoku_start` in `zola.toml`. Several entries in the same month count as one
month.

| Color  | Meaning                    |
| ------ | -------------------------- |
| green  | on track                   |
| yellow | one month missing          |
| red    | two or more months missing |

`scripts/badge.py` recomputes it on every push and on a monthly schedule, and
serves the result at `/badge.json`.

## Commands

Use the Makefile for every task.

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `make serve`     | local preview with live reload                       |
| `make build`     | build the site (incl. search and badge) into `dist/` |
| `make check`     | build plus checks (same as CI)                       |
| `make fmt`       | format Markdown, TOML, and JSON                      |
| `make fmt-check` | check formatting (also runs in the pre-commit hook)  |
| `make badge`     | print the badge JSON                                 |
| `make test`      | tests for the badge script                           |
| `make lint`      | lint the Python scripts                              |
| `make setup`     | one-time setup (hook, Pages, ruleset, About URL)     |

## Repository layout

| Path              | Contents                                        |
| ----------------- | ----------------------------------------------- |
| `content/dokus/`  | your entries, one folder each                   |
| `content/regeln/` | the rules page                                  |
| `templates/`      | Zola templates and the `img` shortcode          |
| `static/`         | stylesheet, search and copy-button scripts      |
| `scripts/`        | badge generator and the setup script            |
| `zola.toml`       | site config, including `lerndoku_start`         |
| `mise.toml`       | pinned tool versions                            |
| `.github/`        | CI, Pages deploy, CodeQL, Scorecard, Dependabot |

## Troubleshooting

- **`make: mise: No such file or directory`**: install mise and restart your
  shell (see [docs/getting-started.md](docs/getting-started.md)).
- **Commit rejected by the pre-commit hook**: run `make fmt`, stage the changes,
  commit again.
- **CI red because of image size**: shrink or crop the image to under 2 MB.
- **Site does not appear**: under _Settings, Pages_, the source must be **GitHub
  Actions**. `make setup` sets this. Then check the _Deploy Pages_ workflow
  under _Actions_.
- **Badge still shows the template repository**: the bootstrap workflow did not
  run or was skipped. Run `make setup`, then commit the changed files.

For anything else, ask your Berufsbildner/in or open an issue.
