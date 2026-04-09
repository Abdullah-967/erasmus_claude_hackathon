---
name: git-commit
description: Use when about to make a git commit — staging files, constructing a Conventional Commits message, or deciding how to split changes into atomic commits
---

# Git Commit

## Overview
Every commit must be atomic (one concern), safe (no secrets), and clearly described using Conventional Commits format.

## Commit Format

```
type(scope): short description

optional body explaining WHY
```

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change, no behavior change |
| `chore` | Tooling, config, dependencies |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `style` | Formatting, whitespace, no logic change |

**Rules:**
- Description: imperative mood, lowercase, no trailing period
- Scope: the area affected — one word (`auth`, `api`, `ui`, `db`)
- Subject line: max 72 characters
- Body: optional — blank line after subject, explain *why* not *what*

## Pre-Commit Checklist

1. `git status` — understand staged vs. unstaged
2. `git diff` — read every change before staging
3. Stage specific files — avoid `git add .` blindly
4. **Never commit:** `.env*`, `*.local`, secrets, credentials, unrelated files

## Constructing the Message

1. Identify the primary change type from the table above
2. Name the scope — the one area most affected
3. Write description in imperative: "add", "fix", "remove" (not "added", "fixes")
4. Add body only if the *why* isn't obvious from the diff

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `git add .` without reviewing | Run `git diff --staged` first |
| Vague: "fix stuff", "updates" | Specific: `fix(auth): handle expired session token` |
| Past tense: "fixed the bug" | Imperative: "fix the bug" |
| Committing `.env.local` | Add to `.gitignore` before staging |
| One giant commit for multiple concerns | Split into one commit per concern |
