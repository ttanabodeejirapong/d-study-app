# ChatGPT Prompt / Request Log

This file preserves user intent across chats.

## Rule for future sessions

After every substantive user request related to the app:
- append the request here;
- record important clarifications/decisions;
- link it to the release/change entry in `FULL_UPDATE_LOG.md` if code was deployed.

For future requests, preserve the user's wording as closely as practical. Do not store secrets, credentials, or unnecessary personal data.

---

## Reconstructed historical requests from available project context

### EC214 summary depth
User feedback:
- lecture summaries were too terse;
- sections such as Factors of Production → Paid Incomes were difficult to understand from short context alone;
- summaries should contain substantially more explanation on nearly every topic;
- professor-detail coverage should not disappear during summarization.

Implementation direction:
- explanation-first summaries;
- detailed Understand it boxes;
- preserve professor examples/annotations.

### Quiz History → Mistake Log
User request:
- quiz history should be clickable;
- for quizzes that are not 100%, show mistake log;
- show wrong question and answer with explanation;
- show Not sure questions with explanation;
- show Guessed questions with explanation.

Implementation:
- clickable historical attempt review / mistake logs were added.

### Understand it boxes everywhere
User request:
- all lecture sections should have Understand it support;
- it should be clickable/collapsible;
- when expanded, add Thai/English control at the top-right;
- create Thai versions for Understand it content;
- make letters/box larger;
- make the box more noticeable so users know it is clickable.

Implementation:
- bilingual collapsible Understand it system;
- later commits enlarged/emphasized the controls.

### Current task — persistent ChatGPT project log
User request (2026-09-22):
- create one more folder called “chatgpt log”;
- contain all ChatGPT prompt log and full detailed update log;
- goal is that a new chat can understand what to do in the app;
- always create a new detailed prompt describing app functions;
- always update it when deploying a new version.

Implementation decision:
- repository path uses `chatgpt-log/` (hyphenated filesystem-safe form);
- added a root `AGENTS.md` pointer;
- added persistent master prompt, app context, prompt log, update log, and deployment checklist;
- established mandatory documentation-update rule for every future deployment.

---

## Current course-material intake requests

User requested separate storage areas for:
- old exams;
- full annotated lectures;
- professor-provided YouTube teaching records.

Current uploaded annotated lecture sources:
- EC214 Lecture 1 — Introduction to Economics;
- EC214 Lecture 2.1 — GDP;
- EC214 Lecture 2.2 — Unemployment & Inflation;
- EC214 Lecture 3 — Economic Growth;
- EC214 Lecture 4 — Finance, Saving, and Investment (full);
- EC214 Lecture 4 — Finance, Saving, and Investment (part 1).

Teaching records supplied:
- 5 Aug 2026 — https://youtu.be/MfZ21jt3GK4
- 19 Aug 2026 — https://youtu.be/u-8Y27FGQDg
- 26 Aug 2026 — https://youtu.be/IRsOy1ElbhY
- 2 Sep 2026 — https://youtu.be/AJOwGEMd3Vk
- 9 Sep 2026 — https://youtu.be/eOboFrmkh7I
- 16 Sep 2026 — https://youtu.be/qh7EOjQfTOM
- 19 Sep 2026 make-up — https://youtu.be/ACnXh3ZiRKI

Old exam/lecture Drive collections were supplied and inspected. Actual public upload of third-party PDFs remains pending the user's confirmation because the current GitHub repository is public.
