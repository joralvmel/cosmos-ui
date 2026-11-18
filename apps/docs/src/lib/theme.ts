export const SITE_THEME_KEY = 'cosmos-docs:theme';

export function applySiteTheme(storage: Pick<Storage, 'getItem'> = localStorage): void {
  const theme = storage.getItem(SITE_THEME_KEY) ?? 'cosmos';
  const mode = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  for (const surface of document.querySelectorAll<HTMLElement>('[data-cosm-preview]')) {
    if (!surface.hasAttribute('data-fixed')) surface.dataset.theme = theme;
    if (!surface.hasAttribute('data-fixed-mode')) surface.dataset.mode = mode;
  }
  for (const select of document.querySelectorAll<HTMLSelectElement>('[data-cosm-theme-select]')) {
    select.value = theme;
  }
}
