# Social posts

One file per post in `posts/`, named `YYYY-MM-DD-short-name.txt`. Merging the PR that adds a
file is the approval: `.github/workflows/social-post.yml` sends it once its time has passed and
records it in `posted.json` (never edit that by hand, except to delete a line to resend).

```
at: 2026-12-01T17:00+01:00
to: facebook, linkedin, x
link: https://activities.englishonline.training/9c-halloween.html
---
The post text. Blank lines are kept.
```

- `at:` Berlin time with its offset: `+01:00` in winter, `+02:00` from the last Sunday of March to
  the last Sunday of October.
- `to:` any of `facebook`, `linkedin`, `x`. Write a separate file per network when the audiences
  need different text (Facebook = learners, LinkedIn = teachers).
- `link:` optional. Facebook and LinkedIn show it as a preview card; on X it is added after the text.
- X: 280 characters, a link counts as 23. `node scripts/social-post.js --check` tests every file.
- To cancel a post before it goes out, delete its file on `main`.
- Reddit and YouTube are not automated: Reddit's learner communities ban scheduled self-promotion,
  and YouTube needs a video.

Setup and token renewal: `docs/social-media-setup.md`.
