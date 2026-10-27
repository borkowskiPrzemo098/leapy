# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React 18 + TypeScript (strict), React Router, Tailwind CSS with CSS-variable tokens, Zustand, Dexie (IndexedDB), Zod, vite-plugin-pwa, KaTeX, vite-react-ssg prerendering, Vitest, Playwright. Pinned by the owner's brief (docs/brief.md); deviations recorded in docs/decisions.md. Hosting: Cloudflare Pages.

## Users

Polish learners preparing for a state exam, served equally (owner's answer 2026-10-27): eighth-graders before the egzamin ósmoklasisty (13–15) and secondary-school students before the matura (16–19). Later phases add first-year university students, vocational exams, language certificates and driving theory. They study mostly on a phone, in short sessions (5–20 minutes), often offline or on weak connections, and come in from Facebook/Instagram posts.

## Product Purpose

Leapy ("Skocz na wyższy poziom.") lets a learner pick an exam, practise original exam-style tasks with instant step-by-step explanations, keep reviewing what they got wrong (spaced repetition), sit timed mock exams and watch their progress climb level by level. Success: a learner returns daily of their own will and walks into the exam having covered every topic.

## Positioning

Free, private and offline-first: no account, no ads, no tracking, progress stays on the device. Content is written originally for Leapy and openly marked as not yet human-reviewed until it is. Independent of CKE, MEN and any university.

## Operating Context

Installed as a PWA from the browser ("Dodaj do ekranu głównego"). Used one-handed on phones (360–390 px wide), also on tablets and desktops. Learners share score/streak/level cards to Instagram stories and Facebook posts; the owner runs the fanpage.

## Capabilities and Constraints

- Zero running cost: no runtime AI/LLM, no server, static files only.
- No accounts in MVP; IndexedDB + JSON backup export/import; storage behind an interface for later cloud sync.
- Content hierarchy Exam → Subject → Section → Topic → Lesson + Tasks; a new exam is added with content files only.
- Task types: single, multi, truefalse, numeric, ordering, match, short. Essays are self-assessed against criteria.
- Every task ships `reviewed: false` until a human verifies it; every task has "Zgłoś błąd".
- Premium tier planned (feature flags now, payments later, nothing promised).
- Contact for error reports and legal pages: rob.lewandowski987@gmail.com (owner's choice).

## Brand Commitments

- Name Leapy, tagline „Skocz na wyższy poziom.", identity built on the leap to a higher step/level.
- Intense violet/indigo brand colour; warm accent (yellow or coral) reserved for rewards, streaks, progress; green/red only for correct/wrong.
- Strongly rounded cards (16–24 px), soft shadows, big buttons, geometric illustrations instead of photos.
- Rounded, readable self-hosted typeface (Plus Jakarta Sans or Nunito), big headings, generous space.
- Energy of Duolingo with the cleanliness of Notion: not school-like, not childish.
- Logo must strongly reference a letter leaping to a higher level; three concepts (A "Skok L", B "Schody", C "Ikona").
- Polish-language UI and content.

## Evidence on Hand

None yet. No users, reviews, statistics or exam results exist; marketing and UI copy must not invent any. Official past papers are linked to cke.gov.pl, never copied.

## Product Principles

1. Honest over impressive: no fabricated numbers, no dark patterns, unreviewed content labelled as such.
2. Thumb-first: every main action reachable one-handed at the bottom of a phone screen.
3. Offline is the normal case, not the error state.
4. Motivation without pressure: streaks and XP reward, never guilt; everything can be switched off.
5. Adding content never requires changing code.

## Accessibility & Inclusion

WCAG 2.2 AA, text contrast ≥ 4.5:1, colour never the only signal (correct/wrong also differ by icon and lightness), full keyboard support, `prefers-reduced-motion`, `prefers-color-scheme`, adjustable text size, touch targets ≥ 48 px. Lighthouse mobile ≥ 95 in all categories.
