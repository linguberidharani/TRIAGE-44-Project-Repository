
import { loadScenarios, getCurrentScenario, advance, filterByDifficulty, shuffleScenarios } from './scenarioEngine.js';
import { getProgress, saveProgress, resetProgress } from './progressStore.js';
import { submitAnswer, calculateAccuracy } from './scoringEngine.js';
import { getTheme, setTheme } from './themeManager.js';

let masterScenarios = [];
let allScenarios = [];
let currentIndex = 0;
let hasAnswered = false;

const VIEW_IDS = ['dashboard-view', 'scenario-view', 'end-screen-view'];
const RESET_CONFIRM_MESSAGE = 'Reset all progress? This clears your score and answer history and cannot be undone.';

async function initApp() {
  applyStoredTheme();
  wireThemeToggle();
  wireStartButton();
  wireResetButton();
  wireFilterChange();
  await bootstrap();
}

function applyStoredTheme() {
  const theme = getTheme();
  document.body.className = `theme-${theme}`;
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function wireThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.className = `theme-${next}`;
    themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  });
}

function showView(viewId, focusView = true) {
  document.getElementById('loading-view').classList.add('hidden');
  VIEW_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (id === viewId) {
      el.classList.remove('hidden');
      requestAnimationFrame(() => el.classList.add('view-visible'));
    } else {
      el.classList.remove('view-visible');
      el.classList.add('hidden');
    }
  });
  if (focusView) {
    const target = document.getElementById(viewId);
    target.focus({ preventScroll: false });
  }
}

function showEmptyState(message) {
  const msgEl = document.getElementById('empty-state-msg');
  msgEl.textContent = message;
  msgEl.classList.remove('hidden');
}

function clearEmptyState() {
  const msgEl = document.getElementById('empty-state-msg');
  msgEl.textContent = '';
  msgEl.classList.add('hidden');
}

function wireFilterChange() {
  const filterSelect = document.getElementById('difficulty-filter');
  filterSelect.addEventListener('change', clearEmptyState);
}

function confirmAndResetProgress(onConfirmed) {
  const confirmed = window.confirm(RESET_CONFIRM_MESSAGE);
  if (!confirmed) return;
  resetProgress();
  onConfirmed();
}

function wireStartButton() {
  const startButton = document.getElementById('start-training-btn');
  const filterSelect = document.getElementById('difficulty-filter');

  startButton.addEventListener('click', () => {
    const difficulty = filterSelect.value;
    const filtered = filterByDifficulty(masterScenarios, difficulty);

    if (filtered.length === 0) {
      showEmptyState(`No scenarios found for "${formatDifficulty(difficulty)}". Try a different difficulty level.`);
      return;
    }
    clearEmptyState();

    allScenarios = shuffleScenarios(filtered);
    currentIndex = 0;
    hasAnswered = false;

    const progress = getProgress();
    progress.currentIndex = 0;
    progress.score = 0;
    progress.totalAnswered = 0;
    progress.streak = 0;
    progress.answerLog = [];
    progress.completedAt = null;
    progress.activeDifficulty = difficulty;
    saveProgress(progress);

    showView('scenario-view', false);
    renderScenario(currentIndex);
  });
}

function wireResetButton() {
  const resetButton = document.getElementById('reset-btn');
  resetButton.addEventListener('click', () => {
    confirmAndResetProgress(() => {
      clearEmptyState();
      renderDashboard();
    });
  });
}

async function bootstrap() {
  try {
    masterScenarios = await loadScenarios();
  } catch (err) {
    console.error('Scenario load failed:', err);
    document.getElementById('loading-view').classList.add('hidden');
    const dashboardView = document.getElementById('dashboard-view');
    dashboardView.classList.remove('hidden');
    dashboardView.classList.add('view-visible');
    document.getElementById('stat-total').textContent = '—';
    const startButton = document.getElementById('start-training-btn');
    startButton.disabled = true;
    startButton.textContent = 'Unable to load scenarios';
    document.getElementById('difficulty-filter').disabled = true;
    showEmptyState('Scenario data could not be loaded. Check that scenarios.json exists and is valid, then reload the page.');
    return;
  }
  renderDashboard(false);
}

function renderDashboard(focusView = true) {
  const totalEl = document.getElementById('stat-total');
  const correctEl = document.getElementById('stat-correct');
  const accuracyEl = document.getElementById('stat-accuracy');
  const progressEl = document.getElementById('stat-progress');
  const startButton = document.getElementById('start-training-btn');
  const resetButton = document.getElementById('reset-btn');

  const progress = getProgress();
  const total = masterScenarios.length;
  const correct = progress.score;
  const attempted = progress.totalAnswered;
  const accuracy = calculateAccuracy(correct, attempted);

  totalEl.textContent = total;
  correctEl.textContent = correct;
  accuracyEl.textContent = `${accuracy}%`;
  progressEl.textContent = `${attempted}/${total}`;

  startButton.disabled = false;
  startButton.textContent = attempted > 0 && attempted < total ? 'Resume Training' : 'Start Training';
  resetButton.classList.toggle('hidden', attempted === 0);

  showView('dashboard-view', focusView);
}

