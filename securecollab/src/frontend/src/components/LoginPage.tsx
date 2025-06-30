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
          await authService.registerIdentity('General User', 'Standard User');
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
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light text-white mb-3 tracking-wide">SecureCollab</h1>
          <div className="w-16 h-0.5 bg-white mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm font-light tracking-wide">Secure Multi-Party Data Collaboration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-10">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-black mb-3 tracking-wide">
                Identity Login
              </h2>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
                Authenticate with Internet Identity for secure access
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-black rounded">
                <p className="text-sm text-gray-700 font-light">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-black text-white rounded-xl font-light text-sm tracking-wide transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="font-light">Connecting</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-light tracking-wide">Login with Internet Identity</span>
                  </div>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-400 font-light">
                  Powered by Internet Computer
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="text-center">
                <h3 className="text-sm font-medium text-black mb-4 tracking-wide">Security Features</h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                    <span className="font-light">vetKD Encryption</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                    <span className="font-light">Multi-Party Signatures</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                    <span className="font-light">Secure Computation</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                    <span className="font-light">Privacy Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
