<!-- JavaScript for Tab Switching -->
  <script>
    function openTab(evt, tabId) {
      const panels = document.querySelectorAll('.tab-panel');
      panels.forEach(panel => panel.classList.remove('active'));

      const tabBtns = document.querySelectorAll('.tab-btn');
      tabBtns.forEach(btn => btn.classList.remove('active'));

      document.getElementById(tabId).classList.add('active');
      evt.currentTarget.classList.add('active');
    }
  </script>