function renderScenario(index) {
  const scenario = getCurrentScenario(allScenarios, index);
  const scenarioView = document.getElementById('scenario-view');
  hasAnswered = false;

  if (!scenario) {
    scenarioView.innerHTML = `<p class="empty-state-msg">No scenario found at this position.</p>`;
    return;
  }

  scenarioView.innerHTML = `
    <div class="scenario-card">
      <div class="scenario-meta">
        <span class="scenario-position">Scenario ${index + 1} of ${allScenarios.length}</span>
        <span class="scenario-badge">${escapeHtml(scenario.title)}</span>
      </div>

      <div class="alert-box">
        <span class="alert-label">ALERT</span>
        <p class="alert-text">${escapeHtml(scenario.alertText)}</p>
      </div>

      <p class="question-text" id="question-label">How would you classify this alert?</p>

      <div class="answer-buttons" role="group" aria-labelledby="question-label">
        <button class="answer-btn" data-answer="malicious">Malicious</button>
        <button class="answer-btn" data-answer="benign">Benign</button>
        <button class="answer-btn" data-answer="needs_investigation">Needs Investigation</button>
      </div>

      <div id="feedback-area" aria-live="polite"></div>
    </div>
  `;

  const buttons = scenarioView.querySelectorAll('.answer-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => handleAnswer(btn.dataset.answer, scenario, buttons));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAnswer(btn.dataset.answer, scenario, buttons);
      }
    });
  });

  buttons[0].focus();
}

function handleAnswer(userAnswer, scenario, buttons) {
  if (hasAnswered) return;
  hasAnswered = true;

  const result = submitAnswer(scenario, userAnswer);

  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.answer === result.correctAnswer) {
      btn.classList.add('answer-correct');
    } else if (btn.dataset.answer === userAnswer && !result.isCorrect) {
      btn.classList.add('answer-incorrect');
    }
  });

  const progress = getProgress();
  progress.totalAnswered += 1;
  progress.score += result.isCorrect ? 1 : 0;
  progress.streak = result.isCorrect ? progress.streak + 1 : 0;
  progress.currentIndex = currentIndex;
  progress.answerLog.push({
    scenarioId: scenario.id,
    title: scenario.title,
    userAnswer,
    correctAnswer: result.correctAnswer,
    correct: result.isCorrect,
    explanation: result.explanation,
    timestamp: new Date().toISOString(),
  });
  const isLast = currentIndex === allScenarios.length - 1;
  if (isLast) progress.completedAt = new Date().toISOString();
  saveProgress(progress);

  const feedbackArea = document.getElementById('feedback-area');
  feedbackArea.innerHTML = `
    <div class="feedback-box ${result.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}">
      <p class="feedback-verdict">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
      <p class="feedback-streak">Streak: ${progress.streak}</p>
      <p class="feedback-explanation">${escapeHtml(result.explanation)}</p>
    </div>
    <button id="next-btn" class="next-button">${isLast ? 'View Results' : 'Next Scenario'}</button>
  `;

  const nextBtn = document.getElementById('next-btn');
  const goNext = () => {
    if (isLast) {
      renderEndScreen();
    } else {
      currentIndex = advance(currentIndex);
      renderScenario(currentIndex);
    }
  };
  nextBtn.addEventListener('click', goNext);
  nextBtn.focus();
}

function renderEndScreen() {
  const progress = getProgress();
  const total = allScenarios.length;
  const correct = progress.score;
  const accuracy = calculateAccuracy(correct, progress.totalAnswered);
  const endView = document.getElementById('end-screen-view');

  const missed = progress.answerLog.filter((entry) => !entry.correct);
  const missedHtml = missed.length > 0
    ? `
      <div class="review-section">
        <h2 class="review-heading">Review Missed Scenarios</h2>
        <ul class="review-list">
          ${missed.map((entry) => `
            <li class="review-item">
              <p class="review-title">${escapeHtml(entry.title)}</p>
              <p class="review-line">Your answer: <span class="review-wrong">${escapeHtml(formatAnswer(entry.userAnswer))}</span></p>
              <p class="review-line">Correct answer: <span class="review-right">${escapeHtml(formatAnswer(entry.correctAnswer))}</span></p>
              <p class="review-explanation">${escapeHtml(entry.explanation)}</p>
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : `<p class="review-perfect">No missed scenarios — perfect run.</p>`;

  endView.innerHTML = `
    <div class="end-card">
      <p class="end-eyebrow">Training Complete</p>
      <h1 class="end-score">${correct}<span class="end-score-total">/${total}</span></h1>
      <p class="end-accuracy">${accuracy}% Accuracy</p>
      <div class="end-buttons">
        <button id="restart-btn" class="start-button">Restart Training</button>
        <button id="end-reset-btn" class="reset-button">Reset Progress</button>
      </div>
      ${missedHtml}
    </div>
  `;

  document.getElementById('restart-btn').addEventListener('click', () => {
    const difficulty = progress.activeDifficulty || 'all';
    const filtered = filterByDifficulty(masterScenarios, difficulty);
    allScenarios = shuffleScenarios(filtered);
    currentIndex = 0;
    hasAnswered = false;

    const freshProgress = getProgress();
    freshProgress.currentIndex = 0;
    freshProgress.score = 0;
    freshProgress.totalAnswered = 0;
    freshProgress.streak = 0;
    freshProgress.answerLog = [];
    freshProgress.completedAt = null;
    saveProgress(freshProgress);

    showView('scenario-view', false);
    renderScenario(0);
  });

  document.getElementById('end-reset-btn').addEventListener('click', () => {
    confirmAndResetProgress(() => {
      renderDashboard();
    });
  });

  showView('end-screen-view', true);
}

function formatAnswer(value) {
  const map = {
    malicious: 'Malicious',
    benign: 'Benign',
    needs_investigation: 'Needs Investigation',
  };
  return map[value] || value;
}

function formatDifficulty(value) {
  if (value === 'all') return 'All Levels';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

initApp();
