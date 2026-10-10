# Chinese subject — structure-only implementation (v13.22 branch)

This module extends the existing D Study App UI. It does **not** publish Chinese textbook content, lesson summaries, vocabulary lists or quiz banks.

## Screens and routes

The following eight Chinese route loaders share the existing app runtime:

- `/chinese/progress/`
- `/chinese/summary/`
- `/chinese/quiz/`
- `/chinese/flashcards/`
- `/chinese/notes/`
- `/chinese/history/`
- `/chinese/prompt/`
- `/chinese/settings/`

Progress, Summary, Quiz and History intentionally show empty states. Notes are editable and local. The Flashcards tab has a blank, ungraded writing sandbox, with future support for Chinese word decks.

## Handwriting flashcards

The writing mode is adapted from the user's independent reference implementation, retaining:

- a canvas usable by mouse, touch or stylus;
- no re-layout of the square during a pointer stroke;
- normalized (resolution-independent) ink strokes, re-rendered after a layout/viewport change;
- native element fullscreen when supported and fullscreen-like fallback when unsupported;
- "Write → Check → Remembered / Try again" workflow;
- randomized first pass, missed-card retry passes, and a 100% completion count;
- subject-scoped review checkpoints using stable card IDs.

The sandbox is not scored. It contains no vocabulary.

To add writing decks later, register a global `window.D_STUDY_CHINESE_WRITING_BANK` object before opening the Chinese Flashcards tab. Its `decks` array contains objects with `id`, `label`, and `cards`. Cards have stable `id`, Hanzi `h`, Pinyin `p`, and optional meaning `m`. No actual cards are supplied in this branch.

## Academic state isolation

- Chinese study state: `d-study-chinese-state::<userId>`
- Chinese handwriting flashcards: `d-study-chinese-flashcards::<userId>`
- Chinese draft namespace: `d-study-chinese-draft::<userId>::...`
- Chinese state/flashcard subject ID: `chinese`

Every Chinese academic-state write checks `subjectId`; mismatches are quarantined instead of overwriting another subject. Shared appearance settings remain managed by the app's existing preferences. Subject export/import rejects backups for other subject IDs. The EC214 and TU101 runtime/code/data were not intentionally modified.

Chinese access is automatically granted to a local account in this structure-only build; no Chinese password or token has been configured yet.

## Private-source boundary

User-supplied handwriting prototype HTML and the supplied textbook PDF remain in the owner's connected private Drive, not GitHub. Do not put a textbook scan, private file or user academic backup into this public repository.

## Validation status

- JavaScript syntax check: passed.
- Mocked data-isolation smoke check: passed (EC214 and TU101 sentinel states unchanged, cross-subject writes rejected, Chinese state reload successful).
- HTML deep-link loaders and asset references: created and inspected.
- Real browser, touch/stylus, full-screen and multi-subject lifecycle regression tests: **still required before merging/deploying**.

Release blocker: complete the full subject-isolation regression checklist in `AGENTS.md`, including A → B → A switches, refresh, deep links, logout/login, session restore, notes, and each subject's backup import/export, before deploying.
