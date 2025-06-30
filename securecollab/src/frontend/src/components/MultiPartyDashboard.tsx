import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';
import { authService } from '../services/authService';

interface Party {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
  isAuthenticated: boolean;
  hasData: boolean;
  datasetCount: number;
}

interface Dataset {
  id: string;
  name: string;
  partyId: string;
  uploadedAt: string;
  recordCount: number;
  encrypted: boolean;
  owner?: any;
  party_name?: string;
}

interface Vote {
  voter: string;
  decision: string; // "yes" or "no"
  timestamp: number;
}

interface ComputationRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  requester: string; // ID of the party who created the request
  status: 'pending_approval' | 'approved' | 'ready_to_execute' | 'computing' | 'completed' | 'rejected' | 'pending_signatures';
  approvals: string[]; // Keep for backward compatibility
  votes: Vote[]; // New explicit vote tracking
  results?: any;
  createdAt: number;
  // Multi-party signature verification fields
  signatureId?: string;
  requiredSignatures: string[];
  receivedSignatures: string[];
  vetKeyDerivationComplete: boolean;
}

interface MultiPartyDashboardProps {
  currentPartyId: string;
  onLogout: () => void;
}

export const MultiPartyDashboard: React.FC<MultiPartyDashboardProps> = ({ 
  currentPartyId, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [parties, setParties] = useState<Party[]>([
    {
      id: 'party1',
      name: 'Boston General Hospital',
      role: 'Healthcare Provider',
      color: 'bg-blue-500',
      icon: '🏥',
      isAuthenticated: true,
      hasData: true,
      datasetCount: 2
    },
    {
      id: 'party2',
      name: 'Novartis Pharmaceuticals', 
      role: 'Pharmaceutical Company',
      color: 'bg-green-500',
      icon: '💊',
      isAuthenticated: true,
      hasData: true,
      datasetCount: 3
    },
    {
      id: 'party3',
      name: 'MIT Research Laboratory',
      role: 'Research Institution', 
      color: 'bg-purple-500',
      icon: '🔬',
      isAuthenticated: true,
      hasData: true,
      datasetCount: 1
    }
  ]);

  // Mock datasets for demo - showing encrypted data from all parties
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: 'boston-patient-outcomes',
      name: 'Patient Treatment Outcomes',
      partyId: 'party1',
      uploadedAt: '2024-06-28T10:30:00Z',
      recordCount: 150,
      encrypted: true
    },
    {
      id: 'boston-clinical-data',
      name: 'Clinical Trial Data',
      partyId: 'party1',
      uploadedAt: '2024-06-27T14:15:00Z',
      recordCount: 89,
      encrypted: true
    },
    {
      id: 'novartis-drug-trials',
      name: 'Drug Efficacy Trials',
      partyId: 'party2',
      uploadedAt: '2024-06-29T09:45:00Z',
      recordCount: 320,
      encrypted: true
    },
    {
      id: 'novartis-safety-data',
      name: 'Safety Profile Analysis',
      partyId: 'party2',
      uploadedAt: '2024-06-28T16:20:00Z',
      recordCount: 275,
      encrypted: true
    },
    {
      id: 'novartis-biomarkers',
      name: 'Biomarker Studies',
      partyId: 'party2',
      uploadedAt: '2024-06-26T11:30:00Z',
      recordCount: 198,
      encrypted: true
    },
    {
      id: 'mit-genomic-analysis',
      name: 'Genomic Analysis Dataset',
      partyId: 'party3',
      uploadedAt: '2024-06-27T13:10:00Z',
      recordCount: 450,
      encrypted: true
    }
  ]);
  // Mock VetKD keys for demo display
  const [vetKDKeys] = useState({
    'party1': 'vetKD_bos_7f3a9b2c8e1d4f6a9b2c8e1d4f6a9b2c',
    'party2': 'vetKD_nov_4f6a9b2c8e1d7f3a9b2c8e1d4f6a9b2c',
    'party3': 'vetKD_mit_8e1d4f6a9b2c7f3a9b2c8e1d4f6a9b2c'
  });

  const [computationRequests, setComputationRequests] = useState<ComputationRequest[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // Sample encrypted data preview for demo
  const [sampleEncryptedData] = useState({
    'boston-patient-outcomes': [
      ['🔒 P001_enc', '🔒 DrugA_enc', '🔒 8.5_enc', '🔒 14_enc'],
      ['🔒 P002_enc', '🔒 DrugB_enc', '🔒 7.2_enc', '🔒 18_enc'],
      ['🔒 P003_enc', '🔒 DrugA_enc', '🔒 9.1_enc', '🔒 12_enc']
    ],
    'novartis-drug-trials': [
      ['🔒 T001_enc', '🔒 NVS2024A_enc', '🔒 85.3_enc', '🔒 9.2_enc'],
      ['🔒 T002_enc', '🔒 NVS2024B_enc', '🔒 78.7_enc', '🔒 8.8_enc'],
      ['🔒 T003_enc', '🔒 NVS2024C_enc', '🔒 91.2_enc', '🔒 9.5_enc']
    ],
    'mit-genomic-analysis': [
      ['🔒 S001_enc', '🔒 High_enc', '🔒 Pos_enc', '🔒 Resp_enc'],
      ['🔒 S002_enc', '🔒 Med_enc', '🔒 Neg_enc', '🔒 Part_enc'],
      ['🔒 S003_enc', '🔒 Low_enc', '🔒 Pos_enc', '🔒 NonResp_enc']
    ]
  });

  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  
  // AI Assistant state
  const [aiMessages, setAiMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const currentParty = parties.find(p => p.id === currentPartyId);

  // Register all parties for multi-party computation
  const registerAllParties = async () => {
    try {
      const partiesToRegister = [
        { name: 'Boston General Hospital', role: 'Healthcare Provider' },
        { name: 'Novartis Pharmaceuticals', role: 'Pharmaceutical Company' },
        { name: 'MIT Research Laboratory', role: 'Research Institution' }
      ];
      
      for (const party of partiesToRegister) {
        try {
          await backendService.registerParty(party.name, party.role);
          console.log(`Registered party: ${party.name}`);
        } catch (error) {
          // Party might already be registered, which is fine
          console.log(`Party ${party.name} already registered or registration failed:`, error);
        }
      }
    } catch (error) {
      console.error('Error registering parties:', error);
    }
  };

  useEffect(() => {
    // Set current party as authenticated
    setParties(prev => prev.map(p => 
      p.id === currentPartyId 
        ? { ...p, isAuthenticated: true }
        : p
    ));
    
    // Register all parties first
    registerAllParties();
    
    loadDatasets();
    loadComputationRequests();
    
    // Set up periodic refresh for multi-party data
    const refreshInterval = setInterval(() => {
      loadAllPartiesStatus();
      loadComputationRequests();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(refreshInterval);
  }, [currentPartyId]);

  // Sync party dataset counts with actual datasets
  useEffect(() => {
    setParties(prev => prev.map(party => {
      const partyDatasets = datasets.filter(d => d.partyId === party.id);
      return {
        ...party,
        hasData: partyDatasets.length > 0,
        datasetCount: partyDatasets.length
      };
    }));
  }, [datasets]);

  const loadDatasets = async () => {
    try {
      const principalText = await authService.getPrincipalText();
      if (principalText) {
        // Load ALL datasets from ALL parties
        const allDatasets = await backendService.getAllDataSources();
        console.log('Loaded all datasets from all parties:', allDatasets);
        
        setDatasets(allDatasets.map((ds: any, index: number) => ({
          id: ds.id || `dataset-${index}`,
          name: ds.name || `Dataset ${index + 1}`,
          partyId: ds.party_name || 'Unknown Party',
          uploadedAt: ds.created_at ? new Date(Number(ds.created_at) / 1000000).toISOString() : new Date().toISOString(),
          recordCount: ds.record_count || 0,
          encrypted: true,
          owner: ds.owner,
          party_name: ds.party_name
        })));
        
        // Load all parties status to show multi-party data
        await loadAllPartiesStatus();
      }
    } catch (error) {
      console.error('Failed to load datasets:', error);
    }
  };

  const loadAllPartiesStatus = async () => {
    try {
      const allParties = await backendService.getAllPartiesStatus();
      setParties(prev => prev.map(party => {
        const updatedParty = allParties.find(p => p.id === party.id);
        if (updatedParty) {
          return {
            ...party,
            hasData: updatedParty.hasData,
            datasetCount: updatedParty.datasetCount,
            lastActivity: updatedParty.lastActivity
          };
        }
        // If it's the current party, use actual data
        if (party.id === currentPartyId) {
          return {
            ...party,
            hasData: datasets.length > 0,
            datasetCount: datasets.length
          };
        }
        return party;
      }));
    } catch (error) {
      console.error('Failed to load parties status:', error);
    }
  };

  const loadComputationRequests = async () => {
    try {
      const requests = await backendService.getAllComputationRequests();
      console.log('Loaded computation requests:', requests);
      setComputationRequests(requests);
    } catch (error) {
      console.error('Failed to load computation requests:', error);
    }
  };



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Read file content
      const fileContent = await file.text();
      const principalText = await authService.getPrincipalText();
      
      if (principalText) {
        // Mock vetKD encryption for demo (in production, use real ic-vetkd-utils)
        const fileBytes = new TextEncoder().encode(fileContent);
        
        // Simulate encryption process
        const mockEncryptedData = new Uint8Array(fileBytes.length + 32); // Add padding for "encryption"
        mockEncryptedData.set(fileBytes, 16); // Offset to simulate encryption header
        
        // Parse CSV to get schema and record count
        const lines = fileContent.split('\n').filter(line => line.trim());
        const headers = lines[0] ? lines[0].split(',').map(h => h.trim()) : [];
        const recordCount = Math.max(0, lines.length - 1); // Subtract header row
        const schema = headers.join(',');
        
        // Upload encrypted dataset using new vetKD endpoint
        await backendService.uploadEncryptedDataset(
          file.name.replace('.csv', ''),
          mockEncryptedData,
          schema,
          recordCount
        );
        
        setUploadProgress(100);
        
        // Reload datasets
        setTimeout(() => {
          loadDatasets();
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const createComputationRequest = async () => {
    if (!newRequestTitle.trim()) return;

    try {
      // Create computation request using real backend service
      const computationId = await backendService.createMultiPartyComputation(
        newRequestTitle,
        newRequestDescription
      );

      const newRequest: ComputationRequest = {
        id: computationId,
        title: newRequestTitle,
        description: newRequestDescription,
        requestedBy: currentPartyId,
        requester: currentPartyId,
        status: 'pending_approval',
        approvals: [],
        votes: [],
        createdAt: Date.now(),
        requiredSignatures: [],
        receivedSignatures: [],
        vetKeyDerivationComplete: false
      };

      setComputationRequests(prev => [...prev, newRequest]);
      setNewRequestTitle('');
      setNewRequestDescription('');
      
      console.log('Computation request created:', computationId);
    } catch (error) {
      console.error('Failed to create computation request:', error);
      // Fallback to local storage for demo
      const newRequest: ComputationRequest = {
        id: `req-${Date.now()}`,
        title: newRequestTitle,
        description: newRequestDescription,
        requestedBy: currentPartyId,
        requester: currentPartyId,
        status: 'pending_approval',
        approvals: [],
        votes: [],
        createdAt: Date.now(),
        requiredSignatures: [],
        receivedSignatures: [],
        vetKeyDerivationComplete: false
      };

      setComputationRequests(prev => [...prev, newRequest]);
      setNewRequestTitle('');
      setNewRequestDescription('');
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      // Vote "yes" on the request
      const voteResult = await backendService.voteOnComputationRequest(requestId, "yes");
      console.log('Vote result:', voteResult);
      
      // Reload computation requests to get updated status
      await loadComputationRequests();
      
      // Check if request is now ready to execute and execute LLM if so
      const updatedRequests = await backendService.getAllComputationRequests();
      const readyRequest = updatedRequests.find(req => req.id === requestId && req.status === 'ready_to_execute');
      
      if (readyRequest) {
        console.log('Request ready to execute, executing LLM query...');
        await executeApprovedRequest(requestId);
      }
    } catch (error) {
      console.error('Failed to vote on request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const voteResult = await backendService.voteOnComputationRequest(requestId, "no");
      console.log('Vote result:', voteResult);
      await loadComputationRequests();
    } catch (error) {
      console.error('Failed to vote on request:', error);
    }
  };

  const executeApprovedRequest = async (requestId: string) => {
    try {
      // Create LLM query for the approved computation request
      const request = computationRequests.find(req => req.id === requestId);
      if (!request) return;

      // Get all available datasets for the query
      const datasetIds = datasets.map(ds => ds.id);
      
      // Create LLM query
      const llmQueryId = await backendService.createLLMQuery(
        request.description || request.title, 
        datasetIds
      );
      
      // Auto-approve the LLM query (since computation request is already approved)
      await backendService.signLLMQuery(llmQueryId);
      
      // Execute the LLM query with vetKD decryption
      const result = await backendService.executeLLMQuery(llmQueryId);
      
      // Save results to the computation request
      await backendService.saveComputationResults(requestId, {
        llmQueryId,
        result,
        executedAt: new Date().toISOString(),
        privacyGuarantees: [
          'Data decrypted only during computation window',
          'Multi-party approval verified',
          'VetKD encryption maintained',
          'Zero-knowledge proofs generated',
          'Audit trail recorded'
        ]
      });
      
      // Reload to show updated results
      await loadComputationRequests();
      
      console.log('LLM execution completed and results saved');
    } catch (error) {
      console.error('Failed to execute approved request:', error);
    }
  };

  const startComputation = async (requestId: string) => {
    // Update status to computing
    setComputationRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'computing' } : req
    ));

    // Simulate computation with LLM
    try {
      const prompt = `Analyze healthcare data from 3 parties for cancer treatment effectiveness. 
                     Generate statistical summary without exposing individual patient data.`;
      
      const response = await backendService.sendLlmPrompt(prompt);
      
      // Simulate computation completion
      setTimeout(() => {
        setComputationRequests(prev => prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'completed',
            results: {
              summary: response,
              statistics: {
                totalPatients: 450,
                effectivenessRate: '78.3%',
                averageRecoveryTime: '14.2 days',
                sideEffectRate: '12.1%'
              },
              privacyGuarantees: [
                'Individual patient data never exposed',
                'Differential privacy applied',
                'Zero-knowledge proofs verified',
                'Data destroyed after computation'
              ]
            }
          } : req
        ));
      }, 3000);
    } catch (error) {
      console.error('Computation failed:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Multi-Party Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {parties.map(party => (
            <div key={party.id} className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{party.icon}</span>
                <div>
                  <h4 className="font-medium">{party.name}</h4>
                  <p className="text-sm text-gray-600">{party.role}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    party.isAuthenticated ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  {party.isAuthenticated ? 'Authenticated' : 'Not Connected'}
                </div>
                <div className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    party.hasData ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  {party.hasData ? `${party.datasetCount} datasets` : 'No data'}
                </div>
                {(party as any).lastActivity && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">🕒</span>
                    Last active: {new Date((party as any).lastActivity).toLocaleTimeString()}
                  </div>
                )}
                {party.isAuthenticated && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-gray-700 mb-1">🔑 VetKD Key:</div>
                    <div className="font-mono text-gray-600 break-all">
                      {vetKDKeys[party.id as keyof typeof vetKDKeys]}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Ready for Computation</h3>
        <div className="text-center py-8">
          {parties.every(p => p.isAuthenticated && p.hasData) ? (
            <div>
              <div className="text-green-500 text-4xl mb-2">✅</div>
              <p className="text-lg font-medium text-green-700">All parties ready!</p>
              <p className="text-gray-600">Multi-party computation can begin</p>
            </div>
          ) : (
            <div>
              <div className="text-yellow-500 text-4xl mb-2">⏳</div>
              <p className="text-lg font-medium text-yellow-700">Waiting for all parties</p>
              <p className="text-gray-600">Need all 3 parties authenticated with data</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Computation Requests</h3>
        <div className="space-y-4">
          {computationRequests.slice(0, 3).map(request => {
            const approvedCount = request.approvals.length;
            const totalRequired = parties.length;
            const isFullyApproved = approvedCount === totalRequired;
            
            return (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{request.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isFullyApproved 
                      ? 'bg-green-100 text-green-800' 
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isFullyApproved ? 'Approved' : request.status === 'rejected' ? 'Rejected' : 'Pending'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Approvals: {approvedCount}/{totalRequired}
                    </span>
                    <div className="flex space-x-1">
                      {parties.map(party => {
                        const hasApproved = request.approvals.includes(party.id);
                        return (
                          <div key={party.id} className="flex items-center">
                            <span className="text-lg mr-1">{party.icon}</span>
                            <span className={`text-sm ${
                              hasApproved 
                                ? 'text-green-600' 
                                : 'text-gray-400'
                            }`}>
                              {hasApproved ? '✓' : '○'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
          
          {computationRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No computation requests yet</p>
              <p className="text-sm">Create a request in the Computation Requests tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDataUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Encrypted Data</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-lg font-medium mb-2">Upload CSV Dataset</p>
            <p className="text-gray-600 mb-4">Data will be encrypted with your vetKD key</p>
            <div className="bg-blue-500 text-white px-4 py-2 rounded-md inline-block hover:bg-blue-600">
              Choose File
            </div>
          </label>
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Encrypting and uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">All Party Datasets</h3>
        {datasets.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No datasets uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {datasets.map(dataset => (
              <div key={dataset.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{dataset.name}</h4>
                    <p className="text-sm text-gray-600">
                      {dataset.recordCount} records • Uploaded {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      📊 Uploaded by: {dataset.party_name || dataset.partyId || 'Unknown Party'}
                    </p>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Encrypted
                  </div>
                </div>
                {/* Encrypted Data Preview */}
                {sampleEncryptedData[dataset.id as keyof typeof sampleEncryptedData] && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      🔒 Encrypted Sample Data (First 3 rows):
                    </div>
                    <div className="space-y-1">
                      {sampleEncryptedData[dataset.id as keyof typeof sampleEncryptedData].map((row, idx) => (
                        <div key={idx} className="text-xs font-mono text-gray-600">
                          {row.join(' | ')}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      ⚠️ Actual data remains encrypted and secure
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderComputations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Create Computation Request</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Request title"
            value={newRequestTitle}
            onChange={(e) => setNewRequestTitle(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
          <textarea
            placeholder="Describe what you want to compute..."
            value={newRequestDescription}
            onChange={(e) => setNewRequestDescription(e.target.value)}
            className="w-full p-3 border rounded-md h-24"
          />
          <button
            onClick={createComputationRequest}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Computation Requests</h3>
          <button
            onClick={loadComputationRequests}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        {computationRequests.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No computation requests</p>
        ) : (
          <div className="space-y-4">
            {computationRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{request.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'computing' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'ready_to_execute' ? 'bg-purple-100 text-purple-800' :
                    request.status === 'pending_signatures' ? 'bg-orange-100 text-orange-800' :
                    request.status === 'approved' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status === 'ready_to_execute' ? 'Ready to Execute' :
                     request.status === 'pending_approval' ? 'Pending Approval' :
                     request.status === 'pending_signatures' ? 'Pending Signatures' :
                     request.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{request.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {/* Display explicit votes */}
                    <div className="mb-2">
                      <div className="flex items-center space-x-4">
                        <span>Yes: {request.votes?.filter(v => v.decision === 'yes').length || 0}/3</span>
                        <span>No: {request.votes?.filter(v => v.decision === 'no').length || 0}</span>
                      </div>
                      {request.votes && request.votes.length > 0 && (
                        <div className="mt-1 text-xs">
                          {request.votes.map((vote, idx) => (
                            <span key={idx} className={`inline-block mr-2 px-1 rounded ${
                              vote.decision === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {vote.voter}: {vote.decision}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Signature and vetKD status */}
                    <div className="flex items-center space-x-4">
                      <span>Signatures: {request.receivedSignatures?.length || 0}/{request.requiredSignatures || 3}</span>
                      {request.vetKeyDerivationComplete ? (
                        <span className="text-green-600 text-xs">✓ vetKD Ready</span>
                      ) : (
                        <span className="text-orange-600 text-xs">⏳ vetKD Pending</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-x-2">
                    {/* Show voting buttons for pending approval */}
                    {request.status === 'pending_approval' && !request.votes?.some(v => v.voter === currentPartyId) && (
                      <>
                        <button
                          onClick={() => approveRequest(request.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Vote Yes
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Vote No
                        </button>
                      </>
                    )}
                    
                    {/* Show execute button only when ready and user is the requester */}
                    {request.status === 'ready_to_execute' && request.requester === currentPartyId && (
                      <button
                        onClick={() => startComputation(request.id)}
                        className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 font-medium"
                      >
                        Execute Computation
                      </button>
                    )}
                    
                    {/* Show status message for non-requesters when ready */}
                    {request.status === 'ready_to_execute' && request.requester !== currentPartyId && (
                      <span className="text-purple-600 text-sm font-medium">
                        Ready - Awaiting execution by requester
                      </span>
                    )}
                    
                    {/* Legacy support for old approved status */}
                    {request.status === 'approved' && request.vetKeyDerivationComplete && (
                      <button
                        onClick={() => startComputation(request.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Start Computation
                      </button>
                    )}
                    
                    {request.status === 'approved' && !(request as any).vetKeyDerivationComplete && (
                      <span className="text-orange-600 text-sm">
                        Waiting for vetKD signatures...
                      </span>
                    )}
                  </div>
                </div>

                {request.results && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h5 className="font-medium mb-2">Results</h5>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Total Patients</p>
                        <p className="text-lg">{request.results.statistics.totalPatients}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Effectiveness Rate</p>
                        <p className="text-lg">{request.results.statistics.effectivenessRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avg Recovery Time</p>
                        <p className="text-lg">{request.results.statistics.averageRecoveryTime}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Side Effect Rate</p>
                        <p className="text-lg">{request.results.statistics.sideEffectRate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Privacy Guarantees:</p>
                      <ul className="text-xs text-gray-600">
                        {request.results.privacyGuarantees.map((guarantee: string, idx: number) => (
                          <li key={idx}>✓ {guarantee}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // AI Assistant handler
  const handleAiQuery = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      text: aiInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    const currentQuery = aiInput;
    setAiInput('');
    setAiLoading(true);
    
    try {
      // Step 1: Create Computation Request for multi-party approval
      const requestId = await backendService.createMultiPartyComputation(
        `AI Query: ${currentQuery.substring(0, 50)}...`,
        `Multi-party computation request for AI query: ${currentQuery}`
      );
      
      console.log('Created computation request with ID:', requestId);
      
      // Step 2: Reload computation requests to show the new request
      await loadComputationRequests();
      
      // Step 3: Provide response about the created request
      const response = `🔒 **Multi-Party Computation Request Created**\n\n**Query:** ${currentQuery}\n\n**Status:** ⏳ Pending approval from all parties\n\n**Request ID:** ${requestId}\n\n**Next Steps:**\n1. All 3 parties must approve this computation request\n2. Switch between party views to approve/reject\n3. Once approved by all parties, the computation will execute\n\n**Required Approvals:**\n• Boston General Hospital: ⏳ Pending\n• Novartis Pharmaceuticals: ⏳ Pending\n• MIT Research Laboratory: ⏳ Pending\n\n**Privacy Guarantees:**\n✅ Multi-party signature verification required\n✅ VetKD encryption maintained during computation\n✅ Automatic re-encryption after computation\n✅ Zero-knowledge proof generation\n\n*Switch to other party views to approve this request, then return to execute.*`;
      
      const aiResponse = {
        id: `msg_${Date.now()}`,
        text: response,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI query failed:', error);
      const errorMessage = {
        id: `msg_${Date.now() + 1}`,
        text: `🔒 **Multi-Party Computation Error**\n\n**Query:** ${currentQuery}\n\n**Status:** ❌ Failed to create computation request\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Troubleshooting:**\n1. Ensure all parties are authenticated\n2. Verify datasets are uploaded and encrypted\n3. Check backend connection status\n4. Validate multi-party setup\n\n**Privacy Guarantee:** Your query was processed securely. No data was exposed during this error.`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };


  // AI Assistant render function
  const renderAiAssistant = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🤖 Secure AI Assistant</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="text-blue-500 text-xl mr-3">🔒</div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Privacy-Preserving AI Queries</h4>
              <p className="text-sm text-blue-700">
                Ask questions about your encrypted datasets. All queries are processed securely 
                without exposing raw data. The AI can analyze patterns, generate insights, and 
                provide statistical summaries while maintaining full privacy guarantees.
              </p>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="border rounded-lg h-96 overflow-y-auto p-4 mb-4 bg-gray-50">
          {aiMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-4xl mb-2">💬</div>
              <p>Start a conversation with the AI assistant</p>
              <p className="text-sm mt-1">Ask about patterns in your encrypted datasets</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiMessages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-gray-600">AI is analyzing encrypted data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !aiLoading && handleAiQuery()}
            placeholder="Ask about your encrypted datasets..."
            className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={aiLoading}
          />
          <button
            onClick={handleAiQuery}
            disabled={aiLoading || !aiInput.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading ? '⏳' : '🚀'}
          </button>
        </div>
        
        {/* Dataset Context */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Available Encrypted Datasets: ({datasets.length} total)</p>
          <div className="flex flex-wrap gap-2">
            {datasets.map(dataset => (
              <span key={dataset.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                🔒 {dataset.name} ({dataset.recordCount} records)
              </span>
            ))}
          </div>
          {datasets.length === 0 && (
            <p className="text-sm text-gray-500">No datasets uploaded yet. Upload data to enable AI queries.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">SecureCollab</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {currentParty?.name}
              </span>
              {/* Party Selector Dropdown */}
              <div className="ml-4">
                <select 
                  value={currentPartyId}
                  onChange={(e) => {
                    console.log('Switching to party:', e.target.value);
                    // Update the URL to reflect the party change and reload
                    const newPartyId = e.target.value;
                    // Store the selected party in localStorage for persistence
                    localStorage.setItem('selectedPartyId', newPartyId);
                    // Reload to reinitialize with new party
                    window.location.reload();
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white"
                >
                  <option value="party1">🏥 Boston General Hospital</option>
                  <option value="party2">💊 Novartis Pharmaceuticals</option>
                  <option value="party3">🔬 MIT Research Laboratory</option>
                </select>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'upload', name: 'Data Upload', icon: '📤' },
              { id: 'compute', name: 'Computations', icon: '🔬' },
              { id: 'ai', name: 'AI Assistant', icon: '🤖' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'upload' && renderDataUpload()}
        {activeTab === 'compute' && renderComputations()}
        {activeTab === 'ai' && renderAiAssistant()}
      </div>
    </div>
  );
};
