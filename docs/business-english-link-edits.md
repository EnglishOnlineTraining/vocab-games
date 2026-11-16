# Internal links into /business-english/: proposed edits

Backlog: Tier 17 item 5 (dashboard `vg-seo-t17-5`), carried by Tier 20.
Target: `/business-english/` (WP 1965, live, modified 2026-11-15).
Read on 2026-11-15 via the WordPress read tools (`context: edit` for block markup). **No live page was edited.** Every live edit needs Shaun's OK (backlog rule 7).

## Finding first

The Tier 17 item assumed these pages need links into `/business-english/`. The live pages show otherwise. Three of the four already link there, and only 1167 has none.

| Page (WP id) | Links to /business-english/ today | Proposal |
|---|---|---|
| 965 Business verbs | One: closing paragraph ("Business English training built on your team's own work") | **None.** No natural body anchor (see below) |
| 1061 Writing emails | One: bottom button "Corporate Business English enquiry" | **None.** See below |
| 1167 Good vs bad emails | **None** | **One new sentence and link. Apply after 5 Dec** |
| 1019 Business English skills | Two: section 2 "online business English course", closing "corporate Business English training" | **None** |

## 965 (frozen until 5 Dec): no edit proposed

Tier 20 run 1 found no natural anchor for 965 (business verbs). That is still true. The body text has no sentence where a training link fits without being forced. The one link the page has is already in the closing paragraph. Adding a second link to the same target would break the Tier 20 rule (each target at most once per source). Recommendation: leave 965 alone.

## 1061 (frozen until 5 Dec): no edit proposed

The page already links to `/business-english/` through the bottom button. The paragraph "I run corporate Business English training for companies…" contains a natural anchor, but it is plain text. Linking it would make a second link to the same target on one page, which the Tier 20 rule forbids. Recommendation: leave 1061 alone.

## 1019 (not frozen): no edit proposed

Two links already exist (the section 2 "online business English course" and the closing "corporate Business English training"). Nothing to add. Tier 17 item 1 (the `/welcome/` 301 and duplicate-paragraph trim) is separate and not affected by this proposal.

## 1167 (frozen until 5 Dec): apply after 5 Dec

This is the only proposed edit. 1167 is an informational guide and has no money-page link at present. Tier 12.1 allows one.

**Anchor text:** `corporate Business English training`

**Sentence it goes in** (a new sentence, which Tier 17 item 5 allows, since it says the 965 gap "needs a sentence written for it"):

> Teams that need this across the whole company can build it with corporate Business English training, on-site or online.

**Placement:** a new paragraph after the "What the good emails have in common" list, before the "Practise it" heading. The sentence follows the checklist of what good emails share and points teams to the paid service at the end of the guide.

**Fit:** moderate. The sentence is new text, not an existing one. If Shaun prefers no commercial link on a learner guide, skip it. Nothing else depends on it.

**Before** (block snippet, `context: edit` markup):

```html
<!-- /wp:list -->

<!-- wp:heading {"anchor":"practise"} -->
<h2 class="wp-block-heading" id="practise">Practise it</h2>
<!-- /wp:heading -->
```

**After:**

```html
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Teams that need this across the whole company can build it with <a href="https://englishonline.training/business-english/">corporate Business English training</a>, on-site or online.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"anchor":"practise"} -->
<h2 class="wp-block-heading" id="practise">Practise it</h2>
<!-- /wp:heading -->
```

**Rule 8:** nothing lost. The edit inserts one paragraph block. No existing text, link, button, image or heading is changed or removed.

**Verify after the write:** re-read 1167 with `context: edit`. Confirm the new link is present, the existing links (`writing-emails-in-english`, `lead-business-email-phrasebank`, `be-professional-emails`, and the page's example anchors) are unchanged, and the "Practise it" buttons still render. Then add the run to the Tier 20 changelog with the revision id, and record 1167's baseline position and impressions.

## Notes

- Tier 20 rule 4 (never rewrite sentences to force an anchor) is respected: nothing existing is rewritten.
- The freeze on 1061, 1167, 965 and others ends 2026-12-05 (backlog calendar). Re-check the 1167 snippet against the live page on that date in case it has changed.
- Shaun's decision for this item: approve the 1167 sentence for after 5 Dec, or skip it. The other three pages need no action.
