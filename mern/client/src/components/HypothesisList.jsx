import React from 'react';
import { Target, CheckCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function HypothesisList({ hypotheses = [] }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Hypotheses & Confidence Ranking</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {hypotheses.length} active hypotheses
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {hypotheses.map((hyp, index) => {
          const isConfirmed = hyp.status === 'confirmed';
          const isRejected = hyp.status === 'rejected';
          const isTopRanked = index === 0;

          return (
            <div
              key={hyp.id || index}
              style={{
                background: isConfirmed
                  ? 'rgba(16, 185, 129, 0.08)'
                  : isTopRanked
                  ? 'rgba(99, 102, 241, 0.06)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${
                  isConfirmed
                    ? 'rgba(16, 185, 129, 0.4)'
                    : isRejected
                    ? 'rgba(239, 68, 68, 0.25)'
                    : isTopRanked
                    ? 'rgba(99, 102, 241, 0.4)'
                    : 'var(--border-subtle)'
                }`,
                borderRadius: '10px',
                padding: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                opacity: isRejected ? 0.6 : 1,
              }}
            >
              {/* Top row: Title + Confidence */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  {isConfirmed ? (
                    <CheckCircle size={16} color="var(--accent-emerald)" />
                  ) : isRejected ? (
                    <XCircle size={16} color="var(--accent-rose)" />
                  ) : (
                    <Sparkles size={16} color={isTopRanked ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
                  )}
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {hyp.title}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: hyp.confidence > 75 ? 'var(--accent-emerald)' : hyp.confidence > 40 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                    {hyp.confidence}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Confidence
                  </div>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${hyp.confidence}%`,
                    height: '100%',
                    background: hyp.confidence > 75
                      ? 'linear-gradient(90deg, #6366f1, #10b981)'
                      : hyp.confidence > 40
                      ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                      : 'linear-gradient(90deg, #f43f5e, #e11d48)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {hyp.description}
              </div>

              {/* Supporting & Contradicting Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
                {hyp.supportingEvidence && hyp.supportingEvidence.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓ Supporting:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{hyp.supportingEvidence.join(' • ')}</span>
                  </div>
                )}
                {hyp.contradictingEvidence && hyp.contradictingEvidence.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>✗ Contradicting:</span>
                    <span style={{ color: '#fca5a5' }}>{hyp.contradictingEvidence.join(' • ')}</span>
                  </div>
                )}
                {hyp.memoryBacking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-indigo)', fontWeight: 600, marginTop: '2px' }}>
                    <span>🧠 Memory Precedent:</span>
                    <span>{hyp.memoryBacking}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
