# AI4DigiT — Website

Static website for the **AI4DigiT European Digital Innovation Hub**, built from the
project's *Communication & Dissemination Handbook (D2.1)*. No build step — plain
HTML/CSS/JS.

## Contents
- `index.html` — single-page site (Hero, Services, About, Consortium, Impact, Activities, Audiences, Newsletter, Contact)
- `styles.css` — brand system (butterfly palette, Montserrat/Open Sans, responsive, WCAG 2.1 AA focus styles)
- `script.js` — bilingual **Shqip / English** toggle (Albanian default), mobile nav, newsletter form stub
- `assets/logo.svg` — butterfly logo (four pillar colours: Coral, Peach, Sky, Mint)

## Run locally
```bash
cd website
python3 -m http.server 8765
# open http://localhost:8765
```

## Publish

**Option A — Netlify Drop (no account setup, instant):**
Go to https://app.netlify.com/drop and drag the `website/` folder onto the page.
You get a live URL in seconds.

**Option B — GitHub Pages:**
```bash
cd website
git init && git add . && git commit -m "AI4DigiT website"
gh repo create ai4digit-website --public --source=. --push   # needs gh + auth
# then: Settings → Pages → Deploy from branch → main / root
```
A `.nojekyll` file is included so the `assets/` folder is served as-is.

## To finish before go-live
- Point the newsletter form (`script.js`) to the real provider (Mailchimp / Brevo) with double opt-in.
- Add real contact email, LinkedIn URL and any social links.
- Add a Privacy/Cookie page (GDPR) and a Legal notice with the full EU funding statement and grant number.
- Replace placeholder photography per the Handbook's photography guidelines.
- Map the custom domain `www.ai4digit.eu`.

Co-funded by the European Union — Digital Europe Programme.
