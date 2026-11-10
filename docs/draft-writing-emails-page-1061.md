# Draft: `/writing-emails-in-english/` (WordPress page 1061)

**Status: LIVE since 2026-11-08 (approved by Shaun). Applied to page 1061 exactly as drafted below. New revision 2867. To revert, restore revision 2682 (2026-10-22, the previous version).**
Source: "Next round" in the Nov 2026 quick-wins report. Live page read on 2026-11-07
(`context: "edit"`, last modified 2026-10-22). Sister page 1167 read the same day.

## Rule 8: what the rewrite drops

Nothing is lost from links, buttons, the image, the checklist, the mistakes list or the
corporate CTA. The page has no schema, form or quiz of its own; `jetpack_seo_noindex` stays `false`.
What changes or goes:

| Old element | In the draft |
|---|---|
| Intro: "Email has become one of the most common forms of communication in today's digital age…" | Dropped (filler). Replaced by an answer-first sentence. |
| Long "good email" (about 110 words, opens "I hope this email finds you well") | Dropped. Replaced by the short 1167 version. |
| Italic notes under the bad and good meeting emails | Replaced by one "What changed" note (the 1167 wording). |
| Phrase "Meeting Request for Q1 Budget Presentation" as a subject line | Still appears in the mistakes list ("Poor subject line"). The short good email uses "Meeting request: Q1 budget presentation". |
| H4 headings for the two examples | H3. Anchors `#bad-email-1` and `#good-email-example-1` are kept, so old deep links still work. |
| Sentence "More pairs — asking for a report and answering a customer complaint — are on…" | Updated to the 4 pairs now on 1167. Link kept. |
| "Mr. Smith" | "Mr Smith" (British spelling, VOICE.md; same as 1167). |

Kept unchanged: H1, featured image (ID 1063) and its `#writing-emails` anchor, the "Common email
mistakes" list, the 9-item checklist, the PDF link and the phrase bank link, the "Practise it"
section and its button to `be-professional-emails.html`, the "Need this across a whole team?"
section and its button to `/business-english/`.

## YouTube

I cannot tell from the repo or the page which part the video points to. Nothing in the repo
records the video's link text or timestamps. Anchors a video description could use, all kept:
`#writing-emails`, `#common-mistakes`, `#bad-vs-good-examples`, `#bad-email-1`,
`#good-email-example-1`, `#checklist`, `#practice-writing-emails`, `#corporate-training`.
New anchors: `#template`, `#german-speakers`. Shaun: check the video description and pinned
comment for which of these it uses. Most likely the worked example or the practice button, which
this draft keeps.

## Metadata (apply through `meta`, not `content`)

| Field | Now | Draft |
|---|---|---|
| `jetpack_seo_html_title` | How to Write a Professional Email in English | How to Write a Professional Email in English (Template) |
| `advanced_seo_description` | Write clear professional emails in English: subject lines, tone, common mistakes, a bad-vs-good example and a checklist to use before you hit send. | A simple 5-part template for professional emails in English: subject line, greeting, purpose, details and closing. With phrases and a checklist. |
| `title` (H1) | How to Write Professional English Emails (With Examples) | Unchanged (not in the approved change list). |
| `excerpt` | "Email has become one of the most common forms…" (filler) | A professional email in English has five parts: a specific subject line, a greeting with a name, the purpose in the first line, the details, and one clear request. Here is each part with a phrase to copy. |

Note: the new description is 158 characters, inside the usual limit. "Template" is in the
title only if you accept the 5-part section below, which is the "template" the title promises.

## New `content` (WordPress block markup)

