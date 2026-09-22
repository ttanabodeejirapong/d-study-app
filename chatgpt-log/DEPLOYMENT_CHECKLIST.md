# Deployment Checklist

Use this before every deployment/version update.

## A. Before editing

- [ ] Read `LATEST_PROMPT.md`.
- [ ] Read `APP_CONTEXT.md`.
- [ ] Read recent entries in `FULL_UPDATE_LOG.md`.
- [ ] Inspect current `main` branch.
- [ ] Identify relevant localStorage/state keys before modifying persistence.
- [ ] Confirm which professor/source material governs content changes.
- [ ] Make sure the requested behavior does not conflict with an intentionally reverted feature.

## B. Runtime non-regression checks

### Navigation
- [ ] Dashboard opens normally.
- [ ] Existing direct routes still work.
- [ ] Summary deep links work.
- [ ] Quiz deep links work.
- [ ] Browser/back navigation behaves sensibly.

### Profiles and persistence
- [ ] Existing profiles load.
- [ ] Existing localStorage state is not reset.
- [ ] Unfinished quiz drafts remain restorable.
- [ ] Per-draft option order remains stable.
- [ ] Cross-tab update behavior remains intact if related code changed.
- [ ] 24-hour session behavior remains intact if auth/session code changed.

### Quiz system
- [ ] Reviewing works.
- [ ] Mastering works.
- [ ] Not sure works.
- [ ] Guessed works.
- [ ] Attempt count/history works.
- [ ] Mistake log opens for non-perfect attempts.
- [ ] Wrong/Not sure/Guessed explanations render correctly.
- [ ] Mastery/confidence logic was not accidentally weakened.

### Summaries
- [ ] Existing lecture summaries still render.
- [ ] Understand it controls are visible and clearly clickable.
- [ ] Understand it expand/collapse works.
- [ ] English/Thai switching works.
- [ ] Text remains readable on mobile and desktop.
- [ ] Professor-specific terminology/examples were preserved.

### Notes / backup
- [ ] Notes remain connected to shared underlying state.
- [ ] Full Backup export still works.
- [ ] Full Backup import still works.
- [ ] New persisted fields are included in backup/restore where appropriate.

### Themes
- [ ] Classic works.
- [ ] Neo Dashboard works.
- [ ] Midnight Workspace works.
- [ ] Light/dark/accent colors remain legible.
- [ ] Reverted V13/Vibrant behavior was not accidentally restored.

### Responsive layout
- [ ] Desktop layout checked.
- [ ] Mobile/narrow layout checked.
- [ ] No major overflow in summary cards, quiz choices, modal/history views, or settings.

## C. Version/documentation requirements

Before considering a release complete:
- [ ] Update version in app if the project convention requires it.
- [ ] Update `LATEST_PROMPT.md`.
- [ ] Append exact user request/decision to `PROMPT_LOG.md`.
- [ ] Append detailed release entry to `FULL_UPDATE_LOG.md`.
- [ ] Update `APP_CONTEXT.md` if behavior/architecture/state/content changed.
- [ ] Record storage migration details if any.
- [ ] Record known limitations.
- [ ] Record commit SHA(s) after deployment.

## D. Safety rule for course materials

Because this repository is public:
- [ ] Confirm redistribution/public upload is intended before committing third-party PDFs.
- [ ] Avoid uploading useless duplicate/macOS `._*` files.
- [ ] Check individual file size before GitHub upload.
- [ ] Files over normal GitHub limits should remain on Drive or use a deliberately configured large-file solution.

## E. After deployment

- [ ] Re-fetch current `main`.
- [ ] Verify expected files changed and unrelated code did not.
- [ ] Confirm documentation reflects the deployed state.
- [ ] If any test could not be performed, state it explicitly in `FULL_UPDATE_LOG.md`.
