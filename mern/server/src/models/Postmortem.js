const mongoose = require('mongoose');

const postmortemSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
    },
    scenarioId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      default: 'SEV-1',
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    rootCauseAnalysis: {
      type: String,
      required: true,
    },
    contributingFactors: [String],
    detectionMethod: String,
    timeline: [
      {
        ts: Date,
        description: String,
        source: String,
      },
    ],
    effectiveMitigations: [String],
    failedAttempts: [String],
    actionItems: [
      {
        description: String,
        owner: String,
        status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
        priority: { type: String, enum: ['P0', 'P1', 'P2'], default: 'P1' },
      },
    ],
    lessonsLearned: [String],
    status: {
      type: String,
      enum: ['draft', 'approved', 'consolidated_to_memory'],
      default: 'draft',
    },
    approvedBy: String,
    consolidatedMemoryId: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Postmortem', postmortemSchema);
