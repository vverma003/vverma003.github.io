/* ==========================================================================
   GLOBAL STATE & CACHING
   ========================================================================== */
let cachedPublicationsHTML = null;
let cachedProjectsHTML = null;

/* ==========================================================================
   MOBILE MENU TOGGLE HANDLER
   ========================================================================== */
function setupMobileMenu() {
  const menuBtn = document.getElementById('menu-toggle');
  const navTabs = document.getElementById('nav-tabs');

  if (menuBtn && navTabs) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      navTabs.classList.toggle('is-active');
    });

    // Close menu when clicking anywhere outside
    document.addEventListener('click', function (e) {
      if (!navTabs.contains(e.target) && !menuBtn.contains(e.target)) {
        navTabs.classList.remove('is-active');
      }
    });
  }
}

/* ==========================================================================
   SCHOLAR METRICS FETCH
   ========================================================================== */
function loadScholarMetrics() {
  fetch(`./metrics.json?v=${new Date().getTime()}`)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const citationsEl = document.getElementById('metric-citations');
      const hindexEl = document.getElementById('metric-hindex');
      const i10indexEl = document.getElementById('metric-i10index');

      if (citationsEl) citationsEl.innerText = data.citations ?? data.cited_by_count ?? '--';
      if (hindexEl) hindexEl.innerText = data.h_index ?? '--';
      if (i10indexEl) i10indexEl.innerText = data.i10_index ?? '--';
    })
    .catch(err => console.error('Scholar metrics fetch error:', err));
}

/* ==========================================================================
   CORE TAB ROUTING & LOADING (HASH-BASED)
   ========================================================================== */
function loadTab(tabName, evt) {
  const contentArea = document.getElementById('content-area');
  const navTabs = document.getElementById('nav-tabs');

  // Auto-close mobile menu on selection
  if (navTabs) {
    navTabs.classList.remove('is-active');
  }

  if (!contentArea) return;

  // 1. Update Navigation Active State
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  } else {
    const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      return onclickAttr.includes(`'${tabName}'`);
    });
    if (targetBtn) targetBtn.classList.add('active');
  }

  // 2. Hash-based Routing
  if (window.location.hash !== `#${tabName}`) {
    history.pushState({ tab: tabName }, '', `#${tabName}`);
  }

  // 3. Fetch Tab HTML
  fetch(`tabs/${tabName}.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Could not load tabs/${tabName}.html`);
      return response.text();
    })
    .then(html => {
      contentArea.innerHTML = html;

      if (tabName === 'about') {
        setTimeout(loadScholarMetrics, 50);
      } else if (tabName === 'publications') {
        cachedPublicationsHTML = html;
        updatePublicationCounts();
        sortPublicationsByYear();
      } else if (tabName === 'projects') {
        cachedProjectsHTML = html;
        sortProjectsByYear();
      } else if (tabName === 'research') {
        initResearchThemeView('public-transport');
      }
    })
    .catch(err => {
      contentArea.innerHTML = `<div class="card"><p style="color:#ef4444;">Error loading tab: ${err.message}</p></div>`;
    });
}

// Router Initializer via Hash
function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '').trim();
  const validTabs = ['about', 'publications', 'projects', 'research', 'talks', 'blog', 'news'];
  const targetTab = validTabs.includes(hash) ? hash : 'about';
  loadTab(targetTab);
}

// Page initialization
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  handleHashNavigation();
});

window.addEventListener('popstate', handleHashNavigation);

/* ==========================================================================
   PUBLICATIONS & PROJECTS FILTERING & SORTING
   ========================================================================== */
function filterItems(sectionId, filterGroup, evt) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.project-item').forEach(item => {
    const itemCat = item.getAttribute('data-category');
    item.style.display = (filterGroup === 'all' || itemCat === filterGroup) ? 'block' : 'none';
  });
}

function sortProjectsByYear() {
  const projectSection = document.getElementById('projects');
  if (!projectSection) return;

  const projectCards = Array.from(projectSection.querySelectorAll('.project-item'));

  projectCards.sort((a, b) => {
    const getTime = (card) => {
      const dataDate = card.getAttribute('data-date');
      if (dataDate) return new Date(dataDate).getTime();

      const dateText = card.querySelector('.date-inline')?.textContent?.trim() || '';
      const startDateStr = dateText.split('-')[0].trim();
      const parsedDate = new Date(startDateStr);

      if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();

      const yearMatch = dateText.match(/\b(19|20)\d{2}\b/);
      return yearMatch ? new Date(parseInt(yearMatch[0], 10), 0, 1).getTime() : 0;
    };

    return getTime(b) - getTime(a);
  });

  projectCards.forEach(card => projectSection.appendChild(card));
}

