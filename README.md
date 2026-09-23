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


## v13.11

- TU101 Lecture 1 Summary was rewritten as a slide-first memorization sheet using 7 smaller sections rather than 5 dense sections.
- English remains the default study language because the exam is English, but every Lecture 1 study card can now switch its full content to Thai (title, memory hook, bullets, and Understand-it explanation).
- Coverage follows the professor slide as the primary checklist, including indigenous society, rice/water settlement, fermented food, animism and guardian spirits, stilt houses, Indianization/Sinicization/Islamization/Westernization, multi-ethnicity, migration, all five language families, Peranakan/Baba-Nyonya, hybrid culture, glocalization, cultural kinship, shared-culture disputes, Gordang Sambilan, palace/instrument similarities, and national-food examples.
- TU101 Lecture 1 Quiz remains 4 focused parts + a 40-question cumulative in each mode. Reviewing and Mastering each contain 40 English questions, now rebalanced to be professor-slide-first; assigned readings are supporting context rather than the quiz backbone.
- Existing TU101/EC214 subject isolation, notes, confidence flags, history data, and backup behavior are preserved.
- v13.11 quiz-bank compatibility patch: revised Lecture 1 drafts and completion status are versioned so unfinished v13.10 drafts/history remain preserved but cannot be mistaken for progress on the new question bank.
- v13.11.2 summary-link hotfix: quiz reading-guide links now use the bilingual summary title field, so section labels remain visible after the v13.11 data-shape change.


## v13.12

- TU101 Lecture 1 summary language controls are now independent: the main topic card has its own English/Thai toggle, and each expanded Understand-it box has a separate English/Thai toggle.
- Fixed the v13.11 display glitch where the Thai topic bullet list could remain visible while English was selected; explicit hidden-state CSS now wins over the summary list layout.
- Added seven self-contained visual study diagrams, one per Lecture 1 section, rebuilt from the professor-slide concepts to make relationships easier to see and memorize without depending on external image hosting.
- Lecture 1 Flashcards are now populated for TU101: 4 focused decks containing 42 cards total, plus the engine-generated cumulative deck.
- Flashcard fronts use English exam wording; answer sides use concise English explanations with short Thai memory support.
- Flashcard content follows the professor Lecture 1 slide first and uses the existing subject-isolated storage key `d-study-flashcards::tu101::<userId>`; EC214 flashcard data is untouched.
- Existing TU101 quiz-bank v13.11 compatibility, notes, history, drafts, confidence tracking, backup behavior, and EC214/TU101 academic-state isolation are preserved.


## v13.13

- Flashcards now support an autosaved note field on the revealed answer side.
- A flashcard note is stored with a subject-aware flashcard key, so TU101 and EC214 cannot share or overwrite flashcard notes.
- Notes Hub automatically includes saved flashcard notes with the original flashcard question and answer as context.
- Editing the note from Flashcards or from Notes Hub updates the same saved note.
- Flashcard notes use the subject academic state, so they are included in normal subject backup/import behavior.
- Existing flashcard progress, cumulative decks, quiz notes, and subject-isolation behavior are preserved.


## v13.14 — Complete EC214 lecture flashcards

EC214 now has a complete source-grounded flashcard bank across all five current lectures.

- Lecture 1 — 77 cards
- Lecture 2.1 GDP — 48 cards
- Lecture 2.2 Unemployment & Inflation — 47 cards
- Lecture 3 Economic Growth — 52 cards
- Lecture 4 Finance, Saving & Investment — 56 cards
- Total — 280 unique cards

Each lecture is separated into four focused part decks plus its own **Full Lecture** deck. The Full Lecture deck is automatically built from every card in that lecture. Reaching 100% on a Full Lecture deck means the user has marked every lecture card Remembered, including clearing all missed-card retry rounds; the lecture then shows as complete with the existing `100% × N` counter.

The same card identity is preserved between a focused part and its Full Lecture deck, so v13.13 flashcard notes/images stay attached to the same question and continue to appear in Notes Hub with the flashcard question and answer as context.

EC214 flashcard progress remains isolated under `d-study-flashcards::ec214::<userId>`; TU101 flashcard progress/content is unchanged.


## v13.15 — Secondary EC214 and TU101 access tokens

- Added one **secondary EC214 token** while preserving the existing EC214 credential.
- Added one **secondary TU101 token** while preserving the existing TU101 token.
- Either the original credential or the corresponding subject-specific secondary token unlocks that subject.
- The secondary hashes are isolated as `EC214_SECOND_TOKEN_HASH` and `TU101_SECOND_TOKEN_HASH`, so either secondary token can be removed later without changing the original credential path.
- No academic state, flashcard state, notes, backups, subject-isolation keys, or existing unlocked-account records are changed.
