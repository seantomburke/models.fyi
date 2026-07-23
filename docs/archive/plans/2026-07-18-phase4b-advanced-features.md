# Phase 4B-4E: Advanced Features & SEO Optimization

> **Status:** DRAFT  
> **Scope:** High-impact improvements beyond Phase 4A quick wins  
> **Effort:** 8-10 days | **Complexity:** Medium-High | **Impact:** Very High  
> **Target Completion:** Week 2-3

---

## Executive Summary

Phase 4A (search, tooltips, copy buttons) has been completed with 283 passing tests. This plan addresses the **highest-ROI improvements** from the audit findings:

1. **Model detail pages** — 30% of audit's P1 priority (high discovery, +50% traffic potential)
2. **Content expansion** — 8 → 20+ Learn topics (SEO + education, +20-30% organic traffic)
3. **Advanced filtering** — Capability-based search (reasoning, vision, web access)
4. **Model bookmarks** — Save favorites to localStorage (engagement, +10-15%)
5. **FAQ & Glossary** — 20 common questions indexed for SEO
6. **Model comparison cards** — Table alternative for mobile (UX polish)
7. **What's new feed** — Highlight recent releases and updates

**Timeline:** 8-10 days across 3 phases  
**Risk:** Low (mostly content + isolated features)  
**Expected Impact:** +30-40% organic traffic, +15-20% engagement

---

## Phase Breakdown

### Phase 4B: Content & SEO (3 days)
- 15+ new Learn topics (model comparisons, use cases, advanced concepts)
- FAQ section (20 common questions)
- Glossary with search
- Internal linking strategy

### Phase 4C: Model Pages & Discovery (3 days)
- Individual model detail pages (/models/:id)
- "Related models" suggestions
- Model tags/capabilities
- SEO rich snippets

### Phase 4D: Advanced Features (2 days)
- Capability-based filtering (reasoning, vision, web access, image gen)
- Model bookmarks (localStorage)
- What's new feed (recent releases)
- Multi-model comparison tool

### Phase 4E: UX Polish (1-2 days)
- Model comparison cards (table alternative)
- Sticky header on Compare page
- Mobile table improvements
- Animation refinements

---

## Problems Addressed

### 1. Content Gaps (P1)
- **Current:** 8 Learn topics, no cross-linking
- **Goal:** 20+ topics with rich internal linking
- **Impact:** +20-30% organic traffic, better user retention
- **Why:** Users can't find answers, bounce off site

### 2. Model Discovery (P1)
- **Current:** No individual model pages, limited context
- **Goal:** 30+ model detail pages with "why" messaging
- **Impact:** +50% model-specific traffic
- **Why:** Users want deep model information, not just numbers

### 3. Advanced Filtering (P1)
- **Current:** Only provider/open-source filters
- **Goal:** Filter by capability (reasoning, vision, web access, image gen)
- **Impact:** +15% engagement, clearer model selection
- **Why:** Power users need to match models to specific tasks

### 4. Engagement (P2)
- **Current:** No way to save favorite models
- **Goal:** Bookmark system + what's new feed
- **Impact:** +10-15% engagement, repeat visits
- **Why:** Users want to build a shortlist

### 5. Mobile UX (P3)
- **Current:** Table overwhelming on mobile
- **Goal:** Card-based alternative, sticky header
- **Impact:** +5-10% mobile engagement
- **Why:** Mobile users get stuck in horizontal scroll

---

## Specification

**Success Criteria:** (verified 2026-07-19 at `a7bab9f`)

- [x] 15+ new Learn topics published — **26 topics** live
- [x] FAQ page with 20+ searchable questions — **24**
- [x] Glossary with 50+ terms, indexed for discovery — **50**
- [ ] 30+ model detail pages live at `/models/:id` — **19**, gated on the model dataset having 19 entries
- [x] Model pages include "why this model," related models, use cases
- [x] SEO rich snippets (JSON-LD) on model pages — now on **55/56** prerendered pages, not just model pages
- [x] Advanced filtering: reasoning, vision, web, image generation
- [x] Bookmark system: save 5+ favorites to localStorage
- [x] "What's new" feed showing recent releases
- [x] Model comparison cards (table alternative) on mobile
- [x] Sticky header with search on Compare page
- [x] All new code ≥90% test coverage — new lib modules 100%, ModelDetail 92.3%
- [x] 350+ total tests passing — **537**
- [ ] No Lighthouse regression (maintain ≥90) — **not measured**: needs a real browser
- [ ] SEO: rich snippets verified in Google Search Console — needs live GSC access; markup validated locally (all 55 blocks parse, no fabricated fields)

