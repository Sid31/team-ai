import React, { useState, useRef, useEffect } from 'react';
import { backendService } from '../services/backendService';
import { parseCSVFile, validateCSVFile, ParsedCSV } from '../utils/csvParser';

interface Dataset {
  id: string;
  name: string;
  type: string;
  size: string;
  encrypted: boolean;
  uploadDate: string;
  owner: string;
  schema: string;
  sampleData?: string[][];
  headers?: string[];
}

interface ComputationRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  targetDatasets: string[];
  computationType: string;
  status: 'pending' | 'approved' | 'rejected' | 'computing' | 'completed';
  approvals: {
    [company: string]: 'pending' | 'approved' | 'rejected';
  };
  createdAt: string;
  question: string;
}

interface Company {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline';
  datasets: number;
  computations: number;
  avatar: string;
}

const EnterpriseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('datasets');
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDatasets, setUploadedDatasets] = useState<Dataset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [computationRequests, setComputationRequests] = useState<ComputationRequest[]>([]);
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestQuestion, setNewRequestQuestion] = useState('');
  const [currentUser, setCurrentUser] = useState('Boston General Hospital');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock companies for multi-party simulation
  const companies: Company[] = [
    {
      id: 'boston-general',
      name: 'Boston General Hospital',
      role: 'Healthcare Provider',
      status: 'online',
      datasets: 2,
      computations: 5,
      avatar: '🏥'
    },
    {
      id: 'novartis',
      name: 'Novartis Pharmaceuticals',
      role: 'Pharmaceutical Company',
      status: 'online',
      datasets: 3,
      computations: 8,
      avatar: '💊'
    },
    {
      id: 'mit-research',
      name: 'MIT Research Laboratory',
      role: 'Research Institution',
      status: 'online',
      datasets: 1,
      computations: 12,
      avatar: '🔬'
    }
  ];

  // Load user's datasets on component mount
  useEffect(() => {
    loadUserDatasets();
    loadComputationRequests();
  }, []);

  const loadUserDatasets = async () => {
    try {
      const dataSources = await backendService.getDataSourcesForUser();
      const datasets: Dataset[] = dataSources.map((source: any) => ({
        id: source.id,
        name: `Dataset ${source.id.substring(0, 8)}`,
        type: 'CSV',
        size: `${Math.round(source.encrypted_data.length / 1024)}KB`,
        encrypted: true,
        uploadDate: new Date(Number(source.created_at) / 1000000).toLocaleDateString(),
        owner: source.owner,
        schema: source.schema_hash,
        // Mock sample data for preview
        headers: ['patient_id', 'age', 'gender', 'treatment_type', 'outcome_score', 'days_to_recovery', 'side_effects'],
        sampleData: [
          ['P001', '45', 'M', 'Drug_X', '8.5', '12', 'mild'],
          ['P002', '52', 'F', 'Drug_Y', '7.2', '18', 'none'],
          ['P003', '38', 'M', 'Drug_X', '9.1', '10', 'mild']
        ]
      }));
      setUploadedDatasets(datasets);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    }
  };

  const loadComputationRequests = () => {
    // Mock computation requests
    const mockRequests: ComputationRequest[] = [
      {
        id: 'req-001',
        title: 'Cancer Treatment Effectiveness Analysis',
        description: 'Analyze treatment outcomes across multiple datasets to identify optimal protocols',
        requestedBy: 'MIT Research Laboratory',
        targetDatasets: ['dataset-001', 'dataset-002'],
        computationType: 'Statistical Analysis with ML',
        status: 'pending',
        approvals: {
          'Boston General Hospital': 'pending',
          'Novartis Pharmaceuticals': 'pending',
          'MIT Research Laboratory': 'approved'
        },
        createdAt: '2024-01-15',
        question: 'Which treatment protocol shows the best outcomes for cancer patients aged 45-65?'
      }
    ];
    setComputationRequests(mockRequests);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Parse CSV file
      setUploadProgress(25);
      const parsedCSV: ParsedCSV = await parseCSVFile(file);
      
      setUploadProgress(50);
      
      // Upload to backend
      const dataSourceId = await backendService.uploadPrivateData(
        parsedCSV.dataAsBytes,
        parsedCSV.schema
      );
      
      setUploadProgress(75);
      
      // Add to local state with sample data
      const newDataset: Dataset = {
        id: dataSourceId,
        name: file.name.replace('.csv', ''),
        type: 'CSV',
        size: `${Math.round(file.size / 1024)}KB`,
        encrypted: true,
        uploadDate: new Date().toLocaleDateString(),
        owner: 'Current User',
        schema: parsedCSV.schema,
        headers: parsedCSV.headers,
        sampleData: parsedCSV.rows.slice(0, 5) // Show first 5 rows as sample
      };
      
      setUploadedDatasets(prev => [...prev, newDataset]);
      setUploadProgress(100);
      
      // Show success message
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        alert(`Successfully uploaded ${file.name} with ${parsedCSV.rows.length} rows!`);
      }, 500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile && fileInputRef.current) {
      // Create a proper file list and set it to the input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(csvFile);
      fileInputRef.current.files = dataTransfer.files;
      
      // Create a proper change event
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    } else {
      alert('Please drop a CSV file');
    }
  };

  const handleCreateComputationRequest = () => {
    if (!newRequestTitle.trim() || !newRequestDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newRequest: ComputationRequest = {
      id: `req-${Date.now()}`,
      title: newRequestTitle,
      description: newRequestDescription,
      question: newRequestQuestion,
      requestedBy: currentUser,
      targetDatasets: uploadedDatasets.map(d => d.id),
      computationType: 'Multi-party Statistical Analysis',
      status: 'pending',
      approvals: {
        'Boston General Hospital': currentUser === 'Boston General Hospital' ? 'approved' : 'pending',
        'Novartis Pharmaceuticals': currentUser === 'Novartis Pharmaceuticals' ? 'approved' : 'pending',
        'MIT Research Laboratory': currentUser === 'MIT Research Laboratory' ? 'approved' : 'pending'
      },
      createdAt: new Date().toLocaleDateString()
    };

    setComputationRequests(prev => [...prev, newRequest]);
    setNewRequestTitle('');
    setNewRequestDescription('');
    setNewRequestQuestion('');
    alert('Computation request created and sent for approval!');
  };

  const handleApproval = (requestId: string, company: string, decision: 'approved' | 'rejected') => {
    setComputationRequests(prev => 
      prev.map(req => {
        if (req.id === requestId) {
          const updatedApprovals = { ...req.approvals, [company]: decision };
          const allApproved = Object.values(updatedApprovals).every(status => status === 'approved');
          const anyRejected = Object.values(updatedApprovals).some(status => status === 'rejected');
          
          return {
            ...req,
            approvals: updatedApprovals,
            status: anyRejected ? 'rejected' : allApproved ? 'computing' : 'pending'
          };
        }
        return req;
      })
    );
  };

  const handleSendPrompt = async () => {
    if (!aiInput.trim()) return;
    
    try {
      const response = await backendService.sendLlmPrompt(aiInput);
      setAiResponse(response);
    } catch (error) {
      console.error("Error sending prompt:", error);
      setAiResponse("Error: Unable to process request. Please try again.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "datasets":
        return (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Encrypted Dataset</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="text-4xl">📊</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                    <p className="text-sm text-gray-500">or click to select a file (max 10MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Select CSV File
                  </button>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and encrypting...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Datasets List */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Encrypted Datasets</h3>
              <div className="space-y-4">
                {uploadedDatasets.map((dataset) => (
                  <div key={dataset.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">{dataset.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🔒 Encrypted
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {dataset.type} • {dataset.size} • Uploaded {dataset.uploadDate}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Schema Hash: {dataset.schema.substring(0, 16)}...
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDataset(selectedDataset?.id === dataset.id ? null : dataset)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedDataset?.id === dataset.id ? 'Hide Preview' : 'Preview Sample'}
                      </button>
                    </div>
                    
                    {/* Dataset Preview */}
                    {selectedDataset?.id === dataset.id && dataset.sampleData && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Sample Data (First 3 rows)</h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {dataset.headers?.map((header, index) => (
                                  <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {dataset.sampleData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          ⚠️ This is sample data only. Actual data is encrypted and secure.
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {uploadedDatasets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No datasets uploaded yet. Upload your first CSV file above.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "requests":
        return (
          <div className="space-y-6">
            {/* Create New Request */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create Computation Request</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Title</label>
                  <input
                    type="text"
                    value={newRequestTitle}
                    onChange={(e) => setNewRequestTitle(e.target.value)}
                    placeholder="e.g., Cancer Treatment Effectiveness Analysis"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRequestDescription}
                    onChange={(e) => setNewRequestDescription(e.target.value)}
                    placeholder="Describe what computation you want to perform..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Research Question</label>
                  <input
                    type="text"
                    value={newRequestQuestion}
                    onChange={(e) => setNewRequestQuestion(e.target.value)}
                    placeholder="What specific question do you want to answer?"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Will request access to {uploadedDatasets.length} datasets from all parties
                  </div>
                  <button
                    onClick={handleCreateComputationRequest}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Requests */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Computation Requests</h3>
              <div className="space-y-4">
                {computationRequests.filter(req => req.requestedBy === currentUser).map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        {request.question && (
                          <p className="text-sm text-blue-600 mt-1">❓ {request.question}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {request.createdAt} • Type: {request.computationType}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          request.status === 'computing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Approval Status */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Approval Status</h5>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(request.approvals).map(([company, status]) => (
                          <div key={company} className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'approved' ? 'bg-green-400' :
                              status === 'rejected' ? 'bg-red-400' :
                              'bg-yellow-400'
                            }`}></div>
                            <span className="text-sm text-gray-700">{company}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "approvals":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Approvals</h2>
              <div className="space-y-4">
                {computationRequests
                  .filter(req => req.approvals[currentUser] === 'pending' && req.requestedBy !== currentUser)
                  .map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        {request.question && (
                          <p className="text-sm text-blue-600 mt-1">❓ {request.question}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Requested by: {request.requestedBy} • {request.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApproval(request.id, currentUser, 'approved')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleApproval(request.id, currentUser, 'rejected')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                    
                    {/* Show what datasets will be accessed */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Datasets Requested</h5>
                      <div className="text-sm text-gray-600">
                        This computation will access encrypted datasets from all participating parties.
                        Your data remains encrypted and private throughout the process.
                      </div>
                    </div>
                  </div>
                ))}
                {computationRequests.filter(req => req.approvals[currentUser] === 'pending' && req.requestedBy !== currentUser).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending approvals at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Computation Results</h2>
              <div className="space-y-4">
                {computationRequests.filter(req => req.status === 'computing' || req.status === 'completed').map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Status: {request.status} • Requested by: {request.requestedBy}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mock Results */}
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Analysis Results</h5>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Drug X Effectiveness:</strong> 87.3% success rate
                          </div>
                          <div>
                            <strong>Drug Y Effectiveness:</strong> 79.1% success rate
                          </div>
                          <div>
                            <strong>Average Recovery Time:</strong> 14.2 days
                          </div>
                          <div>
                            <strong>Side Effects Rate:</strong> 23.4%
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          🔒 Results computed using secure multi-party computation. Individual data points remain encrypted.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {computationRequests.filter(req => req.status === 'computing' || req.status === 'completed').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No computation results available yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Dataset uploaded by {currentUser}</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Computation request approved by MIT Research Laboratory</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">🔄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New computation request created</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-assistant':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI Assistant - Secure MPC Chat</h2>
              
              {/* Chat Interface */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    🤖 Hello! I'm your secure AI assistant. I can help you analyze your encrypted datasets using multi-party computation while preserving privacy. What would you like to know?
                  </p>
                </div>
                
                {aiResponse && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{aiResponse}</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask about your data analysis..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                  />
                  <button
                    onClick={handleSendPrompt}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  🔒 All AI responses are generated using secure computation on encrypted data. Your raw data never leaves your secure environment.
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Select a tab to view content.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">SecureCollab</h1>
              </div>
              <div className="text-sm text-gray-500">Enterprise Multi-Party Computation Platform</div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={currentUser} 
                onChange={(e) => setCurrentUser(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1"
              >
                {companies.map(company => (
                  <option key={company.id} value={company.name}>{company.name}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'datasets', label: 'Datasets', icon: '📊' },
              { id: 'requests', label: 'Computation Requests', icon: '🔄' },
              { id: 'approvals', label: 'Pending Approvals', icon: '✅' },
              { id: 'results', label: 'Results', icon: '📈' },
              { id: 'activity', label: 'Activity', icon: '📋' },
              { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export { EnterpriseDashboard };
