# Daymark — flexible daily-hours tracker

A lightweight task tracker designed around **daily effort targets, not a timetable**. It is a static website and works on GitHub Pages without a backend, build step, or dependencies.

## Features
- Add and remove tasks on the separate Settings page.
- Set a daily target for each task in half-hour increments.
- Log hours with `+` and `−` buttons (each click changes the total by 0.5 hours).
- Track overall daily hours, task-level progress, and how many targets you've met.
- Extra hours are allowed; progress bars cap at 100%, but the hour count continues.
- Task list and daily logs persist in this browser using `localStorage`.
- Export a JSON backup from Settings.

## Publish on GitHub Pages
1. Create a GitHub repository, for example `daymark`.
2. Upload `index.html`, `settings.html`, `styles.css`, `app.js`, and this README to the repository's root.
3. Open **Settings → Pages** in the repository.
4. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/(root)`, then Save.
5. Wait for GitHub Pages to publish. The site URL will be shown in that Pages section.

## Important data note
This version saves data in the browser that you use to access the site. It does **not** sync between devices or browsers, and clearing browser site data can erase your tracker. Use **Export backup** periodically if the history matters to you.

## Daily behaviour
Hours are recorded against the current local calendar date. The dashboard starts a new daily count automatically when the date changes, while previous dates remain in local storage. Targets are per-task daily targets. Hours can exceed a target (for example, `5 / 4`).

## Local preview
Open `index.html` in a browser. Since there is no server-side functionality, the core app works as a static site.
