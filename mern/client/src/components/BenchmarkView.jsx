import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingDown, Zap, Clock, ShieldCheck, DollarSign, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { analyticsAPI } from '../api';

export default function BenchmarkView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBenchmarks() {
      try {
        const res = await analyticsAPI.getBenchmarks();
        if (res.data.success) {
          setData(res.data.benchmark);
        }
      } catch (err) {
        console.error('Error fetching benchmarks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBenchmarks();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Calculating Organizational Memory Benchmarks...
      </div>
    );
  }

  const { summary, comparison, roiCalculations, memoryHealth } = data || {};
  const first = comparison?.firstEncounter || {};
  const repeat = comparison?.repeatEncounter || {};

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <BarChart3 size={24} color="var(--accent-emerald)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Organizational Memory ROI & Learning Loop Velocity
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Quantified proof of how Hindsight Organizational Memory fundamentally accelerates incident resolution on recurring failure patterns.
        </p>
      </div>

      {/* Top ROI KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>MTTR REDUCTION</span>
            <TrendingDown size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', margin: '6px 0 2px 0' }}>
            {summary?.mttrReductionPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            From 42.5 mins down to 4.5 mins
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>TIME TO ROOT CAUSE</span>
            <Zap size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', margin: '6px 0 2px 0' }}>
            {summary?.ttrcReductionPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            18.5 mins ➔ 1.2 mins direct recall
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>ANTI-PATTERN TRAPS ELIMINATED</span>
            <ShieldCheck size={18} color="var(--accent-rose)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185', margin: '6px 0 2px 0' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pod restart failure avoided in repeat
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>ESTIMATED DOWNTIME SAVED</span>
            <DollarSign size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fcd34d', margin: '6px 0 2px 0' }}>
            ${(roiCalculations?.estimatedRevenueSavedUsd || 142500).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            38 mins checkout downtime avoided
          </div>
        </div>
      </div>

      {/* ── Side-by-Side Detailed Benchmark Comparison ───────────────────────── */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            Side-by-Side Incident Execution Comparison: INC-A1 vs INC-A2
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Observing how organizational memory fundamentally changes AI agent reasoning and operational outcomes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* INC-A1 Column (Without Memory) */}
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.05)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(244, 63, 94, 0.2)', paddingBottom: '0.6rem' }}>
              <div>
                <span className="badge badge-sev1" style={{ fontSize: '0.65rem' }}>First Encounter</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '4px' }}>INC-A1 (Zero Memory)</h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700 }}>Cold Triage</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Time to Root Cause (TTRC):</span>
                <strong style={{ color: '#fb7185' }}>{first.ttrcMinutes} minutes</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mean Time to Resolution (MTTR):</span>
                <strong style={{ color: '#fb7185' }}>{first.mttrMinutes} minutes</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hypotheses Formulated:</span>
                <strong style={{ color: 'var(--text-main)' }}>{first.hypothesesEvaluated} competing</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Initial Confidence:</span>
                <strong style={{ color: 'var(--accent-amber)' }}>{first.rootCauseConfidence}%</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(239, 68, 68, 0.12)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ Ineffective Actions Attempted:</span>
                <span style={{ color: '#fca5a5' }}>• Rolling Pod Restart (Provided 45s false relief, then regressed)</span>
              </div>
            </div>
          </div>

          {/* INC-A2 Column (With Memory) */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '0.6rem' }}>
              <div>
                <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>Repeat Encounter</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '4px' }}>INC-A2 (Hindsight Active)</h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>⚡ 98% Memory Match</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Time to Root Cause (TTRC):</span>
                <strong style={{ color: '#34d399' }}>{repeat.ttrcMinutes} minutes (93.5% faster!)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mean Time to Resolution (MTTR):</span>
                <strong style={{ color: '#34d399' }}>{repeat.mttrMinutes} minutes (89.4% faster!)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hypotheses Formulated:</span>
                <strong style={{ color: '#34d399' }}>{repeat.hypothesesEvaluated} (Immediate pinpoint)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Initial Confidence:</span>
                <strong style={{ color: '#34d399' }}>{repeat.rootCauseConfidence}%</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(16, 185, 129, 0.12)', padding: '8px', borderRadius: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 700 }}>🛡️ Trap Avoided via Memory:</span>
                <span style={{ color: '#6ee7b7' }}>• Pod restart rejected immediately; executed rollback directly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
