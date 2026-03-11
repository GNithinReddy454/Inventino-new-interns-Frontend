---
description: Workflow to implement full functionality for all Admin Add Product sections without changing existing UI structure
---

This workflow defines an implementation plan for the Admin Add Product page sections listed below, while preserving current code, UI layout, and visible behavior unless explicitly required by business logic.

## Scope
Implement end-to-end functionality for these sections:
1. Basic Information
2. Publish Setting
3. Pricing and Inventory
4. Shipping
5. SEO
6. Product Color
7. Sizes
8. Story Header
9. Link to Product
10. Story Settings
11. Preview and Publish
12. Tags and Keyboard
13. Artisan Information
14. Product Image

## Non-Negotiable Constraints
1. Do not refactor existing UI structure/components.
2. Do not alter visual design, spacing, typography, or section ordering.
3. Do not break existing page routes, APIs, Redux state shape, or service contracts.
4. Only additive logic changes are allowed (validation, API wiring, data mapping, persistence).
5. All implementation must be backward-compatible with current admin data.

## Implementation Strategy
1. Add missing functional wiring section-by-section.
2. Keep each section isolated by using dedicated payload mapping and validators.
3. Use feature toggles/guards only if needed to avoid regressions.
4. Complete integration in phases: data model -> form state -> validation -> submit mapping -> API persistence -> edit-mode hydration.

## Phase 0: Baseline and Safety
1. Freeze current behavior:
   - Capture current Add Product flow with test notes and screenshots.
   - Identify existing submit handlers and service calls in admin product files.
2. Add regression checklist:
   - Create manual test sheet for create product, edit product, draft, and publish.
3. Confirm API contracts:
   - Verify required/optional fields in backend product create/update endpoints.

Exit criteria:
- Existing add product flow still works exactly as before.
- Known gaps are documented per section.

## Phase 1: Data Contract Matrix (No UI Changes)
Create one contract table for each section with:
1. UI field name
2. Internal form key
3. API key
4. Data type
5. Required/optional
6. Default value
7. Validation rules
8. Transformations (trim, slugify, normalize arrays)

Exit criteria:
- Every field in all 14 sections has explicit mapping and validation rules.

## Phase 2: Section-wise Functional Wiring
Implement sections in this order to reduce dependencies.

### 1) Basic Information
Tasks:
1. Bind title, subtitle/short description, category/subcategory, product type, slug, and primary identifiers.
2. Add required-field validation and character limits.
3. Ensure slug generation/fallback is deterministic and editable if current UI already supports edit.

Acceptance:
- Section state persists in form state.
- Save Draft/Publish payload includes valid basic info.

### 2) Publish Setting
Tasks:
1. Wire status flags (draft, active, archived, scheduled if present).
2. Implement date/time normalization for publish scheduling.
3. Add guard for invalid publish time (past timestamps, malformed dates).

Acceptance:
- Publish status and schedule are persisted and restored in edit mode.

### 3) Pricing and Inventory
Tasks:
1. Wire base price, compare-at price, cost, tax flags, SKU, stock quantity, low-stock threshold.
2. Add numeric validation (non-negative, compare-at >= base if required by rule).
3. Implement inventory policy handling (deny/continue selling when out of stock).

Acceptance:
- Invalid prices/quantities cannot be submitted.
- Inventory fields are persisted correctly.

### 4) Shipping
Tasks:
1. Wire weight, dimensions, shipping class/profile, free shipping eligibility, COD availability if present.
2. Validate unit consistency and positive numeric values.
3. Normalize measurement units in payload.

Acceptance:
- Shipping payload is complete and valid for backend processing.

### 5) SEO
Tasks:
1. Bind SEO title, meta description, canonical URL, OG fields if present.
2. Add character count validation and truncation warnings (non-blocking unless business requires blocking).
3. Auto-fallback SEO title/description from basic info when empty (if allowed by current behavior).

Acceptance:
- SEO data is persisted and loaded in edit mode.

### 6) Product Color
Tasks:
1. Wire color options as structured array with stable identifiers.
2. De-duplicate colors and normalize casing.
3. Connect color data to variants/media mapping where required.

Acceptance:
- Color entries are saved, edited, removed without index mismatch bugs.

