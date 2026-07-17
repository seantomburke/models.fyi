# Phase 4: Audit & Improvement Plan

> **Status:** DRAFT  
> **Date:** July 17, 2026  
> **Scope:** Comprehensive audit of models.fyi after Phases 1-3

---

## Executive Summary

After completing Phases 1-3 (SEO, UX/Export, Analytics/Accessibility), models.fyi is a solid educational platform with professional features. However, a thorough audit reveals 12-15 improvement opportunities ranging from content gaps to feature enhancements that would significantly improve user experience and business value.

**Recommendation:** Prioritize Phases 4A (Quick Wins) and 4B (Content) as they have highest ROI and user impact.

---

## Audit Findings

### 1. **Content & Educational Gaps**

**Current State:**
- Learn section has ~8 topics (what is an LLM, GPT, context window, etc.)
- Minimal cross-linking between Learn topics and Compare page
- No "comparison guides" (e.g., "Anthropic vs OpenAI")
- Limited model-specific education (why choose this model?)
- No glossary or searchable term index

**Findings:**
- Users reading Compare page have no easy way to learn *why* a score matters
- Learning paths are not optimized (no "beginner → intermediate → advanced")
- No "common questions" section (FAQ)
- Missing educational content on newer concepts (multimodal, vision, reasoning models)

**Impact:** Users abandon site if they don't understand the data

**Opportunity:** Add ~10-15 new educational resources with deep internal linking

---

### 2. **Model Details & Depth**

**Current State:**
- Compare page shows: name, provider, benchmarks, price, context, capabilities
- Each model has a `blurb` (1-2 sentence description)
- No detailed model pages
- No "why use this model" explanations per model

**Findings:**
- Users can't read detailed specs or use cases for each model
- No model comparison flows (e.g., "if you need X, choose between A and B")
- Missing links to official model documentation
- No model release notes or changelog
- No capability comparison matrix (e.g., function calling, JSON mode)

**Impact:** Users must leave site to learn more about specific models

**Opportunity:** Create model detail pages with specs, use cases, links, changelog

---

### 3. **Search & Discoverability**

**Current State:**
- No search functionality
- No model filtering by capability (only by provider or open-source)
- No tagging system
- Breadcrumbs added in Phase 3, but minimal internal linking

**Findings:**
- Users can't quickly find models matching their specific needs
- No way to filter by: reasoning capability, vision support, function calling, etc.
- Quiz is only guided filter (other users use Compare, which is overwhelming)
- No related model suggestions

**Impact:** Users get lost or use external sources (Hugging Face, etc.)

**Opportunity:** Add search, advanced filtering, and related model suggestions

---

### 4. **Interactive Features**

**Current State:**
- Quiz (decision flow for recommendations)
- Compare (table with sort/filter)
- Graph (scatter plot with axis selection)
- Calculator (token cost calculator)
- Learn (static educational content)

**Findings:**
- Quiz outputs recommendation but doesn't explain trade-offs deeply
- No way to bookmark/save favorite models
- No "compare these 5 models" quick comparison tool
- No benchmark explanation on hover (just tooltip)
- No "what's new" feed for model releases
- No ability to view historical performance or price changes

**Impact:** Limited engagement and decision-making support

**Opportunity:** Add bookmarks, quick comparisons, model history, better explanations

---

### 5. **Data Quality & Freshness**

**Current State:**
- Data last updated: shown in footer
- Manual data updates (no automation)
- Benchmarks from various sources (provider-published, independent runs)
- Notes about data sources in footer

**Findings:**
- No "data quality badge" per benchmark (confidence levels)
- No model deprecation warnings
- No indicator of data age per model/benchmark
- No changelog or version history of data
- No alerts for new models or price changes
- Manual updates create staleness risk

**Impact:** Users uncertain about data recency and reliability

**Opportunity:** Add data quality indicators, deprecation warnings, and change log

---

### 6. **UI/UX Polish**

