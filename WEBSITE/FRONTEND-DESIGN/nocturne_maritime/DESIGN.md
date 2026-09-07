---
name: Nocturne Maritime
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#8fd5ff'
  on-tertiary: '#00344a'
  tertiary-container: '#1abdff'
  on-tertiary-container: '#004966'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#c5e7ff'
  tertiary-fixed-dim: '#7fd0ff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6a'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  hud-edge-desktop: 1.5rem
  hud-edge-mobile: 0.75rem
  panel-gap: 0.75rem
  stack-compact: 0.25rem
  stack-default: 0.5rem
  stack-relaxed: 1rem
  inset-pill: 0.375rem 0.75rem
  inset-panel: 1.25rem
  inset-panel-compact: 0.75rem
---

## Brand & Style

This design system embodies the ethos of quiet command and surgical precision. Built for elite maritime intelligence, commodity traders, and geopolitical risk analysts, the interface recedes completely into the dark void, allowing critical satellite telemetry, AIS transponder signals, and vessel anomalies to take absolute precedence. 

The aesthetic synthesizes:
- **Radical Minimalism & Apple/Linear Sensibilities:** Restrained chrome, hairline precision, fluid micro-interactions, and pristine typographic balance.
- **HUD Glassmorphism:** Layered frosted glass panels (`backdrop-blur-xl`), deep neutral surfaces, and floating instrumental telemetry units.
- **Instrumental Restraint:** 98% near-monochrome canvas punctuated by single-pixel status indicators, micro-badges, and selective signal amber alerts. The interface feels less like enterprise software and more like an advanced avionics flight deck engineered for high-stakes maritime reconnaissance.

## Colors

The palette is tuned specifically for pitch-black command environments and sustained night viewing, stripping away all decorative pigment to prioritize situational awareness.

- **Base Void (`#09090B`):** The foundational substrate. Deep, near-absolute black that eliminates backlight bleed on OLED displays.
- **Surface Elevation (`#0F0F11`, `#18181B`, `#27272A`):** Successive structural layers used strictly for card backgrounds, floating HUD docks, and contextual flyouts.
- **Muted & Mid Grays (`#71717A`, `#A1A1AA`):** Dedicated to secondary metrics, tabular metadata, coordinate readouts, and inactive states.
- **High-Contrast Text (`#F4F4F5`, `#FFFFFF`):** Pure light for mission-critical vessel identifiers, anomaly titers, and primary headings.
- **Signal Amber (`#F59E0B`):** The solitary functional accent. Used exclusively to flag high-severity anomalies (e.g., transponder spoofing, STS dark transfers, sanctions evasion) and active tracking states. It must appear in no more than 2–3 optical targets on any single screen.
- **Electric Cyan (`#06B6D4`):** Ancillary telemetry accent reserved exclusively for live AIS vector lines, historical vessel wakes, and precision satellite overlay markers.
- **Structural Hairstyle Outlines:** Never use solid opaque borders. All divisions rely on micro-hairline borders styled as `rgba(255, 255, 255, 0.06)` or `rgba(255, 255, 255, 0.1)`.

## Typography

The typographic hierarchy establishes razor-sharp legibility across high-density geospatial maps and tabular data matrices.

- **Primary Font (Inter):** Serves all interface narrative elements, system headers, search dialogs, and summaries. Utilizes optical kerning, negative letter-spacing on display headlines for a taut, Apple-esque finish, and open line heights for effortless scanning.
- **Technical Readouts (JetBrains Mono):** Mandated for all maritime coordinates (Latitude/Longitude), MMSI numbers, IMO identification, timestamps (UTC), vessel velocity (knots), and draft depth. Monospaced character alignment guarantees visual stability during real-time data streaming without optical jitter.
- **Case and Styling:** Technical metadata and status tags must default to uppercase styling with slight positive letter spacing (`0.04em` to `0.06em`).

## Layout & Spacing

This design system uses a **viewport-first spatial layout**, eschewing conventional document flows in favor of full-bleed map or vector substrates with floating telemetry modules.

- **Canvas Hierarchy:** The foundational layer is an edge-to-edge interactive maritime canvas (AIS stream / synthetic-aperture radar). Floating HUD components reside in decoupled overlays pinned to view boundaries using standardized offsets (`hud-edge-desktop: 24px`, `hud-edge-mobile: 12px`).
- **Low-Density Breathing Room:** Information density is controlled through generous macro-whitespace surrounding densely packed micro-telemetry cards. Elements never feel crowded against viewport borders.
- **Dock & Island Model:** Key operational controls (time scrubber, vessel filters, anomaly feeds) exist as self-contained floating islands floating above the canvas, separated by consistent `panel-gap: 12px` intervals.
- **Responsive Adaptations:**
  - **Desktop (>= 1280px):** Multi-dock architecture with persistent left intelligence rail (360px fixed width), bottom temporal timeline scrubber, and top-right HUD vessel detail card.
  - **Tablet (768px – 1279px):** Left rail transforms into a floating retractable drawer; secondary telemetry collapses into top pill buttons.
  - **Mobile (< 768px):** Full-bleed single viewport with a bottom-anchored frosted sheet system, swipe gestures, and condensed pill toggles (`inset-pill`).

