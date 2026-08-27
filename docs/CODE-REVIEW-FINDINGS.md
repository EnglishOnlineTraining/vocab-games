# Code Review Findings

Review date: 2026-08-27

This document records confirmed issues found during a review of the shared exercise framework and submission flow.

## 1. Submission success is not confirmed

**Severity:** High  
**File:** [`exercise.js`](../exercise.js#L734-L763)

### Problem

Submissions use `fetch()` with `mode: 'no-cors'`. A cross-origin no-cors request returns an opaque response, so the browser cannot expose the HTTP status or response body to the page. The current success handler runs whenever the request promise resolves, even if the server returned an HTTP error.

The Apps Script handler also catches internal errors and returns an error message as ordinary output, which can still have an HTTP 200 status.

### Impact

A student may see "Submitted to teacher!" and have the exercise marked complete even though the webhook or spreadsheet rejected the submission. The email fallback is shown only after a rejected browser request, not after an application-level failure.

### Reproduction

Block the webhook request in browser developer tools, or temporarily replace `fetch` with a promise that resolves to an HTTP 500 response. The success branch still executes for any resolved request.

### Recommended fix

Use a submission endpoint that provides a verifiable acknowledgement, or change the flow so that no-cors submission is explicitly treated as unconfirmed. Keep the email fallback available whenever delivery cannot be confirmed.

## 2. Spreadsheet formula injection

**Severity:** High  
**File:** [`apps-script.gs`](../apps-script.gs#L30-L35), [`apps-script.gs`](../apps-script.gs#L63-L122)

### Problem

Publicly submitted values are written directly to Google Sheets with `appendRow()`. This includes names, classes, free-text answers, and values flattened from answer objects.

A value beginning with `=`, `+`, `-`, or `@` can be interpreted by a spreadsheet as a formula rather than plain text. For example, a submitted name such as `=HYPERLINK("https://example.com","open")` could become an active formula when the sheet is opened.

### Impact

An attacker can inject formulas into teacher-facing spreadsheets. Depending on spreadsheet settings and the formula used, this can create misleading content, links, or external data access when the sheet recalculates.

### Reproduction

Send a payload containing a formula-like name:

```sh
curl -X POST "$APPS_SCRIPT_URL" \
  --data-urlencode 'payload={"unit":"test","name":"=HYPERLINK(\"https://example.com\",\"open\")","cls":"9A"}'
```

### Recommended fix

Sanitize every user-controlled string before writing it to Sheets. A common mitigation is to prefix formula-like values with an apostrophe, while preserving the original value for any non-spreadsheet processing. Apply the protection in the shared write path and in the custom-layout paths.

## 3. Completion tracking uses incompatible keys

**Severity:** Medium  
**Files:** [`exercise.js`](../exercise.js#L131-L157), [`activities.html`](../activities.html#L777-L789), [`dashboard.html`](../dashboard.html#L286-L325)

### Problem

The exercise framework stores progress under the page's `UNIT` value. The activities page and dashboard derive their lookup key by removing `.html` from the filename.

These identifiers are not always the same. Current examples include:

- `7c-holidays.html` stores `holidays-7c`
- `7c-robert-the-bruce.html` stores `robert-the-bruce-7c`
- `be-brand-positioning.html` stores `business-brand-positioning`
- `9g-california-hazards.html` stores `california-hazards`

A repository-wide comparison found 14 such mismatches.

### Impact

Completed badges, dashboard completion totals, category progress, and resume links fail to recognise those exercises even though the local-storage record exists.

### Recommended fix

Use the generated exercise metadata's real `UNIT` value everywhere. The filename should remain the URL/link target, but it should not also be treated as the progress identifier. Add a shared `file -> unit` mapping or emit the unit as a data attribute on generated cards.

## 4. Submission requests have no timeout

**Severity:** Low  
**File:** [`exercise.js`](../exercise.js#L749-L763)

### Problem

The submission request has no `AbortController` or timeout. A stalled connection can leave the submit button disabled while the browser waits indefinitely.

### Impact

Students on unreliable or restricted school networks may receive no useful feedback and may not discover the email fallback.

### Recommended fix

Abort the request after a short timeout, restore the button state, show a failure message, and display the email fallback. The timeout should cover network stalls without interrupting normal submissions.

## Validation performed

The following checks passed on 2026-08-27:

- `node test-scoring.js`
- `node scripts/validate-schema.js`
- `node scripts/build.js --check`
- JavaScript syntax checks for all `.js` files

`node scripts/validate-explanations.js` completed without hard errors but reported 29 warnings for dynamically generated or statically unverifiable selects. These warnings should be reviewed separately if the validator is expected to enforce complete answer-option validation.
