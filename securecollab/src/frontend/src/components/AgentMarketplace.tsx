import React, { useState, useEffect } from 'react';
import { Button, Loader } from './';
import { backendService } from '../services/backendService';

interface Agent {
  id: string;
  name: string;
  description: string;
  computation_type: string;
  price_per_computation: bigint;
  reputation_score: number;
}

export const AgentMarketplace: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      // Mock available agents for demo
      const availableAgents = [
        { 
          id: 'medical_researcher', 
          name: 'Medical Research Agent', 
          description: 'Specialized in medical data analysis with privacy preservation',
          computation_type: 'medical_analysis',
          price_per_computation: BigInt(100),
          reputation_score: 4.8
        },
        { 
          id: 'compliance_checker', 
          name: 'Compliance Agent', 
          description: 'Ensures regulatory compliance and generates audit trails',
          computation_type: 'compliance_check',
          price_per_computation: BigInt(75),
          reputation_score: 4.9
        },
        { 
          id: 'statistical_analyzer', 
          name: 'Statistical Agent', 
          description: 'Advanced statistical analysis and pattern recognition',
          computation_type: 'statistical_analysis',
          price_per_computation: BigInt(120),
          reputation_score: 4.7
        }
      ];
      setAgents(availableAgents);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(`Failed to load agents: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId) 
        : [...prev, agentId]
    );
  };

  const deployAgentTeam = async () => {
    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      return;
    }

    try {
      setLoading(true);
      // Create a computation request using existing workflow
      const dummyDataSourceIds = ['data_sample_1', 'data_sample_2'];
      const queryId = await backendService.createLLMQuery(
        `Deploy and coordinate agent team: ${selectedAgents.join(', ')}`,
        dummyDataSourceIds
      );
      const teamId = `team_${queryId}`;
      alert(`Agent team deployed successfully! Team ID: ${teamId}`);
      setSelectedAgents([]);
    } catch (err) {
      console.error('Error deploying agent team:', err);
      setError(`Failed to deploy agent team: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && agents.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">🤖 AI Agent Marketplace</h2>
        {selectedAgents.length > 0 && (
          <Button onClick={deployAgentTeam}>
            Deploy Selected Agents ({selectedAgents.length})
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              selectedAgents.includes(agent.id) 
                ? 'border-blue-500 shadow-lg shadow-blue-100' 
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => toggleAgentSelection(agent.id)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {agent.computation_type}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{agent.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{agent.reputation_score.toFixed(1)}</span>
                </div>
                <div className="text-gray-700">
                  {agent.price_per_computation.toString()} cycles/compute
                </div>
              </div>
            </div>
            <div 
              className={`h-2 w-full ${
                selectedAgents.includes(agent.id) ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            ></div>
          </div>
        ))}

        {agents.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No agents available. Try refreshing the page.
          </div>
        )}
      </div>
    </div>
  );
};
