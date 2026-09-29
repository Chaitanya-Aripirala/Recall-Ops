import React, { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { analyticsAPI } from '../api';
import PostmortemModal from './PostmortemModal';

export default function PostmortemArchiveView() {
  const [postmortems, setPostmortems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPostmortem, setSelectedPostmortem] = useState(null);

  useEffect(() => {
    async function fetchPostmortems() {
      try {
        const res = await analyticsAPI.getPostmortems();
        if (res.data.success) {
          setPostmortems(res.data.postmortems || []);
        }
      } catch (err) {
        console.error('Error fetching postmortems:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPostmortems();
  }, []);

  const filtered = postmortems.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.service || '').toLowerCase().includes(q) ||
      (p.rootCauseAnalysis || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1350px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <FileText size={24} color="var(--accent-amber)" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Incident Postmortem Archive</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Comprehensive repository of approved AI-generated postmortems, root-cause analyses, action items, and organizational learnings.
        </p>
      </div>

      {/* Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search postmortems by service, root cause, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            width: '100%',
          }}
        />
      </div>

      {/* Postmortem List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No postmortems match your criteria. Resolve an incident and generate a postmortem to see it here!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((p) => (
            <div
              key={p._id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedPostmortem(p)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="badge badge-sev1" style={{ fontSize: '0.65rem' }}>
                      {p.severity || 'SEV-1'}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {p.service}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.title}
                  </h3>
                </div>

                <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {p.status}
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.executiveSummary}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {p.actionItems ? `${p.actionItems.length} Action Items` : ''}
                </span>
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  <Eye size={12} /> View Full Postmortem
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPostmortem && (
        <PostmortemModal
          postmortem={selectedPostmortem}
          onClose={() => setSelectedPostmortem(null)}
          onConsolidateToMemory={() => {}}
          consolidating={false}
        />
      )}
    </div>
  );
}
