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
  pubSection.querySelectorAll('.filter-controls .filter-btn').forEach(btn => btn.classList.remove('active'));
  evt.currentTarget.classList.add('active');

  const jSub = document.getElementById('journal-subfilters');
  const cSub = document.getElementById('conference-subfilters');

  if (type === 'journals') {
    jSub.style.display = 'flex';
    cSub.style.display = 'none';
    filterJournals('all');
  } else {
    jSub.style.display = 'none';
    cSub.style.display = 'flex';
    filterConferences('all');
  }
}

function filterJournals(scope, evt) {
  const subContainer = document.getElementById('journal-subfilters');
  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else btns[0].classList.add('active');

  document.querySelectorAll('.conf-item').forEach(i => i.style.display = 'none');
  document.querySelectorAll('.journal-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });
}

function filterConferences(scope, evt) {
  const subContainer = document.getElementById('conference-subfilters');
  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active'); else btns[0].classList.add('active');

  document.querySelectorAll('.journal-item').forEach(i => i.style.display = 'none');
  document.querySelectorAll('.conf-item').forEach(item => {
    item.style.display = (scope === 'all' || item.getAttribute('data-scope') === scope) ? 'block' : 'none';
  });
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