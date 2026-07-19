# Phase 4B-4E: Quick Wins & High-ROI Improvements
**Status:** Ready for Implementation  
**Scope:** SEO, content, engagement, UX polish  
**Total Effort:** 19-22 hours across 3 days  
**Expected Impact:** +25-35% organic traffic, +15-20% engagement  
**Target:** Complete by end of week 2

---

## Implementation Strategy

### Parallelizable Groups
- **Group A (SEO Foundations):** Learn topics, FAQ, Glossary — no dependencies
- **Group B (Model Discovery):** Model detail pages, related models, extended data — sequential
- **Group C (Engagement):** Bookmarks, What's new, Filters, Cards — independent

### Sequential Dependencies
1. Learn topics MUST complete before: Glossary inline linking (Task 4)
2. Model pages MUST complete before: Related models recommendations (Task 6)
3. Filters + Cards MUST complete before: Sticky header integration (Task 11)

---

## Task Breakdown

### PHASE 1: SEO FOUNDATIONS (Day 1 — 6-7 hours)

#### Task 1: Expand Learn Topics (15+ new topics)
**Time:** 3 hours  
**Dependencies:** None  
**Files:**
- `src/pages/learn/topics.ts` (expand existing)
- `src/pages/learn/LearnTopic.tsx` (no changes)

**Deliverables:**
- Add 15 new Topic objects to topics array
- Categories: Comparisons (3), Use Cases (3), Advanced (9)
- All with SEO titles/descriptions, content, internal links
- Tests: Verify 23 total topics, required fields present

**Topics:**
1. Claude vs GPT (comparison)
2. Claude vs Gemini (comparison)
3. Grok vs GPT (comparison)
4. Best model for coding (use case)
5. Best model for writing (use case)
6. Best model for research (use case)
7. What is a vision model? (concept)
8. What is an embedding model? (concept)
9. What is fine-tuning? (concept)
10. Model pricing: input vs output tokens (concept)
11. Context window strategies (concept)
12. Prompt engineering basics (concept)
13. When to use web search (concept)
14. Model hallucinations: why and when (concept)
15. Open source vs closed source (concept)

---

#### Task 2: Create FAQ Section (25+ Q&A)
**Time:** 2 hours  
**Dependencies:** None  
**Files:**
- `src/data/faqs.ts` (new)
- `src/pages/FAQ.tsx` (new)
- `src/App.tsx` (add route)
- `src/components/Layout.tsx` (add nav link)

**Deliverables:**
- FAQs organized by category (Getting Started, Selection, Pricing, Technical, Benchmarks)
- Search/filter functionality
- Accordion expand/collapse
- FAQ schema (JSON-LD)
- 12+ tests covering search, filter, a11y
- Tests: 283 → ~295 passing

**Questions (5 per category):**
- Getting Started: "What is an LLM?", "What is a token?", "How do benchmarks work?", etc.
- Selection: "How do I choose a model?", "What's the difference between reasoning and non-reasoning?", etc.
- Pricing: "How is pricing calculated?", "Input vs output token costs?", etc.
- Technical: "What's a context window?", "Can I fine-tune models?", etc.
- Benchmarks: "What is SWE-Bench?", "What is GPQA?", etc.

---

#### Task 3: Create Glossary (50+ terms)
**Time:** 2 hours  
**Dependencies:** Task 1 (Learn topics should exist for linking)  
**Files:**
- `src/data/glossary.ts` (new)
- `src/pages/Glossary.tsx` (new)
- `src/components/GlossaryLink.tsx` (new, optional)
- `src/App.tsx` (add route)
- `src/components/Layout.tsx` (add nav link)

**Deliverables:**
- 50+ glossary terms (A-Z) with short + long definitions
- Search/filter by term name
- A-Z jump navigation
- Related terms linking
- Link to Learn topics where relevant
- Glossary schema (JSON-LD)
- 12+ tests
- Tests: 295 → ~307 passing

**Term Categories:**
- Model types: LLM, vision model, embedding model, etc.
- Benchmarks: SWE-Bench, GPQA, MATH, etc.
- Concepts: token, context window, reasoning, hallucination, etc.
- Companies: Anthropic, OpenAI, Google DeepMind, xAI, Meta, etc.
- Abbreviations: API, JSON-LD, RAG, etc.

