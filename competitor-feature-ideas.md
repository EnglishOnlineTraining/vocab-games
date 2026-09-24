# Competitor Feature Ideas — englishonline.training

Based on audit of test-english.com, englishpage.com, and perfect-english-grammar.com (September 2026). Updated with current site state.

> **Site context:** The site already has a mature **themen/** grammar hub (16 topic pages with German-language explanations, interactive exercises, FAQ schema, and JSON-LD). The build pipeline (`scripts/build.js`) auto-generates SEO metadata, sitemaps, and the themen index. New themen pages slot into this system with minimal friction.
>
> **Unique positioning:** None of the audited competitors align to the German school curriculum (Gymnasium / Oberschule) or are used and tested in real classrooms. Exercises map directly to the topics and grammar students encounter in their textbooks. This is the core differentiator and should guide content choices.

---

## 1. Grammar Section Gaps

### Prepositions — **HIGH PRIORITY**
- Highest-traffic gap vs competitors — englishpage.com's most-visited content area
- German learners struggle with prepositions specifically (keine direkte Übersetzung)
- **Not covered** in the existing 16 themen pages
- Suggested topics: prepositions of place (in/on/at), time (in/on/at), movement (to/into/onto), verb + preposition collocations
- Format: themen page at `themen/praepositionen.html` following existing pattern (explanation → rules → exercises → FAQ → cross-links)
- **Status: READY TO BUILD** — slot directly into existing themen system

### Articles (a / an / the) — **HIGH PRIORITY**
- Both englishpage and perfect-english-grammar have dedicated sections
- High search volume from German speakers (German has cases, not articles in the same way)
- **Not covered** in the existing 16 themen pages
- Suggested topics: a vs an, definite vs indefinite, zero article, articles with countable/uncountable nouns
- Format: themen page at `themen/artikel.html`
- **Status: READY TO BUILD**

### ~~Phrasal Verbs~~ — ALREADY DONE
- ~~Currently massively underdeveloped vs competitors~~
- **Update:** A dedicated `themen/phrasal-verbs.html` already exists with 22 inline exercises covering separable/inseparable, object placement, and three-part verbs. Plus `9g-india-phrasal-verbs.html` as a textbook-aligned exercise. The themen index shows "2 Übungen" (linked exercise pages), but the inline exercises on the themen page itself are substantial.
- **No action needed** unless the linked exercise count should grow (currently 2 linked vs 22 inline).

---

## 2. New Content Types

### Vocabulary by Topic
- Neither test-english.com nor englishpage.com aligns vocabulary to the German school curriculum
- Opportunity to own "Wortschatz Englisch [Thema]" searches with classroom-tested material
- Suggested topics to start: emotions, work & jobs, environment, technology, media
- Format: new `themen/wortschatz-[thema].html` pages — same system, different content angle
- **Note:** This is a different content type from the grammar themen pages. Consider whether to mix vocab and grammar in the same themen hub or create a separate section. Recommendation: keep them in `themen/` with a "Wortschatz" subsection on the index page.

### Level Test
- Used by both test-english.com and perfect-english-grammar.com as a top engagement/lead tool
- Simple 20–30 question placement test (A1–C1)
- CTA at end: "Your level is B1 — here are exercises for you"
- Could be built as an interactive HTML page on the activities subdomain
- **Effort:** Medium-high (needs question bank, scoring logic, level-to-exercise mapping)
- **Value:** High as a funnel — every test-taker gets a personalised link to exercises

---

## 3. Site / Trust Improvements

### ~~Testimonials~~ — ALREADY DONE
- ~~perfect-english-grammar.com features testimonials prominently on the homepage~~
- **Update:** Testimonials are live via the WordPress testimonials page.
- **Potential action:** Consider surfacing a selection on the homepage or /english-for-students/ directly (not just behind a nav link) — this is how perfect-english-grammar.com uses them most effectively.

### Personal Branding
- perfect-english-grammar.com's founder (Seonaid) is on every page — builds trust
- You are a real, qualified teacher — show it
- **Action:** add a short "About Shaun" section with photo to WordPress homepage and key landing pages
- **Note:** WordPress change. The activities subdomain already has author attribution in JSON-LD schema (`"name": "Shaun Trezise"`) but no visible bio.

---

## 4. Email / Newsletter

### Tighten the newsletter hook
- test-english.com's hook: *"Get two new lessons every week"* — specific, low-commitment
- Current CTA is generic
- Suggested: *"Jede Woche eine neue Übung direkt in dein Postfach"* or similar
- Apply to: WordPress homepage signup, students page, blog post CTAs
- **Note:** WordPress change

### Topic-specific PDF lead magnets
- perfect-english-grammar.com offers free PDFs per grammar topic (e.g. "Tenses PDF")
- Each PDF is a separate SEO entry point and email capture opportunity
- Suggested first PDF: "Die wichtigsten Grammatikregeln fürs Abitur" (A4 cheat sheet)
- **Note:** Could be generated from existing themen page content

---

## 5. Monetisation (longer term)

### Membership model
- perfect-english-grammar.com uses Teachable membership ($) instead of per-product sales
- As the exercise library grows, a monthly/annual membership makes more sense than individual Payhip packs
- Consider: free tier (current exercises) + paid tier (Abitur packs + new content unlocked)
- Not urgent — revisit when pack library reaches 6–8 products

---

## Priority Order (revised)

| Priority | Feature | Effort | Impact | Platform |
|----------|---------|--------|--------|----------|
| **High** | **Prepositions themen page** | Medium | High SEO | GitHub Pages |
| **High** | **Articles themen page** | Medium | High SEO | GitHub Pages |
| Medium | Surface testimonials on homepage | Low | Trust | WordPress |
| Medium | Personal branding / photo | Low | Trust | WordPress |
| Medium | Newsletter hook rewrite | Low | Conversions | WordPress |
| Medium | Level test | High | Engagement / funnel | GitHub Pages |
| Medium | Vocabulary by topic (first 3) | High | SEO | GitHub Pages |
| Low | Topic PDFs | Medium | Lead gen | Either |
| Low | Membership model | Very High | Revenue | External |
| ~~High~~ | ~~Phrasal Verbs expansion~~ | — | — | Already done |