**Current State:**
- Dark mode toggle (working)
- Mobile responsive (tested at 375/768/1024px)
- Error boundary and 404 page
- Loading skeletons for lazy-loaded pages
- Keyboard shortcuts (Phase 3)

**Findings:**
- Compare table can be overwhelming (20+ columns on desktop, many models)
- No "table view" vs "card view" option
- No quick copy (copy to clipboard for model names, prices, URLs)
- No "return to top" button on long pages
- No smooth scroll anchors in Learn section
- Mobile: Some interactions feel cramped
- No animation/transitions on state changes (adds delight)
- Compare page header could be sticky (easier navigation)

**Impact:** Users feel lost on complex pages

**Opportunity:** Add view options, quality-of-life features, polish interactions

---

### 7. **Social & Sharing**

**Current State:**
- OG tags added in Phase 1 (works with social sharing)
- Share buttons? Not implemented
- No embeds (e.g., compare widget for blogs)

**Findings:**
- No explicit "Share this" buttons (users have to use browser share)
- No model-specific share links
- No embed widget for blog posts
- No Twitter/LinkedIn copy-paste optimization
- No referral tracking (growth opportunity)

**Impact:** Limited viral potential and external discovery

**Opportunity:** Add share buttons, embeds, trackable links

---

### 8. **Mobile App Readiness**

**Current State:**
- Mobile responsive (tested)
- No PWA (Progressive Web App)
- No offline support
- No install-to-home-screen support

**Findings:**
- Users can't install as app
- No offline access to data
- No push notifications
- No app metadata (icon, splash screen)
- iOS/Android app not available

**Impact:** Limited mobile discoverability and engagement

**Opportunity:** PWA support (medium effort, good ROI)

---

### 9. **Internationalization (i18n)**

**Current State:**
- All content in English
- No language detection or switching
- Dates/numbers formatted for US locale

**Findings:**
- No support for non-English users
- Missing Chinese, Spanish, Portuguese, Japanese translations
- No multi-currency pricing support
- Locale-specific number/date formatting

**Impact:** Limited to English-speaking audience

**Opportunity:** Add i18n support (high effort, medium ROI)

---

### 10. **Performance Optimization**

**Current State:**
- Lighthouse ≥90 (all categories)
- Web Vitals all "Good"
- Lazy loading for Graph, Calculator
- Performance budgets defined

**Findings:**
- Image assets could be optimized (SVGs, WebP)
- Bundle can be further split
- No service worker (caching optimization)
- No database or API (all static data)
- No CDN (GitHub Pages serves directly)

**Impact:** Good performance, but room for edge cases

**Opportunity:** Add service worker, image optimization, micro-optimizations

---

### 11. **Analytics & Insights**

**Current State:**
- 23 PostHog events tracked (Phase 3)
- Web Vitals monitoring
- No custom dashboards
- No user segmentation

**Findings:**
- Event tracking is in place, but no analysis/insights
- No conversion funnels tracked
- No cohort analysis (e.g., "users who use Quiz" vs "users who skip")
- No A/B testing setup
- PostHog dashboard not used to drive decisions

**Impact:** Data collected but not actionable

**Opportunity:** Create PostHog dashboards and insights playbook

---

### 12. **SEO & Discoverability**

**Current State:**
- Structured data (JSON-LD) added (Phase 1)
- Meta tags and OG tags
- Sitemap generation
- Breadcrumbs (Phase 3)
- Semantic HTML

**Findings:**
- No "rich snippets" for models (could show price, capability)
- No schema for compare/graph pages
- No FAQ schema extended (only Learn section has it)
- No local/structured markup for benchmarks
- No internal link strategy documented
- No topic clusters or pillar content

**Impact:** Good baseline, but missing growth opportunities

**Opportunity:** Expand structured data, build SEO strategy

---

### 13. **Community & Engagement**

**Current State:**
- Comments/discussions: Not supported
- User feedback: No forms or surveys
- Social integration: None
- Newsletter: Not implemented

