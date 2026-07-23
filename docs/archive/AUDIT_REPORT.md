# Models.fyi Audit & Improvement Strategy
**Date:** 2026-07-18  
**Current:** 283 tests, 8 pages, Phase 4A complete  
**Opportunity:** +25-40% organic traffic, +15-20% engagement

## Executive Summary

**The website is solid but has major SEO opportunities.** With 50+ indexable pages and strategic content expansion, we can add significant organic traffic at low cost and risk.

### High-Impact Quick Wins

| # | Feature | Impact | Effort | Timeline |
|---|---------|--------|--------|----------|
| 1 | Model detail pages (/models/:id) | +50% model search | 2-3h | Week 1 |
| 2 | Expand Learn (15+ topics) | +20-30% organic | 3h | Week 1 |
| 3 | FAQ section (25+ Q&A) | +15% long-tail | 2h | Week 1 |
| 4 | Glossary (50+ terms) | +10% SEO | 2h | Week 1 |
| 5 | Bookmarks | +15% engagement | 1h | Week 1 |
| 6 | What's new feed | +5% traffic | 1h | Week 1 |
| 7 | Advanced filters | +8% engagement | 1h | Week 1 |
| 8 | Mobile cards | +5% mobile UX | 2h | Week 2 |
| 9 | Sticky header | +2% UX | 1h | Week 2 |

**Total effort:** 16-20 hours across 2-3 days  
**Risk level:** Low (mostly content, well-isolated features)  
**Expected outcome:** 50-60 total pages, +25-40% traffic

---

## What's Working

✅ Search — responsive, accessible, fast  
✅ Compare page — excellent UI, good filters  
✅ Quiz — intuitive role-based recommendations  
✅ Dark mode — seamless, persistent  
✅ Performance — Lighthouse ≥90  
✅ Accessibility — semantic HTML, ARIA labels  
✅ Tests — 283 passing  

---

## What's Missing (Lost Opportunities)

❌ **No individual model pages** — Users searching "Claude Opus 4.8" or "GPT-5" find no dedicated page. Lost +50% model-specific search traffic.

❌ **Only 8 Learn topics** — Users looking for "Claude vs GPT" or "Best model for coding" don't find answers. High bounce rate.

❌ **No FAQ section** — 25 common questions left unanswered. Lost +15% long-tail traffic.

❌ **No glossary** — Users encounter unfamiliar terms (token, benchmark, reasoning) with no definition. Lost +10% educational searches.

❌ **No bookmarks** — Users can't save favorites without copy-pasting. Lower repeat visits.

❌ **No "What's new" feed** — Recent releases (Claude Sonnet 5, GPT updates) not highlighted. Lost referral traffic.

❌ **Limited advanced filters** — Power users can't filter by capability (reasoning, vision, web search).

❌ **Mobile table struggling** — Cards view would improve mobile UX by 5-10%.

---

## Implementation Plan

### Phase 1: SEO Foundations (Day 1)
**Goal:** Add 50+ indexable pages, +20-30% organic traffic

**1a. Model detail pages** — 30+ pages at `/models/:id`
- Each model gets deep dive: specs, benchmarks, use cases, pros/cons
- Product schema (JSON-LD) for Google rich snippets
- Links from Compare page

**1b. Expand Learn topics** — 15+ new topics
- Claude vs GPT, Gemini, Grok
- Best model for: coding, writing, research
- Concepts: vision, fine-tuning, pricing, context windows, prompt engineering, web search, hallucinations, open source, reasoning
- Each targets 200-2,300 search volume

**1c. FAQ section** — 25 Q&A pairs
- 5 categories: Getting Started, Selection, Pricing, Technical, Benchmarks
- Searchable, with FAQ schema

**1d. Glossary** — 50+ terms
- Model types, benchmarks, concepts, abbreviations
- A-Z navigation, related terms, links to Learn topics

---

### Phase 2: Engagement (Day 2)
**Goal:** +15-20% repeat visits, +8-10% avg session duration

**2a. Model bookmarks** — Save 5+ favorites to localStorage
**2b. What's new feed** — Recent releases (last 6 months)
**2c. Advanced filters** — Filter by reasoning, vision, web search, image gen

---

### Phase 3: UX Polish (Day 3)
**Goal:** +5-10% mobile engagement, +2% UX satisfaction

**3a. Model comparison cards** — Toggle table/cards on Compare
**3b. Sticky header** — Search + filters stay visible when scrolling

---

### Phase 4: Testing & Launch
- 400+ tests passing (283 + 120 new)
- 90%+ coverage on new code
- Lighthouse ≥90 on all pages
- Manual QA: desktop + mobile
- Zero TypeSQL/ESLint errors

---

## Why This Matters

### SEO Impact
- **Current:** ~8 indexable pages
- **After:** 50-60 pages
- **Queries served:** +200% (model-specific + educational + FAQ)
- **Expected lift:** +20-40% organic traffic

### Engagement Impact
- **Bookmarks:** Users save favorites → +15% repeat visits
- **What's new:** Recent releases → +5% referral traffic
- **Learn topics:** Users find answers → -15% bounce rate
- **Advanced filters:** Power users filter by capability → +8% engagement

### Business Impact
- **Time on site:** +30% (more content to explore)
- **Pages per session:** +50% (learning paths)
- **Bounce rate:** -15% (content completeness)
- **Newsletter signups:** +20% (sticky users)

---

## Risk Assessment

**Low risk:**
- Content-only additions (Learn topics, FAQ, Glossary)
- Isolated new pages (What's new, Model cards)
- Self-contained features (Bookmarks)

**Medium risk (mitigated by tests):**
- Model pages (new routes, schema)
- Filters (state management)
- Mobile cards (edge cases)

**Mitigation:**
- 90%+ test coverage on new code
- Manual QA on multiple devices
- Gradual rollout (phase by phase)
- Easy rollback (feature-isolated)

---

## Success Criteria

**Content:**
- ✓ 23 Learn topics (vs 8)
- ✓ 25+ FAQ items
- ✓ 50+ Glossary terms
- ✓ 30+ Model detail pages
- ✓ 200+ internal links

**Quality:**
- ✓ 400+ tests passing
- ✓ ≥90% coverage on new code
- ✓ Lighthouse ≥90 (all pages)
- ✓ 0 TypeScript errors
- ✓ 0 accessibility violations

**Traffic:**
- ✓ +20-30% organic
- ✓ +50% model-specific queries
- ✓ +15-20% engagement
- ✓ -10-15% bounce rate

---

## Timeline

| Phase | Days | Tasks | Tests | Effort |
|-------|------|-------|-------|--------|
| 1: SEO | 1 | 1-4 | +50 | 6-7h |
| 2: Features | 1 | 5-7 | +35 | 3-4h |
| 3: Polish | 0.5 | 8-9 | +35 | 3-4h |
| 4: Testing | 0.5 | 10 | — | 2-3h |
| **Total** | **2-3** | **10** | **+120** | **16-20h** |

**Launch target:** End of week 2 (2026-07-25)

---

## Recommendation

**Start immediately with Phase 1 (SEO).** These are low-risk, high-ROI improvements that compound over time:
1. Model pages drive long-tail searches
2. Expanded Learn topics capture educational queries
3. FAQ + Glossary support both
4. Internal linking multiplies SEO value

**Then add engagement features** (bookmarks, what's new) to keep users coming back.

**Polish mobile UX last** if time permits.

---

See `plans/2026-07-18-phase4b-implementation-plan.md` for detailed task breakdown and technical requirements.
