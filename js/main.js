import { setupMobileMenu, openModal, closeModal, closeModalOutside } from './modules/ui.js';
import { loadScholarMetrics } from './modules/metrics.js';
import { 
  filterItems, 
  sortProjectsByYear, 
  sortPublicationsByYear, 
  updatePublicationCounts, 
  selectPublicationType, 
  filterJournals, 
  filterConferences 
} from './modules/publications.js';
import { initResearchThemeView, filterResearchTheme } from './modules/research.js';
import { filterNews, filterBlogs, toggleUpvote, addComment } from './modules/blog.js';
import { loadTab, handleHashNavigation } from './router.js';

// Attach functions to window object so inline HTML onclick handlers continue working
Object.assign(window, {
  loadTab,
  openModal,
  closeModal,
  closeModalOutside,
  filterItems,
  selectPublicationType,
  filterJournals,
  filterConferences,
  filterResearchTheme,
  filterNews,
  filterBlogs,
  toggleUpvote,
  addComment
});

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  handleHashNavigation();
});

window.addEventListener('popstate', handleHashNavigation);