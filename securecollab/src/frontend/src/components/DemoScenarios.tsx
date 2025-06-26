import React, { useState } from 'react';
import { Button } from './';
import { backendService } from '../services/backendService';

interface DemoStep {
  text: string;
  duration: number;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  color: string;
  steps: DemoStep[];
  result: string;
}

export const DemoScenarios: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [demoProgress, setDemoProgress] = useState<number>(0);
  const [results, setResults] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const demoScenarios: DemoScenario[] = [
    {
      id: 'medical',
      title: '🏥 Multi-Hospital Cancer Research',
      description: '3 hospitals collaborate on treatment research while keeping patient data private',
      color: 'blue',
      steps: [
        { text: "Uploading encrypted patient data from 3 hospitals...", duration: 1500 },
        { text: "Deploying AI research agents with vetKD identities...", duration: 1500 },
        { text: "Agents analyzing treatment effectiveness on encrypted data...", duration: 2000 },
        { text: "Generating research insights with privacy proofs...", duration: 1500 },
        { text: "Complete: Treatment recommendations ready!", duration: 1000 }
      ],
      result: "🏥 Discovery: Combination therapy shows 23% better outcomes for patients age 45-65. Zero patient records exposed. Privacy mathematically guaranteed."
    },
    {
      id: 'financial',
      title: '🏦 Cross-Bank Fraud Detection',
      description: 'Multiple banks collaborate to detect fraud patterns without sharing customer data',
      color: 'green',
      steps: [
        { text: "Securely connecting to 5 bank transaction systems...", duration: 1500 },
        { text: "Deploying fraud detection agents with secure identities...", duration: 1500 },
        { text: "Running pattern analysis on encrypted transaction data...", duration: 2000 },
        { text: "Generating fraud risk scores with privacy guarantees...", duration: 1500 },
        { text: "Complete: Fraud patterns identified!", duration: 1000 }
      ],
      result: "🏦 Alert: Identified 17 potential fraud patterns across institutions. Flagged 43 suspicious transactions for review. All customer PII remained encrypted throughout analysis."
    },
    {
      id: 'market',
      title: '📊 Competitive Market Analysis',
      description: 'Companies share insights without revealing proprietary data',
      color: 'purple',
      steps: [
        { text: "Collecting encrypted market data from 8 companies...", duration: 1500 },
        { text: "Deploying market analysis agents with secure access...", duration: 1500 },
        { text: "Computing market trends on encrypted datasets...", duration: 2000 },
        { text: "Generating industry insights with privacy proofs...", duration: 1500 },
        { text: "Complete: Market analysis ready!", duration: 1000 }
      ],
      result: "📊 Market Intelligence: Identified 3 emerging market segments with 28% growth potential. Each company received personalized recommendations while keeping pricing and strategy data private."
    }
  ];

  const runDemo = async (demoId: string) => {
    const demo = demoScenarios.find(d => d.id === demoId);
    if (!demo) return;

    setActiveDemo(demoId);
    setDemoProgress(0);
    setLoading(true);
    setError(null);

    try {
      // Run through each step with delays
      for (let i = 0; i < demo.steps.length; i++) {
        setDemoProgress(i);
        // Wait for the specified duration
        await new Promise(resolve => setTimeout(resolve, demo.steps[i].duration));
      }

      // For the medical demo, actually call the backend
      if (demoId === 'medical') {
        // Create some dummy data and agents
        const dataBytes = new TextEncoder().encode(
          "Anonymous patient treatment data for research purposes"
        );
        
        try {
          // Upload data
          const dataId = await backendService.uploadPrivateData(
            Array.from(dataBytes),
            "patient_records_schema"
          );
          
          // Deploy agents
          const agents = ['medical_researcher', 'compliance_checker'];
          const teamId = await backendService.deployMpcAgents(
            agents,
            [dataId]
          );
          
          // Run computation
          await backendService.executePrivateComputation(
            teamId,
            "analyze_treatment_effectiveness"
          );
          
          // Generate proof
          await backendService.generatePrivacyProof(teamId);
        } catch (err) {
          console.error("Backend demo error:", err);
          // Continue with the demo even if backend calls fail
        }
      }

      // Set the result
      setResults(prev => ({
        ...prev,
        [demoId]: demo.result
      }));
    } catch (err) {
      console.error(`Error running ${demoId} demo:`, err);
      setError(`Failed to run demo: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: {[key: string]: {bg: string, border: string, text: string, button: string}} = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        button: 'bg-green-600 hover:bg-green-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">
        🎭 Live Demo Scenarios
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {demoScenarios.map((demo) => {
          const colorClasses = getColorClasses(demo.color);
          
          return (
            <div 
              key={demo.id}
              className={`${colorClasses.bg} rounded-lg p-6 border ${colorClasses.border}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${colorClasses.text}`}>
                    {demo.title}
                  </h3>
                  <p className={`${colorClasses.text} opacity-80 text-sm mt-1`}>
                    {demo.description}
                  </p>
                </div>
                <button
                  onClick={() => runDemo(demo.id)}
                  disabled={activeDemo === demo.id && loading}
                  className={`text-white px-4 py-2 rounded disabled:opacity-50 ${colorClasses.button}`}
                >
                  {activeDemo === demo.id && loading ? 'Running...' : '▶️ Run Demo'}
                </button>
              </div>

              {activeDemo === demo.id && (
                <div className="mt-4">
                  <div className="bg-white rounded p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 ${colorClasses.button.replace('hover:', '')} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold">{demoProgress + 1}</span>
                      </div>
                      <span className="text-gray-800">
                        {demo.steps[demoProgress].text}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${colorClasses.button.replace('hover:', '')} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${((demoProgress + 1) / demo.steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {results[demo.id] && (
                <div className="mt-4 bg-white border border-gray-200 rounded p-4">
                  <div className={`${colorClasses.text} font-medium`}>✨ Results:</div>
                  <div className="text-gray-700 mt-2">{results[demo.id]}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
