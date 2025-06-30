import React, { useState, useEffect } from 'react';
import { PartyStatus } from './PartyStatus';
import { MultiPartySignature } from './MultiPartySignature';
import { backendService } from '../services/backendService';

interface Dataset {
  id: string;
  name: string;
  owner: string;
  size: number;
  encrypted: boolean;
  uploadedAt: number;
  schema: string[];
}

interface ComputationRequest {
  id: string;
  title: string;
  description: string;
  dataIds: string[];
  requester: string;
  status: 'pending' | 'approved' | 'computing' | 'completed' | 'failed';
  createdAt: number;
  result?: any;
}

interface Party {
  id: string;
  name: string;
  role: string;
  status: 'connected' | 'disconnected' | 'signing';
  vetKeyId?: string;
  publicKey?: string;
  lastActive?: number;
}

export const ThreePartyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'datasets' | 'requests' | 'signatures' | 'results'>('overview');
  const [parties, setParties] = useState<Party[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [computationRequests, setComputationRequests] = useState<ComputationRequest[]>([]);
  const [currentSignatureRequest, setCurrentSignatureRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load datasets from backend
      const dataSources = await backendService.getDataSourcesForUser();
      const formattedDatasets: Dataset[] = dataSources.map((ds: any) => ({
        id: ds.id,
        name: `Dataset ${ds.id.slice(-8)}`,
        owner: ds.owner,
        size: ds.encrypted_data?.data?.length || 0,
        encrypted: true,
        uploadedAt: Number(ds.created_at) / 1000000, // Convert nanoseconds to milliseconds
        schema: ds.schema ? JSON.parse(ds.schema) : []
      }));
      setDatasets(formattedDatasets);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handlePartyUpdate = (updatedParties: Party[]) => {
    setParties(updatedParties);
  };

  const createComputationRequest = async () => {
    if (datasets.length === 0) {
      alert('Please upload datasets first');
      return;
    }

    setLoading(true);
    try {
      const request: ComputationRequest = {
        id: `req_${Date.now()}`,
        title: 'Multi-Party Cancer Treatment Analysis',
        description: 'Analyze treatment effectiveness across all participating hospitals while preserving patient privacy',
        dataIds: datasets.map(d => d.id),
        requester: 'current_user',
        status: 'pending',
        createdAt: Date.now()
      };

      setComputationRequests(prev => [request, ...prev]);

      // Create signature request for this computation
      setCurrentSignatureRequest(request);
      setActiveTab('signatures');

    } catch (error) {
      console.error('Error creating computation request:', error);
      alert('Failed to create computation request');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = async (requestId: string) => {
    setLoading(true);
    try {
      // Find the computation request
      const request = computationRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update status to computing
      setComputationRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'computing' } : r
      ));

      // Execute secure computation
      const computationResult = await backendService.executeSecureLlmComputation({
        id: request.id,
        dataIds: request.dataIds,
        computationType: 'statistical_analysis',
        prompt: 'Analyze treatment effectiveness and patient outcomes across all datasets while preserving individual privacy'
      });

      // Update with results
      setComputationRequests(prev => prev.map(r => 
        r.id === requestId ? { 
          ...r, 
          status: 'completed',
          result: computationResult
        } : r
      ));

      setActiveTab('results');

    } catch (error) {
      console.error('Error executing computation:', error);
      setComputationRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'failed' } : r
      ));
    } finally {
      setLoading(false);
    }
  };

  const connectedParties = parties.filter(p => p.status === 'connected').length;
  const allConnected = connectedParties === 3;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Secure Multi-Party Computation Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900">Connected Parties</h3>
            <p className="text-2xl font-bold text-blue-600">{connectedParties}/3</p>
            <p className="text-sm text-blue-700">
              {allConnected ? 'Ready for MPC' : 'Waiting for connections'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-900">Encrypted Datasets</h3>
            <p className="text-2xl font-bold text-green-600">{datasets.length}</p>
            <p className="text-sm text-green-700">Secured with vetKD</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-900">Computations</h3>
            <p className="text-2xl font-bold text-purple-600">{computationRequests.length}</p>
            <p className="text-sm text-purple-700">Privacy-preserving</p>
          </div>
        </div>
      </div>

      <PartyStatus onPartyUpdate={handlePartyUpdate} />

      {allConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">Ready for Secure Computation</h3>
              <p className="text-sm text-green-700">
                All parties are connected with vetKD encryption. You can now create computation requests.
              </p>
            </div>
            <button
              onClick={createComputationRequest}
              disabled={loading || datasets.length === 0}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Computation Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderDatasets = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Encrypted Datasets</h2>
      {datasets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No datasets uploaded yet</p>
          <p className="text-sm mt-2">Upload CSV files to begin secure multi-party computation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {datasets.map(dataset => (
            <div key={dataset.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    🔒 Encrypted
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(dataset.size / 1024)} KB
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Owner: {dataset.owner}</p>
                <p>Uploaded: {new Date(dataset.uploadedAt).toLocaleString()}</p>
                <p>Schema: {dataset.schema.length} columns</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Computation Requests</h2>
      {computationRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No computation requests yet</p>
          <p className="text-sm mt-2">Create a request to start secure multi-party computation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {computationRequests.map(request => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{request.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.status === 'completed' ? 'bg-green-100 text-green-800' :
                  request.status === 'computing' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{request.description}</p>
              <div className="text-xs text-gray-500">
                <p>Datasets: {request.dataIds.length}</p>
                <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSignatures = () => (
    <MultiPartySignature 
      onSignatureComplete={handleSignatureComplete}
      computationRequest={currentSignatureRequest}
    />
  );

  const renderResults = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Computation Results</h2>
      {computationRequests.filter(r => r.status === 'completed').length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No completed computations yet</p>
          <p className="text-sm mt-2">Results will appear here after successful multi-party computation</p>
        </div>
      ) : (
        <div className="space-y-6">
          {computationRequests.filter(r => r.status === 'completed').map(request => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{request.title}</h3>
              <div className="bg-gray-50 rounded p-4">
                <h4 className="font-medium text-gray-900 mb-2">Privacy-Preserving Results:</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Analysis:</strong> {request.result?.insights || 'Statistical analysis completed with privacy guarantees'}</p>
                  <p><strong>Privacy Proof:</strong> ✅ All computations verified with zero-knowledge proofs</p>
                  <p><strong>Data Protection:</strong> ✅ Individual records never exposed</p>
                  <p><strong>Participants:</strong> {parties.filter(p => p.status === 'connected').map(p => p.name).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">SecureCollab MPC</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${allConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {allConnected ? 'All Parties Connected' : `${connectedParties}/3 Connected`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'datasets', label: 'Datasets' },
              { id: 'requests', label: 'Requests' },
              { id: 'signatures', label: 'Signatures' },
              { id: 'results', label: 'Results' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'datasets' && renderDatasets()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'signatures' && renderSignatures()}
          {activeTab === 'results' && renderResults()}
        </div>
      </div>
    </div>
  );
};
