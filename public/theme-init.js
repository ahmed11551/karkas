/* Runs synchronously in <head>, before the first paint, so there is no light flash for dark-theme visitors.
   Saved choice wins; without it we follow the system setting. Kept as a separate file because the
   production CSP allows only 'self' scripts (no inline code). Keep the key in sync with src/App.tsx. */
(function () {
  try {
    var saved = window.localStorage.getItem('karkas-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (error) {
    // Storage blocked (private mode, strict settings): stay on the light theme.
  }
})();
