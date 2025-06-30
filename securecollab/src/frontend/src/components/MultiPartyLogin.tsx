import React, { useState } from 'react';
import { authService } from '../services/authService';

interface Party {
  id: string;
  name: string;
  role: string;
  color: string;
  icon: string;
}

const PARTIES: Party[] = [
  {
    id: 'party1',
    name: 'Boston General Hospital',
    role: 'Healthcare Provider',
    color: 'bg-black',
    icon: '🏥'
  },
  {
    id: 'party2', 
    name: 'Novartis Pharmaceuticals',
    role: 'Pharmaceutical Company',
    color: 'bg-gray-800',
    icon: '💊'
  },
  {
    id: 'party3',
    name: 'MIT Research Laboratory', 
    role: 'Research Institution',
    color: 'bg-gray-600',
    icon: '🔬'
  }
];

interface MultiPartyLoginProps {
  onLogin: (partyId: string, isAuthenticated: boolean) => void;
}

export const MultiPartyLogin: React.FC<MultiPartyLoginProps> = ({ onLogin }) => {
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePartyLogin = async (partyId: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedParty(partyId);

    try {
      // Initialize auth service for this party
      await authService.init();
      
      // Login with Internet Identity
      const success = await authService.login();
      
      if (success) {
        // Register identity with backend for this specific party
        try {
          console.log(`Attempting to register identity for ${partyId}...`);
          const party = PARTIES.find(p => p.id === partyId);
          const result = await authService.registerIdentity(party?.name || 'Unknown Party', party?.role || 'Unknown Role');
          console.log(`Identity registered successfully for ${partyId}:`, result);
          onLogin(partyId, true);
        } catch (regError: any) {
          console.error('Identity registration failed:', regError);
          setError(`Failed to register identity with backend: ${regError.message || regError}`);
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-4 tracking-wide">SecureCollab</h1>
          <div className="w-16 sm:w-24 h-0.5 bg-white mx-auto mb-4 sm:mb-6"></div>
          <p className="text-gray-300 text-base sm:text-lg font-light mb-2 tracking-wide px-4">Secure Multi-Party Data Collaboration</p>
          <p className="text-gray-400 text-sm font-light tracking-wide px-4">Choose your organization to authenticate</p>
        </div>

        {error && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white border-l-4 border-black rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-gray-700 font-light">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 w-full">
          {PARTIES.map((party) => (
            <div
              key={party.id}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-105 w-full min-h-[600px]"
            >
              <div className={`${party.color} h-2`}></div>
              
              <div className="p-8 sm:p-10 lg:p-12">
                <div className="text-center mb-8 sm:mb-10">
                  <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">{party.icon}</div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-black mb-4 tracking-wide leading-tight">
                    {party.name}
                  </h3>
                  <p className="text-lg sm:text-xl text-gray-500 font-light">{party.role}</p>
                </div>

                <div className="space-y-5 sm:space-y-6 mb-8 sm:mb-10">
                  <div className="flex items-center text-base sm:text-lg text-gray-600">
                    <div className="w-3 h-3 bg-black rounded-full mr-4 flex-shrink-0"></div>
                    <span className="font-light">vetKD Encryption</span>
                  </div>
                  <div className="flex items-center text-base sm:text-lg text-gray-600">
                    <div className="w-3 h-3 bg-black rounded-full mr-4 flex-shrink-0"></div>
                    <span className="font-light">Secure Data Upload</span>
                  </div>
                  <div className="flex items-center text-base sm:text-lg text-gray-600">
                    <div className="w-3 h-3 bg-black rounded-full mr-4 flex-shrink-0"></div>
                    <span className="font-light">Multi-Party Computation</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePartyLogin(party.id)}
                  disabled={isLoading}
                  className={`w-full py-6 sm:py-7 px-8 rounded-2xl text-white font-light text-lg sm:text-xl tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isLoading && selectedParty === party.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${party.color} hover:opacity-90`
                  }`}
                >
                  {isLoading && selectedParty === party.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-4"></div>
                      <span className="font-light text-lg">Connecting</span>
                    </div>
                  ) : (
                    <span className="font-light tracking-wide">Login as {party.name.split(' ')[0]}</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto shadow-2xl">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-black mb-6 sm:mb-8 tracking-wide">Multi-Party Computation Workflow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-sm sm:text-base">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-light text-base sm:text-lg lg:text-xl">1</span>
                </div>
                <p className="font-medium text-black mb-2 tracking-wide text-sm sm:text-base lg:text-lg">Upload Data</p>
                <p className="text-gray-500 font-light leading-relaxed text-xs sm:text-sm lg:text-base">Each party uploads encrypted CSV datasets</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-light text-base sm:text-lg lg:text-xl">2</span>
                </div>
                <p className="font-medium text-black mb-2 tracking-wide text-sm sm:text-base lg:text-lg">Secure Storage</p>
                <p className="text-gray-500 font-light leading-relaxed text-xs sm:text-sm lg:text-base">Data encrypted with individual vetKD keys</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-light text-base sm:text-lg lg:text-xl">3</span>
                </div>
                <p className="font-medium text-black mb-2 tracking-wide text-sm sm:text-base lg:text-lg">Joint Computation</p>
                <p className="text-gray-500 font-light leading-relaxed text-xs sm:text-sm lg:text-base">All parties decrypt data in secure environment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-white font-light text-base sm:text-lg lg:text-xl">4</span>
                </div>
                <p className="font-medium text-black mb-2 tracking-wide text-sm sm:text-base lg:text-lg">Generate Results</p>
                <p className="text-gray-500 font-light leading-relaxed text-xs sm:text-sm lg:text-base">AI processes data and returns insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
