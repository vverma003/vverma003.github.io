export function setupMobileMenu() {
  const menuBtn = document.getElementById('menu-toggle');
  const navTabs = document.getElementById('nav-tabs');

  if (menuBtn && navTabs) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navTabs.classList.toggle('is-active');
    });

    document.addEventListener('click', (e) => {
      if (!navTabs.contains(e.target) && !menuBtn.contains(e.target)) {
        navTabs.classList.remove('is-active');
      }
    });
  }
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

export function closeModalOutside(event, modalId) {
  if (event.target === document.getElementById(modalId)) {
    closeModal(modalId);
  }
}