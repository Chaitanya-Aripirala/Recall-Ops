const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    scenarioId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['seed', 'repeat', 'distractor', 'dependency', 'regression', 'custom'],
      default: 'seed',
    },
    severity: {
      type: String,
      enum: ['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'],
      default: 'SEV-1',
    },
    status: {
      type: String,
      enum: ['active', 'investigating', 'mitigating', 'resolved', 'closed'],
      default: 'active',
    },
    summary: String,
    symptom: String,
    currentStageIndex: {
      type: Number,
      default: 0,
    },
    currentStageId: {
      type: String,
      default: 'alert',
    },
    stages: [
      {
        id: String,
        label: String,
        offset_s: Number,
        description: String,
        hint: String,
        unlocks: [String],
        evidence: [mongoose.Schema.Types.Mixed],
        metrics: [mongoose.Schema.Types.Mixed],
      },
    ],
    unlockedEvidenceIds: [String],
    executedActions: [
      {
        actionId: String,
        title: String,
        executedAt: { type: Date, default: Date.now },
        approvedBy: { type: String, default: 'On-Call Engineer' },
        result: mongoose.Schema.Types.Mixed,
        effective: Boolean,
        metricsAfter: mongoose.Schema.Types.Mixed,
      },
    ],
    recalledMemories: [
      {
        memoryId: String,
        sourceIncidentId: String,
        title: String,
        relevanceScore: Number,
        rootCause: String,
        warning: String,
        recommendedAction: String,
        status: String, // 'supporting' | 'contradicted' | 'neutral'
      },
    ],
    hypotheses: [
      {
        id: String,
        title: String,
        description: String,
        confidence: Number,
        status: String, // 'active' | 'confirmed' | 'rejected'
        supportingEvidence: [String],
        contradictingEvidence: [String],
        memoryBacking: String,
        recommendedActionId: String,
      },
    ],
    activeMetrics: [
      {
        name: String,
        label: String,
        value: Number,
        unit: String,
        baseline: Number,
        limit: Number,
        history: [{ ts: Number, value: Number }],
      },
    ],
    timeline: [
      {
        ts: { type: Date, default: Date.now },
        type: { type: String, enum: ['alert', 'evidence', 'memory_recall', 'hypothesis', 'action', 'resolution', 'postmortem'] },
        title: String,
        detail: String,
        actor: String,
      },
    ],
    postmortem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Postmortem',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    resolvedTime: Date,
    mttrSeconds: Number,
    hasMemoryBenefit: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