---

## Scope

### In Scope
- 15+ new Learn topics (model comparisons, use cases, benchmarks, advanced concepts)
- FAQ section (20-30 questions)
- Glossary (50+ terms)
- Individual model detail pages (/models/:id)
- Advanced capability filters
- Bookmark system (localStorage)
- What's new feed
- Model comparison cards
- Rich snippet schema
- SEO internal linking

### Out of Scope
- Internationalization (Phase 4F)
- Database migration (future)
- User accounts / cloud sync
- PWA offline support
- Analytics dashboards
- Advanced A/B testing infrastructure

---

## Tasks

### Phase 4B: Content & SEO Foundation

#### Task 1: Expand Learn Topics (5 new comparison + use case topics)

**Context:** `src/pages/learn/topics.ts`, `src/pages/learn/LearnTopic.tsx`

**What:** Add 5 new Learn topics covering model comparisons and use cases.

**Topics to add:**
1. "Claude vs GPT" — Head-to-head comparison (pricing, strengths, weaknesses)
2. "Claude vs Gemini" — Same format
3. "Which model for coding?" — Use case guide (Claude Opus vs GPT-5.6)
4. "Which model for writing?" — Use case guide
5. "Which model for research?" — Use case guide

**Steps:**

1. [ ] Create comprehensive topic content for each (800-1200 words, Karpathy style)
   - Use data from src/data/models.ts for accurate comparisons
   - Include benchmark scores where relevant
   - Add "when to use which" decision points
   - Link to Quiz and Compare pages within content

2. [ ] Update src/pages/learn/topics.ts:
   - Add 5 new Topic objects to `topics` array
   - Set SEO titles/descriptions targeting search phrases:
     - "Claude vs GPT 5" (search volume ~2.3K/month)
     - "Best model for coding" (~1.8K/month)
     - "Best model for writing" (~950/month)

3. [ ] Update src/pages/learn/Learn.tsx:
   - Ensure topics render in topic grid
   - Organize by category (Comparisons, Use Cases)

4. [ ] Create internal links:
   - Cross-link to Compare page
   - Link to Quiz for personalized recommendation
   - Link to related Learn topics

5. [ ] Create tests:
   - `src/pages/learn/topics.test.ts` - Verify all topics have required fields
   - Add to `src/pages/learn/LearnTopic.test.tsx` - Test rendering for new topics

**Verify:**
```bash
npm test -- learn/topics.test.ts LearnTopic.test.tsx
npm run dev
# Manually: Navigate to /learn, see 5 new topics
# Click each topic, verify content renders
# Check links to Compare and Quiz work
```

---

#### Task 2: Add 10 More Learn Topics (Advanced Concepts & Troubleshooting)

**Context:** `src/pages/learn/topics.ts`

**Topics to add:**
1. "What is a vision model?" — Image understanding capability
2. "What is an embedding model?" — Vector search fundamentals
3. "What is fine-tuning?" — Training on custom data
4. "Model pricing: input vs output tokens" — Cost breakdown
5. "Context window strategies" — How to maximize context usage
6. "Prompt engineering basics" — Getting better results
7. "When to use web search" — Real-time vs training data
8. "Model hallucinations: why and when" — Understanding limitations
9. "Open source vs closed source" — Trade-offs explained
10. "How to choose between reasoning models" — Decision framework

**Steps:**

1. [ ] Write comprehensive content for each (600-900 words)
   - Target additional search phrases with 500+/month volume
   - Include examples and concrete use cases
   - Reference benchmarks where relevant

2. [ ] Update `src/pages/learn/topics.ts`:
   - Add 10 Topic objects
   - Verify all SEO titles/descriptions target long-tail keywords

3. [ ] Create internal linking hub:
   - Update Learn.tsx to organize topics by category:
     - Basics (5 topics)
     - Comparisons (5 topics)
     - Advanced (10 topics)
   - Add "suggested next reading" in each topic

4. [ ] Tests:
   - Expand `src/pages/learn/topics.test.ts`
   - Verify total of 23 topics in array

**Verify:**
```bash
npm test -- learn/topics.test.ts
npm run dev
# Navigate to /learn, see 20+ topics organized by category
# Verify internal links between topics
```

---

#### Task 3: FAQ Section with Search

