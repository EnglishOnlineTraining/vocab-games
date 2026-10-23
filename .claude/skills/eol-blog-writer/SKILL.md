---
name: "eol-blog-writer"
description: Write blog posts for englishonline.training in which the whole post is built on one storytelling framework (Before-After-Bridge, Challenge-Choice-Outcome, Hero's Journey, 3-Act Structure, And-But-Therefore, Pixar Story Spine) - the framework shapes the post, it is never named or explained. Follows VOICE.md and saves the post as a WordPress draft with a featured image and full SEO and social metadata. Use this skill whenever Shaun asks for a blog post, article, blog draft, website post or "something for the blog" for englishonline.training, for learners, HR/L&D buyers, teachers or parents (German), even if he does not mention storytelling or frameworks.
---

# EOL blog writer

Write one blog post per request for englishonline.training. The post uses one
storytelling framework as its skeleton. The reader should feel the story, not
see the scaffolding.

## Why "use, not describe"

A post that explains a framework teaches the framework. A post that is built
on a framework holds the reader to the end. Shaun wants the second kind. So
the framework decides the order of ideas and where the tension sits, but its
name and its stage labels never appear in the post.

## Step 1 - Get the brief

You need four things. Take them from the conversation if they are there. Ask
only for what is missing, in one message.

| Item | Options |
|---|---|
| Topic | Any English-learning, teaching or training topic |
| Audience | Learners, HR/L&D, teachers, parents |
| Goal | Teach a skill, show value, share a lesson, build trust, drive to exercises or training |
| Facts | Any real story, numbers or examples Shaun wants used |

Language and address follow the audience (from VOICE.md):

| Audience | Language | Address | WordPress category (ID) |
|---|---|---|---|
| Learners | English | you | English Learning (9490) |
| Professionals, HR, L&D | English | you | Business blogs (24820) |
| Teachers | English | colleague to colleague | Teacher Notes (243245) |
| Parents | German | Sie | Für Eltern (379964997) |

Category IDs were correct in October 2026. If a create call refuses an ID,
run `categories.list` and use the current one.

## Step 2 - Choose the framework

Pick one framework from the goal. If Shaun names one, use it.

| Goal | Best fit | Also works |
|---|---|---|
| Show the value of a method, exercise or course | Before-After-Bridge | 3-Act |
| Share a decision, opinion or lesson learned | Challenge-Choice-Outcome | And-But-Therefore |
| Build trust, tell a learner or founder story | Hero's Journey (5 beats) | Pixar Spine |
| Case study, "how we solved X" | 3-Act Structure | Before-After-Bridge |
| Short post, grammar point, news, update | And-But-Therefore | - |
| Make a non-specialist care (parents, HR) | Pixar Spine | Before-After-Bridge |

Vary the framework across posts. Before you choose, list the five most
recent posts (`posts.list`, `per_page: 5`, `status: ["draft","publish"]`) and
avoid the framework that the most recent post clearly used, unless it is the
only good fit.

Then read `references/frameworks.md` for the chosen framework only. It gives
the beats, how each beat maps to post sections, and the traps.

## Step 3 - Plan the post

Write a short plan (for yourself, not the post):

1. The one sentence the reader should remember.
2. Each framework beat mapped to one post section, with a content heading.
3. Where the required parts sit (see below).

Headings describe content, never stages. "Why the reports took three days" is
right. "Before" or "Act 2: Conflict" is wrong.

### Required parts (VOICE.md)

Every post contains these. Place them inside the final beat (After,
Outcome, Resolution, Return, Therefore, "ever since") so they feel like the
payoff, not an appendix:

- A concrete example the reader can copy.
- One practice task or next step.
- For learners: a grammar or usage tip for German speakers, where useful.
- One call to action at the end, matched to the audience:
  - Learners: free interactive exercises at englishonline.training.
  - HR/L&D: corporate English training, online or in person. Get in touch.
  - Teachers: free interactive exercises for Years 7–10.
  - Parents: kostenlose interaktive Englisch-Übungen für Klasse 7 bis 10.

## Step 4 - Write

Follow `references/voice.md` (a copy of VOICE.md v1.0). The key rules:

- Simplified Technical English: short sentences, one idea each, common words,
  active voice.
- British spelling. German posts: "Sie".
- No exclamation marks, no emojis, no hype words.
- No public lessons offered. No textbook names.
- 500–900 words. Short paragraphs (1–3 sentences).

### Honesty rule for stories

Stories carry these posts, so this matters most. Never present an invented
person, quote, result or testimonial as real. Use one of these:

- A story or numbers Shaun supplied.
- A clearly typical scenario: "A typical Year 9 student…", "Picture a team
  lead who…".
- The reader as the protagonist: "You open the email. It is in English…".

Credit any idea or source by name. If unsure of a fact, leave it out.

### Format

Gutenberg block markup: `wp:paragraph`, `wp:heading` (h2 only), `wp:list`,
`wp:quote` for example texts. Bold sparingly.

## Step 5 - Check

Read the post as the reader, then check:

- [ ] The framework name and stage labels appear nowhere in the post.
- [ ] No sentence explains the post's own structure.
- [ ] The tension point of the framework (the Before, the Challenge, the
      "But", the Ordeal, Act 2, "Until one day") is clear and specific.
- [ ] The first sentence makes the reader want the second.
- [ ] All required parts are present.
- [ ] Every person, quote and number is real-and-supplied or clearly typical.
- [ ] VOICE checklist: spelling, address, no hype, no exclamation marks.
- [ ] If the post links an exercise: one sample image planned (Step 6), with
      alt text, caption and a link to the exercise, and no student data in it.

Fix anything that fails before saving.

## Step 6 - Metadata and featured image

Every post gets the full set below. Write them in the post's language.

| Field | Where it goes | Rule |
|---|---|---|
| Slug | `slug` | Short, keyword-led, hyphenated |
| Category | `categories` | One ID from Step 1 |
| Tags | `tags` | 3–5 IDs. Reuse existing tags (`tags.list`). Propose a new tag only if none fits, and create it only after Shaun approves |
| Excerpt | `excerpt` | 1–2 sentences. Says what the reader gets |
| SEO title | `meta.jetpack_seo_html_title` | Up to 60 characters. Main keyword near the start |
| Meta description | `meta.advanced_seo_description` | Up to 155 characters. Benefit plus keyword |
| Social message | `meta.jetpack_publicize_message` | For X. Casual overtone allowed (VOICE.md). Up to 240 characters. Max one emoji. No hashtag lists - one or two at most |
| Featured image | `featured_media` | Generated in the house style below |
| Image alt text | `alt_text` on the image | Plain description of the image, up to 125 characters. Never empty: Jetpack uses the featured image as the post's `og:image`, so its alt text is what social shares and screen readers get |
| Image title | `title` on the image | Same as the post title |

### Alt text rules (all images)

- Say what the image shows and why it is there. No "image of" or "picture of".
- No keyword lists. One natural phrase that a screen-reader user would want.
- Up to 125 characters, in the post's language.
- Decorative images only: `alt=""`. The featured image, a screenshot and a
  diagram are never decorative: they always have real alt text.

### In-post images: exercise samples and diagrams

When the post sends the reader to an exercise on `activities.englishonline.training`,
add **one** sample image of that exercise. Add a second image only for a diagram
that teaches the post's point. Never more than two in-post images.

- **Place it** in the final beat, at the practice task or call to action, and
  link the image to the exercise URL. The image is a doorway to the exercise,
  not decoration.
- **Source, first choice:** the exercise's own social card, if one exists on
  the activities host (`https://activities.englishonline.training/og-<page>.png`,
  or a diagram PNG such as `past-progressive-vs-simple-past-timeline.png`).
  Check that it returns 200, then upload it with `media.create` and
  `source_url`.
- **Source, second choice (only when the session has a shell):** capture the
  live page with Playwright
  (`npx playwright screenshot --viewport-size=1200,800 <url> <file>.png`). Crop
  to the exercise card: no site header, breadcrumb or footer. Show the task in
  a fresh state, or one answered item with its feedback. Upload with
  `file_content_base64`. With no shell, ask Shaun for the screenshot or leave
  the image out.
- **Never** show a submission, a results screen, a filled name or email field,
  or anything else that identifies a student.

Where these come from (check there if anything here looks out of date): the
exercise pages, their `og-<page>.png` cards and the diagram PNGs live in the
GitHub repo `EnglishOnlineTraining/vocab-games`, served at
`activities.englishonline.training`. Playwright is installed in that repo
(`npm install` there). The student-data rule is rule 1 of that repo's
`CLAUDE.md`. The `media.create` parameters are from the WordPress.com
connector: run `describe` on `media.create` if an upload fails.
- **Filename:** lowercase, hyphenated, says what it is, for example
  `past-progressive-gap-fill-exercise.png`. No dates, no `IMG_`, no `screenshot-1`.
- **Alt text for an exercise sample:** the exercise type, the topic and what is
  visible. For example: "Gap-fill exercise on the past progressive: five
  sentences with drop-down choices and instant feedback".
- **Caption:** one short line that names the exercise. For example: "Try it:
  past progressive or simple past?".
- **Block:** `wp:image` with the media `id`, `alt`, the caption, and
  `linkDestination: "custom"` to the exercise URL.
- Don't put German site chrome into an English post's image. Crop it out.

### Featured image house style

Generate one landscape image per post with `media.generate`. Build the
prompt from this fixed style plus one concrete scene from the post:

> Flat editorial vector illustration. Simple shapes, soft shadows, plenty of
> empty space. Muted palette: deep navy, teal, warm sand and off-white.
> Objects and settings only - for example a desk, laptop, notebook, speech
> bubbles, calendar, classroom or office. No text, letters or numbers
> anywhere. No real or recognisable people; if a person is needed, use a
> faceless simplified figure. No logos or brands. Scene: [one scene from the
> post's opening].

Keep the style text unchanged so all posts look like one series. Change only
the scene. Pick a scene that shows the tension of the post (the moment in
the opening), not a generic "learning" image.

If the generated image contains text, a face or a logo, generate again with
a simpler scene.

## Step 7 - Save as a WordPress draft

Show Shaun, in one message: the title, audience, framework, beat-to-section
map, all metadata from Step 6, the image prompt, and each in-post image
(source, filename, alt text, caption, link). Ask for one approval to
generate and upload the images and save the draft. The site connector requires approval
before any create call.

After a yes:

1. `media.generate` with `prompt`, `orientation: "landscape"`, `alt_text`,
   `title`, `user_confirmed: true`. Note the returned media ID.
   For each in-post image: `media.create` with `source_url` or
   `file_content_base64`, `filename`, `alt_text`, `caption`, `title`,
   `user_confirmed: true`. Put the returned IDs and URLs into the image blocks
   in `content`.
2. `posts.create` on `englishonline.training` with:
   - `status: "draft"` - never publish
   - `user_confirmed: true`
   - `title`, `slug`, `categories`, `tags`, `excerpt`, `content`
   - `featured_media: <media ID>`
   - `meta`: `jetpack_seo_html_title`, `advanced_seo_description`,
     `jetpack_publicize_message`
   - `include_fields: ["id","link","status"]`
3. Attach every image to the post: `media.update` with `post: <post ID>`.
4. Check `_content_warnings` in the result. If WordPress dropped anything,
   tell Shaun.

If Shaun has already said to save drafts directly in this conversation, skip
the extra approval.

## Step 8 - Report

Reply briefly:

- Title, with edit link `https://englishonline.training/wp-admin/post.php?post={id}&action=edit`
  and preview link `https://englishonline.training/?p={id}&preview=true`.
- Framework used and the beat-to-section map (chat only, never in the post).
- A link to the featured image and to each in-post image, with its alt text.
- Anything left out and why (for example, a fact you could not confirm).