function sortPublicationsByYear() {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  const pubCards = Array.from(pubSection.querySelectorAll('.pub-item'));

  pubCards.sort((a, b) => {
    const scopeA = a.getAttribute('data-scope');
    const scopeB = b.getAttribute('data-scope');

    if (scopeA === 'working' && scopeB !== 'working') return -1;
    if (scopeA !== 'working' && scopeB === 'working') return 1;

    const getTime = (card) => {
      const dataDate = card.getAttribute('data-date');
      if (dataDate) return new Date(dataDate).getTime();

      const dateText = card.querySelector('.date-inline')?.textContent?.trim() || '';
      const cleanedDateStr = dateText.replace(/-(\d+)/, '');
      const parsedDate = new Date(cleanedDateStr);

      if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();

      const yearOnly = parseInt(dateText, 10);
      return !isNaN(yearOnly) ? new Date(yearOnly, 0, 1).getTime() : 0;
    };

    return getTime(b) - getTime(a);
  });

  pubCards.forEach(card => pubSection.appendChild(card));
}

function updatePublicationCounts() {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  const setBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `(${count})`;
  };

  const journalCards = pubSection.querySelectorAll('.pub-item[data-type="journals"]');
  const conferenceCards = pubSection.querySelectorAll('.pub-item[data-type="conferences"]');
  const codeCards = pubSection.querySelectorAll('.pub-item[data-type="codes"]');
  const dissertationCards = pubSection.querySelectorAll('.pub-item[data-type="dissertation"]');

  setBadge('count-journals', journalCards.length);
  setBadge('count-conferences', conferenceCards.length);
  setBadge('count-codes', codeCards.length);
  setBadge('count-dissertation', dissertationCards.length);

  const sciJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="sci"]');
  const scopusJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="scopus"]');
  const workingJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="working"]');

  setBadge('count-journals-all', journalCards.length);
  setBadge('count-journals-sci', sciJournals.length);
  setBadge('count-journals-scopus', scopusJournals.length);
  setBadge('count-journals-working', workingJournals.length);

  const intConferences = pubSection.querySelectorAll('.pub-item[data-type="conferences"][data-scope="international"]');
  const natConferences = pubSection.querySelectorAll('.pub-item[data-type="conferences"][data-scope="national"]');

  setBadge('count-conferences-all', conferenceCards.length);
  setBadge('count-conferences-international', intConferences.length);
  setBadge('count-conferences-national', natConferences.length);
}