**Findings:**
- No way for users to suggest models or benchmark changes
- No user-generated content
- No community engagement (voting, comments, etc.)
- No newsletter/email for updates
- No GitHub repo link for transparency

**Impact:** One-way communication, limited community

**Opportunity:** Add feedback forms, GitHub link, email updates

---

## Severity & Impact Assessment

| Category | Severity | Effort | Impact | Priority |
|----------|----------|--------|--------|----------|
| Content Gaps | High | Medium | High | 🔴 P1 |
| Model Details | High | High | High | 🔴 P1 |
| Search/Filtering | High | High | High | 🔴 P1 |
| Interactive Features | Medium | Medium | Medium | 🟠 P2 |
| Data Quality | Medium | Low | Medium | 🟠 P2 |
| UI/UX Polish | Low | Low | Medium | 🟡 P3 |
| Social/Sharing | Low | Low | Low | 🟡 P3 |
| Mobile App (PWA) | Low | High | Medium | 🟡 P3 |
| i18n | Low | Very High | Low | ⚪ P4 |
| Performance | Very Low | Low | Low | ⚪ P4 |
| Analytics/Insights | Low | Medium | Medium | 🟡 P3 |
| SEO Growth | Low | Medium | Medium | 🟡 P3 |
| Community | Low | Medium | Low | ⚪ P4 |

---

## Proposed Phase 4 Structure

### **Phase 4A: Quick Wins** (1-2 days)
- Better benchmark tooltips and explanations
- Data quality indicators
- Quick copy buttons
- "Return to top" button
- Search field on Compare page (client-side search)

### **Phase 4B: Content & Education** (2-3 days)
- 10-15 new Learn topics (model comparisons, use cases, glossary)
- Internal linking strategy (Learn ↔ Compare ↔ Quiz)
- Deep links to official model docs
- Model capability matrix
- FAQ expansion

### **Phase 4C: Model Pages & Details** (2-3 days)
- Create individual model detail pages
- Model specs, use cases, benchmarks
- Links to GitHub repos, papers, official docs
- Related models suggestion

### **Phase 4D: Advanced Features** (2-3 days)
- Advanced filtering by capability
- Multi-model quick comparison
- Bookmark/favorites functionality
- Model release history/changelog

### **Phase 4E: Polish & Engagement** (1-2 days)
- Social share buttons
- Better animations/transitions
- Mobile view optimizations
- Sticky Compare header
- Feedback form

---

## Detailed Phase 4A: Quick Wins Plan

**Effort:** 1-2 days | **Impact:** Medium | **Complexity:** Low

### Tasks:

1. **Enhanced Benchmark Tooltips**
   - Add hover tooltips showing full benchmark description
   - Click to open source link in modal
   - Show data quality badge (provider-published vs independent)

2. **Data Quality Indicators**
   - Add `confidence` field to benchmark scores
   - Show badge: "Published by OpenAI" or "Independent leaderboard run"
   - Tooltip showing data age

3. **Quick Copy Buttons**
   - Add copy icon next to model names in Compare
   - Copy pricing, context window, etc.
   - Toast notification on copy

4. **Return to Top Button**
   - Add floating button on long pages
   - Visible after scrolling down 200px
   - Smooth scroll to top

5. **Client-Side Search**
   - Add search input in Compare header
   - Filter models/benchmarks by text
   - Highlight matches
   - Show result count

**Estimated Effort:** 2 days
**Files to Create/Modify:** 3-4 new components, 5-6 modified files
**Tests:** 20+ new tests

---

## Detailed Phase 4B: Content & Education Plan

**Effort:** 2-3 days | **Impact:** High | **Complexity:** Medium

### New Learn Topics (12-15):

1. **Model Comparisons:**
   - Anthropic vs OpenAI vs Google
   - Claude vs GPT vs Gemini detailed comparison
   - When to use each provider

2. **Use Cases by Role:**
   - Software Engineer
   - Writer/Marketer
   - Researcher
   - Student
   - Business Analyst

