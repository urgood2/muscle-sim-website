(() => {
  let theme = 'light';
  try { theme = localStorage.getItem('dark-mode-storage') || theme; } catch (_) {}
  const apply = (value) => {
    document.documentElement.dataset.theme = value === 'dark' ? 'dark' : 'light';
    const button = document.getElementById('dark-mode-toggle');
    if (button) button.setAttribute('aria-pressed', String(value === 'dark'));
  };
  apply(theme);
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
      const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(value);
      try { localStorage.setItem('dark-mode-storage', value); } catch (_) {}
    });
  });
})();
