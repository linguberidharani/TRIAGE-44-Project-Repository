
import { loadScenarios } from './scenarioEngine.js';
import { getProgress } from './progressStore.js';
import { getTheme, setTheme } from './themeManager.js';

async function initApp() {
  const theme = getTheme();
  document.body.className = `theme-${theme}`;

  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.className = `theme-${next}`;
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  });
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';

  try {
    const scenarios = await loadScenarios();
    console.log(`Loaded ${scenarios.length} scenario(s).`);
  } catch (err) {
    console.error('Scenario load failed:', err);
  }

  const progress = getProgress();
  console.log('Current progress:', progress);
}

initApp();