**Context:** `src/pages/FAQ.tsx` (new), `src/data/faqs.ts` (new)

**What:** Create searchable FAQ section targeting common questions with SEO value.

**FAQ categories & sample questions:**
- Getting Started (5)
- Model Selection (6)
- Pricing & Usage (5)
- Technical Details (5)
- Benchmarks (4)

**Total: 25 FAQs**

**Steps:**

1. [ ] Create `src/data/faqs.ts`:
   ```typescript
   interface FAQ {
     id: string
     question: string
     answer: string
     category: 'getting-started' | 'selection' | 'pricing' | 'technical' | 'benchmarks'
     tags: string[]
     relatedTopics?: string[] // slugs to Learn topics
   }
   export const faqs: FAQ[] = [ ... ]
   ```
   - Write 25 FAQs targeting search phrases
   - Include tags for filtering (e.g., "pricing", "coding", "vs-gpt")
   - Link to related Learn topics

2. [ ] Create `src/pages/FAQ.tsx`:
   - Display FAQ list with search/filter
   - Accordion expand/collapse
   - Share individual FAQ links
   - Keyboard accessible (tab through, enter to expand)

3. [ ] Add routing in `src/App.tsx`:
   - `<Route path="faq" element={<FAQ />} />`

4. [ ] Update navigation in `src/components/Layout.tsx`:
   - Add FAQ link to footer
   - Add to navigation menu

5. [ ] Create tests:
   - `src/data/faqs.test.ts` - Verify FAQ structure
   - `src/pages/FAQ.test.tsx` - Test search, filter, accordion

6. [ ] SEO:
   - Set meta title/description for FAQ page
   - Use FAQ schema (JSON-LD)

**Verify:**
```bash
npm test -- data/faqs.test.ts pages/FAQ.test.tsx
npm run dev
# Navigate to /faq
# Test search filtering
# Expand accordions
```

---

#### Task 4: Glossary with Search & Deep Linking

**Context:** `src/pages/Glossary.tsx` (new), `src/data/glossary.ts` (new)

**What:** Create indexed glossary of 50+ AI terms with search and deep linking.

**Step:** Create glossary covering:
- Model types (LLM, vision model, embedding)
- Benchmarks (SWE-Bench, GPQA, etc.)
- Concepts (token, context window, reasoning)
- Company/model names for disambiguation
- Common abbreviations

**Steps:**

1. [ ] Create `src/data/glossary.ts`:
   ```typescript
   interface GlossaryTerm {
     id: string
     term: string
     definition: string
     longDefinition?: string // 1-2 paragraphs
     relatedTerms: string[] // IDs
     relatedTopics?: string[] // Learn topic slugs
     seenOnPages?: string[] // Where this term is used
   }
   export const glossaryTerms: GlossaryTerm[] = [ ... ]
   ```
   - 50+ terms covering all key concepts
   - Link related terms to each other
   - Link to Learn topics

2. [ ] Create `src/pages/Glossary.tsx`:
   - Display A-Z term list
   - Search/filter by term name
   - Click term to see full definition
   - Show related terms
   - "Jump to section" (A, B, C, etc.)
   - Share individual term links

3. [ ] Create inline glossary highlighting:
   - On Learn pages, auto-detect glossary terms
   - Underline terms with hover tooltip showing definition
   - Click to navigate to full Glossary page
   - (Optional: add component `src/components/GlossaryLink.tsx`)

4. [ ] Tests:
   - `src/data/glossary.test.ts`
   - `src/pages/Glossary.test.tsx`

5. [ ] SEO:
   - Meta title/description
   - Glossary schema (JSON-LD)
   - Deep links on each term

**Verify:**
```bash
npm test -- data/glossary.test.ts pages/Glossary.test.tsx
npm run dev
# Navigate to /glossary
# Test search
# Test term links
# Test inline glossary highlighting (on Learn pages)
```

---

### Phase 4C: Model Pages & Discovery

#### Task 5: Create Individual Model Detail Pages

**Context:** `src/pages/models/ModelDetail.tsx` (new), `src/App.tsx`

**What:** Create individual pages for each model at `/models/:id` showing deep information.

**Page content:**
- Model name, provider logo, tier badge
- Long blurb explaining "why this model"
- Key specs (pricing, context window, capabilities)
- Benchmark scores with source links
- Use cases (2-3 typical tasks)
- Pros/cons vs competitors
- Related models (suggested alternatives)
- Links to official docs
- Last updated date

