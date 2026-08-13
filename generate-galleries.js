#!/usr/bin/env node
/**
 * LENS Portfolio - Gallery Generator
 * ----------------------------------
 * Scans the /images folder and creates data/galleries.json
 * so the website can auto-populate galleries.
 *
 * Usage:
 *   1. Put photos into folders: images/nature/, images/urban/, etc.
 *   2. Run:  node generate-galleries.js
 *   3. Commit & push the updated data/galleries.json to GitHub
 */

const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');
const outputFile = path.join(__dirname, 'data', 'galleries.json');

const galleries = {};

if (!fs.existsSync(imagesDir)) {
  console.error('❌  images/ folder not found. Create it first.');
  process.exit(1);
}

// Read all folders inside /images
const folders = fs.readdirSync(imagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory());

if (folders.length === 0) {
  console.warn('⚠️  No gallery folders found inside images/');
  console.warn('   Create folders like: images/nature, images/urban, images/portraits');
}

folders.forEach(dir => {
  const folderName = dir.name;
  const folderPath = path.join(imagesDir, folderName);

  const images = fs.readdirSync(folderPath)
    .filter(file => /\.(jpe?g|png|webp|gif)$/i.test(file))
    .sort()
    .map(file => {
      // Create a nice title from filename
      const title = file
        .replace(/\.[^/.]+$/, '')          // remove extension
        .replace(/[-_]+/g, ' ')            // dashes/underscores → spaces
        .replace(/\b\w/g, c => c.toUpperCase()); // capitalize words

      return {
        title: title,
        subtitle: folderName.charAt(0).toUpperCase() + folderName.slice(1),
        imageUrl: `images/${folderName}/${file}`
      };
    });

  galleries[folderName] = {
    name: folderName.charAt(0).toUpperCase() + folderName.slice(1),
    slug: folderName,
    images: images
  };
});

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(galleries, null, 2));

console.log('\n✅  galleries.json generated successfully!\n');
Object.keys(galleries).forEach(slug => {
  const count = galleries[slug].images.length;
  console.log(`   • ${slug.padEnd(15)} → ${count} image${count !== 1 ? 's' : ''}`);
});
console.log('\nNext steps:');
console.log('  1. Check data/galleries.json');
console.log('  2. git add . && git commit -m "Update galleries" && git push');
console.log('  3. Your site will update automatically on GitHub Pages\n');
