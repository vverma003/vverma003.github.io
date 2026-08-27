export function loadScholarMetrics() {
  fetch(`./metrics.json?v=${new Date().getTime()}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const citationsEl = document.getElementById('metrics-citations');
      const hIndexEl = document.getElementById('metrics-hIndex');
      const i10IndexEl = document.getElementById('metrics-i10Index');

      if (citationsEl) citationsEl.innerText = data.citations ?? data.cited_by_count ?? '--';
      if (hIndexEl) hIndexEl.innerText = data.hIndex ?? '--';
      if (i10IndexEl) i10IndexEl.innerText = data.i10Index ?? '--';
    })
    .catch((err) => console.error('Scholar metrics fetch error:', err));
}