```html
<!-- wp:paragraph -->
<p>A professional email in English has five parts: a specific subject line, a greeting with a name, the purpose in the first line, the details, and one clear request with a polite closing. Below is each part with a phrase to copy.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"anchor":"writing-emails"} -->
<figure class="wp-block-image" id="writing-emails"><img src="https://englishonline.training/wp-content/uploads/2023/03/jetpack_ai_image.png" alt="cartoon of a woman writing an email" /><figcaption class="wp-element-caption">cartoon of a woman writing an email </figcaption></figure>
<!-- /wp:image -->

<!-- wp:heading {"anchor":"template"} -->
<h2 class="wp-block-heading" id="template">A 5-part template for any professional email</h2>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><li><strong>Subject line</strong> — say what the email is about. Copy: <em>Meeting request: Q1 budget presentation</em></li><li><strong>Greeting</strong> — use the person's name. Copy: <em>Dear Ms Patel,</em></li><li><strong>Purpose in the first line</strong> — the reader should know why you are writing at once. Copy: <em>I am writing to ask whether we could meet next week.</em></li><li><strong>Details</strong> — dates, times, names, numbers. Copy: <em>I have attached the report for your review.</em></li><li><strong>Clear request and closing</strong> — ask for one thing, then close politely. Copy: <em>Could you please reply by Friday? Kind regards,</em></li></ol>
<!-- /wp:list -->

<!-- wp:heading {"anchor":"common-mistakes"} -->
<h2 class="wp-block-heading" id="common-mistakes">Common email mistakes</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><li><strong>Poor subject line</strong> — vague lines like "Important" or "Hello" get skipped. Be specific: "Meeting Request for Q1 Budget Presentation."</li><li><strong>Lengthy emails</strong> — keep it concise, use short paragraphs and bullet points, and cut unnecessary detail.</li><li><strong>Unprofessional tone</strong> — avoid slang and overly casual language with people you don't know well; "Dear Mr Smith" beats "Hey John" until there's an existing relationship.</li><li><strong>Lack of personalisation</strong> — a generic email that doesn't address the recipient by name reads as an afterthought.</li><li><strong>Grammar and spelling</strong> — always proofread; a spell-checker catches typos, not tone.</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"anchor":"bad-vs-good-examples"} -->
<h2 class="wp-block-heading" id="bad-vs-good-examples">Bad vs good — a worked example</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3,"anchor":"bad-email-1"} -->
<h3 class="wp-block-heading" id="bad-email-1">Bad email example: requesting a meeting</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Subject:</strong> Meeting<br>Hey,<br>Can we meet tomorrow to discuss the project? Let me know when you are free.<br>Thanks, [Your Name]</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"anchor":"good-email-example-1"} -->
<h3 class="wp-block-heading" id="good-email-example-1">Good email example: requesting a meeting</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Subject:</strong> Meeting request: Q1 budget presentation<br>Dear Mr Smith,<br>Could we meet on Thursday, 25 March, at 10:00 to discuss the Q1 budget presentation? I will present the budget forecast for the first quarter and the changes we may need. The documents are attached.<br>If this time does not work for you, please suggest another one, and let me know if there is anything you would like me to cover.<br>Best regards,<br>[Your Name]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>What changed:</strong> the subject line now says what the meeting is about. "Hey" became a greeting with a name. The writer suggests a day and time instead of "tomorrow", says what will happen in the meeting and attaches the documents, so the reader can say yes straight away. It is still short: one request, no filler.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Three more pairs — asking for a report, answering a customer complaint and a student asking a teacher for more time — are on <a href="https://englishonline.training/good-vs-bad-when-writing-emails-in-english/">Good vs Bad Email Examples</a>, each with a note on what changed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"anchor":"german-speakers"} -->
<h2 class="wp-block-heading" id="german-speakers">Phrases for German speakers</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul class="wp-block-list"><li><em>Ich freue mich auf Ihre Antwort.</em> → <strong>I look forward to hearing from you.</strong> Not "I look forward to hear": after "look forward to" use the -ing form.</li><li><em>Sie müssen mir das schicken.</em> → <strong>Could you please send me this?</strong> "You must send me this" sounds like an order.</li><li><em>Ich möchte fragen, ob …</em> → <strong>I would like to ask whether …</strong> "I want to ask" is too direct.</li><li><em>Anbei finden Sie …</em> → <strong>I have attached …</strong> or <strong>Please find attached …</strong></li><li><em>Mit freundlichen Grüßen</em> → <strong>Kind regards</strong> or <strong>Best regards</strong>. Do not translate it word for word.</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"anchor":"checklist"} -->
<h2 class="wp-block-heading" id="checklist">Quick checklist before you hit send</h2>
<!-- /wp:heading -->

<!-- wp:list {"ordered":true} -->
<ol class="wp-block-list"><li>Clear, specific subject line</li><li>Professional greeting ("Dear [Name]" is always safe)</li><li>Correct grammar, spelling and punctuation</li><li>Bullet points or numbered lists for anything with multiple parts</li><li>Professional closing ("Best regards" / "Sincerely") with your name and contact details</li><li>Professional tone — no slang, no emoji, no all-caps</li><li>Readable formatting — short paragraphs, one font, no wall of text</li><li>Proofread before sending</li><li>Mind cultural differences — phrasing that's normal in one culture can read as blunt or overly formal in another</li></ol>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Want phrases to copy? Download the <a href="https://englishonline.training/wp-content/uploads/2026/10/useful-phrases-for-business-emails-v2.pdf">Useful Phrases for Business Emails PDF</a>, or browse the full <a href="https://activities.englishonline.training/lead-business-email-phrasebank.html">Business Email Phrase Bank</a> (40 phrases by situation).</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"anchor":"practice-writing-emails"} -->
<h2 class="wp-block-heading" id="practice-writing-emails">Practise it</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Reading examples only gets you so far — the interactive Business English exercise below has you write your own professional emails and checks your work.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://activities.englishonline.training/be-professional-emails.html">Practise: Professional Emails exercise</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:heading {"anchor":"corporate-training"} -->
<h2 class="wp-block-heading" id="corporate-training">Need this across a whole team?</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I run corporate Business English training for companies who want their staff writing confidently in English — on-site or online, group or 1:1.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://englishonline.training/business-english/">Corporate Business English enquiry</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
```

## Notes for Shaun

- **Phrase changed from the report.** The report suggested "I look forward to hearing from you" instead of "I hope to hear from you soon". "I hope to hear from you soon" is correct English, so it is not a fix. The real German-speaker error is "look forward to hear", and that is what the draft warns about.
- **Fact-check.** The draft has no statistics, dates (apart from the example email's date, copied from 1167) or named sources. Its claims are usage rules ("look forward to" + -ing; "must" sounds like an order). I did not run the `fact-check-blogs` skill on them. Say if you want it run.
- **Where to apply.** `pages.update` on ID 1061 with `content`, then `meta.jetpack_seo_html_title`, `meta.advanced_seo_description` and `excerpt`. Verify after the write.
