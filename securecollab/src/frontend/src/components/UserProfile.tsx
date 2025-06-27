import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface UserProfileProps {
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [principalText, setPrincipalText] = useState<string>('');
  const [userIdentity, setUserIdentity] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const principal = authService.getPrincipalText();
        setPrincipalText(principal);

        // Try to get user identity from backend
        try {
          const identity = await authService.getUserIdentity();
          setUserIdentity(identity);
        } catch (error) {
          console.log('User identity not found in backend, this is normal for first login');
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const truncatePrincipal = (principal: string) => {
    if (principal.length <= 12) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-6)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-sm bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-medium text-gray-700">
          {truncatePrincipal(principalText)}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Internet Identity</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Principal ID:</label>
                <p className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">
                  {principalText}
                </p>
              </div>
              {userIdentity && (
                <div>
                  <label className="text-xs text-gray-500">Permissions:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userIdentity.permissions?.map((permission: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Authenticated with IC</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>VetKD Keys Available</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Multi-party Signatures Ready</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                {isLoading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
