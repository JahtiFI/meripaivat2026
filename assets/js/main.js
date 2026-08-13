// LENS Portfolio - Shared JavaScript
// Includes true viewport-based lazy loading (Intersection Observer)

// ========== Lazy Loading Engine ==========
const lazyImageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const img = entry.target;
    const realSrc = img.dataset.src;

    if (realSrc) {
      // Optional: fade-in effect
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';

      img.onload = () => {
        img.style.opacity = '1';
        img.classList.add('loaded');
      };

      img.src = realSrc;
      img.removeAttribute('data-src');
    }

    observer.unobserve(img);
  });
}, {
  // Start loading a bit before the image enters the viewport
  rootMargin: '200px 0px',
  threshold: 0.01
});

function observeLazyImages(container = document) {
  const lazyImages = container.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => lazyImageObserver.observe(img));
}

// ========== Mobile nav toggle ==========
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// ========== Lightbox ==========
let currentImages = [];
let currentIndex = 0;

function openLightbox(images, index) {
  currentImages = images;
  currentIndex = index;
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  updateLightbox();
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const img = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const subtitle = document.getElementById('lightbox-subtitle');
  if (!img) return;

  const photo = currentImages[currentIndex];
  img.src = photo.imageUrl;
  if (title) title.textContent = photo.title || '';
  if (subtitle) subtitle.textContent = photo.subtitle || '';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function showNext() {
  if (!currentImages.length) return;
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateLightbox();
}

function showPrev() {
  if (!currentImages.length) return;
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateLightbox();
}

// Lightbox event listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('lightbox-close');
  const nextBtn = document.getElementById('lightbox-next');
  const prevBtn = document.getElementById('lightbox-prev');
  const lb = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox')?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
});

// ========== Load galleries data ==========
async function loadGalleries() {
  try {
    const res = await fetch('data/galleries.json');
    if (!res.ok) throw new Error('Could not load galleries.json');
    return await res.json();
  } catch (err) {
    console.warn('Galleries data not found. Run generate-galleries.js first.', err);
    return {};
  }
}

// Populate navigation with gallery links
async function populateNavGalleries() {
  const container = document.getElementById('gallery-nav-links');
  if (!container) return;

  const galleries = await loadGalleries();
  const names = Object.keys(galleries);

  if (names.length === 0) {
    container.innerHTML = '<a href="gallery.html">All Galleries</a>';
    return;
  }

  container.innerHTML = names.map(slug => {
    const g = galleries[slug];
    return `<a href="gallery.html?g=${slug}">${g.name}</a>`;
  }).join('');
}

// Homepage gallery cards (also lazy-loaded)
async function renderHomeGalleryCards() {
  const container = document.getElementById('gallery-cards');
  if (!container) return;

  const galleries = await loadGalleries();
  const names = Object.keys(galleries);

  if (names.length === 0) {
    container.innerHTML = `
      <div class="empty-gallery" style="grid-column: 1 / -1;">
        <i class="fas fa-images"></i>
        <h3>No galleries yet</h3>
        <p>Add images to the <code>images/</code> folders and run <code>node generate-galleries.js</code></p>
      </div>`;
    return;
  }

  container.innerHTML = names.map(slug => {
    const g = galleries[slug];
    const cover = g.images[0]?.imageUrl || 'https://picsum.photos/600/400';
    const count = g.images.length;
    return `
      <a href="gallery.html?g=${slug}" class="gallery-card">
        <img data-src="${cover}" alt="${g.name}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%2316213e' width='400' height='300'/%3E%3C/svg%3E">
        <div class="gallery-card-content">
          <h3>${g.name}</h3>
          <p>${count} photograph${count !== 1 ? 's' : ''}</p>
        </div>
      </a>`;
  }).join('');

  // Start observing the cover images
  observeLazyImages(container);
}

// Gallery page renderer with true lazy loading
async function renderGalleryPage() {
  const grid = document.getElementById('gallery-grid');
  const titleEl = document.getElementById('gallery-title');
  const subtitleEl = document.getElementById('gallery-subtitle');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('g');

  const galleries = await loadGalleries();

  if (!slug || !galleries[slug]) {
    if (Object.keys(galleries).length === 0) {
      grid.innerHTML = `
        <div class="empty-gallery" style="grid-column: 1 / -1;">
          <i class="fas fa-folder-open"></i>
          <h3>No images found</h3>
          <p>1. Put photos into folders inside <code>images/</code><br>
             2. Run <code>node generate-galleries.js</code><br>
             3. Refresh this page</p>
        </div>`;
      if (titleEl) titleEl.textContent = 'Galleries';
      return;
    }

    // Redirect to first gallery
    const first = Object.keys(galleries)[0];
    window.location.href = `gallery.html?g=${first}`;
    return;
  }

  const gallery = galleries[slug];
  if (titleEl) titleEl.textContent = gallery.name;
  if (subtitleEl) subtitleEl.textContent = `${gallery.images.length} photographs`;

  if (gallery.images.length === 0) {
    grid.innerHTML = `
      <div class="empty-gallery" style="grid-column: 1 / -1;">
        <i class="fas fa-image"></i>
        <h3>This gallery is empty</h3>
        <p>Add images to <code>images/${slug}/</code> and run the generator again.</p>
      </div>`;
    return;
  }

  // Use data-src instead of src — images only load when visible
  grid.innerHTML = gallery.images.map((photo, index) => `
    <div class="gallery-item" data-index="${index}">
      <img 
        data-src="${photo.imageUrl}" 
        alt="${photo.title}"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%2316213e' width='400' height='300'/%3E%3C/svg%3E"
      >
      <div class="overlay">
        <h3>${photo.title}</h3>
        <span>${photo.subtitle}</span>
      </div>
    </div>
  `).join('');

  // Attach click handlers for lightbox
  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.index, 10);
      openLightbox(gallery.images, idx);
    });
  });

  // Start observing all gallery images
  observeLazyImages(grid);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  populateNavGalleries();
  renderHomeGalleryCards();
  renderGalleryPage();
});
