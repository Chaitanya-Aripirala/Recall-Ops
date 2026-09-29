import React from 'react';
import { Clock, AlertTriangle, Search, Brain, Play, CheckCircle2, FileText } from 'lucide-react';

export default function IncidentTimeline({ timeline = [] }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-amber)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Incident Timeline & Event Stream</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {timeline.length} events logged
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '380px', paddingRight: '4px' }}>
        {timeline.map((evt, i) => {
          const isAlert = evt.type === 'alert';
          const isMemory = evt.type === 'memory_recall';
          const isAction = evt.type === 'action';
          const isResolution = evt.type === 'resolution';
          const isPostmortem = evt.type === 'postmortem';

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '0.65rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderLeft: `3px solid ${
                  isResolution
                    ? 'var(--accent-emerald)'
                    : isMemory
                    ? 'var(--accent-indigo)'
                    : isAlert
                    ? 'var(--accent-rose)'
                    : isPostmortem
                    ? 'var(--accent-amber)'
                    : 'var(--accent-cyan)'
                }`,
                borderRadius: '0 8px 8px 0',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                {isAlert && <AlertTriangle size={15} color="var(--accent-rose)" />}
                {isMemory && <Brain size={15} color="var(--accent-indigo)" />}
                {isAction && <Play size={15} color="var(--accent-cyan)" />}
                {isResolution && <CheckCircle2 size={15} color="var(--accent-emerald)" />}
                {isPostmortem && <FileText size={15} color="var(--accent-amber)" />}
                {!isAlert && !isMemory && !isAction && !isResolution && !isPostmortem && (
                  <Search size={15} color="var(--text-secondary)" />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {evt.title}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {evt.actor || 'System'}
                  </span>
                </div>
                {evt.detail && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>
                    {evt.detail}
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