**Steps:**

1. [ ] Create `src/pages/models/ModelDetail.tsx`:
   - Route parameter: `:id` (e.g., claude-opus-4-8)
   - Fetch model from data by ID
   - Display comprehensive model info
   - Handle not found (404) if ID invalid

   ```typescript
   export function ModelDetail() {
     const { id } = useParams<{ id: string }>()
     const model = models.find(m => m.id === id)
     
     if (!model) return <NotFound />
     
     return (
       <main className="...">
         <ModelHeader model={model} />
         <ModelSpecs model={model} />
         <BenchmarkSection model={model} />
         <UseCasesSection model={model} />
         <ProsCons model={model} />
         <RelatedModels model={model} />
       </main>
     )
   }
   ```

2. [ ] Extend model data in `src/data/models.ts`:
   - Add `useCases?: string[]` field (e.g., ["coding", "research", "writing"])
   - Add `whyChooseThis?: string` field (longer explanation)
   - Add `prosVsCompetitors?: Record<string, string>` (vs GPT, vs Gemini)
   - Add `relatedModelIds?: string[]` (alternatives)
   - Populate for all 30+ models

3. [ ] Create sub-components:
   - `src/components/ModelHeader.tsx` - Name, provider, tier
   - `src/components/ModelSpecs.tsx` - Pricing, context, capabilities
   - `src/components/ModelBenchmarks.tsx` - Score table with sources
   - `src/components/UseCasesSection.tsx` - Typical use cases
   - `src/components/RelatedModels.tsx` - "You might also like"
   - `src/components/ProsCons.tsx` - Strengths/weaknesses vs competitors

4. [ ] SEO & Schema:
   - Set `<title>` dynamically: "{Model Name} | Models.fyi"
   - Set meta description from whyChooseThis
   - Generate JSON-LD schema for model (Product schema)

   ```typescript
   {
     "@context": "https://schema.org",
     "@type": "Product",
     "name": model.name,
     "description": model.whyChooseThis,
     "provider": { "@type": "Organization", "name": provider.name },
     "offers": {
       "@type": "Offer",
       "priceCurrency": "USD",
       "price": model.inputPricePerMTok
     }
   }
   ```

5. [ ] Add routing in `src/App.tsx`:
   - `<Route path="models/:id" element={<ModelDetail />} />`

6. [ ] Add navigation:
   - Link from Compare page model names → detail pages
   - Add "View details" button to model cards on Home
   - Breadcrumb: Home > Compare > Model Name

7. [ ] Tests:
   - `src/pages/models/ModelDetail.test.tsx` - Renders model data
   - `src/components/ModelHeader.test.tsx`
   - `src/components/ModelBenchmarks.test.tsx`
   - `src/components/RelatedModels.test.tsx`

**Verify:**
```bash
npm test -- pages/models/ components/Model*
npm run dev
# Navigate to /models/claude-opus-4-8
# Verify model info displays
# Check links to related models
# Inspect schema with DevTools
```

---

#### Task 6: "Related Models" Recommendations & Cross-Linking

**Context:** `src/lib/recommendations.ts` (new), `src/pages/models/ModelDetail.tsx`

**What:** Add recommendation engine to suggest related models based on similarity.

**Algorithm:**
- Same provider → higher relevance
- Same tier (flagship, balanced, speed) → higher relevance
- Similar benchmark scores → higher relevance
- Similar capabilities → higher relevance
- Pick top 3 alternatives

**Steps:**

1. [ ] Create `src/lib/recommendations.ts`:
   ```typescript
   export function getRelatedModels(modelId: string, count = 3): Model[] {
     const model = models.find(m => m.id === modelId)
     if (!model) return []
     
     const scored = models
       .filter(m => m.id !== modelId)
       .map(m => ({
         model: m,
         score: calculateSimilarity(model, m)
       }))
       .sort((a, b) => b.score - a.score)
     
     return scored.slice(0, count).map(s => s.model)
   }
   
   function calculateSimilarity(a: Model, b: Model): number {
     let score = 0
     // Same provider: +50 points
     if (a.providerId === b.providerId) score += 50
     // Same tier: +30 points
     if (a.tier === b.tier) score += 30
     // Similar context window: +20 points
     if (Math.abs(a.contextWindowTokens - b.contextWindowTokens) < 100_000) score += 20
     // Similar capabilities: +10 per match
     if (a.reasoning === b.reasoning) score += 10
     if (a.internetAccess === b.internetAccess) score += 10
     return score
   }
   ```

