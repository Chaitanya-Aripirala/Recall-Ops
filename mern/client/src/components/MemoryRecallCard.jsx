import React from 'react';
import { Brain, Zap, AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function MemoryRecallCard({ recalledMemories = [], scenarioId, onExploreMemory }) {
  const hasMemories = recalledMemories && recalledMemories.length > 0;
  const isA2Repeat = scenarioId === 'INC-A2';
  const isB1Distractor = scenarioId === 'INC-B1';

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        border: hasMemories ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
        background: isA2Repeat
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
          : isB1Distractor
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(18, 24, 38, 0.75) 100%)'
          : 'var(--bg-card)',
        boxShadow: isA2Repeat ? '0 0 25px rgba(99, 102, 241, 0.2)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isA2Repeat ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={16} color={isA2Repeat ? '#fff' : 'var(--accent-indigo)'} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Hindsight Memory Recall
              {isA2Repeat && (
                <span className="badge badge-memory" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  <Zap size={11} /> 98% Match (INC-A1)
                </span>
              )}
            </h3>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {hasMemories ? `${recalledMemories.length} Precedent(s) Found` : 'No Prior Memory'}
        </span>
      </div>

      {!hasMemories ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            First-time Encounter (Cold Triage)
          </div>
          No prior organizational memory exists for this symptom pattern. The AI Incident Agent will explore multiple hypotheses and record learned lessons upon resolution.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recalledMemories.map((mem, idx) => {
            const isSupporting = mem.status === 'supporting';
            const isContradicted = mem.status === 'contradicted';

            return (
              <div
                key={mem.memoryId || idx}
                style={{
                  background: isContradicted
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(99, 102, 241, 0.08)',
                  border: `1px solid ${
                    isContradicted ? 'rgba(245, 158, 11, 0.35)' : 'rgba(99, 102, 241, 0.35)'
                  }`,
                  borderRadius: '10px',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(99, 102, 241, 0.25)',
                        color: '#c7d2fe',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {mem.sourceIncidentId}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {mem.title}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isContradicted ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                    }}
                  >
                    {isContradicted ? '⚠️ Contradicted' : `⚡ ${mem.relevanceScore}% Relevance`}
                  </span>
                </div>

                {/* Root cause summary */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Known Root Cause: </strong>
                  {mem.rootCause}
                </div>

                {/* Anti-pattern warning if present */}
                {mem.warning && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      color: '#fca5a5',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertOctagon size={14} color="#f87171" style={{ flexShrink: 0 }} />
                    {mem.warning}
                  </div>
                )}

                {/* Recommendation */}
                {mem.recommendedAction && !isContradicted && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      color: '#6ee7b7',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={14} color="#34d399" style={{ flexShrink: 0 }} />
                    {mem.recommendedAction}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
