# Crimson-Development
Website for Crimson development RGE Build team.

The site is plain HTML/CSS/JS in `docs/`, served by GitHub Pages. There is no build step.

## Editing content

Everything people read lives in **`docs/js/content.js`**:

- `team` — name, role, photo, short `summary` (home page) and full `bio` (Team page)
- `posts` — dev blog posts (newest first)
- `projects` — projects, with cover photo, lore, gallery and progress `updates` (newest first)

Images go in `docs/images/` and are referenced like `"images/projects/skarvik/cover.jpg"`.

## Trading Hub

`docs/js/trades.js` runs the trading forum, the "Open a Trading Page" form and the
approval queue on `management.html`.

**Currently in preview mode:** submissions are stored in the visitor's own browser
(localStorage), so other visitors and managers can't see them. To make the forum shared,
the `store` object in `trades.js` needs to be replaced with one backed by a database
(e.g. Supabase, which has a free tier and works with static sites). It has the same
async methods: `list`, `get`, `submit`, `approve`, `remove`.

**Manager access code:** only its SHA-256 hash is in `trades.js`, but the check runs in the
browser, so it is not real security. With a database, approval should be protected by the
database's own login/permissions instead.
