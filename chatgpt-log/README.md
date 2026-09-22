# ChatGPT Project Log — D Study App

This folder is the persistent handoff/context package for future ChatGPT sessions working on **d-study-app**.

## Start here

Before changing the app, read these files in this order:

1. `LATEST_PROMPT.md` — current master prompt / project instructions.
2. `APP_CONTEXT.md` — architecture, features, data model, routes, and non-regression rules.
3. `FULL_UPDATE_LOG.md` — detailed chronological update history.
4. `PROMPT_LOG.md` — user-request history and decisions.
5. `DEPLOYMENT_CHECKLIST.md` — required checks before and after every release.

Then inspect the current `main` branch, especially `index.html`, because the code is always the final source of truth if documentation is stale.

## Mandatory maintenance rule

**Every deployed version must update this folder in the same work session.**

For every app change:
- update `LATEST_PROMPT.md` so it describes the current app and the new behavior;
- append a detailed entry to `FULL_UPDATE_LOG.md`;
- append the user request / implementation decision to `PROMPT_LOG.md`;
- re-check `APP_CONTEXT.md` and update it if architecture, storage, routes, quiz logic, summaries, themes, or materials changed;
- run the checks in `DEPLOYMENT_CHECKLIST.md`.

Do not silently deploy code without updating the documentation.

## Source-of-truth order

1. Current GitHub `main` code.
2. Current EC214 professor material / files supplied by the user.
3. This `chatgpt-log/` documentation.
4. Older notes / prior prompts / older exams.

If an old prompt conflicts with the current code, preserve the current working behavior unless the user explicitly asks to change it.

## Important limitation

A brand-new ChatGPT conversation does not literally inherit another chat's hidden context. This repository folder is therefore the persistent handoff. A new session should be given the repository and instructed to read `AGENTS.md` or `chatgpt-log/README.md` first.

## Current baseline

- Repository: `ttanabodeejirapong/d-study-app`
- Branch: `main`
- Current baseline at creation of this log: commit `8c4bd02958397143d4ba91f99f85fa27452e609d`
- Current app version understood from code/history: **v12.10**
- Architecture: static GitHub Pages app, primarily implemented in root `index.html`
- Documentation folder created: 2026-09-22
