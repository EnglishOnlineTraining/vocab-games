# AI Theme Guidelines (STYLE.md)

> Canonical contract for ALL AI-generated code in this theme.
> Both Kimi (author-model) and Claude (reviewer-model) must follow this file exactly.
> When this file conflicts with a model's habit, THIS FILE WINS.
> If a change genuinely cannot follow this file, the PR must explain why under "Deviations".

## 1. Hard rules (never violate)

- **Never** commit secrets, credentials, `.env` files, or production URLs.
- **Never** push directly to `main` / `master`. AI work = branch -> PR -> CI -> human merge.
- **Never** introduce a new dependency (composer/npm/plugin) without a "New dependency" section in the PR justification. Default answer is no.
- **No direct database queries** (`$wpdb->get_*`) unless the PR proves `WP_Query`/object API cannot do it.
- **Escape late**: `echo esc_html( $var )`, `esc_url()`, `esc_attr()`, `wp_kses_post()` as appropriate. Sanitize on input (`sanitize_text_field()`, etc.).
- **No PHP notices/warnings** on staging with `WP_DEBUG` on.
- **No commented-out code**, no `var_dump`, no `console.log` left in production code.
- Text domain: `TEXT_DOMAIN_TODO` -- use it in every `__()`, `_e()`, `esc_html__()` call. Never hardcode user-facing strings.
- Prefix everything: functions `theme_todo_*`, filters, options, post meta keys.

## 2. Coding standards

- WordPress Coding Standards (WPCS). PHPCS ruleset: `phpcs.xml` in repo root. PRs must pass `phpcs --standard=phpcs.xml` with **zero errors**; warnings <= existing baseline.
- PHP: match theme's minimum PHP version (see `style.css` header / README).
- JS: match existing build setup (see `package.json`). No new frameworks.
- CSS: follow existing naming convention (BEM / whatever the theme uses -- see section 5). No utility-framework additions.

## 3. Architecture patterns (match these, don't invent)

### 3.1 Enqueuing -- the ONLY correct way
```php
function theme_todo_enqueue_assets() {
    $ver = wp_get_theme()->get( 'Version' );
    wp_enqueue_style( 'theme-todo-main', get_theme_file_uri( '/assets/css/main.css' ), array(), $ver );
    wp_enqueue_script( 'theme-todo-main', get_theme_file_uri( '/assets/js/main.js' ), array(), $ver, true );
}
add_action( 'wp_enqueue_scripts', 'theme_todo_enqueue_assets' );
```
No inline styles/scripts. No enqueuing inside templates.

### 3.2 Template parts
```php
get_template_part( 'template-parts/content', 'card' );
```
Template parts live in `template-parts/`, receive data via `set_query_var()` / `$args`, never via globals.

### 3.3 Queries
`WP_Query` only; `wp_reset_postdata()` after every custom loop. Posts per page / pagination respect Reading settings or the issue's acceptance criteria.

### 3.4 Hooks over edits
Prefer filters/actions. Never edit plugin behavior by copying plugin code into the theme.

## 4. Security checklist (every PR touching input, output, or auth)

- [ ] Nonce on every form/POST handler (`wp_nonce_field` / `check_admin_referer` / `wp_verify_nonce`)
- [ ] Capability check (`current_user_can`) before any privileged action
- [ ] `sanitize_*` on all input; `esc_*` / `wp_kses_*` on all output
- [ ] No `$_GET`/`$_POST`/`$_REQUEST` accessed raw, anywhere

## 5. Existing conventions to imitate

TODO: paste 2-3 short canonical excerpts from THIS theme (a typical template file, a typical template part, a typical function in `inc/`). Models must mirror structure, naming, and comment style -- not "best practice" from the internet.

## 6. Definition of done

- [ ] `phpcs` clean (see section 2)
- [ ] Lint/build passes (`composer lint` / `npm run build`)
- [ ] No new PHP notices on staging with `WP_DEBUG` on
- [ ] Acceptance criteria from the issue all checked
- [ ] PR contains: Summary / Test plan / Deviations (or "None")
- [ ] Staged on staging site and linked in PR description

## 7. Tone for AI output

- Patches are minimal diffs. Do not reformat untouched code.
- Do not rename/refactor things the issue didn't ask about.
- If the existing pattern is questionable, flag it in "Notes for reviewer" -- do not silently change it.