**Optional Enhancement:**
- Inline glossary highlighting on Learn pages
- Hover tooltip with definition
- Click to navigate to glossary term page

---

### PHASE 2: MODEL DISCOVERY (Day 2 — 6-7 hours)

#### Task 4: Create Model Detail Pages (/models/:id)
**Time:** 3 hours  
**Dependencies:** None (can start independently)  
**Files:**
- `src/pages/models/ModelDetail.tsx` (new)
- `src/components/ModelHeader.tsx` (new)
- `src/components/ModelSpecs.tsx` (new)
- `src/components/ModelBenchmarks.tsx` (new)
- `src/components/UseCasesSection.tsx` (new)
- `src/components/ProsCons.tsx` (new)
- `src/App.tsx` (add route `/models/:id`)
- `src/data/models.ts` (extend with new fields)
- `src/data/types.ts` (add Model fields)

**Extend Model Type:**
```typescript
interface Model {
  // existing fields...
  useCases?: string[] // ["coding", "writing", "research"]
  whyChooseThis?: string // 1-2 paragraph explanation
  prosVsCompetitors?: Record<string, string> // vs GPT, vs Gemini
  relatedModelIds?: string[] // similar alternatives
}
```

**Deliverables:**
- Page displays: name, specs, use cases, benchmarks, pros/cons, related models
- Product schema (JSON-LD) for Google rich snippets
- Dynamic title/meta description
- 404 handling for invalid model IDs
- Link from Compare page model names → detail pages
- "View details" button on Home model cards
- 15+ tests covering rendering, schema, routing
- Tests: 307 → ~322 passing

---

#### Task 5: Add Related Models Recommendations
**Time:** 1 hour  
**Dependencies:** Task 4 (model detail pages)  
**Files:**
- `src/lib/recommendations.ts` (new)
- `src/pages/models/ModelDetail.tsx` (integrate)
- `src/components/RelatedModels.tsx` (new)

**Algorithm:**
- Same provider: +50 points
- Same tier: +30 points
- Similar context window: +20 points
- Similar capabilities: +10 per match
- Return top 3 by score

**Deliverables:**
- Recommendation engine
- Display 3 related models on detail page
- "You might also like" section
- 10+ tests covering algorithm, edge cases
- Tests: 322 → ~332 passing

---

#### Task 6: Extend Model Data (Use Cases, Pros/Cons)
**Time:** 2 hours  
**Dependencies:** Task 4 (Model type extended)  
**Files:**
- `src/data/models.ts` (expand each model entry)

**For each model, add:**
- `useCases`: 2-3 typical use cases (e.g., ["coding", "research"])
- `whyChooseThis`: 1-2 paragraphs explaining strengths
- `prosVsCompetitors`: comparison vs main competitors
- `relatedModelIds`: 2-3 model IDs of alternatives

**Deliverables:**
- All 30+ models have use cases populated
- All have "why choose" messaging
- All have pros/cons vs competitors
- All have related models
- Tests: 332 → ~332 (no new tests, but data integrity check)

---

### PHASE 3: ENGAGEMENT & UX POLISH (Day 3 — 5-6 hours)

#### Task 7: Model Bookmarks (Favorites System)
**Time:** 1 hour  
**Dependencies:** None  
**Files:**
- `src/lib/bookmarks.ts` (new)
- `src/components/BookmarkButton.tsx` (new)
- `src/pages/Compare.tsx` (integrate)
- `src/pages/Home.tsx` (show saved models if any)

**Deliverables:**
- localStorage persistence (key: "models-fyi-bookmarks")
- Star icon on Compare page rows
- Click to toggle bookmark
- "Bookmarked only" filter on Compare
- "Your saved models" section on Home
- Animated star fill
- 8+ tests covering toggle, persistence, filtering
- Tests: 332 → ~340 passing

---

#### Task 8: What's New Feed (Recent Releases)
**Time:** 1 hour  
**Dependencies:** None  
**Files:**
- `src/data/releases.ts` (new)
- `src/pages/WhatsNew.tsx` (new)
- `src/App.tsx` (add route)
- `src/components/Layout.tsx` (add nav link)

**Release Data (sample):**
```typescript
interface Release {
  id: string
  modelId: string
  type: 'new' | 'update' | 'price-change' | 'feature'
  title: string
  description: string
  date: string // ISO 8601
  link?: string
}
```

