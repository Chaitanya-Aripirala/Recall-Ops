import React from 'react';
import { AlertTriangle, GitCommit, Server, Terminal, Activity, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

export default function EvidenceFeed({ stages = [], currentStageIndex = 0, unlockedEvidenceIds = [], onUnlockEvidence, rawLogs = [] }) {
  // Collect all evidence up to current stage
  const visibleEvidence = [];
  stages.slice(0, currentStageIndex + 1).forEach((st, idx) => {
    (st.evidence || []).forEach((ev) => {
      visibleEvidence.push({
        ...ev,
        stageLabel: st.label,
        stageIndex: idx,
        isUnlocked: unlockedEvidenceIds.includes(ev.id),
      });
    });
  });

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Current Evidence & Telemetry</h3>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
          {visibleEvidence.length} items collected
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', maxHeight: '580px', paddingRight: '4px' }}>
        {visibleEvidence.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.85rem' }}>
            No telemetry evidence recorded yet.
          </div>
        ) : (
          visibleEvidence.map((ev, i) => {
            const isAlert = ev.kind === 'alert';
            const isDeploy = ev.kind === 'deployment';
            const isLog = ev.kind === 'log';
            const isOutcome = ev.kind === 'outcome';

            return (
              <div
                key={ev.id || i}
                style={{
                  background: isAlert
                    ? 'rgba(244, 63, 94, 0.08)'
                    : isDeploy
                    ? 'rgba(99, 102, 241, 0.08)'
                    : isOutcome
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${
                    isAlert
                      ? 'rgba(244, 63, 94, 0.3)'
                      : isDeploy
                      ? 'rgba(99, 102, 241, 0.3)'
                      : isOutcome
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isAlert && <AlertTriangle size={14} color="var(--accent-rose)" />}
                    {isDeploy && <GitCommit size={14} color="var(--accent-indigo)" />}
                    {isLog && <Terminal size={14} color="var(--accent-cyan)" />}
                    {isOutcome && <CheckCircle2 size={14} color="var(--accent-emerald)" />}
                    {!isAlert && !isDeploy && !isLog && !isOutcome && <Server size={14} color="var(--text-secondary)" />}
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {ev.source || ev.kind}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Stage: {ev.stageLabel}
                  </span>
                </div>

                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.3' }}>
                  {ev.title}
                </div>

                {ev.detail && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {ev.detail}
                  </div>
                )}

                {/* Raw Telemetry JSON snippet if available */}
                {ev.raw && (
                  <div className="code-block" style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                    {JSON.stringify(ev.raw, null, 2)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
