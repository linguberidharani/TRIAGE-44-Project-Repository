
export async function loadScenarios() {
  const response = await fetch('src/data/scenarios.json');
  if (!response.ok) {
    throw new Error('ScenarioLoadError: could not fetch scenarios.json');
  }

  let scenarios;
  try {
    scenarios = await response.json();
  } catch (err) {
    throw new Error('ScenarioLoadError: scenarios.json is not valid JSON');
  }

  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    throw new Error('ScenarioLoadError: scenarios.json contains no scenarios');
  }

  scenarios.forEach((s) => {
    const requiredFields = ['id', 'title', 'alertText', 'category', 'explanation', 'difficulty'];
    requiredFields.forEach((field) => {
      if (!s[field]) {
        throw new Error(`ScenarioLoadError: scenario ${s.id || '(unknown id)'} missing field "${field}"`);
      }
    });
  });

  return scenarios;
}

export function getCurrentScenario(scenarios, index) {
  return scenarios[index] || null;
}

export function advance(index) {
  return index + 1;
}

export function filterByDifficulty(scenarios, difficulty) {
  if (!difficulty || difficulty === 'all') return [...scenarios];
  return scenarios.filter((s) => s.difficulty === difficulty);
}

export function shuffleScenarios(scenarios) {
  const shuffled = [...scenarios];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
