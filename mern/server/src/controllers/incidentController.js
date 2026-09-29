const Incident = require('../models/Incident');
const HindsightMemory = require('../models/HindsightMemory');
const Postmortem = require('../models/Postmortem');
const { loadAllScenarios, loadScenarioById } = require('../services/scenarioLoader');
const { recallMemoriesForIncident } = require('../services/memoryEngine');
const { generateHypothesesForIncident, getActionRecommendations, generateStructuredPostmortem } = require('../services/aiAgent');

/**
 * Get list of available incident scenarios
 */
async function getScenarios(req, res) {
  try {
    const scenarios = loadAllScenarios();
    const cleanScenarios = scenarios.map((s) => ({
      id: s.id,
      title: s.title,
      service: s.service,
      role: s.role,
      severity: s.severity_hint || 'SEV-1',
      summary: s.summary,
      symptom: s.symptom,
      tags: s.tags || [],
      memoryExpected: s.memory_expected,
      demoNotes: s.demo_notes,
      baseTime: s.base_time,
      baselineErrorRatePct: s.baseline_error_rate_pct,
    }));

    res.json({ success: true, count: cleanScenarios.length, scenarios: cleanScenarios });
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    res.status(500).json({ success: false, message: 'Failed to load scenarios' });
  }
}

/**
 * Start or reset an incident simulation
 */
async function startIncident(req, res) {
  try {
    const { scenarioId } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ success: false, message: 'scenarioId is required' });
    }

    const scenario = loadScenarioById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ success: false, message: `Scenario ${scenarioId} not found` });
    }

    // Recall organizational memories for this scenario
    const recalledMemories = await recallMemoriesForIncident(scenario);

    // Initial stage (alert)
    const stages = scenario.stages || [];
    const firstStage = stages[0] || { id: 'alert', label: 'Alert Fired', evidence: [], metrics: [] };

    // Initial evidence from stage 0
    const initialEvidenceIds = (firstStage.evidence || []).map((e) => e.id);

    // Generate initial hypotheses and action recommendations
    const hypotheses = generateHypothesesForIncident(scenario, firstStage, recalledMemories);
    const recommendedActions = getActionRecommendations(scenario, firstStage, recalledMemories);

    // Initial metrics
    const initialMetrics = firstStage.metrics || [
      { name: 'http_5xx_pct', label: 'HTTP 5xx error rate', value: 31.0, unit: '%', baseline: 0.4, limit: 5.0 },
      { name: 'checkout_success_pct', label: 'Checkout success rate', value: 68.0, unit: '%', baseline: 99.1, limit: 95.0 },
      { name: 'redis_connections_active', label: 'Redis client connections', value: 100, unit: 'count', baseline: 61, limit: 100 },
    ];

    // Initial timeline entry
    const timeline = [
      {
        ts: new Date(),
        type: 'alert',
        title: `SEV-1 Alert: ${scenario.title}`,
        detail: scenario.symptom || 'High error rate detected',
        actor: 'Datadog Monitor',
      },
    ];

    if (recalledMemories.length > 0) {
      timeline.push({
        ts: new Date(),
        type: 'memory_recall',
        title: `Hindsight Memory Recalled: ${recalledMemories[0].title}`,
        detail: `Relevance Score: ${recalledMemories[0].relevanceScore}% | Proven mitigation: ${recalledMemories[0].recommendedAction || 'Rollback'}`,
        actor: 'RecallOps Engine',
      });
    }

    // Create or update Incident in Mongo
    const incident = await Incident.create({
      scenarioId: scenario.id,
      title: scenario.title,
      service: scenario.service,
      role: scenario.role || 'seed',
      severity: scenario.severity_hint || 'SEV-1',
      status: 'active',
      summary: scenario.summary,
      symptom: scenario.symptom,
      currentStageIndex: 0,
      currentStageId: firstStage.id,
      stages: stages,
      unlockedEvidenceIds: initialEvidenceIds,
      recalledMemories: recalledMemories,
      hypotheses: hypotheses,
      activeMetrics: initialMetrics,
      timeline: timeline,
      hasMemoryBenefit: recalledMemories.some((m) => m.relevanceScore > 80 && m.status === 'supporting'),
    });

    res.json({
      success: true,
      message: `Incident ${scenario.id} initiated`,
      incident,
      scenario,
      recommendedActions,
    });
  } catch (err) {
    console.error('Error starting incident:', err);
    res.status(500).json({ success: false, message: 'Failed to start incident simulation' });
  }
}