3. **Advanced Concepts:**
   - What is reasoning? (o1, Claude Thinking)
   - Vision models explained
   - Embeddings for similarity search
   - Fine-tuning vs prompting
   - Function calling and structured output

4. **Glossary:**
   - All benchmarks explained
   - All technical terms
   - Searchable index
   - Cross-linked

5. **Pricing Deep Dive:**
   - How pricing works (per 1M tokens)
   - Input vs output costs
   - Total cost of ownership
   - Free tier models

6. **Model Selection Guide:**
   - How to pick the right model
   - Cost-quality trade-off
   - Speed considerations
   - Capability matrix

### Internal Linking Strategy:

- Learn topics link to Compare page (filtered by relevant models)
- Compare page links to Learn for concept explanations
- Quiz results link to Learn for deeper understanding
- Model detail pages link to related Learn topics

**Estimated Effort:** 3 days
**Files to Create/Modify:** 12-15 new Learn topics, updated cross-linking
**Tests:** 10+ integration tests

---

## Detailed Phase 4C: Model Pages & Details Plan

**Effort:** 2-3 days | **Impact:** High | **Complexity:** Medium-High

### Model Detail Page Components:

1. **Header:**
   - Model name, provider logo
   - Latest price
   - Release date
   - Status badge (new, stable, deprecated)

2. **Quick Stats:**
   - All benchmark scores
   - Pricing (input/output)
   - Context window
   - Capabilities (reasoning, vision, web, etc.)

3. **Description & Use Cases:**
   - Full description (from blurb)
   - Primary use cases
   - Strengths
   - Limitations

4. **Specs & Details:**
   - All technical specs
   - Training data cutoff
   - Supported formats
   - Rate limits

5. **Benchmarks Table:**
   - All scores
   - Links to benchmark sources
   - Historical performance (if available)

6. **Links & Resources:**
   - Official documentation
   - GitHub repo (if open source)
   - Research papers
   - Blog post

7. **Related Models:**
   - Models with similar price/performance
   - Alternatives by provider
   - Suggested upgrades/downgrades

8. **History:**
   - Price changes over time
   - Performance improvements
   - New capabilities added

**Estimated Effort:** 2-3 days
**Files to Create:** Model detail page component + routing
**Tests:** 30+ tests (component + integration)

---

## Detailed Phase 4D: Advanced Features Plan

**Effort:** 2-3 days | **Impact:** Medium | **Complexity:** High

### Tasks:

1. **Advanced Filtering:**
   - Add capability filters (reasoning, vision, web access, open source, function calling)
   - Add price range slider
   - Add context window range
   - Combined filtering
   - Persist filter state in URL

2. **Multi-Model Comparison:**
   - Select 2-5 models
   - Compare side-by-side
   - Downloadable comparison PDF

3. **Favorites/Bookmarks:**
   - Save favorite models to localStorage
   - Quick access from sidebar or header
   - Share favorites via URL

4. **Model Changelog:**
   - Price changes
   - Performance improvements
   - New capabilities
   - Deprecation notices

5. **Recommendation Widget:**
   - Embed quiz result on external sites
   - Share comparison via URL with pre-selected models
   - Copy comparison markdown for blogs

**Estimated Effort:** 3 days
**Files to Create:** 4-5 new components, state management
**Tests:** 40+ new tests

---

## Detailed Phase 4E: Polish & Engagement Plan

**Effort:** 1-2 days | **Impact:** Low-Medium | **Complexity:** Low

### Tasks:

1. **Social Share Buttons:**
   - Share current page (with preview)
   - Share model comparison
   - Optimized copy for Twitter, LinkedIn, etc.

2. **Feedback Form:**
   - "Send feedback" button in footer
   - Modal form with fields: type (bug/suggestion), message, contact
   - Submit to email or PostHog

3. **Animations & Transitions:**
   - Smooth page transitions
   - Button hover effects
   - Loading animations
   - State change animations

