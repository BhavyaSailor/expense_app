# Expense App Design System

## Brand & Visual Direction

A premium personal finance dashboard inspired by modern SaaS interfaces like Linear, Notion, Stripe, Vercel, Revolut, and Mint.

- Clean spacing and generous white space
- Rounded cards with subtle depth
- Soft neutral grays and teal/emerald primary tones
- Minimal, premium, data-forward presentation
- Dark mode support with accessible contrast

## Color Palette

- Primary: `#10B981` (emerald)
- Primary Soft: `rgba(16, 185, 129, 0.1)`
- Success: `#22C55E`
- Danger: `#EF4444`
- Info/Accent: `#3B82F6`
- Background Light: `#F7F8FB`
- Surface Light: `#FFFFFF`
- Surface Dark: `#111827`
- Text Dark: `#111827`
- Text Light: `#F8FAFC`
- Muted Gray: `#6B7280`

## Typography

- Font family: system stack with `Inter`, `Inter var`, `Helvetica Neue`, `Segoe UI`
- Type scale:
  - Display / Page Title: 2.5rem
  - Section Title: 1.5rem
  - Card Title: 1.125rem
  - Body / labels: 1rem
  - Small text / captions: 0.875rem

## Spacing System

- 4px base unit
- Gaps and padding: `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `2.5rem`, `3rem`
- Card padding: `1.25rem`
- Layout gutters: `1.5rem` desktop, `1rem` mobile

## Elevation & Shadows

- Soft card shadow: `0 18px 50px rgba(15, 23, 42, 0.08)`
- Minimal inner depth for active states

## Layout Breakpoints

- Mobile: up to `640px`
- Tablet: `641px` to `1024px`
- Desktop: `1025px` and above

## Component System

### Atoms

- Typography: headings, body, captions
- Buttons: primary, secondary, ghost
- Badges: status chips, type tags
- Inputs: search, dropdowns, selects
- Icons: nav icons, status indicators

### Molecules

- Stat cards
- Progress bars
- Filter chips
- Navigation items
- Table rows

### Organisms

- Dashboard hero grid
- Transaction table module
- Budget summary cards
- Goal cards
- Analytics chart panels
- Profile edit panel

## Page Hierarchy & Route Structure

- `/` - Dashboard
- `/transactions` - Transactions list
- `/budgets` - Budget overview
- `/goals` - Goal management
- `/savings` - Savings summary
- `/analytics` - Data analytics
- `/profile` - Profile and account settings
- `/settings` - Application preferences
- `/login` - Login
- `/register` - Register

## Responsive Behavior

- Mobile-first flow with stacked cards
- Sidebar collapses into a drawer on mobile
- Tables become card-based or horizontally scrollable
- Dashboard panels wrap into one-column layout on narrow screens
- Bottom nav for fast access to core pages on mobile

## Motion & Interaction

- Use subtle transitions for hover and focus states
- Smooth drawer open/close
- Button hover color changes and shadow lift
- Animated progress bars for goals and budgets

## UX Priorities

- Fast navigation with persistent sidebar and topbar
- Clear information hierarchy with stat cards, charts, and tables
- Accessible color contrast and spacing
- Professional look for portfolio and MVP use cases
- Clean interactive states for buttons, cards, and links
