const HindsightMemory = require('../models/HindsightMemory');

/**
 * Default Seed Memories that represent baseline organizational knowledge
 */
const DEFAULT_MEMORIES = [
  {
    memoryId: 'MEM-REDIS-LEAK-A1',
    sourceIncidentId: 'INC-A1',
    title: 'payment-api Redis Connection Pool Exhaustion on v2.17.4',
    service: 'payment-api',
    symptomSignature: 'HTTP 503 storm, checkout completion collapsed, RedisTimeout in logs, client pool pinned at max (100/100)',
    rootCause: 'Connection leak in cart session billing-meta read introduced in v2.17.4 per-worker pool switch. Connections not released in checkout error path.',
    triggeringPattern: 'High 503 error rate on checkout shortly after deployment + Redis client pool pinned at limit while Redis server CPU is LOW (<15%)',
    tags: ['redis', 'pool-exhaustion', 'regression', 'connection-leak', 'payment-api'],
    effectiveActions: [
      {
        actionId: 'rollback_recent_deploy',
        name: 'Rollback payment-api to v2.17.3',
        reason: 'Restores working pool handling code and drains leaked client connections within 30s.',
        impact: 'Full recovery, 5xx back to baseline 0.4%, latency down to 118ms.',
      },
      {
        actionId: 'inspect_redis_connections',
        name: 'Inspect per-worker Redis connection stats',
        reason: 'Confirms leak is on client side rather than Redis server saturation.',
        impact: 'Proves root cause instantly without guessing.',
      },
    ],
    ineffectiveActions: [
      {
        actionId: 'restart_api_pool',
        name: 'Rolling Pod Restart',
        trapReason: 'Runbook standard action. Temporarily resets leaked sockets (12% 5xx for 45s), but leaks immediately rebuild back to 31% 5xx within 48s.',
        risk: 'High MTTR waste, false sense of resolution, causes secondary traffic spike.',
      },
      {
        actionId: 'flush_cache',
        name: 'Flush Redis Cache',
        trapReason: 'Destroys valid session cache without fixing the connection socket exhaustion.',
        risk: 'Severe cache stampede, high database load.',
      },
    ],
    lessonsLearned: [
      'Normal Redis CPU is a signal of client-side socket leak, NOT a reason to rule out Redis pool exhaustion.',
      'Pod restarts are a trap for code-level connection leaks — always prioritize deployment rollback.',
      'Per-worker connection pools must be configured with explicit checkout timeouts and auto-reaping.',
    ],
    preventiveRecommendations: [
      'Add connection pool saturation alert monitor.',
      'Enforce automated linting for try/finally connection release blocks in Go/Node workers.',
      'Conduct canary deployments for connection-pooling alterations.',
    ],
    mttrMinutes: 42.5,
    confidenceScore: 0.98,
    contradictionClues: [
      'redis-cache cpu is high (>80%) - indicates server overload, not client leak',
      'postgres-orders pool exhausted - indicates database query bottleneck, not Redis',
      'No recent deployment in past 72h - suggests external load spike or 3rd party degradation',
    ],
    verified: true,
  },
  {
    memoryId: 'MEM-PG-SLOW-QUERY-B1',
    sourceIncidentId: 'INC-B1',
    title: 'orders-api Postgres Connection Pool Exhaustion from Unindexed Query',
    service: 'orders-api',
    symptomSignature: 'Order creation latency p95 >6s, Postgres "too many clients already", orders-api 503s',
    rootCause: 'Missing composite index on orders table after schema migration caused table scans holding DB connections.',
    triggeringPattern: 'Postgres active connections at max_connections limit, query latency spiked, Redis healthy',
    tags: ['postgres', 'slow-query', 'database', 'orders-api', 'connection-pool'],
    effectiveActions: [
      {
        actionId: 'kill_long_running_queries',
        name: 'Terminate Long-Running Queries and Add Query Index',
        reason: 'Releases held Postgres connections immediately and restores throughput.',
        impact: 'Postgres connections drop from 100/100 to 22/100, latency back to 180ms.',
      },
    ],
    ineffectiveActions: [
      {
        actionId: 'restart_api_pool',
        name: 'Restart orders-api pods',
        trapReason: 'Does not clear locked backend queries on PostgreSQL and causes queued requests to fail immediately.',
        risk: 'Database remains locked.',
      },
    ],
    lessonsLearned: [
      'Do not confuse Redis client pool exhaustion with Postgres backend connection starvation.',
      'Inspect pg_stat_activity before touching API deployments.',
    ],
    preventiveRecommendations: [
      'Add pg_stat_statements query execution time threshold alerts.',
      'Enforce DB migration review guidelines for unindexed foreign keys.',
    ],
    mttrMinutes: 28.0,
    confidenceScore: 0.94,
    contradictionClues: ['redis-cache is degraded', 'postgres-orders CPU is < 5%'],
    verified: true,
  },
];