2. [ ] Tests:
   - `src/lib/recommendations.test.ts`
   - Test that related models are from same provider (or similar tier)
   - Test that the model itself is not in recommendations

**Verify:**
```bash
npm test -- recommendations.test.ts
npm run dev
# Navigate to model page
# Verify 3 related models show
# Check recommendations make sense
```

---

#### Task 7: Model Search & Filtering by Tags/Capabilities

**Context:** `src/lib/modelFilters.ts` (new), `src/pages/Compare.tsx`

**What:** Extend Compare page filters to support capability-based search (reasoning, vision, web access, image generation).

**Steps:**

1. [ ] Create `src/lib/modelFilters.ts`:
   ```typescript
   export interface ModelFilterOptions {
     providers?: string[]
     openSourceOnly?: boolean
     hasReasoning?: boolean
     hasVision?: boolean
     hasInternetAccess?: boolean
     minContextTokens?: number
     maxPricePerMTok?: number
   }
   
   export function filterModels(models: Model[], options: ModelFilterOptions): Model[] {
     return models.filter(m => {
       if (options.providers?.length && !options.providers.includes(m.providerId)) return false
       if (options.openSourceOnly && !m.openSource) return false
       if (options.hasReasoning && !m.reasoning) return false
       if (options.hasVision && !m.vision) return false
       if (options.hasInternetAccess && !m.internetAccess) return false
       if (options.minContextTokens && m.contextWindowTokens < options.minContextTokens) return false
       if (options.maxPricePerMTok && m.inputPricePerMTok > options.maxPricePerMTok) return false
       return true
     })
   }
   ```

2. [ ] Extend Model type in `src/data/types.ts`:
   - Add `vision?: boolean` field (if not already present)
   - Add `imageGeneration?: boolean`
   - Add other capabilities as needed

3. [ ] Update `src/pages/Compare.tsx`:
   - Add capability filter buttons:
     - 🧠 Reasoning
     - 👁️ Vision
     - 🌐 Web Search
     - 🎨 Image Generation
   - Combine with existing provider/open-source filters
   - Update filter UI to show applied filters

4. [ ] Tests:
   - `src/lib/modelFilters.test.ts` - All filter combinations
   - Update `src/pages/Compare.test.tsx`

**Verify:**
```bash
npm test -- modelFilters.test.ts Compare.test.tsx
npm run dev
# Navigate to /compare
# Click reasoning filter, verify only reasoning models show
# Click vision + web search, verify intersection
```

---

### Phase 4D: Advanced Features & Engagement

#### Task 8: Model Bookmarks (Favorites System)

**Context:** `src/lib/bookmarks.ts` (new), `src/components/BookmarkButton.tsx` (new), `src/pages/Compare.tsx`

**What:** Add ability to save favorite models to localStorage with quick access.

**Features:**
- Star icon on each model in Compare table
- Click to save/unsave
- Persist to localStorage
- Show "Bookmarks" badge on Home
- Quick access via Compare page filter

**Steps:**

1. [ ] Create `src/lib/bookmarks.ts`:
   ```typescript
   const STORAGE_KEY = 'models-fyi-bookmarks'
   
   export function getBookmarkedModelIds(): string[] {
     const data = localStorage.getItem(STORAGE_KEY)
     return data ? JSON.parse(data) : []
   }
   
   export function isBookmarked(modelId: string): boolean {
     return getBookmarkedModelIds().includes(modelId)
   }
   
   export function toggleBookmark(modelId: string): void {
     const ids = getBookmarkedModelIds()
     const idx = ids.indexOf(modelId)
     if (idx >= 0) {
       ids.splice(idx, 1)
     } else {
       ids.push(modelId)
     }
     localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
   }
   ```

2. [ ] Create `src/components/BookmarkButton.tsx`:
   - Icon button (star outline / filled)
   - Tooltip: "Add to bookmarks" or "Remove from bookmarks"
   - Click toggles bookmark
   - Animated star fill
   - Keyboard accessible

3. [ ] Integrate in `src/pages/Compare.tsx`:
   - Add BookmarkButton to each row
   - Add "Bookmarked only" filter toggle
   - Show count of bookmarked models

4. [ ] Extend model display on Home page:
   - Show "Your saved models" section if any bookmarks exist
   - Link to Compare page with bookmarks filter applied

