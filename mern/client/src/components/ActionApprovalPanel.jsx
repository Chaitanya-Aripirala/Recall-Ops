import React, { useState } from 'react';
import { ShieldCheck, Play, AlertTriangle, CheckCircle2, AlertOctagon, RotateCcw, Zap } from 'lucide-react';

export default function ActionApprovalPanel({ recommendedActions = [], onExecuteAction, executing, isResolved }) {
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [approvedBy, setApprovedBy] = useState('On-Call SRE (Human-in-the-loop)');

  const handleExecute = (actionId) => {
    onExecuteAction(actionId, approvedBy);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Recommended Actions & Human Approval Gate</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {recommendedActions.length} actions available
        </span>
      </div>

      {isResolved ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '10px',
            padding: '1.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={32} color="var(--accent-emerald)" />
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
            Incident Successfully Mitigated & Resolved
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Telemetry stabilized at healthy baselines. Generate the postmortem to consolidate lessons into Organizational Memory.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {recommendedActions.map((act) => {
            const isTrap = act.riskLevel?.includes('Trap') || act.recommendationScore < 20;
            const isTopPick = act.recommendationScore >= 80;

            return (
              <div
                key={act.id}
                style={{
                  background: isTrap
                    ? 'rgba(239, 68, 68, 0.06)'
                    : isTopPick
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${
                    isTrap
                      ? 'rgba(239, 68, 68, 0.35)'
                      : isTopPick
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'var(--border-subtle)'
                  }`,
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {act.name || act.id}
                      </span>
                      {isTopPick && (
                        <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>
                          <Zap size={10} /> Top Recommendation
                        </span>
                      )}
                      {isTrap && (
                        <span className="badge badge-trap" style={{ fontSize: '0.65rem' }}>
                          ⚠️ Known Trap
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {act.description || act.rationale}
                    </div>
                  </div>

                  {/* Blast Radius & Risk Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isTrap
                          ? 'rgba(239, 68, 68, 0.2)'
                          : isTopPick
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(255, 255, 255, 0.08)',
                        color: isTrap ? '#fca5a5' : isTopPick ? '#6ee7b7' : 'var(--text-secondary)',
                      }}
                    >
                      Risk: {act.riskLevel || 'Low'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Blast: {act.blastRadius || 'Single pod'}
                    </span>
                  </div>
                </div>

                {/* Memory Warning / Endorsement Callouts */}
                {act.memoryWarning && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      color: '#fca5a5',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertOctagon size={14} color="#f87171" style={{ flexShrink: 0 }} />
                    {act.memoryWarning}
                  </div>
                )}

                {act.memoryEndorsement && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.76rem',
                      color: '#6ee7b7',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={14} color="#34d399" style={{ flexShrink: 0 }} />
                    {act.memoryEndorsement}
                  </div>
                )}

                {/* Human Approval & Execution Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} color="var(--accent-cyan)" />
                    Gate: Requires Human SRE Approval
                  </div>

                  <button
                    className={isTrap ? 'btn-danger' : 'btn-success'}
                    onClick={() => handleExecute(act.id)}
                    disabled={executing}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <Play size={12} />
                    {executing ? 'Executing Mitigation...' : `Approve & Execute`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
