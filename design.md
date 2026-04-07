# Design System Specification: Professional CQI Analytics

## 1. Overview & Creative North Star: "The Analytical Architect"
This design system is engineered for Continuous Quality Improvement (CQI) environments where data density and precision are paramount. We are moving away from the "generic dashboard" aesthetic. Our Creative North Star is **The Analytical Architect**: a visual language that feels as structured and intentional as a blueprint but as legible as a high-end financial editorial.

To move beyond the template look, we utilize **intentional asymmetry** and **tonal layering**. While most dashboards rely on borders to separate data, this system uses the "void" (white space) and subtle shifts in surface color to create a hierarchy of information. The result is an interface that feels quiet, authoritative, and expensive—mimicking the functional elegance of tools like Linear or Stripe.

---

## 2. Colors & Surface Logic
The palette is rooted in a sophisticated range of slates and navies, designed to recede into the background so the data can speak.

### Tonal Tokens
- **Background (Surface):** `#F9FAFB` – The foundation of the entire application.
- **Primary:** `#545F73` (Slate) – Used for primary utility and navigation.
- **On-Primary Container:** `#1E293B` (Deep Navy) – Reserved for high-emphasis actions and "Hero" data points.
- **Surface Container Lowest:** `#FFFFFF` – Used exclusively for "Cards" and "Interactive Modules."

### The "No-Line" Rule
Standard dashboards are often cluttered by 1px borders. **In this design system, 1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background shifts. For example, a `surface-container-low` data table should sit on a `surface` background. The contrast between `#F8F9FA` and `#FFFFFF` provides enough "visual air" to define a container without the cognitive load of a structural line.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper:
1.  **Base Layer:** `surface` (#F8F9FA) - The desk.
2.  **Interactive Layer:** `surface-container-lowest` (#FFFFFF) - The paper sitting on the desk.
3.  **Utility Layer:** `surface-container` (#EAEFF1) - Sub-sections or inactive states.

---

## 3. Typography: Editorial Precision
We utilize **Inter** not just as a font, but as a structural tool. Our hierarchy prioritizes the "Scan-ability" of metrics.

- **Display-SM (2.25rem):** Used for "Hero" numbers (e.g., 98.4% Compliance). Tight letter-spacing (-0.02em).
- **Title-MD (1.125rem):** Used for card headings. Medium weight (500) to provide a subtle anchor for the eyes.
- **Body-MD (0.875rem):** The workhorse for all data labels and descriptions.
- **Label-SM (0.6875rem):** High-caps or bold weight for technical metadata and table headers.

**The Editorial Shift:** Use `label-sm` in `on-surface-variant` (#586064) for all secondary metadata. This creates a high-contrast relationship with the data, ensuring the "Labels" act as context and the "Values" act as the content.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often heavy and dated. We achieve depth through atmospheric light and tonal stacking.

### The Layering Principle
Depth is achieved by stacking `surface-container` tiers. Place a `surface-container-lowest` (#FFFFFF) card on a `surface` (#F8F9FA) background. This creates a "Natural Lift" that feels built-in rather than applied.

### Ambient Shadows
When a card requires a floating effect (e.g., a dropdown or a high-priority modal), use the following:
- **Shadow Token:** `0 1px 3px 0 rgba(0, 0, 0, 0.1)`
- **Director's Note:** The shadow must be nearly invisible. If you can clearly see where the shadow ends, it is too heavy. It should feel like an ambient occlusion rather than a "drop shadow."

### The "Ghost Border" Fallback
If a border is required for accessibility in high-density tables, use a "Ghost Border":
- **Token:** `outline-variant` (#ABB3B7) at **10% opacity**.
- **Rule:** Never use 100% opaque borders for internal grid lines.

---

## 5. Components

### Buttons
- **Primary:** `on-primary-container` (#1E293B) background with `on-primary` (#F6F7FF) text. 8px corner radius. No gradient.
- **Secondary:** `surface-container-high` (#E2E9EC) background with `on-surface` text.
- **Tertiary:** Ghost style. No background, `primary` (#545F73) text. Use for low-priority actions like "Cancel" or "Export."

### Data Cards
- **Structure:** `surface-container-lowest` (#FFFFFF) background.
- **Radius:** `DEFAULT` (0.5rem / 8px).
- **Padding:** 24px (1.5rem) consistent internal gutter. Forbid the use of divider lines within cards; use 16px vertical spacing to separate groups of information.

### Metric Chips
- **Status Chips:** Use `primary-container` (#D8E3FB) for neutral states and `error-container` (#FE8983) for alerts.
- **Shape:** `full` (9999px) for a distinct "pill" look that contrasts against the 8px card corners.

### Input Fields
- **Background:** `surface-container-lowest` (#FFFFFF).
- **Border:** `outline-variant` (#ABB3B7) at 20% opacity. 
- **Focus State:** Border changes to `primary` (#545F73) at 100% opacity. No "outer glow" or halo effects.

---

## 6. Do's and Don'ts

### Do
- **Do** prioritize white space over lines. If two elements feel cluttered, increase the margin rather than adding a divider.
- **Do** use `primary-fixed-dim` (#CAD5ED) for subtle background highlights in selected list items.
- **Do** align data points to a strict 8px grid to maintain "Analytical Architect" precision.

### Don't
- **Don't** use pure black (#000000) for text. Always use `on-surface` (#2B3437) to maintain a soft, premium feel.
- **Don't** use gradients or glassmorphism. This system relies on the purity of solid colors and perfect spacing.
- **Don't** use standard 1px `#E2E8F0` borders for card separation. Rely on the contrast between the white card and off-white background.
- **Don't** center-align data in tables. Always left-align text and right-align numerical values for professional readability.