/**
 * Get the latest active incident or incident by ID
 */
async function getIncident(req, res) {
  try {
    const { id } = req.params;
    let incident = null;

    if (id && id !== 'latest') {
      incident = await Incident.findById(id).populate('postmortem');
    } else {
      incident = await Incident.findOne({}).sort({ createdAt: -1 }).populate('postmortem');
    }

    if (!incident) {
      return res.status(404).json({ success: false, message: 'No incident found' });
    }

    const scenario = loadScenarioById(incident.scenarioId);
    const currentStage = (incident.stages || [])[incident.currentStageIndex] || {};
    const recommendedActions = getActionRecommendations(scenario || {}, currentStage, incident.recalledMemories);

    res.json({
      success: true,
      incident,
      scenario,
      recommendedActions,
    });
  } catch (err) {
    console.error('Error retrieving incident:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve incident' });
  }
}

/**
 * Unlock specific diagnostic evidence
 */
async function unlockEvidence(req, res) {
  try {
    const { id } = req.params;
    const { evidenceId } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    if (!incident.unlockedEvidenceIds.includes(evidenceId)) {
      incident.unlockedEvidenceIds.push(evidenceId);
      incident.timeline.push({
        ts: new Date(),
        type: 'evidence',
        title: `Diagnostic Evidence Unlocked: ${evidenceId}`,
        detail: `Operator investigated telemetry & telemetry stream ${evidenceId}`,
        actor: 'On-Call SRE',
      });
      await incident.save();
    }

    res.json({ success: true, incident });
  } catch (err) {
    console.error('Error unlocking evidence:', err);
    res.status(500).json({ success: false, message: 'Failed to unlock evidence' });
  }
}

/**
 * Advance incident stage
 */
async function advanceStage(req, res) {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const nextIndex = incident.currentStageIndex + 1;
    if (nextIndex >= incident.stages.length) {
      return res.json({ success: true, message: 'Already at final stage', incident });
    }

    const nextStage = incident.stages[nextIndex];
    incident.currentStageIndex = nextIndex;
    incident.currentStageId = nextStage.id;

    // Add newly available evidence IDs
    if (nextStage.evidence) {
      for (const ev of nextStage.evidence) {
        if (!incident.unlockedEvidenceIds.includes(ev.id)) {
          incident.unlockedEvidenceIds.push(ev.id);
        }
      }
    }

    // Update active metrics if stage specifies them
    if (nextStage.metrics && nextStage.metrics.length > 0) {
      incident.activeMetrics = nextStage.metrics;
    }

    // Update hypotheses
    const scenario = loadScenarioById(incident.scenarioId);
    incident.hypotheses = generateHypothesesForIncident(scenario, nextStage, incident.recalledMemories);

    // Add timeline item
    incident.timeline.push({
      ts: new Date(),
      type: 'evidence',
      title: `Stage Advanced: ${nextStage.label}`,
      detail: nextStage.description,
      actor: 'Simulation Engine',
    });

    await incident.save();
    res.json({ success: true, incident });
  } catch (err) {
    console.error('Error advancing stage:', err);
    res.status(500).json({ success: false, message: 'Failed to advance stage' });
  }
}

/**
 * Execute an approved incident mitigation action
 */
