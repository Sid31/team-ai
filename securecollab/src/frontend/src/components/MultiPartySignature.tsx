import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';

interface SignatureRequest {
  id: string;
  title: string;
  description: string;
  requiredSignatures: string[];
  signatures: { [partyId: string]: { signed: boolean; timestamp?: number; signature?: string } };
  status: 'pending' | 'partial' | 'complete' | 'failed';
  createdAt: number;
  dataIds: string[];
}

interface MultiPartySignatureProps {
  onSignatureComplete?: (requestId: string) => void;
  computationRequest?: any;
}

export const MultiPartySignature: React.FC<MultiPartySignatureProps> = ({ 
  onSignatureComplete, 
  computationRequest 
}) => {
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentParty, setCurrentParty] = useState<string>('boston-general');

  const parties = [
    { id: 'boston-general', name: 'Boston General Hospital' },
    { id: 'novartis', name: 'Novartis Pharmaceuticals' },
    { id: 'mit-research', name: 'MIT Research Laboratory' }
  ];

  useEffect(() => {
    if (computationRequest) {
      createSignatureRequest(computationRequest);
    }
  }, [computationRequest]);

  const createSignatureRequest = (request: any) => {
    const newSignatureRequest: SignatureRequest = {
      id: `sig-${Date.now()}`,
      title: `Computation Request: ${request.title}`,
      description: `All parties must sign to authorize computation on encrypted datasets: ${request.dataIds?.join(', ') || 'N/A'}`,
      requiredSignatures: ['boston-general', 'novartis', 'mit-research'],
      signatures: {
        'boston-general': { signed: false },
        'novartis': { signed: false },
        'mit-research': { signed: false }
      },
      status: 'pending',
      createdAt: Date.now(),
      dataIds: request.dataIds || []
    };

    setSignatureRequests(prev => [newSignatureRequest, ...prev]);
  };

  const signRequest = async (requestId: string, partyId: string) => {
    setLoading(true);
    try {
      // Get user identity for signature
      const identity = await backendService.getUserIdentity();
      
      // Create signature data
      const signatureData = {
        requestId,
        partyId,
        timestamp: Date.now(),
        identity: identity.principal
      };

      // Call backend to create signature
      const signatureResult = await backendService.createMultiPartySignature(
        JSON.stringify(signatureData),
        [partyId],
        1
      );

      // Update signature request
      setSignatureRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          const updatedSignatures = {
            ...req.signatures,
            [partyId]: {
              signed: true,
              timestamp: Date.now(),
              signature: signatureResult
            }
          };

          const signedCount = Object.values(updatedSignatures).filter(s => s.signed).length;
          const newStatus = signedCount === 3 ? 'complete' : 'partial';

          const updatedRequest = {
            ...req,
            signatures: updatedSignatures,
            status: newStatus as SignatureRequest['status']
          };

          // If all signatures collected, trigger computation
          if (newStatus === 'complete' && onSignatureComplete) {
            setTimeout(() => onSignatureComplete(requestId), 1000);
          }

          return updatedRequest;
        }
        return req;
      }));

    } catch (error) {
      console.error('Error signing request:', error);
      alert('Failed to sign request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifySignatures = async (requestId: string) => {
    setLoading(true);
    try {
      const request = signatureRequests.find(r => r.id === requestId);
      if (!request) return;

      // Verify all signatures with backend
      const verificationResult = await backendService.verifySignaturesComplete(requestId);
      
      if (verificationResult) {
        // All signatures verified - can proceed with computation
        setSignatureRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'complete' } : req
        ));
        
        if (onSignatureComplete) {
          onSignatureComplete(requestId);
        }
      } else {
        throw new Error('Signature verification failed');
      }

    } catch (error) {
      console.error('Error verifying signatures:', error);
      setSignatureRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'failed' } : req
      ));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return '✅';
      case 'partial': return '⏳';
      case 'pending': return '📝';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Multi-Party Signature Verification
        </h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Current Party:</label>
          <select
            value={currentParty}
            onChange={(e) => setCurrentParty(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            {parties.map(party => (
              <option key={party.id} value={party.id}>{party.name}</option>
            ))}
          </select>
        </div>
      </div>

      {signatureRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No signature requests pending</p>
          <p className="text-sm mt-2">Signature requests will appear when computation is requested</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signatureRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(request.status)}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-500">{request.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-3">
                <h4 className="font-medium text-gray-900 mb-2">Signature Status:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {parties.map(party => {
                    const signature = request.signatures[party.id];
                    return (
                      <div key={party.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="font-medium text-sm">{party.name}</p>
                          {signature.signed && signature.timestamp && (
                            <p className="text-xs text-gray-500">
                              Signed: {new Date(signature.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {signature.signed ? (
                            <span className="text-green-600">✅</span>
                          ) : (
                            <span className="text-gray-400">⏳</span>
                          )}
                          {!signature.signed && party.id === currentParty && (
                            <button
                              onClick={() => signRequest(request.id, party.id)}
                              disabled={loading}
                              className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {loading ? 'Signing...' : 'Sign'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {request.status === 'partial' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-sm text-yellow-800">
                    {Object.values(request.signatures).filter(s => s.signed).length}/3 signatures collected. 
                    Waiting for remaining parties to sign.
                  </p>
                </div>
              )}

              {request.status === 'complete' && (
                <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-800">
                      All signatures collected! Ready to decrypt data and start computation.
                    </p>
                    <button
                      onClick={() => verifySignatures(request.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify & Proceed'}
                    </button>
                  </div>
                </div>
              )}

              {request.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    Signature verification failed. Please try again.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
