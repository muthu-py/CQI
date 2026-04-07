# Design System Specification: Academic Precision & Tonal Depth

## 1. Overview & Creative North Star: "The Intellectual Atelier"
The North Star for this design system is **The Intellectual Atelier**. Unlike standard dashboards that rely on rigid grids and harsh borders, this system treats data as a curated exhibition. We move away from the "software template" look and toward a high-end editorial experience. 

The aesthetic is defined by **Soft Minimalism**: a sophisticated interplay of light and volume. We achieve "cleanliness" not through empty space, but through mathematical precision in typography and a "No-Line" philosophy that uses tonal shifts to define structure. The result is a professional environment that feels calm, authoritative, and deeply intentional.

---

## 2. Colors: The Tonal Landscape
We use a sophisticated palette of slates and cool neutrals to provide a focused environment for academic analysis.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition needed.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine archival paper. 
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Sectioning:** `surface-container-low` (#f0f4f7)
- **Primary Content Cards:** `surface-container-lowest` (#ffffff)
- **Elevated Interstitials:** `surface-container-high` (#e1e9ee)

### The Glass & Signature Texture
- **Glassmorphism:** For floating elements like dropdowns or specialized Insight Panels, use `surface-container-lowest` at 80% opacity with a `24px` backdrop blur.
- **Signature Gradients:** For primary CTAs and high-level metric highlights, use a subtle linear gradient from `primary` (#0053db) to `primary_dim` (#0048c1) at a 135-degree angle. This adds "visual soul" and prevents the interface from feeling "flat."

---

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-academic" feel. Use `headline-lg` for dashboard titles to establish a strong structural anchor.
*   **Body & Labels (Inter):** The workhorse for data. Its high x-height ensures readability in high-density data tables and metric cards.

**Hierarchy as Identity:**
- **Primary Metrics:** Use `display-sm` (Manrope) for top-level numbers to give them a sense of "prestige."
- **Data Labels:** Use `label-md` (Inter) in `on_surface_variant` (#566166) for secondary metadata to ensure the eye settles on the data first, then the context.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "muddy." In this system, we use light and tone to create a sense of height.

### The Layering Principle
Instead of a shadow, place a `surface-container-lowest` card on top of a `surface-container-low` background. This "0.5rem" (`DEFAULT`) rounded corner card will appear to lift naturally due to the contrast in brightness.

### Ambient Shadows
When a card must float (e.g., a specialized Insight Panel), use an **Ambient Shadow**:
- **Color:** `on_surface` (#2a3439) at 6% opacity.
- **Blur:** 32px.
- **Offset:** Y: 8px, X: 0.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., in a high-density data table), use a **Ghost Border**: `outline_variant` (#a9b4b9) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Precision Elements

### Metric Cards
- **Structure:** No borders. Background: `surface-container-lowest`.
- **Corner Radius:** `md` (0.75rem / 12px).
- **Styling:** Use a 4px vertical accent bar of `primary` on the left edge of the card to indicate "Active" or "Selected" states.

### Filter Panels
- **Container:** `surface-container-low`.
- **Layout:** Use intentional asymmetry. Place primary filters in a horizontal bar, but keep "Advanced" filters in a slide-out `surface-container-lowest` panel with a `24px` backdrop blur.

### Insight Panel (Specialized)
- **Visuals:** This is a "Glass" component. Use `surface-container-highest` at 70% opacity. 
- **Typography:** Use `title-sm` for insights to create an editorial feel, distinguishing human-readable analysis from raw data.

### Data Tables
- **Rule:** Forbid divider lines.
- **Separation:** Use `surface-container-low` for the header row and alternating `surface-container-lowest` and `surface` for body rows (zebra striping) at a very low contrast ratio.
- **Typography:** `body-md` for row content; `label-sm` (All Caps) for headers.

### Buttons & Chips
- **Primary Button:** Gradient (`primary` to `primary_dim`). White text. `lg` (1rem) roundedness.
- **Chips:** `surface-container-high` background. No border. On-hover, shift to `primary_container`.

---

## 6. Do's and Don'ts

### Do:
- **Do** use `surface-container` shifts to separate the Sidebar from the Main Content.
- **Do** use large amounts of "Negative Space" around display typography to create a premium feel.
- **Do** use `primary_fixed_dim` for "soft" highlights in charts.

### Don't:
- **Don't** use black (#000000) for text. Use `on_surface` (#2a3439) for a softer, more professional contrast.
- **Don't** use standard 1px borders between table rows; use vertical padding and subtle background shifts.
- **Don't** use "Drop Shadows" on every card. Reserve shadows only for elements that physically "hover" over others (modals, tooltips, insight panels).

### Accessibility Note:
While we lean into tonal shifts, always ensure that the contrast between `on_surface` and its container meets WCAG AA standards. If the background shift is too subtle for a specific monitor, the **Ghost Border** (15% opacity `outline_variant`) is your sanctioned fallback.