import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import IncidentWarRoom from '../components/IncidentWarRoom';
import MemoryBankView from '../components/MemoryBankView';
import BenchmarkView from '../components/BenchmarkView';
import PostmortemArchiveView from '../components/PostmortemArchiveView';
import { incidentAPI, memoryAPI } from '../api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('war_room');
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioId, setCurrentScenarioId] = useState('INC-A1');
  const [incident, setIncident] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [recommendedActions, setRecommendedActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  // Load scenarios on mount
  useEffect(() => {
    async function loadScenarios() {
      try {
        const res = await incidentAPI.getScenarios();
        if (res.data.success) {
          setScenarios(res.data.scenarios);
          if (res.data.scenarios.length > 0) {
            const firstId = res.data.scenarios[0].id;
            setCurrentScenarioId(firstId);
            startOrFetchScenario(firstId);
          }
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
      }
    }
    loadScenarios();
  }, []);

  // Start or fetch a scenario
  const startOrFetchScenario = async (scenarioId) => {
    setLoading(true);
    try {
      const res = await incidentAPI.startIncident(scenarioId);
      if (res.data.success) {
        setIncident(res.data.incident);
        setScenarioData(res.data.scenario);
        setRecommendedActions(res.data.recommendedActions || []);
      }
    } catch (err) {
      console.error('Error starting incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = (scenarioId) => {
    setCurrentScenarioId(scenarioId);
    startOrFetchScenario(scenarioId);
    setActiveTab('war_room');
  };

  const handleUnlockEvidence = async (evidenceId) => {
    if (!incident) return;
    try {
      const res = await incidentAPI.unlockEvidence(incident._id, evidenceId);
      if (res.data.success) {
        setIncident(res.data.incident);
      }
    } catch (err) {
      console.error('Error unlocking evidence:', err);
    }
  };

  const handleAdvanceStage = async () => {
    if (!incident) return;
    setLoading(true);
    try {
      const res = await incidentAPI.advanceStage(incident._id);
      if (res.data.success) {
        setIncident(res.data.incident);
        // Refresh actions
        const incRes = await incidentAPI.getIncident(incident._id);
        if (incRes.data.success) {
          setRecommendedActions(incRes.data.recommendedActions || []);
        }
      }
    } catch (err) {
      console.error('Error advancing stage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (actionId, approvedBy) => {
    if (!incident) return;
    setExecuting(true);
    try {
      const res = await incidentAPI.executeAction(incident._id, actionId, approvedBy);
      if (res.data.success) {
        setIncident(res.data.incident);
        // Refresh incident state
        const incRes = await incidentAPI.getIncident(incident._id);
        if (incRes.data.success) {
          setIncident(incRes.data.incident);
          setRecommendedActions(incRes.data.recommendedActions || []);
        }
      }
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleGeneratePostmortem = async () => {
    if (!incident) return;
    try {
      const res = await incidentAPI.generatePostmortem(incident._id);
      if (res.data.success) {
        const incRes = await incidentAPI.getIncident(incident._id);
        if (incRes.data.success) {
          setIncident(incRes.data.incident);
        }
      }
    } catch (err) {
      console.error('Error generating postmortem:', err);
    }
  };

  const handleConsolidateToMemory = async (postmortemId) => {
    try {
      const res = await incidentAPI.consolidateToMemory(postmortemId);
      if (res.data.success) {
        // Refresh incident
        if (incident) {
          const incRes = await incidentAPI.getIncident(incident._id);
          if (incRes.data.success) {
            setIncident(incRes.data.incident);
          }
        }
      }
    } catch (err) {
      console.error('Error consolidating memory:', err);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await incidentAPI.resetDemo();
      await startOrFetchScenario(currentScenarioId || 'INC-A1');
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarios={scenarios}
        currentScenarioId={currentScenarioId}
        onSelectScenario={handleSelectScenario}
        onResetDemo={handleResetDemo}
        loading={loading}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1, paddingBottom: '2rem' }}>
        {activeTab === 'war_room' && (
          <IncidentWarRoom
            incident={incident}
            scenario={scenarioData}
            recommendedActions={recommendedActions}
            onUnlockEvidence={handleUnlockEvidence}
            onAdvanceStage={handleAdvanceStage}
            onExecuteAction={handleExecuteAction}
            onGeneratePostmortem={handleGeneratePostmortem}
            onConsolidateToMemory={handleConsolidateToMemory}
            onResetSimulation={() => startOrFetchScenario(currentScenarioId)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            loading={loading}
            executing={executing}
          />
        )}

        {activeTab === 'memory_bank' && <MemoryBankView />}

        {activeTab === 'benchmarks' && <BenchmarkView />}

        {activeTab === 'postmortems' && <PostmortemArchiveView />}
      </main>
    </div>
  );
}