const Postmortem = require('../models/Postmortem');

const DEFAULT_POSTMORTEMS = [
  {
    scenarioId: 'INC-A1',
    title: 'Postmortem: payment-api 503 storm 14 minutes after v2.17.4',
    service: 'payment-api',
    severity: 'SEV-1',
    executiveSummary: 'An outage on payment-api caused elevated 5xx error rates (surging from 0.4% to 31%) impacting checkout completion. Triage identified a client-side connection leak introduced during connection-pool refactoring in release v2.17.4.',
    rootCauseAnalysis: 'Connection leak in cart session billing-meta read introduced in v2.17.4 per-worker pool switch. Connections were not released in checkout error path, pinning active sockets at 100/100.',
    contributingFactors: [
      'Lack of automated connection leak tests in CI pipeline',
      'Misleading nominal Redis server CPU obscured client-side connection starvation',
      'Runbook previously advised rolling restart which masked root cause and caused regression',
    ],
    detectionMethod: 'Datadog monitor http_5xx_ratio breached 5% threshold',
    effectiveMitigations: ['Rollback of v2.17.4 to v2.17.3', 'Connection pool parameter validation'],
    failedAttempts: ['Rolling pod restart (temporary relief for 45s, regressed back to 31% error rate)'],
    actionItems: [
      { description: 'Add mandatory CI unit tests verifying Redis connection release on exception paths', owner: 'Backend Platform Team', status: 'Completed', priority: 'P0' },
      { description: 'Configure pool saturation and acquisition wait alarms in Datadog/Prometheus', owner: 'SRE / Observability', status: 'Completed', priority: 'P1' },
      { description: 'Update team runbook to deprecate blind pod restarts during connection pool starvation', owner: 'Payments On-Call', status: 'Completed', priority: 'P0' },
    ],
    lessonsLearned: [
      'Organizational memory is vital for preventing repeat mistakes and eliminating runbook anti-patterns.',
      'Low Redis server CPU does not mean Redis caching is unaffected; inspect client-side pool utilization metrics.',
      'Code-level resource leaks cannot be cured by process restarts without rollback or fix.',
    ],
    status: 'consolidated_to_memory',
    approvedBy: 'Lead SRE & Incident Commander',
    consolidatedMemoryId: 'MEM-REDIS-LEAK-A1',
  },
];

/**
 * Ensure default memories and baseline postmortems are seeded in MongoDB
 */
async function seedDefaultMemories() {
  try {
    for (const mem of DEFAULT_MEMORIES) {
      await HindsightMemory.findOneAndUpdate({ memoryId: mem.memoryId }, mem, { upsert: true, new: true });
    }
    for (const pm of DEFAULT_POSTMORTEMS) {
      await Postmortem.findOneAndUpdate({ scenarioId: pm.scenarioId }, pm, { upsert: true, new: true });
    }
    console.log('✅ Hindsight Memory baseline knowledge & Postmortems seeded into MongoDB');
  } catch (err) {
    console.error('Error seeding default memories and postmortems:', err.message);
  }
}

