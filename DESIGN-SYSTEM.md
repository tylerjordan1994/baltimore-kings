# Baltimore Kings — Design System

## Typography

### Display Font: Archivo Black
- **Source:** Google Fonts
- **Weight:** 400 (single weight — the font is inherently black weight)
- **Usage:** All headings (h1-h6), hero text, stat numbers, display sizes
- **CSS variable:** `--font-heading`
- **Why:** Blocky, condensed, authoritative. Reads "sports brand" without being generic. NOT Inter, Roboto, or Space Grotesk.

### Body Font: Plus Jakarta Sans
- **Source:** Google Fonts
- **Weights:** 200-800 (variable)
- **Usage:** Body text, UI labels, navigation, form inputs
- **CSS variable:** `--font-sans`
- **Why:** Clean geometric sans with good readability. Pairs well with Archivo Black's density.

### Type Scale (mobile-first, clamp)
| Token | Size |
|-------|------|
| Display XL | `clamp(48px, 12vw, 160px)` |
| Display L | `clamp(36px, 8vw, 96px)` |
| Display M | `clamp(28px, 6vw, 72px)` |
| H1 | `clamp(32px, 5vw, 56px)` |
| H2 | `clamp(24px, 4vw, 40px)` |
| H3 | `clamp(20px, 3vw, 28px)` |
| Body | 16px / 18px desktop |
| Eyebrow | 12px uppercase, tracking 0.12em |
| Stat | Inherits heading, `font-variant-numeric: tabular-nums` |

## Color Palette

### Light Theme (Public Site — Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--paper` / `bg-paper` | `#F6F4EE` | Page background, off-white |
| `--ink` / `text-ink` | `#0F0F0F` | Primary text |
| `--brand` / `bg-brand` | `#1B2A4A` | Navy — primary brand color, CTAs |
| `--brand-light` | `#2A3F6E` | Lighter navy for hover states |
| `--accent` / `bg-accent` | `#C9A94E` | Gold — accent, focus rings, highlights |
| `--accent-light` | `#E5D38A` | Light gold for hover |
| `--accent-dark` | `#9A7B2F` | Dark gold for pressed |
| Card surface | `#FFFFFF` | Cards, inputs |
| Border | `#E2E0DA` | Card borders, dividers |
| Muted text | `#6B6B6B` | Secondary text, timestamps |

### Dark Theme (Member Dashboard — `.dark` class)
| Token | Value | Usage |
|-------|-------|-------|
| `--court` / `bg-court` | `#13110F` | Warm near-black base |
| Card surface | `#1A1816` | Card backgrounds |
| Border | `paper @ 8%` | Subtle warm borders |
| Muted text | `#8A8A8A` | Secondary text |
| Primary | Gold `#C9A94E` | CTAs and accents in dark mode |

## Spacing Scale
Base: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.

## Border Radius
| Size | Value | Usage |
|------|-------|-------|
| Small | 4px | Badges, tags |
| Default | 8px | Cards, inputs |
| Medium | 12px | Feature cards |
| Large | 20px | Feature cards, hero elements |
| Pill | 999px | Buttons, filter pills |

## Motion
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveal easing |
| `--ease-in-out-circ` | `cubic-bezier(0.85, 0, 0.15, 1)` | Hover/emphasis |
| Micro | 150ms | Button state changes |
| UI | 250ms | Dropdown open/close |
| Transition | 400ms | Page section transitions |
| Hero | 700ms | Hero reveals |
| Orchestrated | 1200ms | Multi-element sequences |

## Rules
- **No drop shadows** on cards — use thin borders only
- **Light theme default** for all public pages
- **Dark theme** only for member area (behind `.dark` class)
- **No symmetric three-card grids** as main composition
- **Photography-driven** heroes, not headline-on-gradient
- **Asymmetric layouts** preferred over centered symmetric
