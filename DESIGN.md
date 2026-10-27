---
name: Leapy
description: Mobile-first exam-prep PWA that feels like a game you climb. „Skocz na wyższy poziom.”
colors:
  brand: '#5b3df5'
  brand-strong: '#4a2be0'
  brand-deep: '#2f1a9e'
  brand-soft: '#e6e0ff'
  brand-text: '#4a2be0'
  on-brand: '#ffffff'
  on-brand-2: '#d9d2ff'
  reward: '#ffc531'
  reward-strong: '#f0a800'
  reward-deep: '#b87a00'
  reward-soft: '#fff2c9'
  on-reward: '#2b1d00'
  correct: '#1f9d55'
  correct-deep: '#157a40'
  correct-soft: '#dcf6e6'
  correct-text: '#0f6b36'
  wrong: '#e0394a'
  wrong-deep: '#b3202f'
  wrong-soft: '#ffe2e5'
  wrong-text: '#a51c2a'
  bg: '#f5f3ff'
  surface: '#ffffff'
  surface-2: '#eeeaff'
  surface-sunken: '#e7e2fb'
  line: '#ddd6f6'
  line-strong: '#c3b8ee'
  ink: '#17123a'
  ink-2: '#463f6e'
  ink-3: '#635c8c'
  focus: '#5b3df5'
typography:
  display:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '2.5rem'
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: '-0.035em'
    fontFeature: "'ss01' on"
  title:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '1.75rem'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.025em'
    fontFeature: "'ss01' on"
  heading:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '1.3125rem'
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: '-0.015em'
    fontFeature: "'ss01' on"
  body:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 500
    lineHeight: 1.55
    fontFeature: "'ss01' on"
  small:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: 'Plus Jakarta Sans Variable, ui-rounded, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: 1.35
rounded:
  sm: '12px'
  md: '16px'
  lg: '20px'
  xl: '24px'
  2xl: '32px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '20px'
  2xl: '24px'
  section: '56px'
components:
  button-primary:
    backgroundColor: '{colors.brand}'
    textColor: '{colors.on-brand}'
    rounded: '{rounded.lg}'
    padding: '0 20px'
    height: '48px'
  button-primary-hover:
    backgroundColor: '{colors.brand-strong}'
  button-primary-lg:
    backgroundColor: '{colors.brand}'
    textColor: '{colors.on-brand}'
    rounded: '{rounded.xl}'
    padding: '0 24px'
    height: '56px'
  button-reward:
    backgroundColor: '{colors.reward}'
    textColor: '{colors.on-reward}'
    rounded: '{rounded.lg}'
    padding: '0 20px'
    height: '48px'
  button-reward-hover:
    backgroundColor: '{colors.reward-strong}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '0 20px'
    height: '48px'
  button-secondary-hover:
    backgroundColor: '{colors.surface-2}'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.brand-text}'
    rounded: '{rounded.lg}'
    padding: '0 20px'
    height: '48px'
  button-ghost-hover:
    backgroundColor: '{colors.brand-soft}'
  icon-button:
    textColor: '{colors.ink-2}'
    rounded: '{rounded.lg}'
    size: '48px'
  answer-option:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.xl}'
    padding: '12px 16px'
    height: '64px'
  answer-option-selected:
    backgroundColor: '{colors.brand-soft}'
  answer-option-correct:
    backgroundColor: '{colors.correct-soft}'
  answer-option-wrong:
    backgroundColor: '{colors.wrong-soft}'
  chip-plain:
    backgroundColor: '{colors.surface-2}'
    textColor: '{colors.ink-2}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '0 12px'
    height: '28px'
  chip-brand:
    backgroundColor: '{colors.brand-soft}'
    textColor: '{colors.brand-text}'
  chip-reward:
    backgroundColor: '{colors.reward-soft}'
    textColor: '{colors.on-reward}'
  segmented:
    backgroundColor: '{colors.surface-sunken}'
    rounded: '{rounded.xl}'
    padding: '4px'
  segmented-option-active:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    height: '48px'
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.2xl}'
    padding: '20px'
  card-brand:
    backgroundColor: '{colors.brand}'
    textColor: '{colors.on-brand}'
    rounded: '{rounded.2xl}'
    padding: '24px'
  progress-bar:
    backgroundColor: '{colors.surface-sunken}'
    rounded: '{rounded.full}'
    height: '14px'