async function executeAction(req, res) {
  try {
    const { id } = req.params;
    const { actionId, approvedBy = 'On-Call Engineer' } = req.body;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const scenario = loadScenarioById(incident.scenarioId);
    const actionDef = (scenario.actions || []).find((a) => a.id === actionId) || {
      id: actionId,
      name: actionId,
      title: actionId,
    };

    let effective = false;
    let resultMessage = '';
    let newMetrics = [...incident.activeMetrics];

    // Branching logic based on action executed
    if (actionId === 'restart_api_pool') {
      // Ineffective action / trap
      effective = false;
      resultMessage = '⚠️ Rolling pod restart executed. HTTP 5xx dropped temporarily to 12%, but Redis connection pool is refilling rapidly. Not durable!';

      // Set to restart_result stage if exists
      const restartStageIndex = incident.stages.findIndex((s) => s.id === 'restart_result');
      if (restartStageIndex !== -1) {
        incident.currentStageIndex = restartStageIndex;
        incident.currentStageId = 'restart_result';
        const s = incident.stages[restartStageIndex];
        if (s.metrics) incident.activeMetrics = s.metrics;
        if (s.evidence) {
          s.evidence.forEach((ev) => {
            if (!incident.unlockedEvidenceIds.includes(ev.id)) incident.unlockedEvidenceIds.push(ev.id);
          });
        }
      }

      incident.timeline.push({
        ts: new Date(),
        type: 'action',
        title: `Executed: ${actionDef.name || 'Rolling Pod Restart'} (Temporary Trap)`,
        detail: 'Temporary 5xx dip to 12%, but root-cause leak remains active. Regressed after 45s.',
        actor: approvedBy,
      });
    } else if (actionId === 'rollback_recent_deploy') {
      // Successful rollback!
      effective = true;
      resultMessage = '✅ Rollback to prior stable version succeeded! Leaked connection pool drained. HTTP 5xx returned to 0.4%, checkout success recovered to 99.3%.';

      const resolvedStageIndex = incident.stages.findIndex((s) => s.id === 'resolved');
      if (resolvedStageIndex !== -1) {
        incident.currentStageIndex = resolvedStageIndex;
        incident.currentStageId = 'resolved';
        const s = incident.stages[resolvedStageIndex];
        if (s.metrics) incident.activeMetrics = s.metrics;
        if (s.evidence) {
          s.evidence.forEach((ev) => {
            if (!incident.unlockedEvidenceIds.includes(ev.id)) incident.unlockedEvidenceIds.push(ev.id);
          });
        }
      } else {
        incident.activeMetrics = [
          { name: 'http_5xx_pct', label: 'HTTP 5xx rate', value: 0.4, unit: '%', baseline: 0.4, limit: 5.0 },
          { name: 'checkout_success_pct', label: 'Checkout success rate', value: 99.3, unit: '%', baseline: 99.1, limit: 95.0 },
          { name: 'redis_connections_active', label: 'Redis client connections', value: 61, unit: 'count', baseline: 61, limit: 100 },
        ];
      }

      incident.status = 'resolved';
      incident.resolvedTime = new Date();
      incident.mttrSeconds = Math.round((incident.resolvedTime - incident.startTime) / 1000);

      incident.timeline.push({
        ts: new Date(),
        type: 'resolution',
        title: `Mitigation Succeeded: ${actionDef.name || 'Rollback'}`,
        detail: resultMessage,
        actor: approvedBy,
      });
    } else if (actionId === 'kill_long_running_queries' || actionId === 'enable_degraded_mode') {
      // Effective actions for B1 / C1
      effective = true;
      resultMessage = `✅ Executed ${actionDef.name || actionId} successfully. Service metrics returned to normal baseline.`;
      incident.status = 'resolved';
      incident.resolvedTime = new Date();
      incident.mttrSeconds = Math.round((incident.resolvedTime - incident.startTime) / 1000);

      incident.timeline.push({
        ts: new Date(),
        type: 'resolution',
        title: `Mitigation Succeeded: ${actionDef.name || actionId}`,
        detail: resultMessage,
        actor: approvedBy,
      });
    } else {
      // General diagnostic or minor action
      effective = true;
      resultMessage = `Executed action: ${actionDef.name || actionId}. Diagnostic logs updated.`;
      incident.timeline.push({
        ts: new Date(),
        type: 'action',
        title: `Executed: ${actionDef.name || actionId}`,
        detail: resultMessage,
        actor: approvedBy,
      });
    }

    // Record action execution history
    incident.executedActions.push({
      actionId,
      title: actionDef.name || actionDef.title || actionId,
      executedAt: new Date(),
      approvedBy,
      effective,
      result: { message: resultMessage },
      metricsAfter: incident.activeMetrics,
    });

    // Update hypotheses status based on current stage
    const currentStage = incident.stages[incident.currentStageIndex] || { id: incident.currentStageId };
    incident.hypotheses = generateHypothesesForIncident(scenario, currentStage, incident.recalledMemories);

    // Auto-generate postmortem and consolidate to memory when resolved!
    if (incident.status === 'resolved') {
      try {
        const postmortemData = generateStructuredPostmortem(incident, scenario);
        let postmortem = await Postmortem.findOne({ incidentId: incident._id });
        if (postmortem) {
          Object.assign(postmortem, postmortemData);
          postmortem.status = 'consolidated_to_memory';
          await postmortem.save();
        } else {
          postmortem = await Postmortem.create({
            ...postmortemData,
            incidentId: incident._id,
            status: 'consolidated_to_memory',
          });
        }
        incident.postmortem = postmortem._id;

        // Auto-consolidate to HindsightMemory so it immediately appears in Memory Bank & ROI
        const memoryId = `MEM-${incident.scenarioId}-${Date.now().toString().slice(-4)}`;
        await HindsightMemory.findOneAndUpdate(
          { sourceIncidentId: incident.scenarioId },
          {
            memoryId,
            sourceIncidentId: incident.scenarioId,
            title: postmortem.title.replace('Postmortem: ', ''),
            service: postmortem.service,
            symptomSignature: incident.symptom || '5xx error surge',
            rootCause: postmortem.rootCauseAnalysis,
            triggeringPattern: `${postmortem.service} failure during deployment changes or pool pressure`,
            tags: [postmortem.service, 'hindsight-learned', incident.scenarioId.toLowerCase()],
            effectiveActions: (postmortem.effectiveMitigations || []).map((m, idx) => ({
              actionId: `act-${idx}`,
              name: m,
              reason: 'Proven in incident resolution',
              impact: 'Full recovery to baseline',
            })),
            ineffectiveActions: (postmortem.failedAttempts || []).map((f, idx) => ({
              actionId: `fail-${idx}`,
              name: f,
              trapReason: 'Demonstrated ineffective or caused regression',
              risk: 'High MTTR waste',
            })),
            lessonsLearned: postmortem.lessonsLearned,
            preventiveRecommendations: (postmortem.actionItems || []).map((a) => a.description),
            mttrMinutes: incident.mttrSeconds ? +(incident.mttrSeconds / 60).toFixed(1) : 4.5,
            confidenceScore: 0.98,
            verified: true,
          },
          { upsert: true, new: true }
        );

        incident.timeline.push({
          ts: new Date(),
          type: 'postmortem',
          title: `Postmortem Generated & Consolidated to Memory`,
          detail: `Saved to Postmortems archive & Hindsight Memory Bank (${memoryId}).`,
          actor: 'RecallOps AI Agent',
        });
      } catch (pmErr) {
        console.error('Error auto-generating postmortem:', pmErr);
      }
    }

    await incident.save();

    res.json({
      success: true,
      message: resultMessage,
      effective,
      incident,
    });
  } catch (err) {
    console.error('Error executing action:', err);
    res.status(500).json({ success: false, message: 'Failed to execute mitigation action' });
  }
}

