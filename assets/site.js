const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const servicesMenu = document.querySelector('.nav-more');
const mobileLayout = window.matchMedia('(max-width: 1000px)');
const pageContent = document.querySelectorAll('main, .site-footer');

function setNavigation(open) {
  navigation.toggleAttribute('data-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  pageContent.forEach((element) => { element.inert = open; });
  if (!open) servicesMenu.open = false;
}

menuToggle.addEventListener('click', () => setNavigation(!navigation.hasAttribute('data-open')));
mobileLayout.addEventListener('change', () => {
  if (!mobileLayout.matches && navigation.hasAttribute('data-open')) setNavigation(false);
});

document.addEventListener('click', (event) => {
  if (servicesMenu.open && !servicesMenu.contains(event.target)) {
    servicesMenu.open = false;
  }
  if (navigation.hasAttribute('data-open') && !event.target.closest('.site-header')) {
    setNavigation(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (servicesMenu.open) {
    servicesMenu.open = false;
    servicesMenu.querySelector('summary').focus();
  } else if (navigation.hasAttribute('data-open')) {
    setNavigation(false);
    menuToggle.focus();
  }
});

const galleryGrid = document.querySelector('.gallery-grid');
if (galleryGrid) {
  const filters = [...document.querySelectorAll('.filter')];
  const items = [...galleryGrid.querySelectorAll('.gallery-item')];
  const status = document.querySelector('.gallery-status');
  const dialog = document.querySelector('.lightbox');
  const displayImage = dialog.querySelector('img');
  const displayTitle = dialog.querySelector('h2');
  const displayLocation = dialog.querySelector('.lightbox-location');
  const controls = dialog.querySelector('.lightbox-nav');
  const slides = [...document.querySelectorAll('.preview-cards button')];
  const loadMore = document.querySelector('.gallery-more');
  const gallerySection = document.querySelector('.gallery-section');
  const actionSection = document.querySelector('.gallery-action');
  let expanded = false;

  function visibleItems() {
    const current = items.filter((item) => !item.hidden && item.getClientRects().length > 0);
    if (!mobileLayout.matches) return current;
    return current.sort((left, right) =>
      (Number(left.dataset.mobileOrder) || Infinity) - (Number(right.dataset.mobileOrder) || Infinity)
    );
  }
  let group = [];
  let currentIndex = 0;

  function applyFilter(active) {
    filters.forEach((filter) => {
      filter.setAttribute('aria-pressed', String(filter === active));
    });
    items.forEach((item) => {
      item.hidden = active.dataset.category !== 'all' &&
        !item.dataset.categories.split(' ').includes(active.dataset.category);
    });
    const filtered = active.dataset.category !== 'all';
    galleryGrid.toggleAttribute('data-filtered', filtered);
    gallerySection.toggleAttribute('data-filtered', filtered);
    loadMore.hidden = filtered;
    const count = visibleItems().length;
    status.textContent = count === 1 ? '1 campaign shown' : count + ' campaigns shown';
  }

  function showPhoto(button) {
    const image = button.querySelector('img');
    displayImage.src = image.currentSrc || image.src;
    displayImage.alt = image.alt;
    displayTitle.textContent = button.dataset.title;
    displayLocation.textContent = button.dataset.location;
  }

  function openPhoto(button, photos) {
    group = photos;
    currentIndex = photos.indexOf(button);
    controls.hidden = photos.length < 2;
    showPhoto(button);
    dialog.showModal();
  }

  function movePhoto(direction) {
    currentIndex = (currentIndex + direction + group.length) % group.length;
    showPhoto(group[currentIndex]);
  }

  filters.forEach((filter) => filter.addEventListener('click', () => applyFilter(filter)));
  items.forEach((item) => {
    item.addEventListener('click', () => openPhoto(item, visibleItems()));
  });
  slides.forEach((slide) => slide.addEventListener('click', () => openPhoto(slide, slides)));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-previous]').addEventListener('click', () => movePhoto(-1));
  dialog.querySelector('[data-next]').addEventListener('click', () => movePhoto(1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') movePhoto(-1);
    if (event.key === 'ArrowRight') movePhoto(1);
  });

  loadMore.addEventListener('click', () => {
    expanded = !expanded;
    galleryGrid.toggleAttribute('data-expanded', expanded);
    actionSection.toggleAttribute('data-expanded', expanded);
    loadMore.setAttribute('aria-expanded', String(expanded));
    loadMore.firstChild.textContent = expanded ? 'Show Fewer Photos ' : 'View More Photos ';
  });

  const category = new URLSearchParams(location.search).get('category');
  const initial = filters.find((filter) => filter.dataset.category === category);
  if (initial) applyFilter(initial);
}

const campaignFilters = [...document.querySelectorAll('[data-campaign-filter]')];
const campaignCards = [...document.querySelectorAll('[data-campaign-categories]')];

campaignFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    campaignFilters.forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
    const category = filter.dataset.campaignFilter;
    campaignCards.forEach((card) => {
      card.hidden = category !== 'all' && !card.dataset.campaignCategories.split(' ').includes(category);
    });
  });
});

document.querySelectorAll('[data-inquiry]').forEach((form) => {
  const area = form.querySelector('[data-required-group]');
  const firstLocation = area?.querySelector('input');
  const feedback = form.querySelector('.form-feedback');

  function validateLocations() {
    if (!firstLocation) return;
    firstLocation.setCustomValidity(area.querySelector('input:checked') ? '' : 'Select at least one campaign location.');
  }

  area?.addEventListener('change', validateLocations);
  validateLocations();

  const other = form.querySelector('input[value="Other (please specify)"]');
  const otherField = form.querySelector('[data-other-location]');
  other?.addEventListener('change', () => {
    otherField.hidden = !other.checked;
    const input = otherField.querySelector('input[type="text"]');
    input.disabled = !other.checked;
    input.required = other.checked;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = new FormData(form);
    const lines = [...new Set(fields.keys())].map((name) => name + ': ' + fields.getAll(name).join(', '));
    const body = encodeURIComponent(lines.join('\r\n'));
    const mail = 'mailto:info@walkvertising.ca?subject=' + encodeURIComponent(form.dataset.inquiry) + '&body=' + body;
    const link = document.createElement('a');
    link.href = mail;
    link.textContent = 'Open the email draft';
    feedback.replaceChildren('Your request is ready. ', link, ' and send it to Walkvertising.');
    window.location.href = mail;
  });
});
