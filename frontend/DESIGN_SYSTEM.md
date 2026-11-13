# Trackspense design system

Concept: a passbook for your money. One bold element, the ultramarine summary that splits income into spent, saved and left. Everything else stays quiet.

- Palette (light): paper `#E9EDF1`, panel `#F7F9FB`, ink `#18222F`, ultramarine `#2F3FA8`, marigold `#E9A21B`, income teal `#157A60`, expense vermilion `#C23B22`, savings blue `#2B7CB8`. Dark mode swaps to the `[data-theme='dark']` tokens in `src/styles/index.css`.
- Type: Bricolage Grotesque for headings and figures, Hanken Grotesk for body. Numbers use tabular figures.
- Shape: hero 28px, panels 18px, controls 12px. No decorative gradients or shadows; depth comes from tone and borders.
- Charts: Recharts, colors from `src/utils/chartTheme.js`. All figures are computed client-side from transactions by their real date and year.
- Motion: one entrance (the summary bar fills once). Everything else responds to a user action. `prefers-reduced-motion` is respected.
- Voice: sentence case, plain verbs. Buttons say what they do ("Add transaction"); success toasts reuse the same verb ("Transaction added.").
