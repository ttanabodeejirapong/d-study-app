# D Study App

Static GitHub Pages study workspace with multiple independently stored subjects.

The current runtime code on `main` is the source of truth. Internal handoff material, private lecture/reference files, and recovery documentation are kept outside the public repository.

Before making changes, read `AGENTS.md`.

## Data safety — subject isolation is mandatory

EC214, TU101, and every future subject must remain independent at the academic-data level.

**A subject update must never overwrite another subject's progress, notes, quiz history, drafts, mastery state, page position, recovery data, or backup.**

Implementation requirements:
- give each subject a unique storage namespace;
- validate that the in-memory state belongs to the subject/key being written;
- persist the current subject before switching, then load the target subject from its own key;
- block/quarantine subject mismatches instead of overwriting data;
- keep shared appearance/preferences separate from academic state;
- make backup/import/export subject-aware and reject cross-subject data;
- never reset/migrate another subject as a shortcut when adding a new subject.

Any change involving subject creation, subject switching, persistence, backup/import/export, recovery, or migrations must run the isolation regression test documented in `AGENTS.md` before deployment.

## Public/private boundary

Do not commit private lecture PDFs, historical exam source files, private prompt logs, user backups, or personal browser-state exports to this repository.
