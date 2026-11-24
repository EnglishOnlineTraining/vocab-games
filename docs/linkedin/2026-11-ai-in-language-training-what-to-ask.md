# LinkedIn article: AI in language training: what to ask your provider

Status: DRAFT for Shaun to post himself from his personal profile. Not posted.
Audience: HR and L&D buyers of corporate language training. Money page: `/business-english/`.
Source: EF Language Abroad's public job ad "AI Product Manager" (Zurich, seen 2026-11-24). Paraphrased; one short quote.
Before posting: (1) decide whether to name EF or say "one of the largest language-travel companies";
(2) fill the [catch rate] gap after the first `node scripts/review-eval.js` run, or delete that sentence.

---

**Title:** The biggest language school is hiring someone to check its AI. Your provider should be doing the same.

**Article text:**

If your language-training provider uses AI, ask one question: how do you know the AI output is right? A good provider can show you the checks. A weak one says "a teacher looks at it".

This month EF Language Abroad advertised a new role: an AI Product Manager. The job is to find where AI helps students, from the first enquiry to the booking. But most of the ad is about quality. The person must build test sets, collect failure cases, set guardrails and decide when a model's output is "good enough to ship". The ad even asks for someone who will "bring a prototype where others would bring a slide".

That is the right order. First prove the output is correct. Then put it in front of learners.

## Why this matters when you buy training

AI makes practice material fast and cheap. It also makes mistakes that look correct: a quiz with two right answers, a grammar rule that is wrong, a reading text far above your team's level. A learner can't see these mistakes. That is why they are dangerous.

## What I do

I use AI every day to build practice material. Every piece goes through three checks before a learner sees it:

1. **Automatic checks.** Software rejects a page if the answer key does not match the options, if the scoring is missing, or if the wrong language appears.
2. **An AI reviewer with a test.** A second AI model reviews each page against a written style contract. I test that reviewer with 16 pages that contain planted mistakes: a wrong answer key, a second correct option, a wrong fact, a text above the learners' level. [catch rate: "It currently catches N of 14."]
3. **A teacher.** I read the result. When AI drafts written feedback for a learner, I check it before it is sent.

## Five questions to ask your provider

1. Where do you use AI: material, feedback, assessment, or none?
2. How do you check AI output before my team sees it?
3. Can you show me a mistake your checks caught?
4. Does my employees' writing go to an AI service? Which one, and did they agree?
5. Who is responsible when the AI is wrong?

A provider who answers all five clearly is using AI well. One who cannot answer the second question is guessing.

If you want to see how this works for a real team, look at how we build [Business English training for companies](https://englishonline.training/business-english/).