4. **Mobile Improvements:**
   - Better table layout options (card view vs table)
   - Sticky header on Compare page
   - Bottom sheet for filters on mobile

5. **Sticky Header:**
   - Keep Compare table header visible during scroll
   - Sticky navigation
   - Sticky sort/filter bar

6. **Links & Transparency:**
   - Link to GitHub repo
   - Link to data sources (README)
   - Link to blog (if exists)
   - Credits/acknowledgments

**Estimated Effort:** 2 days
**Files to Create:** 2-3 new components, 5+ modified files
**Tests:** 15+ new tests

---

## Implementation Roadmap

### **Recommended Order:**

1. **Phase 4A (Quick Wins)** - 2 days
   - Immediate high-value improvements
   - Low risk
   - Builds user confidence

2. **Phase 4B (Content)** - 3 days
   - Educational content attracts organic traffic
   - SEO benefits
   - High effort but worth it

3. **Phase 4C (Model Pages)** - 2-3 days
   - Foundational for discovery
   - Improves model depth
   - Medium effort

4. **Phase 4D (Advanced Features)** - 2-3 days
   - High engagement features
   - Differentiates from competitors
   - Higher complexity

5. **Phase 4E (Polish)** - 1-2 days
   - Final polish
   - Community engagement
   - Low effort

---

## Overall Metrics & Goals

### Phase 4A Targets:
- Search finds 90% of models correctly
- Copy buttons work 100%
- Tooltips show on all benchmarks
- Performance: +5% engagement

### Phase 4B Targets:
- 15+ new Learn topics
- 200+ internal links
- SEO organic traffic: +20%
- User time on site: +30%

### Phase 4C Targets:
- 30+ model detail pages
- 100+ inbound links per page
- Model-specific traffic: +50%

### Phase 4D Targets:
- Advanced filtering: +15% comparison usage
- Bookmarks: +10% repeat visitors
- Multi-compare: +20% engagement

### Phase 4E Targets:
- Share buttons: +5% social traffic
- Feedback form: 10+ monthly responses
- Mobile engagement: +25%

---

## Risk Assessment

### Low Risk (Proceed Immediately):
- Phase 4A (Quick Wins) - Simple, low-breaking changes
- Basic content additions - Static pages

### Medium Risk (Plan Carefully):
- Model detail pages - Routing changes
- Advanced filtering - Complex state management
- Bookmarks - LocalStorage could have issues

### High Risk (Mitigate):
- i18n implementation - Breaking changes across codebase
- PWA support - Service worker complexity
- Database migration - Not recommended yet

---

## Success Criteria

**Phase 4 Complete When:**
- ✅ All quick wins implemented and tested
- ✅ Content library expanded by 12-15 topics
- ✅ Model detail pages created and working
- ✅ Advanced filtering and features added
- ✅ 300+ total tests passing
- ✅ TypeScript strict mode: 0 errors
- ✅ Lighthouse ≥90 (all categories)
- ✅ Zero console warnings/errors
- ✅ Code review approved
- ✅ PR merged to main

---

## Next Steps

1. **Week 1:** Review Phase 4 plan with stakeholders
2. **Week 2:** Prioritize tasks based on impact
3. **Week 3:** Implement Phase 4A (Quick Wins)
4. **Week 4:** Implement Phase 4B (Content)
5. **Week 5:** Implement Phase 4C (Model Pages)
6. **Week 6:** Implement Phase 4D (Advanced Features)
7. **Week 7:** Polish and finalize (Phase 4E)
8. **Week 8:** Testing and deployment

---

## Conclusion

Models.fyi has a solid foundation from Phases 1-3. Phase 4 builds on this with content, features, and polish that will significantly improve user experience and business value. 

**Recommended starting point:** Begin with **Phase 4A (Quick Wins)** for immediate high-value improvements, then move to **Phase 4B (Content)** for long-term SEO and engagement benefits.
