# CQI Dashboard Frontend Plan

## Goal
Build a production-grade CQI admin dashboard UI (clean, minimal, non-template style) that uses real backend APIs and removes existing dummy dashboard flows.

## Information Architecture

### 1. Overview Page
Purpose: Give the admin an immediate quality snapshot for selected Regulation + Subject (+ optional Batch).

Features:
- Scope summary header (Regulation, Subject, Batch mode)
- KPI strip
  - Planned CO-PO links
  - Achieved CO-PO links
  - Avg achieved percentage
  - Critical gaps count
- Batch trend chart
  - Visible only when batch is not selected
  - Shows 3-batch progression within selected regulation+subject
- Exam reality panel
  - Internal/External/Final attainment percentages

### 2. CO-PO Mapping Page
Purpose: Compare curriculum design intent vs exam reality.

Features:
- Planned vs Achieved matrix table per CO-PO pair
- Columns:
  - CO, PO
  - Planned weightage
  - Planned target %
  - Achieved %
  - Gap %
  - Status (critical/watch/on-track)
- Visual gap highlighting by severity
- Compact summary row with counts by status

### 3. Improvement Page
Purpose: Show what needs intervention now.

Features:
- Prioritized recommendations list from backend
- Priority badges (High/Medium)
- Gap-oriented sorting (highest gap first)
- Suggested action text for each CO-PO pair

## Global UI Structure

### Navbar
- Brand: `CQI Console`
- Navigation tabs:
  - Overview
  - CO-PO Mapping
  - Improvement
- Right-side context badge: `Academic Quality`

### Scope Filter Bar (Collapsible)
- Trigger: `Scope Filters`
- Controls:
  - Regulation (required for data)
  - Subject (required for data)
  - Batch (optional; all batches when empty)
- Actions:
  - Apply
  - Reset
- Compact summary strip visible when collapsed

### Visual Direction
- Minimal light aesthetic with strong typography
- Neutral base + one accent color
- Subtle gradients, soft card shadows, clear spacing rhythm
- Responsive behavior for desktop and mobile

## Data Contracts Used
- `GET /analysis/admin/filter-options`
- `GET /analysis/admin/co-po-insights`

## Implementation Steps
1. Remove old dummy dashboard composition from `App.tsx`.
2. Build new shell (navbar + page switch + scope filter bar).
3. Wire scope filter options and selected scope state.
4. Build three pages using insights payload.
5. Add reusable UI blocks (card, metric, table, badge states).
6. Replace global CSS with dashboard-specific design tokens + layout.
7. Remove obsolete module/component files not used in new architecture.
8. Run frontend build and fix all issues.

## Done Criteria
- No dummy/random data on UI.
- Only required CQI pages and features are present.
- Filters drive backend queries correctly.
- Batch behavior:
  - Empty batch => 3-batch trend visible
  - Selected batch => single-batch scope, trend hidden
- Build passes with zero TypeScript errors.
