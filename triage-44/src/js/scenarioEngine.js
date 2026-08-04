
export async function loadScenarios() {
  const response = await fetch('src/data/scenarios.json');
  if (!response.ok) {
    throw new Error('ScenarioLoadError: could not fetch scenarios.json');
  }
  const scenarios = await response.json();

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