/**
 * Generate an AI Structured Postmortem
 */
async function generatePostmortem(req, res) {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const scenario = loadScenarioById(incident.scenarioId);
    const postmortemData = generateStructuredPostmortem(incident, scenario);

    // Save to Postmortem model
    let postmortem = await Postmortem.findOne({ incidentId: incident._id });
    if (postmortem) {
      Object.assign(postmortem, postmortemData);
      await postmortem.save();
    } else {
      postmortem = await Postmortem.create({
        ...postmortemData,
        incidentId: incident._id,
      });
    }

    incident.postmortem = postmortem._id;
    incident.timeline.push({
      ts: new Date(),
      type: 'postmortem',
      title: `AI Postmortem Generated: ${postmortem.title}`,
      detail: 'Structured root cause, action items, and lessons learned compiled.',
      actor: 'RecallOps AI Agent',
    });
    await incident.save();

    res.json({ success: true, postmortem, incident });
  } catch (err) {
    console.error('Error generating postmortem:', err);
    res.status(500).json({ success: false, message: 'Failed to generate postmortem' });
  }
}

/**
 * Consolidate a postmortem directly into Organizational Hindsight Memory in MongoDB
 */
async function consolidateToMemory(req, res) {
  try {
    const { postmortemId } = req.body;
    const postmortem = await Postmortem.findById(postmortemId).populate('incidentId');
    if (!postmortem) {
      return res.status(404).json({ success: false, message: 'Postmortem not found' });
    }

    const incident = postmortem.incidentId;
    const memoryId = `MEM-${postmortem.scenarioId}-${Date.now().toString().slice(-4)}`;

    const effectiveActions = (postmortem.effectiveMitigations || []).map((m, idx) => ({
      actionId: `act-${idx}`,
      name: m,
      reason: 'Proven in postmortem resolution',
      impact: 'Rapid recovery to baseline error rates',
    }));

    const ineffectiveActions = (postmortem.failedAttempts || []).map((f, idx) => ({
      actionId: `fail-${idx}`,
      name: f,
      trapReason: 'Demonstrated to be ineffective or counter-productive in postmortem analysis',
      risk: 'High MTTR delay and false resolution',
    }));

    const newMemory = await HindsightMemory.create({
      memoryId,
      sourceIncidentId: postmortem.scenarioId,
      title: postmortem.title.replace('Postmortem: ', ''),
      service: postmortem.service,
      symptomSignature: incident ? incident.symptom : 'Incident 5xx error surge',
      rootCause: postmortem.rootCauseAnalysis,
      triggeringPattern: `${postmortem.service} failure during deployment changes or pool pressure`,
      tags: [postmortem.service, 'hindsight-learned', 'postmortem-consolidated', postmortem.scenarioId.toLowerCase()],
      effectiveActions,
      ineffectiveActions,
      lessonsLearned: postmortem.lessonsLearned,
      preventiveRecommendations: (postmortem.actionItems || []).map((a) => a.description),
      mttrMinutes: incident && incident.mttrSeconds ? +(incident.mttrSeconds / 60).toFixed(1) : 4.5,
      confidenceScore: 0.98,
      verified: true,
    });

    postmortem.status = 'consolidated_to_memory';
    postmortem.consolidatedMemoryId = memoryId;
    await postmortem.save();

    res.json({
      success: true,
      message: `Successfully consolidated incident knowledge into Organizational Memory (${memoryId})`,
      memory: newMemory,
      postmortem,
    });
  } catch (err) {
    console.error('Error consolidating to memory:', err);
    res.status(500).json({ success: false, message: 'Failed to consolidate to memory' });
  }
}

/**
 * Reset all active incidents and re-seed clean state
 */
async function resetDemo(req, res) {
  try {
    await Incident.deleteMany({});
    await Postmortem.deleteMany({});
    res.json({ success: true, message: 'Demo state reset successfully' });
  } catch (err) {
    console.error('Error resetting demo:', err);
    res.status(500).json({ success: false, message: 'Failed to reset demo' });
  }
}

module.exports = {
  getScenarios,
  startIncident,
  getIncident,
  unlockEvidence,
  advanceStage,
  executeAction,
  generatePostmortem,
  consolidateToMemory,
  resetDemo,
};