---

<!-- Recorded from the built E0 design system (src/styles/tokens.css, src/styles/index.css, src/ui/*, src/brand/*). The living style guide in src/app/DesignSystemPage.tsx is TEMPORARY: it renders at "/" during E0 and moves to /dev/ui in E1 when the app shell takes "/". Its page composition (logo-concept review, demo sections) is not part of the system. Frontmatter colors are the light theme; dark values live in tokens.css and in .impeccable/design.json. -->

# Design System: Leapy

## Overview

**Creative North Star: "The Climb"**

Leapy is a staircase you climb in short daily sessions, not a school portal. Large committed fields of intense indigo-violet carry the brand; everything around them sits on violet-tinted neutrals so the whole surface reads as one world, in daylight and at night. Progress is literal geometry: blocks that rise one step at a time, a ring that closes, a button that lands when pressed. The energy comes from colour mass, heavy tight display type and tactile motion, while the layout stays clean, roomy and calm enough to study in.

Density is low and thumb-first: every interactive target is at least 48px tall, answer tiles are 64px, primary actions span the full width at the bottom of a card. The palette is strictly role-bound. Violet is the voice, sun-yellow is the reward, green and red exist only to judge an answer. Light and dark are both first-class: the theme is resolved onto `data-theme` on `<html>` before first paint, and every component reads tokens only, so nothing is themed twice.

Motion has one grammar: exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) over three durations (140 / 240 / 420ms). A correct answer leaps (hop up, squash on landing), a wrong one shakes, the current step pulses. Under `prefers-reduced-motion` or `data-motion="reduce"` every duration collapses to zero and animations run once at 0.01ms.

**Key Characteristics:**

- Committed violet fields (`brand`) on violet-tinted neutrals; never grey, never cream.
- Sun-yellow reserved for rewards, streaks, levels and goal completion.
- Green/red only for answer feedback, always paired with a check/cross icon.
- Plus Jakarta Sans Variable, self-hosted, 800-weight display with negative tracking.
- Strong rounding (12–32px) and tactile buttons with a solid lip that compresses on press.
- The staircase motif (StepLadder, stair backdrop, logo mark) and the leap keyframe.

## Colors

One intense violet carries the brand at full field strength, a single warm sun-yellow rewards, and a tinted-violet neutral ramp holds everything else; feedback hues are functional, not decorative.

### Primary

- **Leap Violet** (`brand`): the brand field. Hero/Start cards, primary buttons, selected answer badge, the current StepLadder step, active Switch track, `::selection`, caret. White text on it passes AA (6.1:1 light, 4.9:1 dark, where it lifts to #6c4fff).
- **Pressed Violet** (`brand-strong`): hover fill of primary buttons; doubles as `brand-text` in light theme for violet text on light surfaces (links, ghost buttons, brand chips).
- **Night Violet** (`brand-deep`): the solid lip under primary buttons and the stair backdrop drawn at 45% opacity inside violet cards. Also the logo's deep violet.
- **Violet Mist** (`brand-soft`): selected answer tile, brand chip, brand IconButton rest state, ghost button hover.
- **On-Violet Lilac** (`on-brand-2`): secondary text on violet fields (supporting copy, ring captions).

### Secondary

- **Sun Yellow** (`reward`): rewards only. Reward button (claim XP, Continue on the Start card), finished StepLadder steps, GoalRing once the goal is met, streak chip, the logo spark. Text on it is always `on-reward` (#2b1d00, 11.8:1).
- **Amber Lip** (`reward-deep`): the lip under reward buttons and the inset base of finished steps; `reward-strong` is the hover fill.
- **Sun Cream** (`reward-soft`): reward chip background (in dark theme it becomes a deep olive-brown and the chip text switches to `reward`).

### Tertiary (feedback only)

- **Correct Green** (`correct`, `correct-deep`, `correct-soft`, `correct-text`): correct answer tile, badge and explanation panel; the "missed" dashed outline; a "mastered" progress bar tone.
- **Wrong Red** (`wrong`, `wrong-deep`, `wrong-soft`, `wrong-text`): wrong answer tile, badge and explanation panel. Nothing else.

### Neutral

- **Lavender Ground** (`bg`): page background; the dark theme ground is a near-black violet (#0e0a22).
- **Surface White** (`surface`): cards, idle answer tiles, secondary buttons, active segment.
- **Lilac Wash** (`surface-2`): plain chips, hover fills, inset strips inside cards.
- **Sunken Lilac** (`surface-sunken`): tracks (progress bar, segmented control), todo steps, skeletons.
- **Lilac Hairline** (`line`) / **Lilac Rule** (`line-strong`): card borders and idle tile lip / secondary button border and lip, Switch off-track, scrollbar thumb, dashed placeholder outline.
- **Violet Ink** (`ink`, `ink-2`, `ink-3`): primary text (16.9:1), secondary text (9.1:1), tertiary/meta text (5.4:1). All three clear 4.5:1 on `surface` in both themes.

### Named Rules

**The Role-Bound Palette Rule.** Violet carries large fields; yellow appears only for rewards, streaks, levels and goal completion; green and red appear only to judge an answer and never without a check or cross icon. A yellow decorative accent or a red "delete" button breaks the system.

**The Tinted Neutral Rule.** Every neutral is violet-tinted (`bg` #f5f3ff through `ink` #17123a). No grey, no cream, no pure black, in either theme.

**The Tokens-Only Rule.** Components reference tokens (`bg-brand`, `text-ink-2`); raw hex lives only in `tokens.css` and `src/brand/geometry.js`.

## Typography

**Display Font:** Plus Jakarta Sans Variable (with ui-rounded, system-ui, sans-serif)
**Body Font:** Plus Jakarta Sans Variable, same family
**Label/Mono Font:** none distinct; numbers use tabular figures (`.tabular`)

**Character:** One geometric-friendly sans across the whole ramp, pushed to 800 with tight negative tracking at the top so headlines feel bold and game-like, and relaxed at 500 / 1.55 for reading. Stylistic set `ss01` is on globally. Self-hosted via Fontsource, never a CDN.

### Hierarchy

- **Display** (800, 2.5rem, 1.05, -0.035em): the Start card headline and other single hero statements; may step up on wide screens.
- **Title** (800, 1.75rem, 1.12, -0.025em): section titles and the feedback verdict in the explanation panel.
- **Heading** (750, 1.3125rem, 1.25, -0.015em): card headings, the task question.
- **Body** (500, 1rem, 1.55): explanations and reading text, capped near 60–65ch; answer text is body at 600.
- **Small** (500–700, 0.875rem, 1.45): meta lines, counters, descriptions under Switch labels, segmented labels.
- **Label** (700, 0.75rem, 1.35): chips and captions. Sentence case, never uppercase-tracked.

Sizes are in rem and the root font-size is `100% * --text-scale`, so the in-app text-size setting scales the whole ramp. Headings use `text-wrap: balance`, paragraphs `pretty`. Buttons are 700 with -0.01em tracking.

### Named Rules

**The Heavy Top Rule.** Display and Title are always 800 with negative tracking; body never goes below 500. The contrast between those two weights is the hierarchy.

**The Tabular Count Rule.** Any changing number (score, step count, percent, countdown) uses tabular figures so it does not jitter.

## Layout

Mobile-first single column, designed for 360–390px phones and one thumb. Content containers cap at 1024px (`max-w-5xl`) with 16px side padding, 24px from the `sm` breakpoint (640px). Two-column card grids open at `sm` or `md` (768px) with asymmetric fractions (1.2fr/1fr, 1.4fr/1fr) rather than equal tiles. Spacing follows the 4px Tailwind scale: 12–16px between sibling cards and stacked controls, 20px card padding (24px from `sm`), 56px between major sections. The primary action sits at the bottom of its card, full width (or capped at ~384px inside a hero), within thumb reach. Sticky headers respect `env(safe-area-inset-top)` and blur a 90% `bg` backdrop.

**The Thumb Floor Rule.** Every tap target is at least 48px (buttons 48/56px, IconButton 48px, segments 48px, Switch rows 56px, answer tiles 64px). Small visual elements get a full-row hit area instead of shrinking the target.

## Elevation & Depth

A hybrid: surfaces are mostly flat, separated by tonal steps (`bg` → `surface` → `surface-2` → `surface-sunken`) and 1px `line` borders. Soft violet-tinted ambient shadows are used sparingly for emphasis and floating pieces. The signature depth device is the tactile lip: a solid, zero-blur bottom offset in the element's own deep tone that compresses to nothing when pressed, so a tap physically lands.

### Shadow Vocabulary

- **Ambient Low** (`--shadow-sm`): active segment, Switch thumb.
- **Ambient Mid** (`--shadow-md`): an emphasised (picked/featured) card.
- **Ambient High** (`--shadow-lg`): reserved for floating layers (sheets, dialogs) in later stages.
- **Button Lip** (`0 4px 0` in `brand-deep` / `reward-deep` / `line-strong`): primary, reward and secondary buttons; on `:active` the lip goes to 0 and the button translates down 4px.
- **Tile Lip** (`0 3px 0` in `line` / `brand` / `correct-deep` / `wrong-deep`): answer tiles, colour following state; compresses 3px on press. The "missed" state drops the lip.
- **Step Base** (`inset 0 -4px 0 reward-deep`): finished StepLadder blocks.

In dark theme ambient shadows switch to black at higher alpha; lips keep their token colours.

### Named Rules

**The Lip Is Tactile Rule.** Solid offset shadows exist only as a pressable lip in the element's own deep tone, on things you press (buttons, answer tiles) or have climbed (finished steps). Never as decoration on static cards. Ghost buttons and IconButtons stay flat.

## Shapes

Strongly rounded throughout, on a five-step radius scale: 12px (badges inside rows, focus ring), 16px (answer key badge, step tops), 20px (buttons, IconButtons, segments, skeletons), 24px (large buttons, answer tiles, inner panels, segmented track), 32px (cards and the violet Start card). Chips, progress tracks, Switch tracks and scrollbar thumbs are full pills. Borders are 1px `line` on cards, 2px on answer tiles and secondary buttons; a dashed border marks an empty/pending state or a missed correct answer.

The recurring silhouette is the staircase: ascending blocks with rounded tops (StepLadder heights rise from 28% to 100%), the deep-violet stair polygon climbing to the right behind the Start card, and the logo mark, an L whose foot takes off along a dotted arc to a sun-yellow spark one level higher. Logo geometry has one source, `src/brand/geometry.js`; all files in `brand/final/` and `public/icons/` are generated from it.

## Components

### Buttons

Tactile and confident: a solid face on a darker lip that compresses on press.

- **Shape:** rounded 20px at md (48px tall, 20px side padding), 24px at lg (56px tall, 24px padding, 1.0625rem text).
- **Primary:** `brand` face, `on-brand` text, `brand-deep` lip. The default action.
- **Reward:** `reward` face, `on-reward` text, `reward-deep` lip. Only for claiming rewards or continuing a streak (the Start card's Continue).
- **Secondary:** `surface` face, `ink` text, 2px `line-strong` border and lip.
- **Ghost:** transparent, `brand-text`, flat; hover fills `brand-soft`.
- **States:** hover shifts the face to the strong tone; `:active` translates 4px down while the lip drops to 0 (140ms ease-out); disabled is 50% opacity with no press; loading swaps the leading icon for a spinning loader and sets `aria-busy`. Icons (lucide, 20px) sit leading or trailing.

### Answer Option (signature)

The thumb-sized answer tile. Min 64px tall, 24px radius, 2px border, 16px gap between a 40px key badge (16px radius, showing 1–4 or A–D) and the answer text. States: idle (`surface`, `line` border and lip), selected (`brand-soft`, `brand` border and lip, violet badge), correct (`correct-soft`, green border, `correct-deep` lip, badge becomes a check and leaps), wrong (`wrong-soft`, red border, badge becomes a cross and shakes), missed (dashed green border, flat, check badge in `correct-soft`). Each judged state also announces a screen-reader status line. Desktop answers with number keys.

### Chips

- **Style:** 28px pill, 12px padding, label type (0.75rem, 700), optional 16px leading icon.
- **Tones:** plain (`surface-2` / `ink-2`), brand (`brand-soft` / `brand-text`), reward (`reward-soft` / `on-reward`; streaks), inverse (white at 15% on violet fields, `on-brand` text; countdowns on the Start card). Chips are status, not buttons.

### Cards / Containers

- **Corner Style:** 32px.
- **Background:** `surface` with a 1px `line` border on the ground; `brand` (no border) for the hero/Start card; feedback panels fill `correct-soft` or `wrong-soft`; empty panels use a dashed `line-strong` outline.
- **Shadow Strategy:** flat by default; `--shadow-md` plus a 2px `brand` border only to mark an emphasised card.
- **Internal Padding:** 20px, 24px from `sm`; the Start card 24px, 40px from `sm`.

### Progress

- **ProgressBar:** 14px pill track in `surface-sunken`, fill in `brand` (default), `reward` or `correct`, with a 4px white-35% highlight strip inside the fill; width animates over 420ms.
- **GoalRing:** circular daily goal drawn on violet fields; track `on-brand` at 20%, stroke 12% of the diameter with round caps, `on-brand` while filling and `reward` once the goal is met. Centre holds a tabular 800-weight number and a small caption.
- **StepLadder (signature):** a row of rising blocks (96px tall, 6px gaps, 16px top / 12px bottom radius). Done steps are `reward` with a `reward-deep` inset base, the current step is `brand` and pulses (brightness 1 → 1.18, 1.6s), todo steps are `surface-sunken`.

### Controls

- **Segmented:** `surface-sunken` track, 24px radius, 4px padding; 48px segments at 20px radius; the active one is `surface` with `--shadow-sm` and `ink` text, others `ink-3`. Compact mode shows icons only below `sm`, labels stay for screen readers.
- **Switch:** the whole 56px row is the target; label in 700 `ink`, description in small `ink-3`; 56x32px pill track (`brand` on, `line-strong` off) with a 24px white thumb sliding 24px over 240ms.
- **IconButton:** 48px square at 20px radius, always with an accessible label; plain (`ink-2`, hover `surface-2`) or brand (`brand-soft` → `brand` on hover).
- **Skeleton:** `surface-sunken` block at 20px radius, pulsing.

### Focus

Every focusable element shows a 3px solid `focus` outline at 3px offset with 12px radius (`brand` in light, `brand-text` lilac in dark).

## Do's and Don'ts

### Do:

- **Do** put the brand on big violet fields (Start card, primary buttons) and let the tinted neutrals carry everything else.
- **Do** reserve `reward` yellow for rewards, streaks, levels and goal completion, with `on-reward` (#2b1d00) text.
- **Do** pair every correct/wrong colour with a check or cross icon and a screen-reader status.
- **Do** give pressable things the solid lip in their own deep tone and compress it on `:active` (4px buttons, 3px tiles).
- **Do** keep every tap target at least 48px and place the main action full-width at the bottom of its card.
- **Do** run every transition on `--ease-out` with `--dur-fast` / `--dur-base` / `--dur-slow`, so reduced motion zeroes them.
- **Do** use the leap keyframe for a correct answer and the shake for a wrong one; nothing else hops.
- **Do** check every text pair for 4.5:1 in both themes.

### Don't:

- **Don't** use grey or cream neutrals, or pure black, in either theme.
- **Don't** use yellow as a decorative accent, or green/red for anything other than answer feedback (no green "save", no red "delete").
- **Don't** put a solid offset lip on static cards or decorative elements; ghost buttons and IconButtons stay flat.
- **Don't** hard-code hex in components or hand-edit generated logo files; change `tokens.css` or `src/brand/geometry.js`.
- **Don't** substitute emoji or Unicode glyphs for icons; icons are lucide-react.
- **Don't** fade content in on scroll or animate without the `--dur-*` tokens.
- **Don't** rotate, stretch, shadow or gradient the logo, and keep the spark sun-yellow unless the whole mark is mono.
