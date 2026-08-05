
const SETTINGS_KEY = 'triage44_settings';

export function getTheme() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const settings = raw ? JSON.parse(raw) : { theme: 'dark' };
    return settings.theme || 'dark';
  } catch (err) {
    console.warn('StorageUnavailableError: defaulting to dark theme', err);
    return 'dark';
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme }));
  } catch (err) {
    console.warn('StorageUnavailableError: could not persist theme', err);
  }
}
