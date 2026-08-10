
const PROGRESS_KEY = 'triage44_progress';

const DEFAULT_PROGRESS = {
  currentIndex: 0,
  score: 0,
  totalAnswered: 0,
  streak: 0,
  answerLog: [],
  completedAt: null,
  activeDifficulty: 'all',
};

function normalizeProgress(raw) {
  const merged = { ...DEFAULT_PROGRESS, ...(raw || {}) };
  if (!Array.isArray(merged.answerLog)) {
    merged.answerLog = [];
  }
  if (typeof merged.score !== 'number') merged.score = 0;
  if (typeof merged.totalAnswered !== 'number') merged.totalAnswered = 0;
  if (typeof merged.streak !== 'number') merged.streak = 0;
  if (typeof merged.currentIndex !== 'number') merged.currentIndex = 0;
  return merged;
}

export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeProgress(parsed);
  } catch (err) {
    console.warn('StorageUnavailableError: falling back to in-memory progress', err);
    return normalizeProgress(null);
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)));
    return true;
  } catch (err) {
    console.warn('StorageUnavailableError: could not save progress', err);
    return false;
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (err) {
    console.warn('StorageUnavailableError: could not reset progress', err);
  }
}
