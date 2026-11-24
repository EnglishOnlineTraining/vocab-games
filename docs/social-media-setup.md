# Social media scheduler: setup

How posts work: `_social/README.md`. This file covers the one-time setup of each network's keys.
Every key goes into a GitHub secret. Run the command in Terminal, inside the repo; it asks for the
value and doesn't show it on screen. Never paste a key into a Claude chat, an issue or a file.

```bash
gh secret set FB_PAGE_TOKEN
```

A network with no secrets fails only its own posts. Set up one network, test it, then the next.

## Facebook Page (learners)

1. Go to developers.facebook.com → **My Apps → Create app**. Choose the use case for managing a Page
   (named something like "Manage everything on your Page"). Name the app e.g. "EOT scheduler".
2. Open **Tools → Graph API Explorer**. Pick the app, then **Get User Access Token** with these
   permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`.
3. Open **Tools → Access Token Debugger**, paste that token, and click **Extend Access Token**. You
   now have a long-lived (60-day) user token.
4. Back in Graph API Explorer, paste the long-lived token and run `GET me/accounts`. Find your Page
   in the list. Its `access_token` is a Page token **that does not expire**, and its `id` is the Page ID.
5. Save them: `gh secret set FB_PAGE_ID` and `gh secret set FB_PAGE_TOKEN`.

If test posts are visible only to you, the app is in Development mode. Switch it to **Live**. Meta
asks for a privacy policy URL; use the englishonline.training privacy page.

## LinkedIn personal profile (teachers)

1. Go to linkedin.com/developers → **Create app**. LinkedIn requires a Company Page to link the app
   to. Use the englishonline.training page, or create one (it can stay empty).
2. On the app's **Products** tab, add **Share on LinkedIn** and
   **Sign In with LinkedIn using OpenID Connect**.
3. On the **Auth** tab, open **OAuth 2.0 tools → Create token** with the scopes `openid`, `profile`
   and `w_member_social`. Copy the token.
4. Get your person ID: in Terminal, run the command below, paste the token when asked, and copy the
   value of `"sub"` from the reply.
   ```bash
   read -s -p "Token: " T; echo; curl -s -H "Authorization: Bearer $T" https://api.linkedin.com/v2/userinfo
   ```
5. Save them: `gh secret set LINKEDIN_TOKEN` and `gh secret set LINKEDIN_PERSON_ID`.

**The token expires after 60 days.** When it does, the workflow run fails with "LinkedIn token
expired". Repeat step 3, then `gh secret set LINKEDIN_TOKEN`. The person ID never changes.

## X

1. Go to developer.x.com and sign up for a developer account. **Check the current free allowance
   for posting first**: X has changed its API pricing several times. A few posts a week should fit
   the free allowance; don't enter payment details unless you have decided to pay.
2. In the developer portal, open your app → **User authentication settings**. Set the app
   permissions to **Read and write** and save.
3. Open **Keys and tokens**. Copy the **API Key and Secret**. Then generate the **Access Token and
   Secret**. Do this *after* step 2, or the token is read-only.
4. Save them: `gh secret set X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.

## Test a network

Add a test post with an `at:` time in the past and only that network in `to:`, merge it, then run
the workflow by hand: GitHub → **Actions → Social media posts → Run workflow**. Check the run log
and the network, then delete the test post on the network.

## Reddit and YouTube

These are not automated. Reddit's learner communities ban scheduled self-promotion, so Claude drafts
Reddit posts and you put them up yourself. YouTube needs a video: Claude writes the script, title and
description, and you upload and schedule it in YouTube Studio.
