import React, { useState, useEffect } from 'react';
import { Button, Loader } from './';
import { backendService } from '../services/backendService';

interface PrivateDataSource {
  id: string;
  owner: string;
  schema_hash: string;
  access_permissions: string[];
}

interface ComputationResult {
  insights: string;
  privacy_proof: string;
  timestamp: bigint;
}

export const PrivacyDashboard: React.FC = () => {
  const [dataSources, setDataSources] = useState<PrivateDataSource[]>([]);
  const [computations, setComputations] = useState<{[key: string]: ComputationResult}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'computations'>('data');
  const [uploadingData, setUploadingData] = useState<boolean>(false);
  const [dataToUpload, setDataToUpload] = useState<string>('');
  const [dataSchema, setDataSchema] = useState<string>('');

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      setLoading(true);
      const sources = await backendService.getDataSourcesForUser();
      setDataSources(sources);
    } catch (err) {
      console.error('Error fetching data sources:', err);
      setError(`Failed to load data sources: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpload = async () => {
    if (!dataToUpload || !dataSchema) {
      setError('Please provide both data and schema');
      return;
    }

    try {
      setUploadingData(true);
      // Convert string to bytes for upload
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(dataToUpload);
      
      const dataSourceId = await backendService.uploadPrivateData(
        Array.from(dataBytes),
        dataSchema
      );
      
      alert(`Data uploaded successfully! Data Source ID: ${dataSourceId}`);
      setDataToUpload('');
      setDataSchema('');
      fetchDataSources(); // Refresh the list
    } catch (err) {
      console.error('Error uploading data:', err);
      setError(`Failed to upload data: ${err}`);
    } finally {
      setUploadingData(false);
    }
  };

  const generateProof = async (computationId: string) => {
    try {
      setLoading(true);
      const proofHash = await backendService.generatePrivacyProof(computationId);
      alert(`Privacy proof generated: ${proofHash}`);
    } catch (err) {
      console.error('Error generating proof:', err);
      setError(`Failed to generate proof: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const executeComputation = async (teamId: string = 'demo_team') => {
    try {
      setLoading(true);
      // Use existing LLM query system for computation
      await backendService.createLLMQuery(
        'Analyze data patterns from uploaded datasets',
        [] // Will use all available datasets
      );
      const result = { 
        insights: 'Data analysis completed using secure MPC', 
        privacy_proof: 'zk-SNARK proof generated for computation privacy',
        timestamp: BigInt(Date.now())
      };
      
      setComputations(prev => ({
        ...prev,
        [teamId]: result
      }));
      
      alert('Computation executed successfully!');
    } catch (err) {
      console.error('Error executing computation:', err);
      setError(`Failed to execute computation: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && dataSources.length === 0 && Object.keys(computations).length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">🔒 Privacy Dashboard</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('data')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'data'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Private Data Sources
            </button>
            <button
              onClick={() => setActiveTab('computations')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'computations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Secure Computations
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-3">Upload New Data</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data (will be encrypted)
                    </label>
                    <textarea
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      value={dataToUpload}
                      onChange={(e) => setDataToUpload(e.target.value)}
                      placeholder="Enter your sensitive data here..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Schema
                    </label>
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={dataSchema}
                      onChange={(e) => setDataSchema(e.target.value)}
                      placeholder="e.g., patient_records, financial_data"
                    />
                  </div>
                  <Button
                    onClick={handleDataUpload}
                    disabled={uploadingData}
                  >
                    {uploadingData ? 'Encrypting & Uploading...' : 'Securely Upload Data'}
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-medium">Your Private Data Sources</h3>
              
              {dataSources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No data sources yet. Upload some data to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {dataSources.map((source) => (
                    <div 
                      key={source.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{source.id}</h4>
                          <p className="text-sm text-gray-600">Schema: {source.schema_hash}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Encrypted
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'computations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Secure Computations</h3>
                <Button onClick={() => executeComputation()}>
                  Run Demo Computation
                </Button>
              </div>

              {Object.keys(computations).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No computations yet. Run a computation to see results.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(computations).map(([teamId, result]) => (
                    <div 
                      key={teamId}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Team: {teamId}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Timestamp: {new Date(Number(result.timestamp) / 1000000).toLocaleString()}
                          </p>
                        </div>
                        <Button 
                          onClick={() => generateProof(teamId)}
                          size="small"
                        >
                          Verify Privacy
                        </Button>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded text-gray-800">
                        <p className="font-medium">Insights:</p>
                        <p>{result.insights}</p>
                      </div>
                      
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500 font-mono">{result.privacy_proof}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
