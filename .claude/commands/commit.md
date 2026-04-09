Stage and commit changes using Conventional Commits format.

1. Run `git status` and `git diff` to understand what changed
2. Stage relevant files (never `.env*`, secrets, or unrelated files)
3. Write a commit message following this format:
   `type(scope): short description`
   - Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
   - Scope: the area changed (e.g. `auth`, `api`, `ui`)
   - Description: imperative, lowercase, no period
4. Commit with `git commit -m "..."`
5. Confirm with `git log --oneline -3`

If $ARGUMENTS is provided, use it as a hint for the commit message.