## Elevation & Depth

Visual hierarchy is built exclusively through translucent surface luminosity, refractive blurs, and delicate hairline rims rather than traditional drop shadows.

- **Level 0 (The Deep):** Solid `#09090B`. The base map and data matrix background.
- **Level 1 (Sub-Panels & Data Grids):** `rgba(15, 15, 17, 0.75)` with `backdrop-filter: blur(16px)` and a continuous 1px outline of `rgba(255, 255, 255, 0.04)`.
- **Level 2 (Floating HUDs & Tactical Windows):** `rgba(24, 24, 27, 0.65)` with `backdrop-filter: blur(24px)`, a 1px top-highlight edge of `rgba(255, 255, 255, 0.12)`, and bottom/lateral edges of `rgba(255, 255, 255, 0.06)`. Subtle ambient occlusion shadow: `0 16px 32px -8px rgba(0, 0, 0, 0.6)`.
- **Level 3 (Modals, Command Palettes, Tooltips):** `rgba(39, 39, 42, 0.85)` with `backdrop-filter: blur(32px)`, bordered by `rgba(255, 255, 255, 0.14)` and an outer shadow of `0 24px 48px -12px rgba(0, 0, 0, 0.85)`.
- **Light Rim Technique:** Every floating panel features an asymmetrical hairline border to simulate an overhead instrument light source—the top border carries double the opacity of the lower border.

## Shapes

The geometric framework balances technical instrument precision with Apple-level industrial curvature.

- **Standard Panels & Cards:** Use refined `rounded-lg` (16px) curvature to soften interface corners without appearing playful or bubbly.
- **HUD Telemetry Chips & Control Docks:** Styled as continuous pill shapes (`rounded-full` / 9999px) to establish tactile, capsule-like status indicators and button clusters.
- **Nested Ratio Rule:** Child components strictly follow concentric border radii. If a container has a 16px border-radius with 8px internal padding, interior child selections or highlights use an 8px radius (`R_inner = R_outer - Padding`).
- **Dividers:** Absolute 1px hair-lines; avoid full-width lines when whitespace alone can imply grouping.

## Components

### Buttons & Action Triggers
- **Primary Signal Button:** Dark glass base with subtle warm border, white text, and a micro 6px glowing amber status pip to the left. On active interaction: background transitions to `rgba(245, 158, 11, 0.12)` with a pure `#F59E0B` hairline border.
- **Ghost HUD Button:** Transparent fill, `1px solid rgba(255, 255, 255, 0.08)` border, text `#A1A1AA`. On hover: border switches to `rgba(255, 255, 255, 0.2)` with text `#FFFFFF` and `background: rgba(255, 255, 255, 0.03)`.
- **Icon Actions:** 32x32px square or circle floating glass triggers with centered 14px monochrome vector icons.

### Floating Pills & Telemetry Chips
- Pill-shaped capsules (`h-7`, `px-3`) rendered in `rgba(24, 24, 27, 0.6)` with `backdrop-blur-md` and `1px solid rgba(255, 255, 255, 0.06)`.
- Internal layout: Leading monochrome label (e.g., `SPD`, `COG`, `DRA`), followed by a JetBrains Mono numeric readout in `#FFFFFF`, with units in `#71717A`.

### Tactical Lists & Tabular AIS Matrices
- Flat, zero-divider execution. Rows establish separation through micro-hover highlights (`rgba(255, 255, 255, 0.02)`).
- Padding is compact (`py-2.5`, `px-3`), maintaining consistent vertical alignment between vessel names (Inter Medium) and coordinate streams (JetBrains Mono).

### Input Fields & Command Bar
- Command palette (Linear style, activated via `Cmd+K`): Floating centered modal, `bg-[#18181B]/80`, `backdrop-blur-2xl`, 1px perimeter border `rgba(255, 255, 255, 0.1)`.
- Input fields: No underline, no solid white boxes. Borderless text field with `#71717A` placeholder, punctuated only by a leading electric-cyan tracking icon.

### Cards & Intelligence Panels
- Translucent frosted substrate with zero drop shadow in resting state.
- Header region features vessel name, country of registry icon, and a single critical flag indicator.
- Body incorporates low-density metric clusters: raw numbers rendered large (`headline-md`) in `#FFFFFF`, with micro mono descriptions below in `#71717A`.

### Signal Anomaly Badges (Domain-Specific)
- Used for high-stakes intelligence callouts (e.g., "AIS Gap: 42h", "Dark STS Transfer", "Spoofed Flag").
- Designed as a minimal dark pill: background `rgba(245, 158, 11, 0.08)`, border `1px solid rgba(245, 158, 11, 0.3)`, text `#F59E0B`, accompanied by a pulsing 4px amber locator dot.