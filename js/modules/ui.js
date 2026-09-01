// ui.js

// Configure PDF.js worker path globally
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let pdfRendered = false;

// Renders the PDF into HTML5 canvas elements sequentially
export async function renderPDF(pdfUrl) {
  const container = document.getElementById('pdf-render-container');
  if (!container || pdfRendered) return;

  container.innerHTML = '<p style="text-align:center; color: var(--text-muted, #94a3b8);">Loading CV...</p>';

  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    container.innerHTML = ''; // Clear loading text

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      container.appendChild(canvas);
      await page.render({ canvasContext: context, viewport: viewport }).promise;
    }
    pdfRendered = true;
  } catch (error) {
    console.error('Error rendering PDF:', error);
    container.innerHTML = '<p style="color:#ef4444; text-align:center;">Unable to display PDF inline. Please use the Download button above.</p>';
  }
}

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

  // Trigger PDF rendering when opening the CV modal
  if (modalId === 'cv-modal') {
    renderPDF('assets/CV_V.Verma.pdf');
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