**Content:**
- Claude Sonnet 5 released (2026-06-30)
- GPT-5 released (2026-06-15)
- Claude Opus price drop (2026-06-10)
- Web search added to Claude (2026-05-20)
- 8-12 releases from last 6 months

**Deliverables:**
- Chronological feed (newest first)
- Filter by type (new, update, price, feature)
- Relative dates ("2 weeks ago")
- Link to model detail pages
- 8+ tests
- Tests: 340 → ~348 passing

---

#### Task 9: Advanced Capability Filters
**Time:** 1 hour  
**Dependencies:** None (independent from Compare)  
**Files:**
- `src/lib/modelFilters.ts` (new, expand existing if needed)
- `src/pages/Compare.tsx` (integrate)

**New Filter Options:**
- 🧠 Reasoning (reasoning: true)
- 👁️ Vision (vision: true)
- 🌐 Web Search (internetAccess: true)
- 🎨 Image Generation (imageGeneration: true)

**Deliverables:**
- Capability filter buttons on Compare
- Combine with existing provider/open-source filters
- Show applied filters
- 15+ tests covering all filter combinations
- Tests: 348 → ~363 passing

---

#### Task 10: Model Comparison Cards (Mobile Alternative)
**Time:** 2 hours  
**Dependencies:** None  
**Files:**
- `src/components/ModelCard.tsx` (new)
- `src/pages/Compare.tsx` (integrate view mode toggle)

**Card Features:**
- Displays: name, provider, tier, key specs, benchmarks
- Bookmark star
- "View details" button
- Copy buttons for key fields
- Copy to Compare button

**View Mode:**
- Toggle between table/cards
- Default to cards on mobile (< 768px)
- Default to table on desktop
- Store preference in localStorage

**Deliverables:**
- Card component
- View mode toggle UI
- Responsive grid (1 col mobile, 2-3 desktop)
- Smooth transitions
- 12+ tests
- Tests: 363 → ~375 passing

---

#### Task 11: Sticky Header on Compare Page
**Time:** 1 hour  
**Dependencies:** Task 9 (filters), Task 10 (cards)  
**Files:**
- `src/pages/Compare.tsx` (refactor)
- `src/index.css` (add sticky styles)

**Features:**
- Search input sticks to top when scrolling
- Filters remain accessible
- Show model count in header
- Collapse/expand filters on mobile
- "Clear filters" button

**Deliverables:**
- Sticky header component
- Smooth animations
- z-index management
- Mobile optimizations
- Tests: 375 → ~380 passing

---

### PHASE 4: TESTING & VALIDATION (Day 3.5 — 2-3 hours)

#### Task 12: Comprehensive Testing & QA
**Time:** 2-3 hours  
**Dependencies:** All tasks complete  
**Verification:**
- npm test → 380+ tests passing (vs 283 baseline)
- npm run build → 0 errors
- npm run lint → 0 errors
- Lighthouse all pages → ≥90 across categories
- Manual QA: Desktop (Chrome, Safari), Mobile (iPhone, Android)
- Accessibility: Keyboard nav, screen reader (WAVE)
- SEO: Rich snippets verification

**Checklist:** (verified 2026-07-19 at 075ef78)
- [x] 380+ tests passing — **537** across 56 files
- [x] ≥90% code coverage (new code) — new lib modules at 100%, ModelDetail 92.3% (overall statements 86.5%). `npm run test:coverage`
- [ ] Lighthouse ≥90 (all pages) — **not measured**: needs a real browser, out of scope for the light stack
- [x] 0 TypeScript errors
- [x] 0 lint errors — 3 pre-existing oxlint *warnings* remain (entry-server, Toast, CopyButton)
- [x] 0 accessibility violations — axe suite over 7 key pages; 3 real violations found and fixed (aria-sort on a button, nested `<th>`, links inside buttons)
- [ ] Mobile responsive (< 768px breakpoint) — not re-verified this pass; needs a browser
- [ ] Dark mode works on all new pages — not re-verified this pass; needs a browser
- [x] Internal links work (Learn → Compare → Models) — 10 dead glossary links fixed; guard test blocks regressions
- [x] Schema validation (JSON-LD) — 55/56 prerendered pages (404 skipped), all blocks parse, no fabricated fields

