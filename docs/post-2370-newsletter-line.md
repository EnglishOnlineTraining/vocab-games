# Post 2370: newsletter line and MailerLite preview links

Rule 8: this file proposes wording only. No WordPress edit was made; post 2370 is unchanged, so nothing is lost.

Backlog row: `eol-backlog-plan.md` open item 8 (the old numbering was item 18, "WordPress follow-ups", added 2026-10-06 and retired with `wordpress-todo.md`). Checked 2026-11-15 (read-only).

## What the live post is

- **ID 2370**, slug `american-british-english-what-matters`, published 2026-10-21.
- **Title:** "American or British English? What Actually Matters in Class".
- **Audience:** learners. It is written to a student ("Max"), says "ask your teacher", and ends with a learner CTA. It is **not** a teacher post. The 2026-11-15 backlog wording ("3-Act Structure for student presentations", "written for teachers") is out of date.
- **Ending today:** the exercise CTA (`8g-american-british-english.html`), a figure linking to the same exercise, then a paragraph recommending Boston English Center's free lessons.
- **Newsletter sign-up:** not in the stored post content. The public page (fetched 2026-11-15) shows no sign-up markup in the body. It does load MailerLite's `universal.js` with `enablePopups: true` from the official MailerLite WordPress plugin, so a sign-up may come from a popup or a plugin widget and not from the post text. Shaun should check the live page in a browser before any edit.
- **Preview links:** the post has no `preview.mailerlite.io` link in its body or page source.

## Proposed newsletter line (learner, English)

> Want more free practice like this? Sign up for our newsletter and get new exercises by email.

Form: the **General** MailerLite form, ID `200478242193278763` (the same form `lead-story-structures.html` uses in `signup.js`). It is double opt-in, so MailerLite sends its own confirmation email before anyone joins.

**Check before use:** the line says new exercises arrive by email. Confirm that the General group really gets that, or drop the second half: "Want more free practice like this? Sign up for our newsletter."

Voice check against `VOICE.md`:
- Learner address ("you"), short sentences, one idea, no exclamation mark, no hype.
- §7 asks for **one** closing call to action. The post already ends with the exercise CTA. The newsletter line is therefore a second CTA. Options:
  - **A (recommended):** keep both, the exercise first, the newsletter line second.
  - **B:** drop the newsletter line and keep the exercise CTA only.

## Exact insertion point (if Shaun approves option A)

In the block editor, after the figure block (`<figure class="wp-block-image size-full">…</figure>`) and **before** the paragraph that begins "I can also recommend trying Boston English Center…".

Insert as a plain paragraph:

```html
<p>Want more free practice like this? Sign up for our newsletter and get new exercises by email.</p>
```

Link the words "Sign up for our newsletter" to the signup page or the on-site form, not to a preview link (see below).

Separate question for Shaun, not part of this proposal: the Boston English Center paragraph is a third-party recommendation sitting directly above the newsletter line. Keep it, move it, or remove it.

## MailerLite preview links: permanent or expiring?

**I cannot tell from the docs.** Searches of the MailerLite developer docs and help centre (2026-11-15) found nothing on how `preview.mailerlite.io/forms/…/share` links behave: no statement that they are permanent, and no statement that they expire. The developer docs cover API, triggers and e-commerce; the help centre covers websites, blogs and deliverability. Neither mentions form share links.

What the repo already says:
- `signup.js` embeds forms by **form ID** through MailerLite's own endpoint (`assets.mailerlite.com/jsonp/2491182/forms/`). That endpoint is not in the documented API, so it can change without notice, but the IDs are stable in the repo.
- `ux-backlog.md` (Decided) says the `preview.mailerlite.io` contact links are intended by Shaun.
- The old backlog asked for confirmation that the preview-domain links are meant to be permanent. Nothing in the repo answers it.

Recommendation: do not rely on `preview.mailerlite.io` share links for anything new. Link to the on-site form or the form ID. To settle the question for existing links, Shaun can ask MailerLite support directly, which the docs do not answer.

## Decisions for Shaun

1. **Newsletter line: option A approved** (Shaun, 2026-11-16): keep it as the second call to action. The live edit is not made yet; it needs a separate go-ahead.
2. **Confirm** the General group sends new exercises by email, or drop that clause.
3. **Check the live page** (browser, not curl) for a popup or widget that shows the sign-up. If a popup is the sign-up, the body line may be unnecessary.
4. **Boston English Center paragraph:** keep, move or remove.
5. **Preview links:** ask MailerLite support whether share links are permanent, or move the links to form IDs.

Nothing here has been posted, sent or published. No MailerLite campaign or subscriber was touched.