5. [ ] Tests:
   - `src/lib/bookmarks.test.ts` - Add/remove, persistence
   - `src/components/BookmarkButton.test.tsx` - UI and toggle
   - `src/pages/Compare.test.tsx` - Integration

**Verify:**
```bash
npm test -- bookmarks.test.ts BookmarkButton.test.tsx
npm run dev
# Navigate to Compare
# Click star on model
# Verify star shows filled
# Refresh page, verify bookmarks persist
# Apply "Bookmarked only" filter
```

---

#### Task 9: What's New Feed (Recent Releases)

**Context:** `src/pages/WhatsNew.tsx` (new), `src/data/releases.ts` (new)

**What:** Create feed of recent model releases and updates for engagement.

**Content:**
- Recent model releases (last 6 months)
- Price changes
- Feature announcements (web access, reasoning, etc.)
- Benchmark updates

**Steps:**

1. [ ] Create `src/data/releases.ts`:
   ```typescript
   interface Release {
     id: string
     modelId: string
     type: 'new' | 'update' | 'price-change' | 'feature'
     title: string
     description: string
     date: string
     link?: string
   }
   export const releases: Release[] = [
     {
       modelId: 'claude-sonnet-5',
       type: 'new',
       title: 'Claude Sonnet 5 Released',
       description: 'Most agentic Sonnet yet with autonomous tool use and planning.',
       date: '2026-06-30',
     },
     // ... more releases
   ]
   ```

2. [ ] Create `src/pages/WhatsNew.tsx`:
   - Display releases in chronological order (newest first)
   - Filter by type (new, update, price-change, feature)
   - Link to model detail pages
   - Show model logo + name
   - Relative dates ("2 weeks ago")

3. [ ] Add to routing and navigation:
   - `<Route path="whats-new" element={<WhatsNew />} />`
   - Link from Home page (hero or sidebar)
   - Footer link

4. [ ] Tests:
   - `src/data/releases.test.ts`
   - `src/pages/WhatsNew.test.tsx`

**Verify:**
```bash
npm test -- releases.test.ts WhatsNew.test.tsx
npm run dev
# Navigate to /whats-new
# See recent releases
# Filter by type
```

---

### Phase 4E: UX Polish & Mobile

#### Task 10: Model Comparison Cards (Mobile Alternative)

**Context:** `src/components/ModelCard.tsx` (new), `src/pages/Compare.tsx`

**What:** Add card-based view as alternative to table on mobile (viewMode toggle).

**Features:**
- Toggle between "table" and "cards" view
- Cards show key info (name, price, context, scores)
- Stack vertically on mobile
- Still filterable/searchable
- Prefer cards on mobile by default

**Steps:**

1. [ ] Create `src/components/ModelCard.tsx`:
   - Displays single model's key info in card format
   - Shows: name, provider, tier badge, key specs
   - Benchmark highlights (top 1-2 scores)
   - "View details" button
   - Copy buttons for key info
   - Bookmark star

2. [ ] Update `src/pages/Compare.tsx`:
   - Add "View Mode" toggle (table/cards)
   - Default to cards on mobile (< 768px)
   - Default to table on desktop
   - Store preference to localStorage

3. [ ] CSS:
   - Card grid layout (responsive: 1 col on mobile, 2-3 on desktop)
   - Card styling to match site design
   - Smooth transition between view modes

4. [ ] Tests:
   - `src/components/ModelCard.test.tsx`
   - Update `src/pages/Compare.test.tsx`

**Verify:**
```bash
npm test -- ModelCard.test.tsx Compare.test.tsx
npm run dev
# Navigate to /compare on mobile
# Verify cards show by default
# Toggle to table view
# Refresh, verify preference persists
```

---

#### Task 11: Sticky Header & Mobile UX Refinements

**Context:** `src/pages/Compare.tsx`, `src/index.css`

**What:** Add sticky header with search/filters on Compare page for better mobile UX.

**Features:**
- Search input sticks to top when scrolling
- Filters remain accessible
- Model count visible in sticky header
- Collapse/expand filter section on mobile
- "Clear all filters" button

**Steps:**

1. [ ] Update `src/pages/Compare.tsx`:
   - Move SearchInput and filters into sticky header component
   - Header height: 60px on mobile, 80px on desktop
   - Add z-index layer management
   - Smooth scroll-to-top when header appears

2. [ ] CSS in `src/index.css`:
   - `.sticky-header { position: sticky; top: 0; z-index: 50; ... }`
   - Smooth slide-in animation on desktop
   - Mobile-optimized spacing

