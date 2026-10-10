# Chinese subject — structure-only implementation (v13.22 branch)

This module extends the existing D Study App UI. It publishes 169 compact vocabulary flashcard entries from user-provided textbook vocabulary tables for Lessons 6–10 (Hanzi, Pinyin, short Thai/English glosses), but **does not** publish textbook scans, lesson summaries, or quiz banks.

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

Progress, Summary, Quiz and History intentionally show empty states. Notes are editable and local. Flashcards has five selectable word decks (Lessons 6–10, 169 terms total) and a blank ungraded writing sandbox.

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

To add writing decks later, register a global `window.D_STUDY_CHINESE_WRITING_BANK` object before opening the Chinese Flashcards tab. Its `decks` array contains objects with `id`, `label`, and `cards`. Cards have stable `id`, Hanzi `h`, Pinyin `p`, and optional meaning `m`. The five lesson decks are supplied in `assets/chinese-boya-l6-l10-v13.22.js`, loaded before `assets/chinese-v13.22.js`. Source scans and the reference HTML remain private.

## Academic state isolation

- Chinese study state: `d-study-chinese-state::<userId>`
- Chinese handwriting flashcards: `d-study-chinese-flashcards::<userId>`
- Chinese draft namespace: `d-study-chinese-draft::<userId>::...`
- Chinese state/flashcard subject ID: `chinese`

Every Chinese academic-state write checks `subjectId`; mismatches are quarantined instead of overwriting another subject. Shared appearance settings remain managed by the app's existing preferences. Subject export/import rejects backups for other subject IDs. The EC214 and TU101 runtime/code/data were not intentionally modified.

Chinese access is automatically granted to a local account in this structure-only build; no Chinese password or token has been configured yet.

## Private-source boundary

User-supplied handwriting prototype HTML and the supplied textbook PDF remain in the owner's connected private Drive, not GitHub. Only compact word-card data is published in the app for practice. Do not put a textbook scan, private file or user academic backup into this public repository.

## Validation status

- JavaScript syntax check: passed.
- Mocked data-isolation smoke check: passed (EC214 and TU101 sentinel states unchanged, cross-subject writes rejected, Chinese state reload successful).
- HTML deep-link loaders and asset references: created and inspected.
- Real-browser/device-specific touch/stylus and fullscreen validation: **not independently verified in this environment**; exercise on iPad and desktop after publishing.

Release recommendation: run the full subject-isolation checklist from `AGENTS.md`, including A → B → A switches, refresh, deep links, logout/login, session restore, notes, and each subject's backup import/export. Automated state-isolation smoke tests cover core data separation, but they cannot prove all browser-specific behavior.