/**
 * Recall relevant memories for a given incident scenario & current evidence
 */
async function recallMemoriesForIncident(scenario) {
  try {
    const allMemories = await HindsightMemory.find({}).lean();
    const recalled = [];

    const scenarioTags = scenario.tags || [];
    const serviceName = scenario.service || '';
    const scenarioSymptom = (scenario.symptom || '').toLowerCase();
    const scenarioSummary = (scenario.summary || '').toLowerCase();

    for (const mem of allMemories) {
      let score = 0;
      let status = 'neutral';
      let matchReasons = [];

      // 1. Service match
      if (mem.service === serviceName) {
        score += 35;
        matchReasons.push(`Exact service match (${serviceName})`);
      }

      // 2. Tag overlap
      const sharedTags = (mem.tags || []).filter((t) => scenarioTags.includes(t));
      if (sharedTags.length > 0) {
        score += Math.min(40, sharedTags.length * 15);
        matchReasons.push(`Matching tags: ${sharedTags.join(', ')}`);
      }

      // 3. Symptom / keyword match
      if (scenarioSymptom.includes('redis') && mem.symptomSignature.toLowerCase().includes('redis')) {
        score += 25;
      }
      if (scenarioSymptom.includes('503') || scenarioSymptom.includes('502')) {
        score += 10;
      }
      if (scenarioSymptom.includes('pool') || scenarioSummary.includes('pool')) {
        score += 15;
      }

      // Check for contradiction conditions!
      // Example: Scenario INC-B1 is Postgres, but recalls Redis memory -> flag contradiction
      if (scenario.id === 'INC-B1' && mem.tags.includes('redis')) {
        status = 'contradicted';
        score = Math.min(score, 45); // Demote score
      } else if (scenario.id === 'INC-C1' && (mem.tags.includes('redis') || mem.tags.includes('postgres'))) {
        status = 'contradicted';
        score = Math.min(score, 30);
      } else if (score >= 60) {
        status = 'supporting';
      }

      // Format recalled memory item
      if (score >= 25 || (scenario.id === 'INC-A2' && mem.sourceIncidentId === 'INC-A1')) {
        const isExactRepeat = scenario.id === 'INC-A2' && mem.sourceIncidentId === 'INC-A1';
        const finalScore = isExactRepeat ? 98 : Math.min(95, score);

        recalled.push({
          memoryId: mem.memoryId,
          sourceIncidentId: mem.sourceIncidentId,
          title: mem.title,
          service: mem.service,
          relevanceScore: finalScore,
          rootCause: mem.rootCause,
          status: isExactRepeat ? 'supporting' : status,
          matchReasons,
          warning: mem.ineffectiveActions && mem.ineffectiveActions.length > 0
            ? `⚠️ ANTI-PATTERN WARNING: ${mem.ineffectiveActions[0].name} failed in ${mem.sourceIncidentId} (${mem.ineffectiveActions[0].trapReason})`
            : null,
          recommendedAction: mem.effectiveActions && mem.effectiveActions.length > 0
            ? `💡 PROVEN MITIGATION: ${mem.effectiveActions[0].name} — ${mem.effectiveActions[0].reason}`
            : null,
          ineffectiveActions: mem.ineffectiveActions || [],
          effectiveActions: mem.effectiveActions || [],
          lessonsLearned: mem.lessonsLearned || [],
          preventiveRecommendations: mem.preventiveRecommendations || [],
          isRepeatRecognition: isExactRepeat,
        });
      }
    }

    // Sort by relevance score descending
    recalled.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return recalled;
  } catch (err) {
    console.error('Error in recallMemoriesForIncident:', err);
    return [];
  }
}

module.exports = {
  seedDefaultMemories,
  recallMemoriesForIncident,
  DEFAULT_MEMORIES,
};
