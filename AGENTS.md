# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-12
**Commit:** 0608957
**Branch:** main

## OVERVIEW

Hugo static site for "Byteden Games" — game dev blog with posts, projects showcase, and Ko-fi integration. Retro aesthetic using MxPlus Tandy font.

## STRUCTURE

```
muscle-sim-website/
├── content/post/       # Blog posts (132 MD files, date-named)
├── layouts/            # Hugo templates
│   ├── _default/       # Base templates (baseof, single, list)
│   ├── partials/       # Reusable components (header, footer, cards)
│   └── shortcodes/     # mermaid, image, row/column
├── static/             # Assets
│   ├── css/            # style.css (main), dark.css, my_style.css
│   └── js/             # dark.js (theme toggle), bootstrap, isotope
├── public/             # Generated output (DO NOT EDIT)
├── config.toml         # Site config (menus, taxonomies, params)
└── .github/workflows/  # CI: Hugo build + Discord announcements
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| New blog post | `./hugo-new.sh TITLE` | Mac/Linux; creates `content/post/Mon-DD-YYYY-TITLE.md` |
| New post (Windows) | `create_new_post.bat` | Creates `content/post/Mon-DD-YYYY.md` |
| Site config | `config.toml` | Menus, social links, Disqus, taxonomies |
| Page templates | `layouts/_default/` | baseof.html, single.html, list.html |
| Reusable components | `layouts/partials/` | header, footer, head, cards, metadata |
| Custom shortcodes | `layouts/shortcodes/` | mermaid, image, row, column |
| Main styling | `static/css/style.css` | CSS variables, cards, navbar, content |
| Dark mode | `static/js/dark.js` + `static/css/dark.css` | localStorage-persisted toggle |
| Custom fonts | `static/css/my_style.css` | MxPlus Tandy, Cascadia Code definitions |
| Home page | `layouts/index.html` | Shows latest 50 posts + garden/projects/library sections |

## CONVENTIONS

- **Post filenames**: `YYYY-MM-DD-HH-MM-SS.md` or `Mon-DD-YYYY-title.md`
- **Custom font**: MxPlus Tandy1K-II 200L (retro aesthetic)
- **Markdown**: Goldmark with unsafe HTML enabled (for embeds)
- **Comments**: Disqus (shortname: `brawnbastion`)
- **Donations**: Ko-fi widget overlay on all pages
- **CSS variables**: Defined in `:root` in style.css (--blue, --red, --grey, etc.)

## ANTI-PATTERNS

- **NEVER** edit files in `public/` — regenerated on every build
- **NEVER** commit large binary assets to git — use `static/images/` sparingly

## COMMANDS

```bash
# Development
hugo server -D                    # Local server with drafts at localhost:1313

# Create new post
./hugo-new.sh TITLE               # Mac/Linux
create_new_post.bat               # Windows

# Build (CI handles this automatically)
hugo --gc --minify --baseURL "/"
```

## CI/CD

- **Deploy**: Push to `main` → GitHub Actions builds Hugo → deploys to GitHub Pages
- **Announcements**: New posts in `content/*.md` trigger Discord webhook notification
- **Hugo version**: 0.111.3 (extended)

## NOTES

- No package.json/npm — pure Hugo static site
- Theme: hermit (git submodule in `themes/`)
- Custom taxonomies exist (garden_tags, project_tags, library_tags) but mostly unused
- Animated background pattern in baseof.html (base64 PNG + CSS animation)
- Max container width: 800px throughout
