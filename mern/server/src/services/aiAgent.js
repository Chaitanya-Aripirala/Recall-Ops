/**
 * AI Agent Reasoning Engine for RecallOps
 * Generates hypotheses, evaluates evidence, recommends actions, and compiles postmortems.
 */

function generateHypothesesForIncident(scenario, currentStage, recalledMemories = []) {
  const scenarioId = scenario.id.toUpperCase();
  const hasMemoryRecall = recalledMemories.some((m) => m.sourceIncidentId === 'INC-A1' && m.status === 'supporting');

  if (scenarioId === 'INC-A1') {
    // First encounter with Redis leak: multiple competing hypotheses
    return [
      {
        id: 'hyp-a1-1',
        title: 'Redis Connection Pool Exhaustion from v2.17.4 release',
        description: 'New billing-meta code in cart session is leaking Redis client connections on error branches.',
        confidence: currentStage.id === 'alert' ? 55 : 88,
        status: currentStage.id === 'resolved' ? 'confirmed' : 'active',
        supportingEvidence: [
          'Deploy v2.17.4 occurred 14m before alert (correlation 0.82)',
          'Redis client pool pinned at 100/100 with 37 waiters',
          'Log canary leak: checkout_conn_leak 318 warnings',
        ],
        contradictingEvidence: ['Redis server CPU is only 11% (misleading indicator of server health)'],
        memoryBacking: null,
        recommendedActionId: 'rollback_recent_deploy',
      },
      {
        id: 'hyp-a1-2',
        title: 'Transient payment-api pod worker deadlock (Runbook default)',
        description: 'Temporary thread exhaustion recoverable via rolling pod restart.',
        confidence: currentStage.id === 'alert' ? 45 : 15,
        status: currentStage.id === 'regression' ? 'rejected' : 'active',
        supportingEvidence: ['HTTP 503 surge without upstream DB saturation'],
        contradictingEvidence: [
          'Pod restart in test only dropped 5xx for 45 seconds before regressing',
          'Root cause code is baked into v2.17.4 image',
        ],
        memoryBacking: null,
        recommendedActionId: 'restart_api_pool',
      },
      {
        id: 'hyp-a1-3',
        title: 'Redis Server Node Overload / Network Partition',
        description: 'Redis cache cluster node experiencing memory pressure or dropped packets.',
        confidence: 20,
        status: 'rejected',
        supportingEvidence: ['RedisTimeout exceptions in application logs'],
        contradictingEvidence: ['Redis exporter shows node CPU at 11%, memory normal, latency 1.2ms'],
        memoryBacking: null,
        recommendedActionId: 'flush_cache',
      },
    ];
  }

  if (scenarioId === 'INC-A2') {
    // Repeat encounter: Hindsight Memory recognition immediately isolates root cause!
    return [
      {
        id: 'hyp-a2-1',
        title: '⚡ Redis Client Pool Exhaustion (Exact Repeat Pattern from INC-A1)',
        description: 'Hindsight Memory identified identical symptom signature and leak mechanism. v2.18.1 re-introduced unreleased connection handling in session worker.',
        confidence: 96,
        status: currentStage.id === 'resolved' ? 'confirmed' : 'active',
        supportingEvidence: [
          'Hindsight Memory match: INC-A1 (98% similarity score)',
          'Checkout latency >4s with 502/503 cache acquisition timeouts',
          'Client connections climbing while Redis server CPU remains healthy (14%)',
          'Matches known anti-pattern: pod restart proven ineffective in prior incident',
        ],
        contradictingEvidence: [],
        memoryBacking: 'INC-A1 (Organisational Memory: MEM-REDIS-LEAK-A1)',
        recommendedActionId: 'rollback_recent_deploy',
      },
      {
        id: 'hyp-a2-2',
        title: 'Upstream PSP / Acquirer Latency Degradation',
        description: 'External payment gateway latency propagating back to cart session timeouts.',
        confidence: 12,
        status: 'rejected',
        supportingEvidence: ['PSP integration in payment flow'],
        contradictingEvidence: [
          'psp-acquirer-eu telemetry shows nominal p95 latency (195ms)',
          'Hindsight memory rules this out in favor of client connection pool leak',
        ],
        memoryBacking: null,
        recommendedActionId: 'inspect_dependency_health',
      },
    ];
  }

  if (scenarioId === 'INC-B1') {
    // Distractor scenario: Postgres query regression, not Redis!
    return [
      {
        id: 'hyp-b1-1',
        title: 'PostgreSQL Connection Starvation via Unindexed Query Scan',
        description: 'Unindexed query on orders table holds DB connections to max_connections ceiling.',
        confidence: 93,
        status: currentStage.id === 'resolved' ? 'confirmed' : 'active',
        supportingEvidence: [
          'Postgres error: "too many clients already" (100/100 connections active)',
          'orders-api p95 latency rose from 180ms to 6.4s',
          'pg_stat_activity shows 74 idle-in-transaction connections',
        ],
        contradictingEvidence: [],
        memoryBacking: null,
        recommendedActionId: 'kill_long_running_queries',
      },
      {
        id: 'hyp-b1-2',
        title: '⚠️ Recalled Redis Pool Pattern (Contradicted by Evidence)',
        description: 'Prior Redis pool memories are CONTRADICTED because Redis cache telemetry is 100% nominal (CPU 8%, latency 1.1ms).',
        confidence: 8,
        status: 'rejected',
        supportingEvidence: ['503 error codes on API layer'],
        contradictingEvidence: ['redis-cache cluster is completely healthy', 'PostgreSQL DB is saturated, not Redis'],
        memoryBacking: 'Contradicted INC-A1 Memory',
        recommendedActionId: 'inspect_redis_connections',
      },
    ];
  }

  if (scenarioId === 'INC-C1') {
    // Third party dependency timeout
    return [
      {
        id: 'hyp-c1-1',
        title: 'Third-Party Fraud Scoring Provider Timeout',
        description: 'External fraud assessment vendor is timing out (>8s), blocking checkout confirmations.',
        confidence: 94,
        status: currentStage.id === 'resolved' ? 'confirmed' : 'active',
        supportingEvidence: [
          'External HTTP calls to fraud-shield.io timing out after 8000ms',
          'All internal services (db, cache, checkout-web) healthy with low CPU',
          'No deployment in the last 72 hours',
        ],
        contradictingEvidence: [],
        memoryBacking: null,
        recommendedActionId: 'enable_degraded_mode',
      },
    ];
  }

  if (scenarioId === 'INC-D1') {
    // Catalog CPU & N+1 query explosion
    return [
      {
        id: 'hyp-d1-1',
        title: 'ORM N+1 Query Regression in v5.2.0 Deploy',
        description: 'Missing prefetch in category handler exploded queries per request from 9 to 1180, driving CPU to 97%.',
        confidence: 95,
        status: currentStage.id === 'resolved' ? 'confirmed' : 'active',
        supportingEvidence: [
          'v5.2.0 shipped 11 minutes before CPU spike',
          'Queries per request increased 131x (9 -> 1180)',
          'Catalog API CPU pinned at 97%',
        ],
        contradictingEvidence: [],
        memoryBacking: null,
        recommendedActionId: 'rollback_recent_deploy',
      },
    ];
  }

  // Fallback generic hypothesis
  return [
    {
      id: 'hyp-gen-1',
      title: 'Service Degradation under Elevated Traffic or Dependency Slowness',
      description: 'System experiencing elevated error rates and latency.',
      confidence: 60,
      status: 'active',
      supportingEvidence: ['Error rate alert triggered'],
      contradictingEvidence: [],
      memoryBacking: null,
      recommendedActionId: 'inspect_service_health',
    },
  ];
}