function selectPublicationType(type, evt) {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  pubSection.querySelectorAll('.filter-controls .filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  const jSub = document.getElementById('journal-subfilters');
  const cSub = document.getElementById('conference-subfilters');
  const allPubs = pubSection.querySelectorAll('.pub-item');

  if (type === 'journals') {
    if (jSub) jSub.style.display = 'flex';
    if (cSub) cSub.style.display = 'none';
    filterJournals('all');
  } else if (type === 'conferences') {
    if (jSub) jSub.style.display = 'none';
    if (cSub) cSub.style.display = 'flex';
    filterConferences('all');
  } else {
    if (jSub) jSub.style.display = 'none';
    if (cSub) cSub.style.display = 'none';

    allPubs.forEach(pub => {
      pub.style.display = (pub.getAttribute('data-type') === type) ? 'block' : 'none';
    });
    sortPublicationsByYear();
  }
}

function filterJournals(scope, evt) {
  const subContainer = document.getElementById('journal-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else if (btns[0]) btns[0].classList.add('active');

  document.querySelectorAll('.conf-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');
  document.querySelectorAll('.journal-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  sortPublicationsByYear();
}

function filterConferences(scope, evt) {
  const subContainer = document.getElementById('conference-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else if (btns[0]) btns[0].classList.add('active');

  document.querySelectorAll('.journal-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');
  document.querySelectorAll('.conf-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  sortPublicationsByYear();
}

/* ==========================================================================
   BLOG & NEWS FILTERING
   ========================================================================== */
function filterNews(year, evt) {
  const section = document.getElementById('news');
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.news-year-card').forEach(card => {
    card.style.display = (year === 'all' || card.getAttribute('data-year') === year) ? 'block' : 'none';
  });
}

function filterBlogs(category, evt) {
  const section = document.getElementById('blog');
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.blog-card').forEach(card => {
    card.style.display = (category === 'all' || card.getAttribute('data-category') === category) ? 'block' : 'none';
  });
}

/* ==========================================================================
   RESEARCH THEME ENGINE
   ========================================================================== */
async function initResearchThemeView(themeKey) {
  if (!cachedPublicationsHTML) {
    try {
      const res = await fetch('tabs/publications.html');
      cachedPublicationsHTML = await res.text();
    } catch(e) { console.error('Error prefetching publications:', e); }
  }

  if (!cachedProjectsHTML) {
    try {
      const res = await fetch('tabs/projects.html');
      cachedProjectsHTML = await res.text();
    } catch(e) { console.error('Error prefetching projects:', e); }
  }

  renderThemeCards(themeKey);
}

function filterResearchTheme(themeKey, evt) {
  const section = document.getElementById('research-themes');
  if (!section) return;

  section.querySelectorAll('.filter-controls .filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  renderThemeCards(themeKey);
}

function renderThemeCards(themeKey) {
  const pubDoc = new DOMParser().parseFromString(cachedPublicationsHTML || '', 'text/html');
  const projDoc = new DOMParser().parseFromString(cachedProjectsHTML || '', 'text/html');

  const projectsGroup = document.getElementById('theme-projects-group');
  const projectsList = document.getElementById('theme-projects-list');
  const pubsGroup = document.getElementById('theme-pubs-group');
  const journalsContainer = document.getElementById('theme-journals-container');
  const journalsList = document.getElementById('theme-journals-list');
  const confsContainer = document.getElementById('theme-conferences-container');
  const confsList = document.getElementById('theme-conferences-list');

  if (!projectsList || !journalsList || !confsList) return;

  projectsList.innerHTML = '';
  journalsList.innerHTML = '';
  confsList.innerHTML = '';

  const matchedProjects = projDoc.querySelectorAll(`.project-item[data-theme~="${themeKey}"]`);
  if (matchedProjects.length > 0) {
    projectsGroup.style.display = 'block';
    matchedProjects.forEach(card => {
      const clone = card.cloneNode(true);
      clone.style.display = 'block';
      projectsList.appendChild(clone);
    });
  } else {
    projectsGroup.style.display = 'none';
  }

  const matchedJournals = pubDoc.querySelectorAll(`.journal-item[data-theme~="${themeKey}"]`);
  if (matchedJournals.length > 0) {
    journalsContainer.style.display = 'block';
    matchedJournals.forEach(card => {
      const clone = card.cloneNode(true);
      clone.style.display = 'block';
      journalsList.appendChild(clone);
    });
  } else {
    journalsContainer.style.display = 'none';
  }

  const matchedConfs = pubDoc.querySelectorAll(`.conf-item[data-theme~="${themeKey}"]`);
  if (matchedConfs.length > 0) {
    confsContainer.style.display = 'block';
    matchedConfs.forEach(card => {
      const clone = card.cloneNode(true);
      clone.style.display = 'block';
      confsList.appendChild(clone);
    });
  } else {
    confsContainer.style.display = 'none';
  }

  pubsGroup.style.display = (matchedJournals.length + matchedConfs.length > 0) ? 'block' : 'none';
}

/* ==========================================================================
   MODAL CONTROLS & INTERACTIVE FEATURES
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function closeModalOutside(event, modalId) {
  if (event.target === document.getElementById(modalId)) closeModal(modalId);
}

function toggleUpvote(postId) {
  const card = document.getElementById(postId);
  if (!card) return;

  const btn = card.querySelector('.upvote-btn');
  const countSpan = card.querySelector('.upvote-count');
  let currentCount = parseInt(countSpan.textContent, 10);

  if (btn.classList.contains('upvoted')) {
    btn.classList.remove('upvoted');
    countSpan.textContent = currentCount - 1;
  } else {
    btn.classList.add('upvoted');
    countSpan.textContent = currentCount + 1;
  }
}

function addComment(postId) {
  const card = document.getElementById(postId);
  if (!card) return;

  const nameInput = card.querySelector('.comment-name');
  const msgInput = card.querySelector('.comment-msg');
  const list = card.querySelector('.comment-list');
  const countSpan = card.querySelector('.comment-count');

  const name = nameInput.value.trim() || 'Anonymous Reader';
  const msg = msgInput.value.trim();

  if (!msg) {
    alert('Please write a comment before posting.');
    return;
  }

  const li = document.createElement('li');
  li.className = 'comment-item';
  li.innerHTML = `<div class="comment-author">${name}</div><div class="comment-text">${msg}</div>`;
  list.appendChild(li);

  countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;
  nameInput.value = '';
  msgInput.value = '';
}