**Note:** the Learn section now has **26** topics, not the 21 recorded in Task 1.

---

## File Changes Summary

### New Files (25+)
**Pages:** FAQ, Glossary, ModelDetail, WhatsNew  
**Components:** ModelHeader, ModelSpecs, ModelBenchmarks, UseCasesSection, ProsCons, RelatedModels, BookmarkButton, ModelCard, GlossaryLink  
**Libraries:** bookmarks, recommendations, modelFilters  
**Data:** faqs, glossary, releases  
**Tests:** All corresponding .test.ts/.test.tsx  

### Modified Files (5)
- `src/App.tsx` — Add routes
- `src/pages/Compare.tsx` — Filters, bookmarks, cards, sticky header
- `src/pages/Home.tsx` — Show saved models, "View details" links
- `src/components/Layout.tsx` — Add nav links
- `src/data/models.ts` — Add useCases, whyChooseThis, prosVsCompetitors, relatedModelIds

---

## Metrics & Success

### Content & SEO
- 23 Learn topics (vs 8)
- 25+ FAQ items
- 50+ Glossary terms
- 30+ Model detail pages
- 200+ internal links (vs ~50)
- Rich snippets for models & FAQ

### Engagement & Features
- Bookmarks: estimate 5%+ adoption
- Model cards: 10%+ mobile engagement increase
- Advanced filters: 8%+ usage
- What's new: 3%+ referral traffic

### Quality & Performance
- 380+ total tests (134 new, vs 283 baseline)
- ≥90% coverage on new code
- Lighthouse ≥90 (maintained)
- 0 TypeScript/ESLint errors
- 0 accessibility violations

### Traffic Impact (Expected)
- +20-30% organic traffic (SEO)
- +50% model-specific queries
- +15-20% user engagement
- +30% average session duration
- -10-15% bounce rate

---

## Risk Mitigation

**Low Risk Items:**
- Learn topics (content only)
- FAQ (isolated page)
- Glossary (isolated page)
- What's new (isolated page)
- Bookmarks (localStorage, self-contained)

**Medium Risk Items:**
- Model pages (new routes, schema validation) → mitigated by tests + manual QA
- Filters (state management) → mitigated by tests
- Cards (mobile edge cases) → mitigated by manual QA on devices

**Rollout Strategy:**
1. Phase 1 (SEO) — Deploy first, immediate traffic benefit
2. Phase 2 (Model pages) — Deploy after validation
3. Phase 3 (Features) — Deploy in parallel
4. Phase 4 (Testing) — Comprehensive QA before each deployment

---

## Timeline

| Phase | Duration | Tasks | Tests Added |
|-------|----------|-------|-------------|
| 1: SEO Foundations | 3 days | 1-3 | +24 |
| 2: Model Discovery | 3 days | 4-6 | +37 |
| 3: Engagement | 2 days | 7-11 | +57 |
| 4: Testing & QA | 1 day | 12 | — |
| **TOTAL** | **3-4 days** | **11 tasks** | **+118 tests** |

**Estimated total effort:** 19-22 hours  
**Estimated launch:** End of week 2 (2026-07-25)

---

## Success Criteria (Completion Definition)

- [x] Plan documented with clear task breakdown
- [ ] Phase 1: 307 tests passing (Learn + FAQ + Glossary)
- [ ] Phase 2: 332 tests passing (Model pages + data)
- [ ] Phase 3: 380 tests passing (Bookmarks, What's new, Filters, Cards, Sticky header)
- [ ] All new pages responsive (mobile + desktop)
- [ ] All new pages have proper SEO (title, meta, schema)
- [ ] Lighthouse ≥90 across all new pages
- [ ] Zero TypeScript/ESLint errors
- [ ] Manual QA sign-off (desktop + mobile)
- [ ] PR created and ready for merge

---

## Next Steps

1. ✅ Audit completed (this document)
2. → Start Task 1 (Expand Learn Topics)
3. → Parallel: Start Task 2 (FAQ) and Task 3 (Glossary)
4. → Complete Phase 1 validation
5. → Move to Phase 2 (Model pages)
6. → Complete Phase 3 (Engagement)
7. → Comprehensive testing
8. → Create Pull Request

**Estimated Start:** Immediately  
**Estimated Completion:** 2026-07-25

---