/**
 * Generate Action Recommendations with Risk & Blast Radius
 */
function getActionRecommendations(scenario, currentStage, recalledMemories = []) {
  const scenarioId = (scenario.id || '').toUpperCase();
  const hasA1Memory = recalledMemories.some((m) => m.sourceIncidentId === 'INC-A1');

  const rawActions = scenario.actions || [];
  const actionList = Array.isArray(rawActions)
    ? rawActions
    : Object.entries(rawActions).map(([key, val]) => ({
        id: key,
        name: (key.charAt(0).toUpperCase() + key.slice(1)).replace(/_/g, ' '),
        ...(typeof val === 'object' && val !== null ? val : { detail: val }),
      }));

  const actions = actionList.map((act) => {
    let riskLevel = 'Low';
    let blastRadius = 'Single service';
    let recommendationScore = 70;
    let memoryWarning = null;
    let memoryEndorsement = null;

    if (act.id === 'restart_api_pool') {
      riskLevel = 'Medium';
      blastRadius = 'Workers momentarily drop in-flight requests';
      if (scenarioId === 'INC-A2' || (scenarioId === 'INC-A1' && currentStage.id === 'regression')) {
        riskLevel = 'High (Trap)';
        recommendationScore = 15;
        memoryWarning = '⚠️ DO NOT EXECUTE: In INC-A1, rolling restart gave temporary relief for ~45s then regressed to 31% error rate.';
      } else {
        recommendationScore = 45;
      }
    } else if (act.id === 'rollback_recent_deploy') {
      riskLevel = 'Low';
      blastRadius = 'payment-api rolled back to prior stable tag';
      recommendationScore = 95;
      if (hasA1Memory || scenarioId === 'INC-A2') {
        memoryEndorsement = '✅ HIGH CONFIDENCE PROVEN MITIGATION: Rollback in INC-A1 resolved 5xx within 30s.';
      }
    } else if (act.id === 'kill_long_running_queries') {
      riskLevel = 'Low';
      blastRadius = 'Cancels idle & slow backend SQL sessions';
      recommendationScore = 98;
    } else if (act.id === 'enable_degraded_mode') {
      riskLevel = 'Low';
      blastRadius = 'Switches fraud scoring to async queue fallback';
      recommendationScore = 96;
    } else if (act.id === 'flush_cache') {
      riskLevel = 'Critical';
      blastRadius = 'Clears all Redis cached session data (causes DB stampede)';
      recommendationScore = 10;
      memoryWarning = '⚠️ HIGH RISK: Cache flush will flood backend databases with un-cached reads.';
    }

    return {
      ...act,
      riskLevel,
      blastRadius,
      recommendationScore,
      memoryWarning,
      memoryEndorsement,
      requiresApproval: true,
    };
  });

  // Sort by recommendation score descending
  actions.sort((a, b) => b.recommendationScore - a.recommendationScore);
  return actions;
}

