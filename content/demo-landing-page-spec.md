# Demo Landing Page Spec

## Overview

A landing page for an early alpha demo of a genre mashup: Noita-style spell stacking + survivors-like enemy waves + traditional roguelike skill-building. The core loop is building spell combos to handle increasingly chaotic enemy waves.

Primary goal: Build community (Discord) and collect emails (newsletter). Both CTAs are equally prominent.
Secondary goal: Communicate the core loop and alpha scope in under 30 seconds.

Tone: "Cozy apocalypse" — chill vibes despite the chaos. Soft pixel art with warm colors.

Title status: Working title TBD — use [GAME TITLE] placeholder throughout.

---

## Honesty Principles

These guide every content decision:

1. No scope exaggeration — don't make a focused experience sound epic
2. No feature inflation — only list what exists now, not plans
3. No scripted representations — real gameplay only
4. Alpha state is a feature, not a disclaimer — frame as an opportunity to shape the game
5. Keep WIP content in a dedicated Alpha panel, not mixed with best media

---

## Above-the-Fold Requirements

Must be visible without scrolling on a 13" laptop (1366x768) and a typical phone viewport (390x844):

- Logo/title placeholder + EARLY ALPHA badge
- Tagline (tone) + clarity line (genre recognition)
- 10-20s looping gameplay clip (muted MP4/WebM) with GIF fallback
- Dual CTAs (Discord + Newsletter), equally prominent
- Trust row: Free alpha, platform, last updated date, no spam

---

## Page Structure (Recommended Order)

### 1. Hero Section (30-second understanding block)

Visual: Logo/title art placeholder + atmospheric background
- Placeholder dimensions: 1200x600px recommended
- Evoke "cozy apocalypse" — soft, warm, pixel art aesthetic
- Keep terminal UI framing (2px borders, 4px shadows, pixel font), and let the hero media carry the warm vibe

Alpha badge: Visible EARLY ALPHA indicator integrated into the hero

Tagline (tone):
- Primary: "Stack spells. Break waves. Chill."

Clarity line (genre recognition):
- "Noita-style wand building meets bullet-heaven swarms."

Gameplay loop media:
- 10-20s muted looping clip (MP4/WebM) in hero
- GIF fallback for unsupported browsers
- Visible play/pause control is optional but should not clutter the hero
- Clip should show at least one spell combo payoff (visually obvious)

Dual CTAs (side-by-side on desktop, stacked on mobile):
- [ JOIN DISCORD ] - links to existing Discord server
  - Microcopy: "Playtest drops + feedback"
- [ GET UPDATES ] - newsletter signup (Buttondown integration exists)
  - Microcopy: "Monthly devlog. No chat."

Access line under CTAs:
- "Demo access announced on Discord and by email."

Trust row (tiny):
- "Free alpha" + "Last updated [YYYY-MM-DD]" + "Platform [Windows/Mac]" + "No spam"
- "Last updated" reflects the most recent content update, not just build date

---

### 2. In This Build, You Can (3 bullets)

Keep short and concrete:
- Stack spell parts into wands
- Survive escalating enemy waves
- Unlock new components per run

---

### 3. Proof of Uniqueness (Combo Examples + Clip)

Purpose: Demonstrate strategic depth without requiring the player to experience it.

Content approach:
- One short paragraph + two concrete combo examples
- One clip or GIF showing emergent behavior
- Combos shown must exist in the current build

Example format:

"The spell stacking isn't just cosmetic.

Combine Fireball + Split + Homing and watch one spell become twelve seeking missiles.

Or try Freeze + Trigger + Explosion for delayed crowd control that shatters frozen enemies.

Every component changes the math. Every build choice has tradeoffs."

Media placeholder:
- [SPELL_COMBO_CLIP - 480x270px, looping, showing emergent behavior]

---

### 4. Media Section (Best-Only Gallery)

Screenshot placeholders (3 total):
1. [SCREENSHOT_POLISHED_1] - best-looking gameplay moment
2. [SCREENSHOT_POLISHED_2] - different game state (shop? build screen?)
3. [SCREENSHOT_POLISHED_3] - action shot with spell effects

Note: WIP shot moves to Alpha panel (not in gallery).
All gallery images should share the same aspect ratio (16:9 preferred).

---

### 5. Alpha: What to Expect (Honesty Panel)

Placement: After media, before roadmap.

Framing: Honest + invitational.

Content:
- Short intro: "This is an early alpha. The core loop works, but expect rough edges."
- Three bullets:
  - Limited enemy variety and spell selection
  - Placeholder art in some areas
  - Balance is experimental

Include one labeled WIP screenshot:
- [SCREENSHOT_WIP] with caption "Work in progress - placeholder art in some areas"

Close with invitation:
- "If you enjoy watching games evolve and shaping them, this is for you."

---

### 6. Dev Update / Roadmap (Short)

Purpose: Transparency about current state and direction.

