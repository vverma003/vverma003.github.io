export function filterItems(sectionId, filterGroup, evt) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  section.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  section.querySelectorAll('.project-item').forEach((item) => {
    const itemCat = item.getAttribute('data-category');
    item.style.display = filterGroup === 'all' || itemCat === filterGroup ? 'block' : 'none';
  });
}

export function sortProjectsByYear() {
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

  projectCards.forEach((card) => projectSection.appendChild(card));
}

export function sortPublicationsByYear() {
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

  pubCards.forEach((card) => pubSection.appendChild(card));
}

export function updatePublicationCounts() {
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

export function selectPublicationType(type, evt) {
  const pubSection = document.getElementById('publications');
  if (!pubSection) return;

  pubSection.querySelectorAll('.filter-controls .filter-btn').forEach((btn) => btn.classList.remove('active'));
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

    allPubs.forEach((pub) => {
      pub.style.display = pub.getAttribute('data-type') === type ? 'block' : 'none';
    });
    sortPublicationsByYear();
  }
}

export function filterJournals(scope, evt) {
  const subContainer = document.getElementById('journal-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach((b) => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');
  else if (btns[0]) btns[0].classList.add('active');

  document.querySelectorAll('.conf-item, .code-item, .dissertation-item').forEach((i) => (i.style.display = 'none'));
  document.querySelectorAll('.journal-item').forEach((item) => {
    item.style.display = scope === 'all' || item.getAttribute('data-scope') === scope ? 'block' : 'none';
  });

  sortPublicationsByYear();
}

export function filterConferences(scope, evt) {
  const subContainer = document.getElementById('conference-subfilters');
  if (!subContainer) return;

  const btns = subContainer.querySelectorAll('.sub-filter-btn');
  btns.forEach((b) => b.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');
  else if (btns[0]) btns[0].classList.add('active');

  document.querySelectorAll('.journal-item, .code-item, .dissertation-item').forEach((i) => (i.style.display = 'none'));
  document.querySelectorAll('.conf-item').forEach((item) => {
    item.style.display = scope === 'all' || item.getAttribute('data-scope') === scope ? 'block' : 'none';
  });

  sortPublicationsByYear();
}