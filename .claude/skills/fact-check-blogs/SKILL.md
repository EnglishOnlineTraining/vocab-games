---
name: fact-check-blogs
description: Fact-check any written content - a blog post, landing page, FAQ, exercise or reading text, a draft pasted into chat, a PDF, a WordPress page or post, or text from anywhere else - by extracting every checkable claim (dates, statistics, exam rules, laws, named studies, "new this year" statements), verifying each against primary and independent sources, fixing what is wrong, and adding real citations. Use this whenever the user says "check the facts", "verify this", "fact check", "is this true", "find real sources", "add sources", or hands over content and wants it reviewed for accuracy, even if they never say "fact-check". Works on its own, independent of any writing skill, and also for text that attributes figures to real organisations (Pew, Gallup, Eurostat, ministries).
---

# Fact-checking content from any source

Published content gets believed, quoted and indexed. Search snippets and memory are not evidence, so the job is to trace each claim back to the document that originated it, then change the page to say exactly what that document supports.

## Where the content can come from

This skill stands alone: it does not depend on how the text was written. Fetch the content in whatever form it arrives:

- a live URL (fetch it) or a local HTML/Markdown file (read the whole file, including meta tags and JSON-LD)
- a WordPress page or post (read it through the API; request `context: "edit"` when you may write it back)
- a PDF or document (extract the text, see step 3)
- text pasted into chat, or several items at once (check them one after another and keep one combined report)

If the same claim appears in several places, verify it once and fix every copy.

## Workflow

1. **Extract claims.** Read the whole page (visible text, FAQ answers, meta description, JSON-LD) and list every checkable claim: numbers, percentages, dates, "new/changed/mandatory" statements, who-decides statements (which state, which ministry), named studies or organisations, rules such as grading weights or exam length. Opinions and advice are not claims; fictional case studies are fine if the page says they are fictional.
2. **Find the primary source for each, and a second one where it matters.** Official publisher first: ministry or exam authority PDFs, circulars (Rundschreiben), the original survey report or fact sheet, the standards body. Secondary sites (exam-prep portals, news, aggregators) can point you to the primary source but cannot confirm a claim alone. For contested, legal or high-stakes claims (health, money, exam rules) look for two independent sources and say when they disagree. Different jurisdictions or editions of a document often differ, so note which version the claim rests on.
3. **Read the source, not the search summary.** Fetch the document. If the fetch tool cannot read a PDF, it saves the file locally; extract text with `python3 -c "import pymupdf; print(''.join(p.get_text() for p in pymupdf.open('file.pdf')))"` (`pip install pymupdf` if missing). If a source returns 403, say so and fall back to corroborated search results, flagged as less certain.
4. **Compare precisely.** Check the exact wording against the claim. The errors that actually occurred in practice:
   - a real figure with the wrong denominator (46% of teens use the *internet* almost constantly, not social media)
   - an *example* in an official document read as a rule (a 70/30 weighting shown as a sample for classroom tests, not the exam)
   - a figure attributed to a real organisation that does not exist in its publications (invented "Pew" and "Gallup" numbers)
   - "new" labels that are only partly new (a topic changed, another merely got a new focus)
   - two jurisdictions presented as identical when their documents differ
   - a date range quoted for the whole exam period instead of the specific subject date
5. **Classify each claim**: Confirmed (matches primary source), Corrected (source says something different), Unsupported (no source found; remove or soften), Needs human (ambiguous, paywalled, or depends on which version applies).
6. **Fix the page.** Replace unsupported or wrong statements with what the source supports, in the page's own voice and language. Prefer removing a claim to keeping a vague one. Where a figure is used in an exercise (match-the-statistic, summary, mediation), update every place it appears: the text, the model answer, the answer key, the exercise questions and any German or translated copy. Search for the old numbers afterwards to prove none are left.
7. **Show sources.** Name the organisation and year in the sentence ("a 2025 Pew Research Center survey") and add a visible source line with links. When a text contains invented people or scenarios, say so.
8. **Re-verify.** Rebuild with the project's own build, syntax-check any edited JavaScript, load the page and check the console, then confirm the live URL after publishing.

## Reporting

Report in this shape, short, no padding:

- **Confirmed and kept** (one line of sources)
- **Wrong or unsourced, now fixed** (old claim, what the source says, link)
- **Still unchecked or uncertain** (say what you could not reach and why)

Be plain about what you did not verify. A claim you could only support with a secondary source goes under uncertain, not confirmed.

## Boundaries

- Do not publish, push or update WordPress without the user having asked for it. In this user's setup, edit WordPress through the API with `context: "edit"` and change only the strings you mean to change.
- Never put student names or anything identifying a student into content, notes or commit messages.
- Do not invent a replacement statistic. If no real figure supports the point, rewrite the sentence so it does not need one.
- Dates the user says are unimportant can be reported but need not be chased.
