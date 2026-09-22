# D Study App — Full App Context

## 1. Purpose

D Study App is a personal study application currently focused on **EC214 Introductory Macroeconomics**. The design goal is not just to display notes: it should help the student understand lecture material, practise with quizzes, track uncertainty and mistakes, retain progress, and revisit weak areas.

The professor's current lecture material is the primary content authority. Older exams, old lectures, student notes, and teaching recordings are supplementary sources.

## 2. Current architecture

The app is a static GitHub Pages project.

### Main implementation
- Root `index.html` contains the majority of the application:
  - HTML
  - CSS
  - application state
  - quiz data
  - summary data
  - navigation
  - profile handling
  - localStorage handling
  - themes
  - rendering logic

### Route folders
Folders such as:
- `summary/`
- `notes/`
- `quiz/`
- `progress/`
- `settings/`
- `history/`
- `prompt/`
- `quiz1-42/`
- `quiz43-70/`
- `quiz-l2-gdp/`
- `quiz-l2-labor-inflation/`
- `sum-1-42/`
- `sum-43-70/`
- `sum-l2-gdp/`
- `sum-l2-labor-inflation/`
- `sum-l3-growth/`
- `sum-l4-finance/`

are lightweight route/loader pages used to provide stable GitHub Pages URLs. Do not duplicate core feature logic into these folders unless necessary.

## 3. Current EC214 content coverage

### Summary coverage
Current summary system covers:
- Lecture 1 — Introduction to Economics
  - Part 1 / pages 1–42
  - Part 2 / pages 43–70
- Lecture 2.1 — Macroeconomic Indicators: GDP
- Lecture 2.2 — Macroeconomic Indicators: Unemployment & Inflation
- Lecture 3 — Economic Growth
- Lecture 4 — Finance, Saving, and Investment

### Quiz coverage
Current quiz libraries cover:
- Lecture 1 pages 1–42
- Lecture 1 pages 43–70
- Lecture 2.1 GDP
- Lecture 2.2 Unemployment & Inflation

At this baseline, Lecture 3 and Lecture 4 have summaries but no equivalent quiz libraries yet.

## 4. Summary design rules

Summaries should be **explanation-first**, not just compressed bullet points.

The app includes clickable **Understand it** sections:
- every important summary section should have an Understand it explanation where appropriate;
- the box is collapsible;
- it should visibly look clickable;
- text should be comfortably readable / larger than before;
- expanded content supports Thai and English switching;
- explanations should make difficult professor shorthand understandable to someone without strong prior knowledge;
- do not remove professor-specific terminology simply to replace it with generic textbook wording.

## 5. Quiz system behavior

Quiz behavior is intentionally more conservative than a simple score tracker.

Important concepts include:
- Reviewing vs Mastering modes;
- per-question confidence/evidence;
- `Not sure`;
- `Guessed`;
- wrong-answer tracking;
- attempt history;
- stable option order within a saved unfinished draft;
- cumulative and focused quiz parts;
- mastery should require repeated strong evidence, not one lucky correct answer.

### Mistake log
Quiz history can be opened for attempts that were not perfect. The mistake log should preserve:
- wrong question;
- chosen answer;
- correct answer;
- explanation;
- Not sure questions;
- Guessed questions;
- historical question snapshot so later quiz edits do not make an old history entry misleading.

Do not weaken or remove this system without explicit instruction.

## 6. Notes

The Notes Hub uses shared underlying note state rather than creating disconnected copies for every UI location.

Notes and other user study state are browser-local and profile-specific.

## 7. Profiles, persistence, and compatibility

The app stores user data in browser `localStorage`.

Important compatibility patterns include:
- `d-study-state::<profile id>`
- per-part / per-mode draft keys under `d-study-draft::<profile id>::...`

Existing state can include:
- profile data;
- preferences;
- quiz history;
- quiz drafts;
- confidence;
- notes;
- current selections;
- study progress;
- theme settings.

There is a 24-hour session concept and cross-tab storage synchronization.

### Critical non-regression rule
**Do not rename, reset, or invalidate existing storage keys casually.**
Any migration must preserve existing unfinished work and user history.

## 8. Backup

The app includes Full Backup import/export so browser-local data can be moved manually between devices.

Any future state additions should be included in backup/restore where relevant.

## 9. Themes

Supported baseline themes:
- Classic
- Neo Dashboard
- Midnight Workspace

A V13/Vibrant experiment was created and then intentionally reverted. Do not resurrect it by accident.

Theme accent colors should apply consistently across both light/dark UI components, not only a few headline elements.

## 10. Navigation and routes

Dedicated route behavior matters because users can bookmark/open summary and quiz pages directly.

When changing routing:
- preserve existing deep links;
- preserve correct back/navigation behavior;
- keep GitHub Pages static hosting constraints in mind.

## 11. Course material archive policy

The course-material archive uses a **hybrid storage policy**:

### Keep as actual GitHub files
Only the five canonical current full annotated professor lecture PDFs:
1. Lecture 1 — Introduction to Economics
2. Lecture 2.1 — Macroeconomic Indicators: GDP
3. Lecture 2.2 — Macroeconomic Indicators: Unemployment & Inflation
4. Lecture 3 — Economic Growth
5. Lecture 4 — Finance, Saving, and Investment (full / All version)

### Keep as links only
Do not copy these historical/supplementary materials into GitHub:
- old exams;
- old lectures;
- exercises / answer keys;
- student notes;
- textbooks;
- other historical archive files;
- professor teaching-record videos.

These remain in the original Google Drive / YouTube locations and are indexed under `course-materials/`.

The separate Lecture 4 Part 1 PDF is an overlapping partial copy and is **not** part of the canonical five-file set.

Current professor teaching-record links supplied by the user:
- 5 Aug 2026 — https://youtu.be/MfZ21jt3GK4
- 19 Aug 2026 — https://youtu.be/u-8Y27FGQDg
- 26 Aug 2026 — https://youtu.be/IRsOy1ElbhY
- 2 Sep 2026 — https://youtu.be/AJOwGEMd3Vk
- 9 Sep 2026 — https://youtu.be/eOboFrmkh7I
- 16 Sep 2026 — https://youtu.be/qh7EOjQfTOM
- 19 Sep 2026 — https://youtu.be/ACnXh3ZiRKI (make-up session)

## 12. Current annotated lecture files supplied in the 2026 project conversation

Canonical five:
- Lecture 1 — Introduction to Economics — annotated, 70 pages.
- Lecture 2.1 — Macroeconomic Indicators: GDP — annotated, 42 pages.
- Lecture 2.2 — Macroeconomic Indicators: Unemployment & Inflation — annotated, 36 pages.
- Lecture 3 — Economic Growth — annotated, 37 pages.
- Lecture 4 — Finance, Saving, and Investment — annotated full version, 50 pages.

Non-canonical duplicate/partial:
- Lecture 4 — Finance, Saving, and Investment — part 1 version, 43 pages.

## 13. Content-source hierarchy

For current EC214 teaching content:
1. current professor lecture PDFs / annotated lecture materials;
2. professor teaching recordings;
3. current professor instructions/context supplied by user;
4. old exams for style / practice / historical coverage;
5. older lecture/student notes for supplementary explanation.

Do not silently import an old-exam topic into the current syllabus unless current material supports it.

## 14. General implementation rule

Before editing:
1. inspect current `main`;
2. identify the exact feature and existing storage/state dependencies;
3. preserve all unrelated working features;
4. make the smallest coherent change;
5. test navigation, state persistence, theme compatibility, mobile layout, and history behavior where relevant;
6. update `chatgpt-log/` documentation as part of the release.
