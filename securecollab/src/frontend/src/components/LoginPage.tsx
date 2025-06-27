import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface LoginPageProps {
  onLogin: (isAuthenticated: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth service and check if already logged in
    const initAuth = async () => {
      try {
        await authService.init();
        const state = authService.getState();
        if (state.isAuthenticated) {
          onLogin(true);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to initialize authentication');
      }
    };

    initAuth();
  }, [onLogin]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await authService.login();
      if (success) {
        // Register identity with backend after successful login
        try {
          await authService.registerIdentity(['read', 'write', 'compute', 'sign']);
          console.log('Identity registered successfully');
        } catch (regError) {
          console.warn('Identity registration failed, but login succeeded:', regError);
        }
        onLogin(true);
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SecureCollab</h1>
          <p className="text-lg text-gray-600 mb-8">Secure Multi-Party Data Collaboration</p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Secure Identity Login
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Login with Internet Identity to access secure multi-party computation features
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Login with Internet Identity
                </div>
              )}
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Powered by Internet Computer's Internet Identity
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              <h3 className="font-medium mb-2">Features:</h3>
              <ul className="space-y-1 text-xs">
                <li>• Secure vetKD key derivation</li>
                <li>• Multi-party signature verification</li>
                <li>• Encrypted data computation</li>
                <li>• Privacy-preserving analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
