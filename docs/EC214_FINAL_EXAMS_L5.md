# EC214 Final Exams — Lecture 5 (v14.2)
 
## Ownership & course source
EC214 Final Exams is a **fourth, separately authorized subject**, not a rename or extension of the original EC214 (midterm) academic record. The current teacher-annotated source is the owner's **EC214 Lecture 5, Aggregate Demand and Aggregate Supply, 2026-2 Afternoon** PDF, 49 uploaded pages. The original file is in the owner's connected private Google Drive under **EC214 Final Exams — Private Sources**. Never upload the PDF, professor's marked slides, account backups or plaintext subject token to the public repository.

## Release contents
- Subject card in the existing **Choose your subject** grid, with preview, lock/unlock status and a local token gate.
- Standalone theme-linked final study shell at `/d-study-app/ec214-final/` to avoid modifying the original core academic state engine.
- Direct link loaders: `progress/`, `summary/`, `quiz/`, `flashcards/`, `notes/`, `history/`, `prompt/`, `settings/`.
- Summary: 13 source-referenced sections, diagrams redrawn from AD–AS relationships, all professor slide mechanisms, numerical schedules, aggregate demand multiplier, macroeconomic equilibrium, output gaps and long-run self-correction.
- Quiz: 43 Reviewing questions and 42 Mastering questions with stable IDs `l5-r-###` and `l5-m-###`, all 4-choice, documented correct answer/explanation and professor source page. A few derived arithmetic examples are explicitly labeled.
- Independent quiz drafts, score/history, mistaken-question details, confidence flags, per-question notes and subject-level study notes.
- Flashcards intentionally left blank. New lecture slots will be populated as the owner supplies approved professor sources.

## Technical boundaries
- Profile login is the **existing** `d-study-users-v1` / `d-study-active-user` local browser session with 24-hour expiry, checked before opening this subject.
- Subject unlock is stored in `subjectAccess.ec214final`, never overwrites `subjectAccess.ec214` or `subjectAccess.tu101`.
- Token verifier: one-way SHA-256 hash in public code, plaintext token conveyed privately to the owner. This is a client-side gate, not secure server-side authentication.
- Academic namespace: `d-study-ec214-final-state::<profileId>`, with `subjectId: "ec214final"` and `profileId` validated before every write.
- Quiz drafts: `d-study-ec214-final-draft::<profileId>::l5::<mode>`, separately for Reviewing and Mastering.
- Invalid data is quarantined under `d-study-ec214-final-quarantine::...` rather than silently reused.
- Backup/export is only EC214 Final; import checks both subject identity and local profile identity.
- Shared appearance remains `d-study-shared-preferences-v1`. Do not put academic data there or edit existing subjects' keys.
- There is **no cross-device cloud sync**.

## Follow-up lecture development
Create a new professor-grounded content module and independent quiz bank for each future lecture, using stable identifiers (e.g. `l6-`, `l7-`). Update the final workspace dashboard and navigation while preserving `l5` record IDs, drafts and history. Add to this same EC214 Final subject; do not create an additional separate subject for each lecture. Keep the same Reviewing/Mastering, Notes, Progress, Flashcards, Quiz History and Backup flow.

## Release verification
- JavaScript parse/syntax test passed.
- Content checks passed: 13 summary sections, Reviewing 43, Mastering 42, unique question IDs and source/explanation fields.
- Simulated lifecycle confirmed login gate, wrong token rejection, correct token granting only `ec214final`, notebook autosave, complete Mastering attempt, scored history, separate draft and reset preserving submitted history.
- Existing EC214/TU101/Chinese academic sentinel states remained unchanged in tests.
- Full real-browser iPad/Safari and account-scoped manual test should be done following deployment; automated mocks cannot prove every UI gesture.

## v14.3 update — Existing EC214 template features

- Cross-section summary search, searchable question bank, searchable Notes Hub and Mistake Log with direct navigation and source references.
- Confidence decisions persist in independent mode-specific drafts (Confident=1.0, Not sure=0.7, Guessed=0.4, wrong=0); raw and adjusted learning scores saved independently after submission.
- Completion counts are derived from EC214 Final history (Taken N times, best learning, clean 100% × N). A topic earns Mastered only after two clean Mastering passes.
- Each new attempt saves option-shuffle order and full answer snapshots so past answers remain readable after later lecture additions.
- Backward compatibility: v14.2 drafts default to their original A–D order without resetting answers or flags; v14.2 history is displayed without recalculation of unrecorded learning confidence. Existing professor Lecture 5 questions and IDs, original subject engines, and private source file remain unchanged.

## v14.3.1 — Question-number note indicator
The quiz question picker shows a small violet saved-note dot if `state.quizQuestionNotes[questionId]` contains non-whitespace text. It updates immediately on textarea input and restores on any quiz re-render or browser reload. It is independent of answered/flagged/uncertain indicators, and never changes quiz grading. Existing per-question records are reused without a migration.

