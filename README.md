# E-Waste Segregation ♻️

A small, responsive, **working browser prototype** built from the original HTML/CSS/JavaScript example. No backend, database, packages, build step, or API keys required.

## Features

- Add a breadboard, motherboard, wire/cable, charger/adapter, battery, or other electronic item.
- Select a condition and optionally upload a photo (compressed to a small thumbnail).
- Automatically sort into **Repair**, **Resale**, or **Recycle**.
- View category counts and saved submissions; remove individual entries or clear them all.
- Save items locally in the browser using `localStorage`, surviving page refreshes.
- Works on desktop and mobile browsers.

## Run locally

Open `index.html` in a browser, or run a static local server from this directory:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Publish on GitHub Pages

1. Create a public GitHub repository named `e-waste-segregation`.
2. Add `index.html`, `styles.css`, `app.js`, and `README.md` to the repository's `main` branch (or push this project using Git).
3. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, **main**, and **/(root)**, then save.
4. When GitHub Pages has deployed, open `https://YOUR-USERNAME.github.io/e-waste-segregation/`.

## Push with Git

```bash
git init
git add index.html styles.css app.js README.md
git commit -m "Build e-waste segregation prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/e-waste-segregation.git
git push -u origin main
```

If this folder already contains a Git repository, skip `git init` and replace the origin as needed.

## Important limitations

This is a **rules-based prototype, not an AI classifier**. The selected condition determines the result; the uploaded photo is not analyzed. Every battery goes to the recycle category. It does not verify recycler certifications, arrange collection, list items for real sale, or sync between users. All information stays in the current browser and may be erased by clearing browser/site data. Battery collection and disposal should follow applicable local rules and authorized e-waste channels.
