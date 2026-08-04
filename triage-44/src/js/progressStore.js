
const PROGRESS_KEY = 'triage44_progress';

const DEFAULT_PROGRESS = {
  currentIndex: 0,
  score: 0,
  totalAnswered: 0,
  streak: 0,
  answerLog: [],
  completedAt: null,
};

export function getProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT_PROGRESS };
  } catch (err) {
    console.warn('StorageUnavailableError: falling back to in-memory progress', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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