/**
 * Generate Structured Postmortem
 */
function generateStructuredPostmortem(incident, scenario) {
  const isA2 = incident.scenarioId === 'INC-A2';
  const isA1 = incident.scenarioId === 'INC-A1';

  return {
    scenarioId: incident.scenarioId,
    title: `Postmortem: ${incident.title}`,
    service: incident.service,
    severity: incident.severity,
    executiveSummary: isA2
      ? 'A repeat Redis connection pool exhaustion occurred following release v2.18.1. Leveraging Hindsight Organizational Memory from INC-A1, the AI Incident Response system immediately recognized the failure pattern, bypassed the ineffective pod restart trap, and rolled back the regression in under 5 minutes.'
      : `An outage on ${incident.service} caused elevated 5xx error rates impacting checkout completion. Triage identified a client-side connection leak introduced during connection-pool refactoring in the recent release.`,
    rootCauseAnalysis: isA2
      ? 'Per-worker Redis connection pool in v2.18.1 omitted pool.Release() in unhandled cart validation exception branch. Re-occurrence of the failure pattern originally documented in INC-A1.'
      : 'Connection leak in cart session billing-meta read introduced in v2.17.4 per-worker pool switch. Connections were not released in checkout error path, pinning active sockets at 100/100.',
    contributingFactors: [
      'Lack of automated connection leak tests in CI pipeline',
      'Misleading nominal Redis server CPU obscured client-side connection starvation',
      'Runbook previously advised rolling restart which masked root cause',
    ],
    detectionMethod: 'Datadog monitor http_5xx_ratio breached 5% threshold',
    timeline: (incident.timeline || []).map((t) => ({
      ts: t.ts,
      description: t.detail || t.title,
      source: t.actor || 'System',
    })),
    effectiveMitigations: isA2
      ? ['Direct deployment rollback to prior stable release (identified via Hindsight Memory)', 'Connection drain verification']
      : ['Rollback of v2.17.4 to v2.17.3', 'Connection pool parameter validation'],
    failedAttempts: isA2
      ? ['None — Hindsight Memory prevented repeating the pod restart anti-pattern']
      : ['Rolling pod restart (temporary relief for 45s, regressed to 31% error rate)'],
    actionItems: [
      {
        description: 'Add mandatory CI unit tests verifying Redis connection release on exception paths',
        owner: 'Backend Platform Team',
        status: 'Open',
        priority: 'P0',
      },
      {
        description: 'Configure pool saturation and acquisition wait alarms in Datadog/Prometheus',
        owner: 'SRE / Observability',
        status: 'Open',
        priority: 'P1',
      },
      {
        description: 'Update team runbook to deprecate blind pod restarts during connection pool starvation',
        owner: 'Payments On-Call',
        status: 'Completed',
        priority: 'P0',
      },
    ],
    lessonsLearned: [
      'Organizational memory is vital for preventing repeat mistakes and eliminating runbook anti-patterns.',
      'Low Redis server CPU does not mean Redis caching is unaffected; inspect client-side pool utilization metrics.',
      'Code-level resource leaks cannot be cured by process restarts without rollback or fix.',
    ],
    status: 'approved',
    approvedBy: 'Lead SRE & On-Call Commander',
  };
}

module.exports = {
  generateHypothesesForIncident,
  getActionRecommendations,
  generateStructuredPostmortem,
};