### 7) Sizes
Tasks:
1. Wire size list and optional size chart reference.
2. Validate duplicate sizes and ordering.
3. Ensure compatibility with color/variant matrix if used.

Acceptance:
- Sizes persist accurately and map correctly in payload.

### 8) Story Header
Tasks:
1. Wire story heading, subheading, cover image reference, and intro copy fields.
2. Validate required fields for story-enabled products.
3. Ensure rich text/plain text format conversion is consistent.

Acceptance:
- Story header content is saved and displayed in preview payload.

### 9) Link to Product
Tasks:
1. Wire internal links (related/upsell/cross-sell/parent product) by product id/slug.
2. Validate referential integrity (linked product exists).
3. Prevent self-link loops where disallowed.

Acceptance:
- Linked products are persisted and rehydrated on edit.

### 10) Story Settings
Tasks:
1. Wire story visibility, ordering, CTA label/url, section toggles.
2. Validate URL format and CTA dependencies.
3. Ensure disabled story settings are excluded or explicitly set as false.

Acceptance:
- Story settings produce stable payload and edit-mode restore.

### 11) Preview and Publish
Tasks:
1. Build preview payload serializer from canonical form state.
2. Ensure preview uses current unsaved state (without mutating source state).
3. Wire publish action to final validation gate and API call.

Acceptance:
- Preview reflects exactly what will be submitted.
- Publish only succeeds when all mandatory sections are valid.

### 12) Tags and Keyboard
Tasks:
1. Wire tags array with trim/lowercase normalization strategy.
2. Implement keyboard/keyword metadata as searchable tokens.
3. Add dedupe and max count rules.

Acceptance:
- Tags/keywords are persisted and reusable for search/filter logic.

### 13) Artisan Information
Tasks:
1. Wire artisan id/name/bio/location/media references.
2. Validate required artisan fields for artisan-linked products.
3. Support either embedded artisan snapshot or referenced artisan entity per backend contract.

Acceptance:
- Artisan data persists and hydrates consistently.

### 14) Product Image
Tasks:
1. Wire image uploads/selectors for primary gallery and optional section-specific image mapping.
2. Validate file types, file size, and minimum image count.
3. Maintain deterministic image ordering and primary-image flag.

Acceptance:
- Uploaded/selected images persist and are correctly included in publish payload.

## Phase 3: Unified Validation and Submit Pipeline
1. Build a single validation orchestrator composed of section validators.
2. Implement two submit modes:
   - Save Draft: lenient validation
   - Publish: strict validation
3. Add error surface mapping back to existing UI fields (without redesign).

Exit criteria:
- Validation errors are section-accurate and user-actionable.

## Phase 4: Edit Mode and Data Hydration
1. Implement server-to-form mapper for all sections.
2. Handle legacy products with missing fields by applying defaults.
3. Ensure no field resets unexpectedly when switching tabs/sections.

Exit criteria:
- Existing products load, edit, and save without data loss.

## Phase 5: Testing and Regression Protection
1. Manual test matrix:
   - Create draft
   - Publish new product
   - Edit existing product
   - Add/remove colors and sizes
   - Upload/reorder/remove images
   - Story-enabled and story-disabled flows
2. API tests:
   - Validate create/update payloads against backend schema.
3. Negative tests:
   - Invalid numbers, bad URLs, duplicate tags/sizes/colors, empty required fields.

Exit criteria:
- No regression in existing admin flows.
- All 14 sections function end-to-end.

## Phase 6: Rollout Plan
1. Implement in small PRs by section group:
   - PR-1: Basic + Publish + Pricing/Inventory + Shipping
   - PR-2: SEO + Colors + Sizes + Tags/Keyboard
   - PR-3: Story Header + Link to Product + Story Settings
   - PR-4: Artisan Info + Product Images + Preview/Publish gate
2. Run lint/typecheck/build for each PR.
3. Merge only after admin QA sign-off.

## Deliverables Checklist
1. Section contract matrix complete for all 14 sections.
2. Validators for all mandatory fields.
3. API payload mappers (create/update/hydrate).
4. Draft and publish submit paths working.
5. Manual QA report covering all sections.
6. No visual or structural UI changes.

## Definition of Done
1. Every listed section saves and restores data correctly.
2. Publish flow rejects invalid data and accepts valid data.
3. Existing behavior and UI remain unchanged.
4. No regression in current Add Product admin functionality.
