# LENS Photography Portfolio

Multi-page photography portfolio that **auto-populates galleries** from image folders.

## Folder Structure

```
lens-portfolio/
├── index.html              ← Homepage
├── gallery.html            ← Individual gallery pages
├── about.html
├── contact.html
├── assets/
│   ├── css/style.css
│   └── js/main.js
├── data/
│   └── galleries.json      ← Auto-generated (do not edit by hand)
├── images/
│   ├── nature/             ← Put nature photos here
│   ├── urban/              ← Put urban photos here
│   └── portraits/          ← Put portrait photos here
└── generate-galleries.js   ← Run this after adding photos
```

## How to Add New Photos (Auto-populate)

1. Create a folder inside `images/` (example: `images/weddings/`)
2. Drop your `.jpg`, `.png` or `.webp` files into that folder
3. Open a terminal in this project folder and run:

```bash
node generate-galleries.js
```

4. The script scans all folders and updates `data/galleries.json`
5. Commit and push to GitHub — your live site updates automatically

### Example

```bash
# Add new gallery
mkdir images/travel
# copy your photos into images/travel/

node generate-galleries.js
git add .
git commit -m "Add travel gallery"
git push
```

## Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload this entire folder
3. Go to **Settings → Pages**
4. Source = Deploy from branch → `main` → `/ (root)`
5. Your site will be live at `https://yourusername.github.io/repo-name`

## Notes

- Image titles are automatically generated from the filename
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- The homepage and navigation automatically list every gallery folder you create
- No build tools required beyond Node.js (only needed when adding photos)

---

Built for simplicity and speed.
