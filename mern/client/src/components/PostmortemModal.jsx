import React, { useState } from 'react';
import { X, FileText, Brain, CheckCircle2, ShieldCheck, ArrowRight, Download } from 'lucide-react';

export default function PostmortemModal({ postmortem, onClose, onConsolidateToMemory, consolidating }) {
  const [copied, setCopied] = useState(false);

  if (!postmortem) return null;

  const isConsolidated = postmortem.status === 'consolidated_to_memory';

  const copyMarkdown = () => {
    const md = `# ${postmortem.title}
**Service:** ${postmortem.service} | **Severity:** ${postmortem.severity} | **Status:** ${postmortem.status}

## Executive Summary
${postmortem.executiveSummary}

## Root Cause Analysis
${postmortem.rootCauseAnalysis}

## Contributing Factors
${(postmortem.contributingFactors || []).map((f) => `- ${f}`).join('\n')}

## Effective Mitigations
${(postmortem.effectiveMitigations || []).map((m) => `- ${m}`).join('\n')}

## Failed Attempts / Anti-Patterns
${(postmortem.failedAttempts || []).map((f) => `- ${f}`).join('\n')}

## Action Items
${(postmortem.actionItems || []).map((a) => `- [${a.priority}] ${a.description} (Owner: ${a.owner})`).join('\n')}

## Lessons Learned
${(postmortem.lessonsLearned || []).map((l) => `- ${l}`).join('\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="var(--accent-amber)" />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{postmortem.title}</h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Service: <strong style={{ color: 'var(--text-main)' }}>{postmortem.service}</strong> | Severity:{' '}
                <span className="badge badge-sev1" style={{ fontSize: '0.65rem' }}>{postmortem.severity}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Executive Summary */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
              Executive Summary
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {postmortem.executiveSummary}
            </p>
          </div>

          {/* Root Cause Analysis */}
          <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fb7185', marginBottom: '6px' }}>
              Root Cause Analysis
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {postmortem.rootCauseAnalysis}
            </p>
          </div>

          {/* Contributing Factors & Mitigations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.9rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>
                Effective Mitigations
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {(postmortem.effectiveMitigations || []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fca5a5', marginBottom: '6px' }}>
                Failed Attempts / Anti-Patterns
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#fca5a5', lineHeight: '1.5' }}>
                {(postmortem.failedAttempts || []).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lessons Learned */}
          <div style={{ background: 'rgba(99, 102, 241, 0.06)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '6px' }}>
              Organizational Lessons Learned
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {(postmortem.lessonsLearned || []).map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '8px' }}>
              Preventive Action Items
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(postmortem.actionItems || []).map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: act.priority === 'P0' ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                      [{act.priority}]
                    </span>
                    <span>{act.description}</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    Owner: {act.owner}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Consolidate Action */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button className="btn-secondary" onClick={copyMarkdown}>
            <Download size={14} />
            {copied ? 'Copied Markdown!' : 'Copy Markdown'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>

            {isConsolidated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} /> Consolidated into Organizational Memory
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={() => onConsolidateToMemory(postmortem._id)}
                disabled={consolidating}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                }}
              >
                <Brain size={16} />
                {consolidating ? 'Consolidating...' : 'Consolidate into Hindsight Memory'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
