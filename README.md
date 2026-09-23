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


## Flashcards

v13.9 adds the same Flashcards workspace to EC214 and TU101, with no study cards populated yet.

The engine is ready for:
- separate part decks plus a cumulative deck;
- tap/press to reveal the answer;
- shuffle remaining cards;
- Remembered / Haven’t remembered ratings;
- automatic random repetition of only missed cards after the first pass until 100%;
- autosave during play;
- a per-deck “100% × N” completion counter;
- per-deck and all-flashcard reset controls.

Flashcard review state is subject-isolated under `d-study-flashcards::<subjectId>::<userId>`. EC214 and TU101 must never share or overwrite flashcard progress.


## v13.10

- Fixed restored/deep-linked EC214 `/flashcards/` sessions opening Progress instead of Flashcards.
- TU101 Lecture 1 / Chapter 1 now has a full source-grounded Summary built from the professor slide and the two assigned readings.
- TU101 Lecture 1 Quiz now has 4 focused parts + a 40-question cumulative in both Reviewing and Mastering (40 questions per mode).
- TU101 Quiz follows the EC214 study rules: randomized answer positions, autosaved drafts, section/question notes, Not sure/Guessed confidence, weighted learning score, conservative mastery progression, Quiz History, and Mistake Log.
- Lectures 2–6 are not expanded into full summaries/quiz banks yet.
