const mongoose = require('mongoose');

const hindsightMemorySchema = new mongoose.Schema(
  {
    memoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sourceIncidentId: {
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
      index: true,
    },
    symptomSignature: {
      type: String,
      required: true,
    },
    rootCause: {
      type: String,
      required: true,
    },
    triggeringPattern: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    effectiveActions: [
      {
        actionId: String,
        name: String,
        reason: String,
        impact: String,
      },
    ],
    ineffectiveActions: [
      {
        actionId: String,
        name: String,
        trapReason: String,
        risk: String,
      },
    ],
    lessonsLearned: [String],
    preventiveRecommendations: [String],
    mttrMinutes: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0.95,
    },
    contradictionClues: [String],
    verified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HindsightMemory', hindsightMemorySchema);
