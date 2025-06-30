import React, { useState, useEffect } from 'react';
import { backendService } from '../services/backendService';

interface Party {
  id: string;
  name: string;
  role: string;
  status: 'connected' | 'disconnected' | 'signing';
  vetKeyId?: string;
  publicKey?: string;
  lastActive?: number;
}

interface PartyStatusProps {
  onPartyUpdate?: (parties: Party[]) => void;
}

export const PartyStatus: React.FC<PartyStatusProps> = ({ onPartyUpdate }) => {
  const [parties, setParties] = useState<Party[]>([
    {
      id: 'boston-general',
      name: 'Boston General Hospital',
      role: 'Healthcare Provider',
      status: 'disconnected'
    },
    {
      id: 'novartis',
      name: 'Novartis Pharmaceuticals',
      role: 'Pharmaceutical Company',
      status: 'disconnected'
    },
    {
      id: 'mit-research',
      name: 'MIT Research Laboratory',
      role: 'Research Institution',
      status: 'disconnected'
    }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkPartyConnections();
    const interval = setInterval(checkPartyConnections, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onPartyUpdate) {
      onPartyUpdate(parties);
    }
  }, [parties, onPartyUpdate]);

  const checkPartyConnections = async () => {
    try {
      // Check each party's connection status and vetKD keys
      const updatedParties = await Promise.all(
        parties.map(async (party) => {
          try {
            // Try to get identity for each party (simulated)
            const identity = await backendService.getUserIdentity();
            return {
              ...party,
              status: 'connected' as const,
              vetKeyId: identity.vetkey_id,
              publicKey: identity.public_key ? Array.from(identity.public_key as Uint8Array).slice(0, 8).map((b: number) => b.toString(16).padStart(2, '0')).join('') + '...' : undefined,
              lastActive: Date.now()
            };
          } catch (error) {
            return {
              ...party,
              status: 'disconnected' as const,
              vetKeyId: undefined,
              publicKey: undefined
            };
          }
        })
      );
      setParties(updatedParties);
    } catch (error) {
      console.error('Error checking party connections:', error);
    }
  };

  const initiateVetKDSetup = async (partyId: string) => {
    setLoading(true);
    try {
      const party = parties.find(p => p.id === partyId);
      if (!party) return;

      // Update party status to signing
      setParties(prev => prev.map(p => 
        p.id === partyId ? { ...p, status: 'signing' } : p
      ));

      // Register identity with vetKD for this party
      const partyName = parties.find(p => p.id === partyId)?.name || 'Unknown Party';
      const identity = await backendService.registerUserIdentity(partyName, 'party_member');

      // Update party with vetKD information
      setParties(prev => prev.map(p => 
        p.id === partyId ? {
          ...p,
          status: 'connected',
          vetKeyId: identity.vetkey_id,
          publicKey: identity.public_key ? Array.from(identity.public_key as Uint8Array).slice(0, 8).map((b: number) => b.toString(16).padStart(2, '0')).join('') + '...' : undefined,
          lastActive: Date.now()
        } : p
      ));

    } catch (error) {
      console.error('Error setting up vetKD for party:', error);
      // Reset party status on error
      setParties(prev => prev.map(p => 
        p.id === partyId ? { ...p, status: 'disconnected' } : p
      ));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'signing': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'signing': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  const connectedCount = parties.filter(p => p.status === 'connected').length;
  const allConnected = connectedCount === 3;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Multi-Party Connection Status
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {connectedCount}/3 parties connected
          </span>
          {allConnected && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Ready for MPC
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {parties.map((party) => (
          <div key={party.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(party.status)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{party.name}</h3>
                  <p className="text-sm text-gray-500">{party.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(party.status)}`}>
                  {party.status.charAt(0).toUpperCase() + party.status.slice(1)}
                </span>
                {party.status === 'disconnected' && (
                  <button
                    onClick={() => initiateVetKDSetup(party.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>

            {party.status === 'connected' && (
              <div className="bg-gray-50 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VetKD ID:</span>
                  <span className="font-mono text-gray-900">{party.vetKeyId}</span>
                </div>
                {party.publicKey && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Public Key:</span>
                    <span className="font-mono text-gray-900">{party.publicKey}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Active:</span>
                  <span className="text-gray-900">
                    {party.lastActive ? new Date(party.lastActive).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            )}

            {party.status === 'signing' && (
              <div className="bg-yellow-50 rounded p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-800">Setting up vetKD encryption...</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {allConnected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <div>
              <h4 className="font-medium text-green-900">All Parties Connected</h4>
              <p className="text-sm text-green-700">
                Secure multi-party computation is now available. All parties have established vetKD encryption keys.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
