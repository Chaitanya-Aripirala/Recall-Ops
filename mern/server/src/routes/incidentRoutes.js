const express = require('express');
const router = express.Router();
const {
  getScenarios,
  startIncident,
  getIncident,
  unlockEvidence,
  advanceStage,
  executeAction,
  generatePostmortem,
  consolidateToMemory,
  resetDemo,
} = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');

// Public or optional-auth incident routes for smooth demo execution
router.get('/scenarios', getScenarios);
router.post('/start', startIncident);
router.get('/current/:id?', getIncident);
router.post('/unlock/:id', unlockEvidence);
router.post('/advance/:id', advanceStage);
router.post('/execute/:id', executeAction);
router.post('/postmortem/:id', generatePostmortem);
router.post('/consolidate', consolidateToMemory);
router.post('/reset', resetDemo);

module.exports = router;
