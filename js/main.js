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
  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  section.querySelectorAll('.project-item').forEach(item => {
    const itemCat = item.getAttribute('data-category');
    item.style.display = (filterGroup === 'all' || itemCat === filterGroup) ? 'block' : 'none';
  });
}

function selectPublicationType(type, evt) {
  const pubSection = document.getElementById('publications');
  
  // Highlight active main category filter button
  pubSection.querySelectorAll('.filter-controls .filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  const jSub = document.getElementById('journal-subfilters');
  const cSub = document.getElementById('conference-subfilters');

  // Get all publication items
  const allPubs = pubSection.querySelectorAll('.pub-item');

  if (type === 'journals') {
    jSub.style.display = 'flex';
    cSub.style.display = 'none';
    filterJournals('all');
  } else if (type === 'conferences') {
    jSub.style.display = 'none';
    cSub.style.display = 'flex';
    filterConferences('all');
  } else {
    // Hide both sub-filter rows for Codes & Dissertation
    jSub.style.display = 'none';
    cSub.style.display = 'none';

    // Show only items matching the selected type
    allPubs.forEach(pub => {
      pub.style.display = (pub.getAttribute('data-type') === type) ? 'block' : 'none';
    });
  }
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

function updatePublicationCounts() {
  // Main Category Counts
  const journalCards = document.querySelectorAll('.pub-item[data-type="journals"]');
  const conferenceCards = document.querySelectorAll('.pub-item[data-type="conferences"]');
  const codeCards = document.querySelectorAll('.pub-item[data-type="codes"]');
  const dissertationCards = document.querySelectorAll('.pub-item[data-type="dissertation"]');

  document.getElementById('count-journals').textContent = `(${journalCards.length})`;
  document.getElementById('count-conferences').textContent = `(${conferenceCards.length})`;
  document.getElementById('count-codes').textContent = `(${codeCards.length})`;
  document.getElementById('count-dissertation').textContent = `(${dissertationCards.length})`;

  // Journal Sub-Filter Counts
  const sciJournals = document.querySelectorAll('.pub-item[data-type="journals"][data-scope="sci"]');
  const scopusJournals = document.querySelectorAll('.pub-item[data-type="journals"][data-scope="scopus"]');
  const workingJournals = document.querySelectorAll('.pub-item[data-type="journals"][data-scope="working"]');

  document.getElementById('count-journals-all').textContent = `(${journalCards.length})`;
  document.getElementById('count-journals-sci').textContent = `(${sciJournals.length})`;
  document.getElementById('count-journals-scopus').textContent = `(${scopusJournals.length})`;
  document.getElementById('count-journals-working').textContent = `(${workingJournals.length})`;

  // Conference Sub-Filter Counts
  const intConferences = document.querySelectorAll('.pub-item[data-type="conferences"][data-scope="international"]');
  const natConferences = document.querySelectorAll('.pub-item[data-type="conferences"][data-scope="national"]');

  document.getElementById('count-conferences-all').textContent = `(${conferenceCards.length})`;
  document.getElementById('count-conferences-international').textContent = `(${intConferences.length})`;
  document.getElementById('count-conferences-national').textContent = `(${natConferences.length})`;
}

// Run on page load
document.addEventListener('DOMContentLoaded', updatePublicationCounts);

/* Main Category Switcher */
function selectPublicationType(type, evt) {
  const pubSection = document.getElementById('publications');
  
  pubSection.querySelectorAll('.filter-controls .filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  const jSub = document.getElementById('journal-subfilters');
  const cSub = document.getElementById('conference-subfilters');
  const allPubs = pubSection.querySelectorAll('.pub-item');

  if (type === 'journals') {
    jSub.style.display = 'flex';
    cSub.style.display = 'none';
    filterJournals('all');
  } else if (type === 'conferences') {
    jSub.style.display = 'none';
    cSub.style.display = 'flex';
    filterConferences('all');
  } else {
    jSub.style.display = 'none';
    cSub.style.display = 'none';

    allPubs.forEach(pub => {
      pub.style.display = (pub.getAttribute('data-type') === type) ? 'block' : 'none';
    });
    sortPublicationsByYear();
  }
}

/* Sub-filtering Journals */
function filterJournals(scope, evt) {
  const subContainer = document.getElementById('journal-subfilters');
  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else btns[0].classList.add('active');

  // Hide all non-journal items
  document.querySelectorAll('.conf-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');

  // Show matching journal items
  document.querySelectorAll('.journal-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  // Sort visible items by year descending
  sortPublicationsByYear();
}

/* Sub-filtering Conferences */
function filterConferences(scope, evt) {
  const subContainer = document.getElementById('conference-subfilters');
  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else btns[0].classList.add('active');

  // Hide all non-conference items
  document.querySelectorAll('.journal-item, .code-item, .dissertation-item').forEach(i => i.style.display = 'none');

  // Show matching conference items
  document.querySelectorAll('.conf-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });

  // Sort visible items by year descending
  sortPublicationsByYear();
}

function filterNews(year, evt) {
  const section = document.getElementById('news');
  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  section.querySelectorAll('.news-year-card').forEach(card => {
    card.style.display = (year === 'all' || card.getAttribute('data-year') === year) ? 'block' : 'none';
  });
}

function filterBlogs(category, evt) {
  const section = document.getElementById('blog');
  section.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  section.querySelectorAll('.blog-card').forEach(card => {
    card.style.display = (category === 'all' || card.getAttribute('data-category') === category) ? 'block' : 'none';
  });
}

/* --- Modal Reader Functions --- */
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = 'auto';
}

function closeModalOutside(event, modalId) {
  if (event.target === document.getElementById(modalId)) closeModal(modalId);
}

/* --- Upvote & Comment Functions --- */
function toggleUpvote(postId) {
  const card = document.getElementById(postId);
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