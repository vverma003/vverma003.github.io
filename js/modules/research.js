let cachedPublicationsHTML = null;
let cachedProjectsHTML = null;

export async function initResearchThemeView(themeKey) {
  if (!cachedPublicationsHTML) {
    try {
      const res = await fetch('tabs/publications.html');
      cachedPublicationsHTML = await res.text();
    } catch (e) {
      console.error('Error prefetching publications:', e);
    }
  }

  if (!cachedProjectsHTML) {
    try {
      const res = await fetch('tabs/projects.html');
      cachedProjectsHTML = await res.text();
    } catch (e) {
      console.error('Error prefetching projects:', e);
    }
  }

  renderThemeCards(themeKey);
}

export function filterResearchTheme(themeKey, evt) {
  const section = document.getElementById('research-themes');
  if (!section) return;

  section.querySelectorAll('.filter-controls .filter-btn').forEach((btn) => btn.classList.remove('active'));
  if (evt) evt.currentTarget.classList.add('active');

  renderThemeCards(themeKey);
}

export function setCachedPublicationsHTML(html) {
  cachedPublicationsHTML = html;
}

export function setCachedProjectsHTML(html) {
  cachedProjectsHTML = html;
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
    matchedProjects.forEach((card) => {
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
    matchedJournals.forEach((card) => {
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
    matchedConfs.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.style.display = 'block';
      confsList.appendChild(clone);
    });
  } else {
    confsContainer.style.display = 'none';
  }

  pubsGroup.style.display = matchedJournals.length + matchedConfs.length > 0 ? 'block' : 'none';
}