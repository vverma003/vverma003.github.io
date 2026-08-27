import { loadScholarMetrics } from './modules/metrics.js';
import { updatePublicationCounts, sortPublicationsByYear, sortProjectsByYear } from './modules/publications.js';
import { initResearchThemeView, setCachedPublicationsHTML, setCachedProjectsHTML } from './modules/research.js';

export function loadTab(tabName, evt) {
  const contentArea = document.getElementById('content-area');
  const navTabs = document.getElementById('nav-tabs');

  if (navTabs) {
    navTabs.classList.remove('is-active');
  }

  if (!contentArea) return;

  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  } else {
    const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find((btn) => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      return onclickAttr.includes(`'${tabName}'`);
    });
    if (targetBtn) targetBtn.classList.add('active');
  }

  if (window.location.hash !== `#${tabName}`) {
    history.pushState({ tab: tabName }, '', `#${tabName}`);
  }

  fetch(`tabs/${tabName}.html`)
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load tabs/${tabName}.html`);
      return response.text();
    })
    .then((html) => {
      contentArea.innerHTML = html;

      if (tabName === 'about') {
        setTimeout(loadScholarMetrics, 50);
      } else if (tabName === 'publications') {
        setCachedPublicationsHTML(html);
        updatePublicationCounts();
        sortPublicationsByYear();
      } else if (tabName === 'projects') {
        setCachedProjectsHTML(html);
        sortProjectsByYear();
      } else if (tabName === 'research') {
        initResearchThemeView('public-transport');
      }
    })
    .catch((err) => {
      contentArea.innerHTML = `<div class="card"><p style="color:#ef4444;">Error loading tab: ${err.message}</p></div>`;
    });
}

export function handleHashNavigation() {
  const hash = window.location.hash.replace('#', '').trim();
  const validTabs = ['about', 'publications', 'projects', 'research', 'talks', 'blog', 'news'];
  const targetTab = validTabs.includes(hash) ? hash : 'about';
  loadTab(targetTab);
}