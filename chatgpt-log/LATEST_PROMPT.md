# Master Prompt for Future ChatGPT Sessions

You are working on the GitHub repository:

**https://github.com/ttanabodeejirapong/d-study-app/**

Before making any change, read:
- `AGENTS.md`
- `chatgpt-log/README.md`
- `chatgpt-log/APP_CONTEXT.md`
- `chatgpt-log/FULL_UPDATE_LOG.md`
- `chatgpt-log/PROMPT_LOG.md`
- `chatgpt-log/DEPLOYMENT_CHECKLIST.md`
- `course-materials/README.md`

Then inspect the current `main` branch. **Current code is the final source of truth.**

## Your job

Maintain and improve D Study App without regressing existing functionality.

The app is a static GitHub Pages study app primarily implemented in root `index.html`. Route folders are mostly thin loaders/deep-link routes. Avoid unnecessary duplication.

## Non-regression priorities

Preserve:
- existing profiles and localStorage data;
- unfinished quiz drafts;
- quiz option ordering inside saved drafts;
- quiz history;
- mistake logs;
- Not sure / Guessed evidence;
- Reviewing / Mastering logic;
- confidence/mastery tracking;
- shared Notes Hub state;
- backup import/export;
- 24-hour session behavior;
- cross-tab syncing;
- direct/deep routes;
- Classic / Neo Dashboard / Midnight Workspace themes;
- bilingual collapsible Understand it boxes;
- all current lecture summaries and existing quizzes.

Do not reintroduce the reverted V13/Vibrant theme unless explicitly requested.

## Developer management console

Current app version includes a **For Dev** management console in Settings.

Preserve:
- password-gated developer console entry next to Update Log; management content must not render visibly before successful password verification, and opening the console again must require the password again;
- local user/progress overview;
- local activity log;
- local remove-user action;
- local ban/unban enforcement;
- developer snapshot export without PIN hashes;
- clear messaging that IP/global administration is backend-only.

Important: this app is still static GitHub Pages. The developer password gate is not server-grade security. Do not claim it is invisible or impossible to bypass. Do not add third-party IP collection just to simulate an IP console. Proper global users/IP bans require a backend.

## EC214 content rule

Use the current professor materials as the main authority. Preserve professor-specific framing, annotations, formulas, examples, and terminology. Explanations should be detailed enough for a student who may not already understand the lecture shorthand.

Current summary coverage:
- Lecture 1 part 1
- Lecture 1 part 2
- Lecture 2.1 GDP
- Lecture 2.2 Unemployment & Inflation
- Lecture 3 Economic Growth
- Lecture 4 Finance, Saving, and Investment

Current quiz coverage:
- Lecture 1 p.1–42
- Lecture 1 p.43–70
- Lecture 2.1 GDP
- Lecture 2.2 Unemployment & Inflation

## Course-material storage policy

Only these five current annotated lecture PDFs are intended to live in GitHub as actual files:
1. Lecture 1
2. Lecture 2.1
3. Lecture 2.2
4. Lecture 3
5. Lecture 4 full/All

Everything else—old exams, old lectures, exercises/answers, notes, textbooks, historical archives, and professor videos—should remain link-only under `course-materials/`.

The Lecture 4 Part 1 PDF is not part of the canonical five-file set.

## Understand it requirement

Understand it content should:
- exist throughout lecture-summary sections where explanation is useful;
- remain collapsed by default unless current UI says otherwise;
- visibly look clickable;
- use readable sizing;
- provide English/Thai switching in expanded content;
- explain the intuition, not merely repeat the summary.

## Every deployment must update documentation

Whenever you deploy a new version:
1. update this file so it reflects the new current app;
2. append the user's request and implementation decisions to `PROMPT_LOG.md`;
3. append a full version/change entry to `FULL_UPDATE_LOG.md`;
4. update `APP_CONTEXT.md` when architecture/features/state/routes/content change;
5. follow `DEPLOYMENT_CHECKLIST.md`.

**Never deploy a version and leave this handoff documentation stale.**

## Versioning / release notes

Use the app's existing version convention. Do not invent a major-version jump without a reason. Record:
- date;
- version;
- commit(s);
- user request;
- files changed;
- exact behavior added/removed/fixed;
- compatibility/migration notes;
- test/verification notes;
- known limitations.

## Working style

Prefer targeted edits over rewrites. If an old prompt conflicts with current working code, preserve current behavior unless the user explicitly asks for the older behavior.

For risky changes, inspect the related storage and rendering logic first. Do not reset user data as a shortcut.

## Current release baseline

- App version: **v12.12**
- v12.12 fixes the developer access gate: locked content remains hidden and every open requires the developer password again.
- Runtime commit: `c241a270092fce54777d0587a09b98d5ff8786fe`
- The static/local architecture remains unchanged; no cloud backend exists yet.

## Documentation baseline

This master prompt originated on 2026-09-22. Always inspect current `main` rather than assuming that original baseline is still current.
