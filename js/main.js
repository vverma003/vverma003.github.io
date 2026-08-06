// Load Tab HTML dynamically into #content-area
function loadTab(tabName, evt) {
  const contentArea = document.getElementById('content-area');

  // Update navbar active state
  if (evt) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    evt.currentTarget.classList.add('active');
  }

  fetch(`tabs/${tabName}.html`)
    .then(response => {
      if (!response.ok) throw new Error(`Could not load tabs/${tabName}.html`);
      return response.text();
    })
    .then(html => {
      contentArea.innerHTML = html;

      // If the loaded tab is 'publications', update counts & run initial filtering
      if (tabName === 'publications') {
        updatePublicationCounts();
        sortPublicationsByYear();
      }
    })
    .catch(err => {
      contentArea.innerHTML = `<div class="card"><p style="color:#ef4444;">Error loading tab: ${err.message}</p></div>`;
    });
}

// Load default tab on page startup
document.addEventListener('DOMContentLoaded', () => {
  loadTab('about');
});

/* --- Filtering Functions --- */
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

/* Helper Function: Sort Visible Publications by Year (Descending) */
function sortPublicationsByYear() {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  // Select all publication cards
  const pubCards = Array.from(pubSection.querySelectorAll('.pub-item'));

  // Sort array based on the year extracted from .date-inline
  pubCards.sort((a, b) => {
    const yearA = parseInt(a.querySelector('.date-inline')?.textContent || '0', 10);
    const yearB = parseInt(b.querySelector('.date-inline')?.textContent || '0', 10);
    return yearB - yearA; // Descending order (newest first)
  });

  // Re-append cards to DOM in sorted order
  pubCards.forEach(card => pubSection.appendChild(card));
}

/* Update Counts Function (Safe against missing elements) */
function updatePublicationCounts() {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  // Helper to safely assign text content if element exists
  const setBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) el.textContent = `(${count})`;
  };

  // Main Category Counts
  const journalCards = pubSection.querySelectorAll('.pub-item[data-type="journals"]');
  const conferenceCards = pubSection.querySelectorAll('.pub-item[data-type="conferences"]');
  const codeCards = pubSection.querySelectorAll('.pub-item[data-type="codes"]');
  const dissertationCards = pubSection.querySelectorAll('.pub-item[data-type="dissertation"]');

  setBadge('count-journals', journalCards.length);
  setBadge('count-conferences', conferenceCards.length);
  setBadge('count-codes', codeCards.length);
  setBadge('count-dissertation', dissertationCards.length);

  // Journal Sub-Filter Counts
  const sciJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="sci"]');
  const scopusJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="scopus"]');
  const workingJournals = pubSection.querySelectorAll('.pub-item[data-type="journals"][data-scope="working"]');

  setBadge('count-journals-all', journalCards.length);
  setBadge('count-journals-sci', sciJournals.length);
  setBadge('count-journals-scopus', scopusJournals.length);
  setBadge('count-journals-working', workingJournals.length);

  // Conference Sub-Filter Counts
  const intConferences = pubSection.querySelectorAll('.pub-item[data-type="conferences"][data-scope="international"]');
  const natConferences = pubSection.querySelectorAll('.pub-item[data-type="conferences"][data-scope="national"]');

  setBadge('count-conferences-all', conferenceCards.length);
  setBadge('count-conferences-international', intConferences.length);
  setBadge('count-conferences-national', natConferences.length);
}

/* Main Category Switcher */
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

/* Sub-filtering Journals */
function filterJournals(scope, evt) {
  const subContainer = document.getElementById('journal-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else if (btns[0]) btns[0].classList.add('active');

  // Hide all non-journal items
  document.querySelectorAll('.conf-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');

  // Show matching journal items
  document.querySelectorAll('.journal-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  sortPublicationsByYear();
}

/* Sub-filtering Conferences */
function filterConferences(scope, evt) {
  const subContainer = document.getElementById('conference-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else if (btns[0]) btns[0].classList.add('active');

  // Hide all non-conference items
  document.querySelectorAll('.journal-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');

  // Show matching conference items
  document.querySelectorAll('.conf-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  sortPublicationsByYear();
}

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

/* --- Modal Reader Functions --- */
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

/* --- Upvote & Comment Functions --- */
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