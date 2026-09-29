import React from 'react';
import { ShieldAlert, Brain, Activity, FileText, BarChart3, RefreshCw, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, scenarios = [], currentScenarioId, onSelectScenario, onResetDemo, loading }) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              RECALL<span style={{ color: 'var(--accent-cyan)' }}>OPS</span>
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                fontWeight: 700
              }}>MERN</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Incident Intelligence & Hindsight Memory</div>
          </div>
        </div>

        {/* Live Scenario Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Scenario:</span>
          <select
            value={currentScenarioId || ''}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={loading}
            style={{
              background: '#0e1422',
              color: 'var(--text-main)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.id} — {sc.role === 'repeat' ? '⚡ ' : ''}{sc.service} ({sc.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('war_room')}
          style={{
            background: activeTab === 'war_room' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
            color: activeTab === 'war_room' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'war_room' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            padding: '6px 12px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ShieldAlert size={15} color={activeTab === 'war_room' ? 'var(--accent-rose)' : 'currentColor'} />
          War Room
        </button>

        <button
          onClick={() => setActiveTab('memory_bank')}
          style={{
            background: activeTab === 'memory_bank' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
            color: activeTab === 'memory_bank' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'memory_bank' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            padding: '6px 12px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Brain size={15} color={activeTab === 'memory_bank' ? 'var(--accent-indigo)' : 'currentColor'} />
          Memory Bank
        </button>

        <button
          onClick={() => setActiveTab('benchmarks')}
          style={{
            background: activeTab === 'benchmarks' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
            color: activeTab === 'benchmarks' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'benchmarks' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            padding: '6px 12px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <BarChart3 size={15} color={activeTab === 'benchmarks' ? 'var(--accent-emerald)' : 'currentColor'} />
          Memory ROI Comparison
        </button>

        <button
          onClick={() => setActiveTab('postmortems')}
          style={{
            background: activeTab === 'postmortems' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)' : 'transparent',
            color: activeTab === 'postmortems' ? '#ffffff' : 'var(--text-secondary)',
            border: activeTab === 'postmortems' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
            padding: '6px 12px',
            borderRadius: '7px',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <FileText size={15} color={activeTab === 'postmortems' ? 'var(--accent-amber)' : 'currentColor'} />
          Postmortems
        </button>
      </nav>

      {/* Utilities & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onResetDemo}
          title="Reset simulation state"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '6px 10px',
            borderRadius: '7px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          Reset Demo
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <User size={14} />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name || user.email}</span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-rose)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
