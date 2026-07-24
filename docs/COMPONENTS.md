# React Component Specs

## Pages
| Component | State | Status |
|-----------|-------|--------|
| `Welcome` | mode + session code entry | ✅ functional |
| `AvatarCreate` | name, color, icon | ✅ functional |
| `GameScreen` | renders active stage + WorldMap | ✅ orchestration |
| `FinalScreen` | net worth, achievements, replay | 🟡 net worth done; achievements/leaderboard TODO |
| `Settings` | audio, contrast, glossary | 🟡 toggles render; glossary/help content TODO |

## Components
| Component | Purpose | Status |
|-----------|---------|--------|
| `Stage1Childhood` | $20 allowance split across 3 jars + 3 event cards + summary | ✅ fully playable |
| `Stage2Business` | pick business → 4-week P&L loop (price/effort/demand/tax) → events → summary + marketplace | ✅ fully playable |
| `Stage3YoungAdult` | salary, allocate $1,650, 6-month investment sim + life events + net-worth chart | ✅ fully playable |
| `Marketplace` | buy items w/ points; peer trades | ✅ buy flow; 🟡 peer-trade UI TODO |
| `Leaderboard` | top-10 net worth | ✅ |
| `WorldMap` | town hub, 3 locations | ✅ static; 🟡 live avatars TODO |
| `EventCard` | reusable random-event card | ✅ |
| `HelpTooltip` | "?" context help | ✅ |

## Design system (Tailwind)
- Colors: `spend` (orange), `save` (green), `give` (purple), `highlight` (yellow), `tayubg` (deep blue). Defined in `tailwind.config.js`.
- Classes: `.btn-primary`, `.btn-secondary`, `.card` in `src/styles/index.css`.
- Accessibility: 16px+ body, 44px tap targets, color + label (not color alone), `?` help on controls, WCAG AA contrast.

## Pure logic (testable, no React)
`utils/financialCalculations.js`, `utils/eventGenerator.js`, `utils/marketplaceLogic.js`, `utils/validators.js`.
