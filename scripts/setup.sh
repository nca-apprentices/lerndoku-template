#!/bin/sh
# One-time setup after "Use this template": activate the git hook,
# replace placeholders, configure GitHub Pages and the branch ruleset.
# Idempotent - safe to run multiple times.
set -eu

for tool in git gh mise perl; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "Error: '$tool' is not installed (see README, Quickstart section)."
    exit 1
  }
done

gh auth status >/dev/null 2>&1 || {
  echo "Error: gh is not logged in. Run 'gh auth login'."
  exit 1
}

nwo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
owner=${nwo%/*}
repo=${nwo#*/}
owner_lc=$(printf '%s' "$owner" | tr '[:upper:]' '[:lower:]')
pages_url="https://${owner_lc}.github.io/${repo}"

echo "Repository: $nwo"
echo "Site URL:   $pages_url"

echo "-> Activating git hook (core.hooksPath = .githooks)"
git config core.hooksPath .githooks

# Fallback: normally the bootstrap workflow personalizes these on first push.
# The trigger matches the quote-terminated template base_url only, and the
# patterns refuse to match inside longer repo names (e.g. lerndoku-max).
if [ "$nwo" != "nca-apprentices/lerndoku-template" ] &&
  grep -qF 'nca-apprentices.github.io/lerndoku-template"' zola.toml; then
  echo "-> Rewriting template URLs in zola.toml and README.md"
  export owner repo owner_lc
  perl -pi -e '
    s{github\.com/nca-apprentices/lerndoku-template(?![\w-])}{github.com/$ENV{owner}/$ENV{repo}}g;
    s{nca-apprentices\.github\.io%2Flerndoku-template(?![\w-])}{$ENV{owner_lc}.github.io%2F$ENV{repo}}g;
    s{nca-apprentices\.github\.io/lerndoku-template(?![\w-])}{$ENV{owner_lc}.github.io/$ENV{repo}}g;
  ' zola.toml README.md
else
  echo "-> Template URLs already personalized"
fi

echo "-> Setting the repository About URL to the Pages site"
gh api -X PATCH "repos/${nwo}" -f homepage="${pages_url}" >/dev/null

echo "-> Setting GitHub Pages source to 'GitHub Actions'"
if gh api "repos/${nwo}/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/${nwo}/pages" -f build_type=workflow >/dev/null
else
  gh api -X POST "repos/${nwo}/pages" -f build_type=workflow >/dev/null
fi

echo "-> Applying ruleset 'protect-main' (linear history on main)"
if gh api "repos/${nwo}/rulesets" --jq '.[].name' | grep -qx "protect-main"; then
  echo "   Ruleset already exists"
else
  gh api -X POST "repos/${nwo}/rulesets" \
    --input .github/rulesets/protect-main.json >/dev/null
fi

echo "-> Enabling Dependabot alerts"
gh api -X PUT "repos/${nwo}/vulnerability-alerts" >/dev/null 2>&1 || true

echo ""
echo "Done. If files were changed, commit and push them."
echo "Your site appears at ${pages_url}"
