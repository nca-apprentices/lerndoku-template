# Getting started

Everything you need to set up before you write your first entry: GitHub, a
package manager, the pinned toolchain, and a Git identity that does not leak
your work email address.

Work through the sections in order. Each one ends with a command that tells you
whether it worked. The commands assume macOS and **zsh**, which is the default
shell there.

## Contents

- [1. GitHub](#1-github)
- [2. Homebrew](#2-homebrew)
- [3. mise: the pinned toolchain](#3-mise-the-pinned-toolchain)
- [4. gh: GitHub from the terminal](#4-gh-github-from-the-terminal)
- [5. Keep your real email private](#5-keep-your-real-email-private)
- [6. Sign your commits](#6-sign-your-commits)
- [7. The daily loop](#7-the-daily-loop)
- [Troubleshooting](#troubleshooting)

## 1. GitHub

### Account

Create an account at [github.com](https://github.com/join) with your company
email address, so the organisation can match the account to you (for Copilot).

Turn on two-factor authentication under _Settings, Password and authentication_.
GitHub requires it for contributors anyway.

Your company address stays on the account. It does not go into your commits,
which is what section 5 sets up.

### The vocabulary

| Term         | What it means                                                 |
| ------------ | ------------------------------------------------------------- |
| repository   | one project, including its full history                       |
| commit       | one saved change with a message explaining _why_              |
| branch       | a named line of commits, of which `main` is the published one |
| remote       | the copy on GitHub, called `origin` here                      |
| push, pull   | send your commits up, or fetch other commits down             |
| pull request | a proposal to merge one branch into another, with review      |
| Actions      | GitHub's CI, meaning scripts that run on every push           |

### Create your repository

1. Open the template repository and click **Use this template, Create a new
   repository**.
2. Name it (for example `lerndoku`) and make it **public**, because GitHub Pages
   is only free for public repositories.
3. A one-time bootstrap workflow rewrites all URLs and badges to your
   repository. Wait for it to go green under the _Actions_ tab.

### Get it onto your machine

```sh
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
```

Cloning over HTTPS is fine, because `gh` (section 4) supplies the credentials,
so you never type a password. SSH keys are still worth setting up, because
commit signing uses one (section 6).

Check: `git remote -v` prints your repository twice, as `origin`.

## 2. Homebrew

[Homebrew](https://brew.sh) is the macOS package manager. A _formula_ is a
command-line tool, and a _cask_ is a GUI application.

### Install it

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The installer writes to `/opt/homebrew` on Apple Silicon. At the end it prints a
line to add to `~/.zshrc`:

```sh
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Open a new terminal and run `brew --prefix`. It must print `/opt/homebrew`.

### Install casks into `~/Applications`

Casks land in `/Applications` by default, which needs an administrator password
every time. Point them at your home directory instead, in `~/.zshrc`:

```sh
export HOMEBREW_CASK_OPTS="--appdir=$HOME/Applications --no-quarantine"
```

Create the folder (`mkdir -p ~/Applications`) and install:

```sh
brew install --cask jetbrains-toolbox
```

Apps in `~/Applications` show up in Spotlight and Launchpad like any other.
Without the flag, `brew install --cask` asks for an administrator password and
fails if you do not have one.

Not every cask works this way. Some ship installer packages (`.pkg`) or system
extensions that insist on writing outside your home directory. Those you have to
request from IT.

Check: `brew install --cask jetbrains-toolbox` finishes and the app appears in
`~/Applications`.

### Your editor: IntelliJ IDEA

Use IntelliJ IDEA for the everyday work in this repository: writing entries,
staging and committing, and running the Makefile targets from the built-in
terminal.

Install it through JetBrains Toolbox, the cask you just installed. Open Toolbox,
sign in with your JetBrains account, and install **IntelliJ IDEA**. Toolbox
handles updates from then on, so you never install a JetBrains IDE by hand
again.

Then open the repository folder in IntelliJ. Markdown files get a live preview
next to the editor, and the Git panel shows what you are about to commit.

## 3. mise: the pinned toolchain

[mise](https://mise.jdx.dev) installs the exact tool versions a project
declares, per project. This repository pins Zola, Python, and Pagefind in
`mise.toml`, so your local build and CI run identical versions, and "works on my
machine" stops being an argument.

```sh
brew install mise
```

Activate it in your shell, so entering the directory switches versions
automatically. Add this to `~/.zshrc`, below the `brew shellenv` line:

```sh
eval "$(mise activate zsh)"
```

Then, inside the repository:

```sh
mise trust      # confirm you trust this repo's mise.toml
mise install    # fetch every pinned tool
```

Two commands are worth knowing:

- `mise install` reads `mise.toml` and downloads what is missing.
- `mise exec -- <cmd>` runs a command with the pinned versions on `PATH`, even
  without shell activation. The `Makefile` uses this form, which is why
  `make serve` works regardless of your shell setup.

Check: `mise exec -- zola --version` prints the version pinned in `mise.toml`.

## 4. gh: GitHub from the terminal

[`gh`](https://cli.github.com) is GitHub's official CLI. It handles
authentication for `git push`, and it is the correct way to talk to the GitHub
API. Never hand-roll `curl` calls against `api.github.com`.

```sh
brew install gh
gh auth login
```

Choose _GitHub.com_, then _HTTPS_, then _Login with a web browser_, and answer
**yes** when it offers to authenticate Git with your GitHub credentials. That
last step is what makes `git push` stop asking for passwords.

Useful commands:

```sh
gh repo view --web        # open this repository in the browser
gh run list               # recent CI runs
gh run watch              # follow the running build live
gh run view --log-failed  # logs of the failed step only
gh issue create           # open an issue
gh pr create              # open a pull request from the current branch
```

Check: `gh auth status` reports you as logged in with a valid token.

## 5. Keep your real email private

Every commit records an author name and email, and on a public repository that
email is visible to everyone forever, including spam crawlers. Never commit with
your company address.

GitHub gives you a permanent alias of the form
`<id>+<username>@users.noreply.github.com`. Find yours under _Settings, Emails_,
below **Keep my email addresses private**. Tick that box while you are there,
because it makes GitHub itself use the alias for anything committed through the
web interface.

Set it for this repository:

```sh
git config user.email "<id>+<username>@users.noreply.github.com"
git config user.name "Your Name"
```

Adding `--global`, as in `git config --global user.email ...`, makes it the
default for every repository on the machine. Doing both is the safe combination:
a global private default, plus an explicit per-repository value so a stray
global change cannot leak the wrong address.

Check:

```sh
git config user.email          # your noreply alias
git log -1 --format='%ae %ce'  # author and committer of the last commit
```

Turn on the guard rail as well, under _Settings, Emails_: **Block command line
pushes that expose my email**. GitHub then rejects any push whose commits carry
your real address, before it becomes public.

If you already committed with the wrong address, the fix is to rewrite the
affected commits and force-push, which rewrites history for everyone who cloned
the repository. That is easiest while nobody else has a copy:

```sh
git commit --amend --reset-author --no-edit   # last commit only
```

For anything deeper, use
[git-filter-repo](https://github.com/newren/git-filter-repo) and ask your
Berufsbildner/in first.

## 6. Sign your commits

A signature proves a commit really came from you. Without one, anyone can author
a commit under your name and email. GitHub shows signed commits with a green
**Verified** badge. SSH signing is the simplest route, because it uses one key
for both pushing and signing.

### Create a key

```sh
ssh-keygen -t ed25519 -C "your-key-comment"
```

Accept the default path (`~/.ssh/id_ed25519`) and set a passphrase.

### Register it with GitHub, twice

A key is registered for one purpose at a time, so upload it as both an
authentication key and a signing key:

```sh
gh ssh-key add ~/.ssh/id_ed25519.pub --type authentication --title "laptop"
gh ssh-key add ~/.ssh/id_ed25519.pub --type signing --title "laptop"
```

### Tell Git to use it

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

To make `git log --show-signature` verify locally as well, Git needs a list of
trusted signers:

```sh
mkdir -p ~/.config/git
printf '%s %s\n' "$(git config user.email)" "$(cat ~/.ssh/id_ed25519.pub)" \
  >> ~/.config/git/allowed_signers
git config --global gpg.ssh.allowedSignersFile ~/.config/git/allowed_signers
```

Use the same address here as in section 5, because the signer file is matched by
email.

Check: commit something, then `git log -1 --show-signature` reports a good
signature, and the commit shows **Verified** on GitHub.

> GPG works too and is what older guides describe, but it means managing a
> keyring, an expiry date, and an agent. With SSH signing you reuse the key you
> already have.

## 7. The daily loop

```sh
git pull                 # start from the current state
mise install             # only when mise.toml changed
make serve               # preview at http://127.0.0.1:1111
# ... write your entry under content/dokus/YYYY-MM-topic/index.md ...
make fmt                 # format Markdown, TOML, JSON
make check               # the same build and checks CI runs
git add content/dokus/YYYY-MM-topic
git commit -m "docs: Eintrag zu <Thema>"
git push
gh run watch             # follow CI until it is green
```

Stage the files belonging to your entry explicitly instead of using `git add .`,
which keeps caches and editor files out of the history by habit rather than by
luck.

Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org): a `type: summary`
line, present tense, no trailing period. Common types here are `docs` for
entries, `feat` and `fix` for site changes, and `chore` for maintenance.

## Troubleshooting

**`brew: command not found`**: the `shellenv` line is missing from `~/.zshrc`,
or you have not opened a new terminal since adding it.

**A cask still asks for an administrator password**: `HOMEBREW_CASK_OPTS` is not
set in the current shell (check with `echo $HOMEBREW_CASK_OPTS`), or the cask
installs a `.pkg` that cannot go into your home directory.

**`make: mise: No such file or directory`**: mise is not on `PATH`. Install it
and restart the shell.

**`mise: config file is not trusted`**: run `mise trust` inside the repository.

**The commit is rejected by the hook**: formatting failed. Run `make fmt`, stage
the changes, commit again.

**The push is rejected with "your push would publish a private email address"**:
the guard rail from section 5 is doing its job. Fix `git config user.email`,
then amend or rewrite the offending commits.

**The commit shows _Unverified_ on GitHub**: the key is not registered with
`--type signing`, or the commit was made before `commit.gpgsign` was enabled.

For anything else: ask your Berufsbildner/in or open an issue.
