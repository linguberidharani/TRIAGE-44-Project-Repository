
import { loadScenarios, getCurrentScenario, advance } from './scenarioEngine.js';
import { getProgress, saveProgress, resetProgress } from './progressStore.js';
import { submitAnswer, calculateAccuracy } from './scoringEngine.js';
import { getTheme, setTheme } from './themeManager.js';

let allScenarios = [];
let currentIndex = 0;
let hasAnswered = false;

async function initApp() {
  applyStoredTheme();
  wireThemeToggle();
  wireStartButton();
  wireResetButton();
  await renderDashboard();
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

function showView(viewId) {
  ['dashboard-view', 'scenario-view', 'end-screen-view'].forEach((id) => {
    document.getElementById(id).classList.toggle('hidden', id !== viewId);
  });
}

function wireStartButton() {
  const startButton = document.getElementById('start-training-btn');
  startButton.addEventListener('click', () => {
    const progress = getProgress();
    currentIndex = progress.totalAnswered < allScenarios.length ? progress.totalAnswered : 0;
    hasAnswered = false;
    showView('scenario-view');
    renderScenario(currentIndex);
  });
}

function wireResetButton() {
  const resetButton = document.getElementById('reset-btn');
  resetButton.addEventListener('click', () => {
    const confirmed = window.confirm('Reset all progress? This clears your score and answer history and cannot be undone.');
    if (!confirmed) return;
    resetProgress();
    renderDashboard();
  });
}

async function renderDashboard() {
  const totalEl = document.getElementById('stat-total');
  const correctEl = document.getElementById('stat-correct');
  const accuracyEl = document.getElementById('stat-accuracy');
  const progressEl = document.getElementById('stat-progress');
  const startButton = document.getElementById('start-training-btn');
  const resetButton = document.getElementById('reset-btn');

  if (allScenarios.length === 0) {
    try {
      allScenarios = await loadScenarios();
    } catch (err) {
      console.error('Scenario load failed:', err);
      totalEl.textContent = '—';
      startButton.disabled = true;
      startButton.textContent = 'Unable to load scenarios';
      return;
    }
  }

  const progress = getProgress();
  const total = allScenarios.length;
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

  showView('dashboard-view');
}

function renderScenario(index) {
  const scenario = getCurrentScenario(allScenarios, index);
  const scenarioView = document.getElementById('scenario-view');
  hasAnswered = false;

  if (!scenario) {
    scenarioView.innerHTML = `<p>No scenario found at this position.</p>`;
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
    userAnswer,
    correct: result.isCorrect,
    timestamp: new Date().toISOString(),
  });
  const isLast = currentIndex === allScenarios.length - 1;
  if (isLast) progress.completedAt = new Date().toISOString();
  saveProgress(progress);

  const feedbackArea = document.getElementById('feedback-area');
  feedbackArea.innerHTML = `
    <div class="feedback-box ${result.isCorrect ? 'feedback-correct' : 'feedback-incorrect'}">
      <p class="feedback-verdict">${result.isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
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

  endView.innerHTML = `
    <div class="end-card">
      <p class="end-eyebrow">Training Complete</p>
      <h1 class="end-score">${correct}<span class="end-score-total">/${total}</span></h1>
      <p class="end-accuracy">${accuracy}% Accuracy</p>
      <div class="end-buttons">
        <button id="restart-btn" class="start-button">Restart Training</button>
        <button id="end-reset-btn" class="reset-button">Reset Progress</button>
      </div>
    </div>
  `;

  document.getElementById('restart-btn').addEventListener('click', () => {
    const progress = getProgress();
    progress.currentIndex = 0;
    progress.score = 0;
    progress.totalAnswered = 0;
    progress.streak = 0;
    progress.answerLog = [];
    progress.completedAt = null;
    saveProgress(progress);
    currentIndex = 0;
    hasAnswered = false;
    showView('scenario-view');
    renderScenario(0);
  });

  document.getElementById('end-reset-btn').addEventListener('click', () => {
    const confirmed = window.confirm('Reset all progress? This clears your score and answer history and cannot be undone.');
    if (!confirmed) return;
    resetProgress();
    renderDashboard();
  });

  showView('end-screen-view');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

initApp();
