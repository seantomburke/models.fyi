# Phase 1: SEO & Metadata Improvements

## Overview
Improve SEO, discoverability, and user trust through structured data, enhanced meta tags, and transparency about data freshness.

## Tasks

### 1. Add JSON-LD Structured Data
**Files to modify:**
- `src/components/Layout.tsx` - Add JSON-LD to document head
- `src/lib/meta.ts` - Helper for generating structured data

**Work:**
- Add `@context` for schema.org
- Create FAQPage schema for Learn section
- Create Organization schema for site identity
- Create Product schema for each model (optional, v2)
- Create BreadcrumbList schema for navigation

**Success criteria:**
- JSON-LD validates with Google's Structured Data Testing Tool
- Organization schema appears in rich results

### 2. Enhance Meta Tags (Open Graph, Twitter Cards)
**Files to modify:**
- `src/lib/routeMeta.ts` - Route metadata
- `src/components/Layout.tsx` - Meta tag rendering

**Work:**
- Add OG title, description, image for each route
- Add OG type (website, article, etc.)
- Add Twitter Card tags
- Add canonical URLs
- Ensure image placeholders for OG images

**Success criteria:**
- Each page has OG image, title, description
- Twitter card previews work
- Canonical tags prevent duplicate indexing

### 3. Add "Last Updated" Timestamp
**Files to modify:**
- `src/data/models.ts` - Add source date
- `src/components/Layout.tsx` - Show in footer
- `src/pages/Compare.tsx` - Show near table

**Work:**
- Extract current data source date from models.ts
- Display in footer: "Data refreshed on [date]"
- Add last-modified meta tag to HTML head
- Link to data README for sources

**Success criteria:**
- Footer shows refresh date
- Date updates when data changes
- Users know how fresh the data is

### 4. Improve Benchmark Explanations & Linking
**Files to modify:**
- `src/pages/Compare.tsx` - Add links to benchmark sources
- `src/data/benchmarks.ts` - Add source URLs

**Work:**
- Add `sourceUrl` field to benchmark data
- Link benchmark names to source leaderboards
- Add (i) icon with tooltip for each benchmark
- Show confidence level (published vs. independent)

**Success criteria:**
- Hovering benchmark name shows source
- Clicking benchmark name links to source
- Users understand data provenance

### 5. Add FAQ Schema for Learn Section
**Files to modify:**
- `src/pages/learn/LearnTopic.tsx` - Wrap in FAQ schema
- `src/components/Layout.tsx` - Conditional schema rendering

**Work:**
- Convert Learn topics to FAQPage schema
- Each topic becomes a FAQ item
- Include topic content in `acceptedAnswer`

**Success criteria:**
- FAQ appears in Google rich results
- Schema validates

### 6. Enhance Route Metadata
**Files to modify:**
- `src/lib/routeMeta.ts` - Add per-route metadata

**Work:**
- Improve meta descriptions (currently basic)
- Add keywords
- Add author info
- Ensure each route has unique description

**Success criteria:**
- Each page has unique, descriptive meta description (160 chars)
- Descriptions are compelling for click-through

## Files Summary
- `src/lib/routeMeta.ts` - Core metadata
- `src/lib/meta.ts` - Meta tag utilities
- `src/components/Layout.tsx` - Head rendering
- `src/data/` - Data with sources
- `src/pages/Compare.tsx` - Benchmark rendering
- `src/pages/learn/LearnTopic.tsx` - Learn content

## Testing
- Google Structured Data Testing Tool (validate JSON-LD)
- Lighthouse SEO audit
- Share URLs in social media to test OG/Twitter cards
- Check Google Search Console (if set up)

## Acceptance Criteria
✅ All structured data validates
✅ OG/Twitter cards render correctly
✅ Data refresh date visible to users
✅ Benchmark sources accessible
✅ All meta descriptions unique and compelling (160 chars)
✅ FAQ schema appears in rich results
✅ No console warnings/errors
