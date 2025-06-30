import { useState, useEffect } from 'react';
import reactLogo from '../assets/React-icon.webp';
import { Loader, ErrorDisplay, PrivacyDashboard, MultiPartyLogin, MultiPartyDashboard } from "./components";
import { GreetingView, CounterView, LlmPromptView } from "./views";
import { LoginPage } from './components/LoginPage';
import { UserProfile } from './components/UserProfile';
import { authService } from './services/authService';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>("threeparty");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [multiPartyMode, setMultiPartyMode] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.init();
        const state = authService.getState();
        setIsAuthenticated(state.isAuthenticated);
        
        // Check for stored party selection
        const storedPartyId = localStorage.getItem('selectedPartyId');
        if (storedPartyId && state.isAuthenticated) {
          setSelectedParty(storedPartyId);
          setMultiPartyMode(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMultiPartyMode(false);
    setSelectedParty(null);
    // Clear stored party selection
    localStorage.removeItem('selectedPartyId');
  };

  const handleMultiPartyLogin = (partyId: string, authenticated: boolean) => {
    setSelectedParty(partyId);
    setIsAuthenticated(authenticated);
    setMultiPartyMode(true);
    // Store the party selection for persistence
    localStorage.setItem('selectedPartyId', partyId);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const logoStyle = {
    animation: "logo-spin 60s linear infinite",
  };

  const renderContent = () => {
    // If in multi-party mode, show the multi-party dashboard
    if (multiPartyMode && selectedParty) {
      return <MultiPartyDashboard currentPartyId={selectedParty} onLogout={handleLogout} />;
    }

    switch (activeTab) {
      case "threeparty":
        return <MultiPartyDashboard currentPartyId="party1" onLogout={handleLogout} />;
      case "privacy":
        return <PrivacyDashboard />;
      case "llm":
        return <LlmPromptView onError={handleError} setLoading={setLoading} />;
      case "counter":
        return <CounterView onError={handleError} setLoading={setLoading} />;
      case "home":
      default:
        return (
          <div className="space-y-8">
            <GreetingView onError={handleError} setLoading={setLoading} />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome to SecureCollab</h2>
              <p className="text-gray-700 mb-4">
                SecureCollab is a privacy-preserving multi-agent computation platform built on the Internet Computer.
                It enables secure collaboration between AI agents while protecting sensitive data through advanced
                cryptographic techniques like Multi-Party Computation (MPC) and vetKD encryption.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">🤝 Multi-Party Dashboard</h3>
                  <p className="text-sm text-gray-600">Collaborate securely with multiple parties on sensitive computations.</p>
                  <button 
                    onClick={() => setActiveTab("threeparty")}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Start Collaboration →
                  </button>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">🔒 Privacy Dashboard</h3>
                  <p className="text-sm text-gray-600">Upload encrypted data and manage your private computations.</p>
                  <button 
                    onClick={() => setActiveTab("privacy")}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Manage Data →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing SecureCollab...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">SecureCollab</h2>
              <p className="text-gray-600 mb-8">Choose your login method</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setMultiPartyMode(false)}
                className={`w-full py-3 px-4 rounded-lg border-2 transition-colors ${
                  !multiPartyMode 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">Standard Login</div>
                  <div className="text-sm opacity-75">Single user Internet Identity</div>
                </div>
              </button>
              
              <button
                onClick={() => setMultiPartyMode(true)}
                className={`w-full py-3 px-4 rounded-lg border-2 transition-colors ${
                  multiPartyMode 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">Multi-Party Login</div>
                  <div className="text-sm opacity-75">3-Party Secure MPC Workflow</div>
                </div>
              </button>
            </div>
            
            <div className="mt-8">
              {multiPartyMode ? (
                <MultiPartyLogin onLogin={handleMultiPartyLogin} />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          @keyframes logo-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src={reactLogo}
                  className="h-8 w-8 will-change-[filter] hover:drop-shadow-[0_0_1em_#61dafbaa] motion-reduce:animate-none"
                  style={logoStyle}
                  alt="SecureCollab logo"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">SecureCollab</span>
              </div>
            </div>
            <nav className="flex space-x-4 items-center">

              <button
                onClick={() => setActiveTab("threeparty")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "threeparty" ? "bg-green-100 text-green-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                🔐 Multi-Party Dashboard
              </button>
              <button
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "home" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "privacy" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Privacy Dashboard
              </button>
              <UserProfile onLogout={handleLogout} />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {renderContent()}
            
            {/* Loading and Error States */}
            {loading && !error && <Loader />}
            {!!error && <ErrorDisplay message={error} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              &copy; 2025 SecureCollab - Built on the Internet Computer
            </div>
            <div className="text-sm text-gray-500">
              Privacy-Preserving Multi-Agent Computation Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
