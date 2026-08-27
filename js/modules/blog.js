export function filterNews(year, evt) {
  const section = document.getElementById('news');
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.news-year-card').forEach((card) => {
    card.style.display = year === 'all' || card.getAttribute('data-year') === year ? 'block' : 'none';
  });
}

export function filterBlogs(category, evt) {
  const section = document.getElementById('blog');
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.blog-card').forEach((card) => {
    card.style.display = category === 'all' || card.getAttribute('data-category') === category ? 'block' : 'none';
  });
}

export function toggleUpvote(postId) {
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

export function addComment(postId) {
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