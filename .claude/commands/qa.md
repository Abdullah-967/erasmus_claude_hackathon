Run browser QA on the running application.

Follow the Browser QA Protocol:
1. Ensure the dev server is running (`npm run dev`)
2. Use `mcp__playwright-docker__*` tools to navigate the app
3. Check each major flow: auth, core features, edge cases
4. Read all console errors — never suppress or ignore them
5. Fix small issues (wrong routes, missing props, null checks) inline
6. Report major issues (architecture, >3 files) to Abdullah before touching them