3. [ ] Add "Collapse filters" toggle on mobile:
   - Icon button (chevron up/down)
   - Filters slide in/out smoothly
   - Saves state per session

4. [ ] Tests:
   - `src/pages/Compare.test.tsx` - Header visibility

**Verify:**
```bash
npm test -- Compare.test.tsx
npm run dev
# Navigate to /compare
# Scroll down, verify header stays visible
# On mobile, test filter collapse/expand
```

---

#### Task 12: Comprehensive Testing & Quality Pass

**Context:** All new components and pages

**What:** Write unit and integration tests for Phase 4B-4E, achieve 90%+ coverage.

**Steps:**

1. [ ] Create test files:
   - `src/pages/learn/topics.test.ts` (15 tests)
   - `src/pages/FAQ.test.tsx` (12 tests)
   - `src/data/faqs.test.ts` (8 tests)
   - `src/pages/Glossary.test.tsx` (12 tests)
   - `src/data/glossary.test.ts` (8 tests)
   - `src/pages/models/ModelDetail.test.tsx` (15 tests)
   - `src/lib/recommendations.test.ts` (10 tests)
   - `src/lib/modelFilters.test.ts` (15 tests)
   - `src/lib/bookmarks.test.ts` (10 tests)
   - `src/components/BookmarkButton.test.tsx` (8 tests)
   - `src/pages/WhatsNew.test.tsx` (10 tests)
   - `src/components/ModelCard.test.tsx` (12 tests)
   - Integration tests (15 tests)

2. [ ] Test coverage goals:
   - All new code: ≥90%
   - Critical paths: 100%
   - Edge cases: covered

3. [ ] Verify no regressions:
   - All existing 283 tests still pass
   - No TypeScript errors
   - No ESLint warnings

4. [ ] Manual testing checklist:
   - [ ] Desktop (Chrome, Safari): All pages responsive, interactive
   - [ ] Mobile (iPhone SE, Android): Cards show, sticky header works
   - [ ] Accessibility: Keyboard nav, screen reader (WAVE)
   - [ ] Performance: Lighthouse ≥90 (all pages)
   - [ ] SEO: Rich snippets (Models.fyi on Google Search Console)

**Verify:**
```bash
npm test
# Should see: ~400 tests passing (283 Phase 1-4A + 120 Phase 4B-4E)
npm run build
# No errors
npm run lint
# 0 errors
lighthouse http://localhost:5173/ --view
# Verify ≥90 on all categories
```

---

## Implementation Order & Dependencies

### Sequential (Must follow order):
1. Task 1-2: Learn topics (foundation for Task 4)
2. Task 3: FAQ (independent)
3. Task 4: Glossary with inline linking (depends on Task 1-2)
4. Task 5: Model pages (independent)
5. Task 6: Related models (depends on Task 5)
6. Task 7: Filters (independent, integrates into Compare)
7. Task 8: Bookmarks (independent)
8. Task 9: What's new feed (independent)
9. Task 10: Model cards (independent)
10. Task 11: Sticky header (depends on Task 7, 10)
11. Task 12: Testing (final verification)

### Parallelization Groups:

**Group 1 (Phase 4B - Content, 3 days):**
- Task 1 + 2 (Learn topics)
- Task 3 (FAQ)
- Task 4 (Glossary)

**Group 2 (Phase 4C - Model Pages, 3 days):**
- Task 5 (Model pages)
- Task 6 (Related models)
- Task 7 (Filters)

