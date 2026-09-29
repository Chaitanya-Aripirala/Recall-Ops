const fs = require('fs');
const path = require('path');

// Root scenarios directory path
const SCENARIOS_DIR = path.resolve(__dirname, '../../../../scenarios');

/**
 * Reads a JSON file safely
 */
function readJsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading JSON from ${filePath}:`, err.message);
  }
  return null;
}

/**
 * Reads an NDJSON file safely into an array of objects
 */
function readNdjsonSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    }
  } catch (err) {
    console.error(`Error reading NDJSON from ${filePath}:`, err.message);
  }
  return [];
}

/**
 * Load all available scenarios from the scenarios/ folder
 */
function loadAllScenarios() {
  const scenarioIds = ['INC-A1', 'INC-A2', 'INC-B1', 'INC-C1', 'INC-D1'];
  const results = [];

  for (const id of scenarioIds) {
    const dir = path.join(SCENARIOS_DIR, id);
    if (!fs.existsSync(dir)) continue;

    const scenario = readJsonSafe(path.join(dir, 'scenario.json')) || { id };
    const alert = readJsonSafe(path.join(dir, 'alert.json')) || {};
    const stages = readJsonSafe(path.join(dir, 'stages.json')) || [];
    const rawActions = readJsonSafe(path.join(dir, 'actions.json')) || {};
    const actions = Array.isArray(rawActions)
      ? rawActions
      : Object.entries(rawActions).map(([key, val]) => ({
          id: key,
          name: (key.charAt(0).toUpperCase() + key.slice(1)).replace(/_/g, ' '),
          ...(typeof val === 'object' && val !== null ? val : { detail: val }),
        }));
    const groundTruth = readJsonSafe(path.join(dir, 'ground_truth.json')) || {};
    const metrics = readJsonSafe(path.join(dir, 'metrics.json')) || [];
    const deployments = readJsonSafe(path.join(dir, 'deployments.json')) || [];
    const dependencies = readJsonSafe(path.join(dir, 'dependencies.json')) || [];
    const logs = readNdjsonSafe(path.join(dir, 'logs.ndjson'));

    results.push({
      ...scenario,
      alert,
      stages,
      actions,
      groundTruth,
      metrics,
      deployments,
      dependencies,
      logs,
    });
  }

  return results;
}

/**
 * Load a single scenario by ID
 */
function loadScenarioById(scenarioId) {
  const all = loadAllScenarios();
  return all.find((s) => s.id.toUpperCase() === scenarioId.toUpperCase()) || null;
}

module.exports = {
  loadAllScenarios,
  loadScenarioById,
};
