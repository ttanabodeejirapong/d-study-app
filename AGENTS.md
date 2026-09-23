# D Study App — Agent Entry Point

Internal project handoff documentation is intentionally kept outside this public repository.

Before changing the app:
1. Inspect current `main`; current code is the runtime source of truth.
2. With the owner's connected Google Drive, open `D Study App — Private`.
3. Read the private `ChatGPT Log` folder, especially the latest private prompt and app context.
4. Preserve existing browser data, quiz drafts/history, notes, routes, themes, summaries, and other working behavior unless the owner explicitly requests a change.

Do not add private lecture PDFs, detailed internal prompt logs, or database/backups to this public repository.


## CRITICAL — Subject data isolation

**Never allow one subject to overwrite, migrate into, reset, or masquerade as another subject's data.**

This is a release-blocking requirement for EC214, TU101, and every future subject.

Rules:
1. Every subject must have its own explicit storage namespace for academic state, quiz drafts, notes, history, recovery snapshots, and any future subject-specific data.
2. Never choose a write destination only from a mutable UI variable such as `activeSubject`. Before every subject-state write, validate that the in-memory state belongs to the same subject/schema as the destination key.
3. Subject switching must follow this order: **persist current subject to its own key → switch subject identity → load target subject from its own key → render target**. A stale in-memory state must never be saved into the target subject's key.
4. If a state/key subject mismatch is detected, **block the write**. Preserve/quarantine the value for recovery rather than overwriting another subject.
5. Shared settings may use a shared preferences key, but only appearance/preferences belong there. Progress, pages, notes, note images, quiz history, confidence data, drafts, mastery state, and recovery data remain subject-isolated.
6. Backup/export/import must be subject-aware. Validate the subject identity inside a backup before import; never label/export TU101-shaped data as EC214 or vice versa.
7. Adding a new subject must not reuse an existing subject's state key, draft key, recovery key, migration path, or in-memory state object.
8. Never reset or migrate existing subject data as a shortcut for implementing a new subject.

### Required regression test for every subject/storage change

Before deployment, seed visibly different sentinel data in at least two subjects, then verify all of the following without cross-write:
- Subject A → Subjects → Subject B
- Subject B → Subjects → Subject A
- refresh while inside each subject
- deep-link into each subject
- logout/login and 24-hour session restore
- edit a note/progress value in one subject and confirm the other subject is unchanged
- export each subject and confirm the backup contains only that subject's academic state

If any subject's state appears in another subject's key or backup, **do not deploy**.