## v14.3.2 — Reading layout parity with EC214

The Final Exam stylesheet uses a larger base font (17px Normal / 19px Large); most Summary body text is approximately 18px Normal, quiz questions 21px, and answer choices 18px. The Summary library now sits above full-width article cards rather than taking a narrow permanent sidebar. Question controls, notes, history, tables, figure captions and other labels scale up for iPad/desktop and mobile. These changes preserve Classic/Neo/Midnight + accent tokens, tactile controls, and the noted-question purple-dot marker. Final Settings exposes the shared `textSize` and `font` controls, without adding new academic keys. Existing Lecture 5 content and quizzes remain unchanged.

## v14.4 — Four quiz parts and professor summary deep links

Reviewing: 12, 10, 11, 10 questions in p1–p4; Mastering: 11, 11, 10, 10 questions in p1–p4. Content and question IDs are identical to the existing lecture bank. Each part has its own draft key `d-study-ec214-final-draft::<profileId>::l5::<mode>::<partId>`. Submitted history contains `partId`; older attempts without `partId` remain legacy full-bank attempts. Existing full-draft keys are preserved and reachable only through the optional legacy control. Per-part completion counts and raw/weighted scores are computed from filtered history. Mastery statistics for a topic use a part-specific stats key in the existing EC214 Final state to avoid conflating topic fragments across two parts.

Hints identify the professor's topic and source page but never reveal an answer. Each question links to `/d-study-app/ec214-final/summary/#final-section-<topicId>` with direct navigation and a return-to-quiz control; Notes search also switches to the correct part when opening a question. Cross-part question search remains available.

Backup export/import retains the old `reviewing`/`mastering` full-draft properties when present, and appends validated `reviewingParts`/`masteringParts` objects for all four part drafts. Never write to other subjects' storage namespaces. No professor PDF or plaintext access token was uploaded publicly.

## v14.5 — Per-question visual and table coverage

The professor's 49-page Lecture 5 PDF remains a private Drive source. Every currently published Lecture 5 question was audited and assigned a visual type in the separate `assets/ec214-final-l5-visuals-v14.5.js` module. Of 85 total IDs, 82 display one visual: 39 theme-colored conceptual SVG graphs, 17 semantic data tables, 18 study-process flows, 8 formula panels. R004/R043/M038 were explicitly audited and left text-only because a diagram would add no meaningful learning value.

The professor AS and AD schedules, numerical AD–AS equilibrium, full output-gap example, money-wage/price example and GDP spending components are represented as readable tabular/formula inputs. The graph for an unseen shock is deliberately neutral (two alternatives), without drawing the correct answer. Every SVG has an accessible description and caption; tables have column headers and horizontal scroll on narrow screens. Original professor slide images/PDF are not copied to public GitHub.

When adding a future lecture's quiz: review all questions against the original approved source, explicitly classify each question as graph/table/formula/flow/none, validate coverage, and test that question IDs, answer options, confidence scoring, four-part progress, and quiz history remain intact. No source text, quiz IDs or academic data formats changed for v14.5.

## v14.6 — Final screenshot Mock, preserving v14.5 L5 quiz visuals

The owner supplied 17 screenshots of the original 30-question Google Form final mock. Originals were privately archived in `EC214 Final Mock — 30 Questions — Source Screenshots`, folder `1mTLc8gM9IpNZEW77LXd6p0LAw5bcR4_7` (under EC214 Final Exams private sources), and must never be committed publicly. `assets/ec214-final-mock-v1.js` reconstructs the original form wording, correct source order, 3×10 question parts, and all four/five answer choices. The screenshots do **not** contain an official answer key: the answers/explanations are inferred and clearly marked unofficial. For the two graph-dependent AE questions (Q4/Q7), the client redraws the original AE₀, AE₁, AE=Y and Y₁/Y₂/Y₃ relationship as a responsive accessible SVG. Four calculations (Q6/Q8/Q11/Q18) have neutral data tables.

Independent Mock storage keys: `d-study-ec214-final-mock-state::<userId>` and `d-study-ec214-final-mock-draft::<userId>::v1::<p1|p2|p3>` with subject/profile/mock/part identity validation. Mock stores separate notes, purple note-dot statuses, Confident/Not sure/Guessed point records, part history, review snapshots, search progress and bookmarks; subject-scoped backup export/import includes Mock data and validates before replacing. Old backups without Mock data preserve existing Mock work. The preexisting v14.5 `assets/ec214-final-l5-visuals-v14.5.js` must continue loading BEFORE the existing Lecture 5 quiz runtime; never replace or duplicate that audit. The new Mock is a separate tab at `/d-study-app/ec214-final/mock/`, not Lecture 5 Part 5. The Professor has not yet supplied the later lecture slides, so related Lecture 5 links appear only for topics that actually exist.