Format: Simple list with strikethrough for completed items.

Example structure:

CURRENT FOCUS:
- Core spell-stacking system
- Enemy wave balancing

DONE:
- Basic movement and controls
- Spell component system
- Wave spawning

COMING NEXT:
- More spell components
- Boss encounters
- Sound design

Styling: Terminal-adjacent styling works here since it's dev-focused content.

---

### 7. FAQ + System Requirements

FAQ (max 5):
1. Is it free?
2. How long is a run?
3. What's in the alpha right now?
4. Where do I report bugs?
5. How often do updates drop?

System requirements / platform (short line):
- "Currently: Windows/Mac. Controller support: TBD." (update with real info)

---

### 8. Footer CTAs

Repeat dual CTA pattern:
- Discord (community)
- Newsletter (updates)

Add creator line:
- "Made by Byteden. No publishers, just shipping."

---

## Tagline Decision

Lock this pairing:

- Tagline (tone): "Stack spells. Break waves. Chill."
- Clarity line (genre recognition): "Noita-style wand building meets bullet-heaven swarms."

Alternate single-line options if needed:
- "Build cozy little wands. Unleash huge disasters."
- "Make weird wands. Melt big waves."

---

## Tightening / QA Checklist

Use this as a final pass before publishing:

- [ ] All [PLACEHOLDER] text replaced, including [GAME TITLE], [YYYY-MM-DD], and media labels.
- [ ] Hero clip is real gameplay, loops cleanly, and remains readable at mobile width.
- [ ] Discord + Newsletter CTAs are visually equal in weight and repeated in footer.
- [ ] Trust row matches reality (platforms and updated date).
- [ ] Gallery is best-only; WIP stays in Alpha panel.
- [ ] FAQ answers are short (1-2 sentences) and avoid future promises.
- [ ] Newsletter form success state works and is visible without page reload.

---

## Visual Identity

Keep site continuity with terminal UI framing, but introduce warm pixel art energy inside the frames.

- Preserve: 2px borders, 4px shadows, sharp corners, MxPlus Tandy font
- Add page-scoped accents:
  - Ember/orange: #FF8C42
  - Moss/teal: #4A9D8C
- Use low-contrast dither/noise texture as a subtle background
- Let hero media supply most of the warmth
- Avoid introducing a new dominant accent color beyond the two above

---

## CTA Strategy

Dual CTAs are equally prominent, but give visitors a reason to choose.

- Discord: "Playtest drops + feedback"
- Newsletter: "Monthly devlog. No chat."

Add access line beneath:
- "Demo access announced on Discord and by email."

Optional if direct demo download exists:
- Add a small text link: "Download current build"

---

## Technical Implementation Notes

Hugo structure:
- Create new layout: layouts/_default/demo.html
- Content file: content/demo.md with layout: demo
- Static assets: static/images/demo/ for placeholders

Visual identity:
- Keep terminal aesthetic and add warm accents on this page only
- Consider custom CSS scoped to this page

Existing integrations to use:
- Newsletter partial: {{ partial "newsletter.html" . }}
- Discord link: Already exists in site (check about.md)

Responsive considerations:
- Hero clip scales gracefully
- Dual CTAs stack on mobile
- Screenshot gallery adapts to viewport
- Consider a sticky dual CTA bar on mobile (50/50 split) after scroll
- Cap hero media height on mobile so CTAs and trust row remain above the fold

Media/perf considerations:
- Use a poster image for the hero clip
- Use autoplay + loop + muted + playsinline
- Keep the hero clip lightweight (target <= 6 MB)
- Lazy-load below-the-fold media

---

## Content Checklist Before Launch

- Working title finalized or acceptable placeholder decided
- 3 curated screenshots captured
- 1 combo clip (MP4/WebM) exported
- Logo/title art created (even simple)
- Discord server ready for traffic
- Newsletter welcome email set up in Buttondown
- Dev roadmap updated to current state
- Mobile responsive testing complete
- "Last updated" date set to current content date

---

## Anti-Patterns to Avoid

1. "Coming soon" lists longer than "Available now" lists
2. Aspirational adjectives: avoid "epic," "massive," "revolutionary"
3. AAA comparisons that outscale visuals
4. Over-designed page for under-developed game
5. Hiding the alpha state below the fold

---

## Success Metrics (Post-Launch)

Track these to know if the page is working:

1. Discord join rate - what % of visitors join?
2. Newsletter signup rate - what % subscribe?
3. Bounce rate - are people engaging or leaving immediately?
4. Feedback sentiment - are expectations aligned with reality?
5. Clip engagement - are visitors watching the hero loop long enough to understand it?

---

## Open Questions

1. When will the title be finalized?
2. Target launch date for the demo page?
3. Legal/copyright considerations for genre comparison mentions?
4. Should there be a presskit page linked from this?
5. Will there be a direct demo download link, or Discord/email only?