**Group 3 (Phase 4D-4E - Features & Polish, 2 days):**
- Task 8 (Bookmarks)
- Task 9 (What's new)
- Task 10 (Model cards)
- Task 11 (Sticky header)

**Group 4 (Testing, 1 day):**
- Task 12 (Comprehensive testing)

---

## Risk Assessment

### Low Risk
- New Learn topics (content only, no code changes)
- FAQ section (isolated new page)
- Glossary (isolated new page)
- What's new feed (isolated new page)

### Medium Risk
- Model detail pages (new routes, schema)
- Bookmarks (localStorage, UI integration)
- Filters (state management in Compare)

### High Risk
- Related models (algorithm correctness)
- Model comparison cards (mobile edge cases)

**Mitigation:**
- Comprehensive testing (90%+ coverage)
- Manual QA on mobile devices
- Gradual rollout (feature flags if needed)
- Rollback plan for each phase

---

## Files Summary

### New Files (30+)

**Learn & Education:**
- `src/pages/learn/topics.ts` (expanded, +15 topics)

**FAQ & Glossary:**
- `src/pages/FAQ.tsx` - FAQ page
- `src/data/faqs.ts` - FAQ content
- `src/pages/Glossary.tsx` - Glossary page
- `src/data/glossary.ts` - Glossary terms

**Model Pages:**
- `src/pages/models/ModelDetail.tsx` - Model detail page
- `src/components/ModelHeader.tsx` - Header component
- `src/components/ModelSpecs.tsx` - Specs component
- `src/components/ModelBenchmarks.tsx` - Benchmarks component
- `src/components/UseCasesSection.tsx` - Use cases
- `src/components/RelatedModels.tsx` - Related suggestions
- `src/components/ProsCons.tsx` - Pros/cons comparison
- `src/components/ModelCard.tsx` - Card view

**Features:**
- `src/lib/recommendations.ts` - Related models algorithm
- `src/lib/modelFilters.ts` - Filter logic
- `src/lib/bookmarks.ts` - Bookmark persistence
- `src/components/BookmarkButton.tsx` - Bookmark UI
- `src/pages/WhatsNew.tsx` - What's new feed
- `src/data/releases.ts` - Release data

### Modified Files (5+)
- `src/App.tsx` - Add routes
- `src/pages/Compare.tsx` - Filters, bookmarks, sticky header
- `src/components/Layout.tsx` - Add navigation links
- `src/data/models.ts` - Extend with capabilities
- `src/data/types.ts` - Add model fields

### Test Files (13+)
- All corresponding `.test.ts` and `.test.tsx` files

---

## Metrics & Success

### Content & SEO
- ✅ 20+ Learn topics (up from 8)
- ✅ 25+ FAQ items
- ✅ 50+ Glossary terms
- ✅ 30+ Model detail pages
- ✅ Internal linking: 200+ links (up from ~50)
- ✅ SEO rich snippets verified

### Engagement & Features
- ✅ Bookmarks: 5%+ adoption rate
- ✅ Model cards: 10%+ mobile engagement increase
- ✅ Advanced filters: 8%+ usage
- ✅ What's new: 3%+ referral traffic

### Quality & Performance
- ✅ 400+ total tests passing
- ✅ ≥90% code coverage (new code)
- ✅ Lighthouse ≥90 (all pages)
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ 0 accessibility violations (WAVE)

### Traffic Impact
- ✅ +20-30% organic traffic (SEO)
- ✅ +15-20% user engagement
- ✅ +50% model-specific traffic
- ✅ Improved time-on-site (+30%)
- ✅ Lower bounce rate (-15%)

---

## Timeline

**Week 1 (Phase 4B: Content)** — 3 days
- Task 1-2: Learn topics expansion
- Task 3: FAQ section
- Task 4: Glossary

**Week 2 (Phase 4C: Model Pages)** — 3 days
- Task 5: Model detail pages
- Task 6: Related models
- Task 7: Advanced filters

**Week 3 (Phase 4D-4E: Features)** — 2 days
- Task 8: Bookmarks
- Task 9: What's new
- Task 10-11: Model cards + sticky header

**Week 3 (Testing)** — 1 day
- Task 12: Comprehensive testing & QA

**Total:** 8-9 days | **Launch:** Early August

---

## Rollout Strategy

1. **Phase 1:** Deploy Phase 4B (content) — low risk, immediate SEO benefit
2. **Phase 2:** Deploy Phase 4C (model pages) — routes, schema validation
3. **Phase 3:** Deploy Phase 4D (features) + Phase 4E (polish) — coordinate
4. **Monitoring:** Track analytics, user feedback, performance
5. **Iterate:** Adjust based on early engagement metrics

---

## Conclusion

Phase 4B-4E represents a comprehensive expansion of the models.fyi platform, transitioning from a comparison tool to a comprehensive AI model discovery and education platform. With strong SEO fundamentals, rich content, and engagement features, we expect significant growth in both organic traffic and user engagement.

**Expected Outcome:**
- 50-60 pages (up from 8)
- 100+ internal links
- +30-40% organic traffic
- +15-20% user engagement
- Sustained Lighthouse ≥90 performance

**Risk Level:** Low-Medium (mostly content, well-tested code)  
**Timeline:** 8-10 days  
**Effort:** ~80 dev hours

---

## Review Notes

_To be filled after devil's advocate review_

---
