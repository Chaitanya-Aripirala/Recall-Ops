import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function TelemetryGauges({ metrics = [], isResolved }) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Real-Time Telemetry & SLO Gauges</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`pulse-dot ${isResolved ? 'pulse-green' : 'pulse-red'}`} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isResolved ? '#34d399' : '#fb7185' }}>
            {isResolved ? 'Healthy Telemetry' : 'Degraded Stream'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {metrics.map((m, i) => {
          const isBreached = m.limit && m.value > m.limit;
          const isHealthy = isResolved || !isBreached;

          return (
            <div
              key={m.name || i}
              style={{
                background: isBreached ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isBreached ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {m.label || m.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isBreached ? '#fb7185' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                  {m.value}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>{m.unit}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  baseline: {m.baseline}{m.unit}
                </span>
              </div>

              {/* Mini visual indicator */}
              <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (m.value / (m.limit || 100)) * 100)}%`,
                    height: '100%',
                    background: isBreached ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                    transition: 'all 0.5s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
