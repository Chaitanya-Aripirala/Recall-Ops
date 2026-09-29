import React, { useState, useEffect } from 'react';
import { Brain, Search, Plus, RefreshCw, AlertOctagon, CheckCircle2, Tag, ShieldAlert } from 'lucide-react';
import { memoryAPI } from '../api';

export default function MemoryBankView() {
  const [memories, setMemories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(false);
  const [reseedMsg, setReseedMsg] = useState('');

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await memoryAPI.getAll({
        search: search || undefined,
        service: selectedService !== 'all' ? selectedService : undefined,
      });
      if (res.data.success) {
        setMemories(res.data.memories || []);
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [search, selectedService]);

  const handleReseed = async () => {
    setLoading(true);
    try {
      const res = await memoryAPI.reseed();
      if (res.data.success) {
        setMemories(res.data.memories || []);
        setReseedMsg('Memory bank reseeded with organizational knowledge!');
        setTimeout(() => setReseedMsg(''), 3000);
      }
    } catch (err) {
      console.error('Error reseeding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Brain size={24} color="var(--accent-indigo)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Organizational Hindsight Memory Bank</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Curated long-term operational knowledge graph. Automatically indexed from past incident resolutions & postmortems.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {reseedMsg && (
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{reseedMsg}</span>
          )}
          <button className="btn-secondary" onClick={handleReseed} disabled={loading}>
            <RefreshCw size={14} /> Reseed Default Knowledge
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search symptoms, tags, failure modes, root causes..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={{
              background: '#0d1322',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            <option value="all">All Services</option>
            <option value="payment-api">payment-api</option>
            <option value="orders-api">orders-api</option>
            <option value="checkout-web">checkout-web</option>
            <option value="catalog-api">catalog-api</option>
          </select>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {memories.map((mem) => (
          <div
            key={mem.memoryId || mem._id}
            className="glass-panel"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.85) 0%, rgba(10, 15, 26, 0.85) 100%)',
            }}
          >
            {/* Memory Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {mem.memoryId}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent-cyan)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {mem.service}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3' }}>
                  {mem.title}
                </h3>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                {Math.round((mem.confidenceScore || 0.95) * 100)}% Confidence
              </div>
            </div>

            {/* Root Cause */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--text-main)' }}>Root Cause: </strong>
              {mem.rootCause}
            </div>

            {/* Triggering Pattern */}
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '8px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Symptom Signature: </strong>
              {mem.triggeringPattern || mem.symptomSignature}
            </div>

            {/* Ineffective Action / Anti-Pattern Alert */}
            {mem.ineffectiveActions && mem.ineffectiveActions.length > 0 && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.76rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertOctagon size={13} />
                  Anti-Pattern Warning ({mem.ineffectiveActions[0].name})
                </div>
                <div style={{ color: '#fca5a5' }}>
                  {mem.ineffectiveActions[0].trapReason}
                </div>
              </div>
            )}

            {/* Effective Mitigation */}
            {mem.effectiveActions && mem.effectiveActions.length > 0 && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.76rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} />
                  Proven Resolution ({mem.effectiveActions[0].name})
                </div>
                <div style={{ color: '#6ee7b7' }}>
                  {mem.effectiveActions[0].reason}
                </div>
              </div>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto', paddingTop: '6px' }}>
              {(mem.tags || []).map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.68rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
