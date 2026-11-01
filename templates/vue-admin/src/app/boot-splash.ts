export function dismissBootSplash() {
  const splash = document.getElementById('boot-splash');
  if (!splash) return;
  splash.classList.add('is-exiting');
  window.setTimeout(() => splash.remove(), 240);
}
