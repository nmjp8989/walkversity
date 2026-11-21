const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const servicesMenu = document.querySelector('.nav-more');

function closeNavigation() {
  navigation.removeAttribute('data-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}

menuToggle.addEventListener('click', () => {
  const open = navigation.toggleAttribute('data-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', (event) => {
  if (servicesMenu.open && !servicesMenu.contains(event.target)) {
    servicesMenu.open = false;
  }
  if (navigation.hasAttribute('data-open') && !event.target.closest('.site-header')) {
    closeNavigation();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (servicesMenu.open) {
    servicesMenu.open = false;
    servicesMenu.querySelector('summary').focus();
  } else if (navigation.hasAttribute('data-open')) {
    closeNavigation();
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
    galleryGrid.toggleAttribute('data-filtered', active.dataset.category !== 'all');
    const count = items.filter((item) => !item.hidden).length;
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
    item.addEventListener('click', () => openPhoto(item, items.filter((photo) => !photo.hidden)));
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

  const category = new URLSearchParams(location.search).get('category');
  const initial = filters.find((filter) => filter.dataset.category === category);
  if (initial) applyFilter(initial);
}

const faqForm = document.querySelector('.faq-search');
if (faqForm) {
  const input = faqForm.querySelector('input');
  const groups = [...document.querySelectorAll('.faq-group')];
  const status = document.querySelector('.faq-status');

  function filterQuestions() {
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let matches = 0;
    groups.forEach((group) => {
      const category = group.querySelector('h2').textContent.toLowerCase();
      const questions = [...group.querySelectorAll('.question')];
      questions.forEach((question) => {
        const searchable = category + ' ' + question.textContent.toLowerCase();
        question.hidden = !terms.every((term) => searchable.includes(term));
        if (!question.hidden) matches += 1;
      });
      group.hidden = questions.every((question) => question.hidden);
    });
    status.hidden = terms.length === 0;
    status.textContent = matches === 0 ? 'No questions match your search.' :
      matches + (matches === 1 ? ' question found.' : ' questions found.');
  }

  faqForm.addEventListener('submit', (event) => {
    event.preventDefault();
    filterQuestions();
  });
  input.addEventListener('input', filterQuestions);
  document.querySelectorAll('.faq-side nav a').forEach((anchor) => {
    anchor.addEventListener('click', () => {
      input.value = '';
      filterQuestions();
    });
  });
}

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
