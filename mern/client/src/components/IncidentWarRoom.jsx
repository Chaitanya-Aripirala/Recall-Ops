import React, { useState } from 'react';
import { ShieldAlert, Play, StepForward, CheckCircle2, RotateCcw, FileText, Brain, Sparkles, BarChart3 } from 'lucide-react';
import EvidenceFeed from './EvidenceFeed';
import MemoryRecallCard from './MemoryRecallCard';
import HypothesisList from './HypothesisList';
import ActionApprovalPanel from './ActionApprovalPanel';
import TelemetryGauges from './TelemetryGauges';
import IncidentTimeline from './IncidentTimeline';
import PostmortemModal from './PostmortemModal';

export default function IncidentWarRoom({
  incident,
  scenario,
  recommendedActions = [],
  onUnlockEvidence,
  onAdvanceStage,
  onExecuteAction,
  onGeneratePostmortem,
  onConsolidateToMemory,
  onResetSimulation,
  onNavigateTab,
  loading,
  executing,
}) {
  const [showPostmortemModal, setShowPostmortemModal] = useState(false);
  const [consolidating, setConsolidating] = useState(false);

  if (!incident || !scenario) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading incident environment...
      </div>
    );
  }

  const stages = incident.stages || scenario.stages || [];
  const currentStageIndex = incident.currentStageIndex || 0;
  const currentStage = stages[currentStageIndex] || {};
  const isResolved = incident.status === 'resolved' || currentStage.id === 'resolved';
  const hasPostmortem = !!incident.postmortem;
  const isRepeatScenario = scenario.role === 'repeat' || scenario.id === 'INC-A2';

  const handleConsolidate = async (postmortemId) => {
    setConsolidating(true);
    await onConsolidateToMemory(postmortemId);
    setConsolidating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
      {/* ── Top Incident Banner ────────────────────────────────────────────── */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          border: isResolved
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : isRepeatScenario
            ? '1px solid rgba(99, 102, 241, 0.4)'
            : '1px solid rgba(244, 63, 94, 0.4)',
          background: isResolved
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : isRepeatScenario
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className={isResolved ? 'badge badge-resolved' : 'badge badge-sev1'}>
                {incident.severity || 'SEV-1'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  color: 'var(--accent-cyan)',
                }}
              >
                {incident.service}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: isRepeatScenario ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isRepeatScenario ? '#a5b4fc' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                }}
              >
                Role: {scenario.role}
              </span>
            </div>

            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {incident.title}
            </h1>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: '1.4' }}>
              {incident.summary || scenario.summary}
            </div>
          </div>

          {/* Action Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isResolved ? (
              <button
                className="btn-primary"
                onClick={onAdvanceStage}
                disabled={loading || currentStageIndex >= stages.length - 1}
              >
                <StepForward size={14} />
                Advance Next Stage ({currentStageIndex + 1}/{stages.length})
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={async () => {
                    if (!hasPostmortem) {
                      await onGeneratePostmortem();
                    }
                    setShowPostmortemModal(true);
                  }}
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                  <FileText size={15} />
                  View AI Postmortem
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => onNavigateTab && onNavigateTab('memory_bank')}
                  style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#c7d2fe' }}
                >
                  <Brain size={15} color="var(--accent-indigo)" />
                  Memory Bank
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => onNavigateTab && onNavigateTab('benchmarks')}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}
                >
                  <BarChart3 size={15} color="var(--accent-emerald)" />
                  Memory ROI
                </button>
              </div>
            )}

            <button className="btn-secondary" onClick={onResetSimulation}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* Stage Stepper Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingTop: '4px' }}>
          {stages.map((st, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={st.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: isCurrent
                    ? 'rgba(99, 102, 241, 0.25)'
                    : isPassed
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent
                    ? '1px solid rgba(99, 102, 241, 0.5)'
                    : isPassed
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid transparent',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: isCurrent ? '#ffffff' : isPassed ? '#34d399' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--accent-indigo)' : isPassed ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </span>
                {st.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main 3-Column Cockpit Layout ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Column 1: Evidence & Telemetry Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <EvidenceFeed
            stages={stages}
            currentStageIndex={currentStageIndex}
            unlockedEvidenceIds={incident.unlockedEvidenceIds || []}
            onUnlockEvidence={onUnlockEvidence}
            rawLogs={scenario.logs || []}
          />
        </div>

        {/* Column 2: Memory Recall & Hypotheses & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Hindsight Memory Recall Banner */}
          <MemoryRecallCard
            recalledMemories={incident.recalledMemories || []}
            scenarioId={scenario.id}
          />

          {/* AI Hypotheses Stack */}
          <HypothesisList hypotheses={incident.hypotheses || []} />

          {/* Action Recommendation & Human Approval Panel */}
          <ActionApprovalPanel
            recommendedActions={recommendedActions}
            onExecuteAction={onExecuteAction}
            executing={executing}
            isResolved={isResolved}
          />
        </div>

        {/* Column 3: Telemetry Gauges & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <TelemetryGauges
            metrics={incident.activeMetrics || []}
            isResolved={isResolved}
          />

          <IncidentTimeline timeline={incident.timeline || []} />
        </div>
      </div>

      {/* Postmortem Modal */}
      {showPostmortemModal && incident.postmortem && (
        <PostmortemModal
          postmortem={incident.postmortem}
          onClose={() => setShowPostmortemModal(false)}
          onConsolidateToMemory={handleConsolidate}
          consolidating={consolidating}
        />
      )}
    </div>
  );
}
