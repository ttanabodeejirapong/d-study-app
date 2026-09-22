# Full Detailed Update Log

This log records both app releases and documentation/handoff changes. It is intentionally more detailed than a short in-app changelog.

## Baseline reconstructed from Git history — 2026-09-22

> Note: entries below are reconstructed from available Git commit history and current project context. Future entries should be written at deployment time and should include exact implementation/testing details.

### v12.x — current maintained line

#### v12.10 baseline — Understand it readability / visibility
Commit: `8c4bd02958397143d4ba91f99f85fa27452e609d`
- Enlarged and emphasized clickable Understand it cards.
- Goal: make the explanation affordance clearly discoverable and easier to read.
- Preserved bilingual/collapsible behavior.

Related prior commit:
- `747d48558f95e4d3be069bf96ced50affb6bfc4d` — made Understand it controls larger and more visibly clickable.

#### Bilingual collapsible Understand it
Commit: `2a46799ffd9f1ece1d8f9b54eee92ecf13eea8d4`
- Converted Understand it explanations to collapsible controls across lecture summaries.
- Added Thai/English switching to expanded explanations.
- Requirement: all relevant lecture sections should receive explanation-first support, not just selected examples.

#### Clickable quiz-history mistake logs
Commit: `23d831e72a569b3aecaf5e8d5993aedcd4452a00`
- Added clickable historical attempt details for non-perfect attempts.
- Mistake history includes wrong questions and explanations.
- Also preserves Not sure and Guessed review context.
- Historical question snapshots are important so later question edits do not corrupt old review records.

#### Explanation-first lecture summaries
Commit: `8deec8f4ad0cea8d51911e0797d33aa9659047ff`
- Expanded lecture summaries so sections contain enough explanation to understand the professor's shorthand.
- Shifted from terse bullet-only summaries toward quiz-ready conceptual explanations.

#### Theme accent fixes
Commit: `eb1fde70fd589e03f2287530d6fa3d8e33af1db5`
- Fixed remaining accent-color inconsistencies across dark and light UI.
- Theme changes should remain systematic across components.

#### Dedicated summary routes
Commits:
- `3fbccdc71286b2be1ef326931fd4ce87aefad559`
- `a49d7c86e41a48fc70b46c5b82927af167c52256`
- Added dedicated summary route behavior for stable navigation/deep links.

#### Expanded summary coverage
Commit: `735f582175c6e37cf0dbf6523b446ae952c0a3d5`
- Expanded summaries to cover all five current professor lecture files available at that time:
  - Lecture 1
  - Lecture 2.1 GDP
  - Lecture 2.2 Unemployment & Inflation
  - Lecture 3 Economic Growth
  - Lecture 4 Finance, Saving, and Investment
- Lecture 1 remains split into two logical summary sections/routes.

#### v12.3 — V13 rollback / stable themes
Commit: `8d8cf7d85d837f5c9632533de515b1946f411f01`
- Reverted the V13/Vibrant direction.
- Released stable v12.3 theme palettes and quiz clarity fixes.
- Supported theme family after rollback:
  - Classic
  - Neo Dashboard
  - Midnight Workspace

#### Reverted experiment — V13 Vibrant
Commits:
- `fbccc385a1dd622e75da1875709a884795abed50` — rebuilt V13 Vibrant Accents.
- `00c678c51aa5e1d4f67a34902e1ba861ac9186f7` — introduced V13 Vibrant Accents/dashboard summary activity features.
- This experiment was intentionally rolled back. Do not restore accidentally.

---

## Documentation release — 2026-09-22

### Persistent ChatGPT handoff system
Files added:
- `AGENTS.md`
- `chatgpt-log/README.md`
- `chatgpt-log/APP_CONTEXT.md`
- `chatgpt-log/LATEST_PROMPT.md`
- `chatgpt-log/FULL_UPDATE_LOG.md`
- `chatgpt-log/PROMPT_LOG.md`
- `chatgpt-log/DEPLOYMENT_CHECKLIST.md`

Purpose:
- make new ChatGPT/coding sessions able to reconstruct the project quickly;
- document detailed current functionality and non-regression rules;
- preserve request history and implementation decisions;
- require documentation updates for every future deployment.

Code impact:
- Documentation only.
- No changes to `index.html`, route loaders, storage logic, quiz data, summaries, or runtime behavior.

### Course-material archival planning captured
Current supplied 2026 professor materials:
- Lecture 1 annotated PDF;
- Lecture 2.1 GDP annotated PDF;
- Lecture 2.2 Unemployment & Inflation annotated PDF;
- Lecture 3 Economic Growth annotated PDF;
- Lecture 4 Finance, Saving, and Investment annotated full + part 1 versions;
- seven dated professor YouTube teaching-record links.

Old EC214 Drive archives were inspected and include historical lectures, exercises, midterms, finals, answer keys, and notes.

Important publishing constraint:
- the GitHub repo is public;
- third-party course/exam PDFs should not automatically be republished publicly without confirmation;
- at least one historical PDF is approximately 292 MB and exceeds normal GitHub single-file limits.


### Course-material archive changed to hybrid file/link policy
User decision:
- store only the five current full annotated professor lecture PDFs as actual GitHub files;
- keep all historical/supplementary material as external links.

Files added:
- `course-materials/README.md`
- `course-materials/full-annotated-lectures/README.md`
- `course-materials/old-exams/README.md`
- `course-materials/old-lectures/README.md`
- `course-materials/exercises/README.md`
- `course-materials/professor-recordings/README.md`

Behavior/runtime impact:
- none; documentation/archive structure only;
- no changes to `index.html`, routes, localStorage, quizzes, summaries, or themes.

Storage policy:
- canonical file set: Lecture 1, Lecture 2.1, Lecture 2.2, Lecture 3, Lecture 4 full/All;
- Lecture 4 Part 1 treated as overlapping partial copy, not canonical;
- old exams/lectures/exercises/notes/textbooks remain on Drive and are linked;
- teaching recordings remain YouTube links.
