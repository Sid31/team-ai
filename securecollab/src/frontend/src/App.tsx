import { useState } from "react";
// Import React logo from assets directory
import reactLogo from '../assets/React-icon.webp';

// Import components and views
import { Loader, ErrorDisplay, AgentMarketplace, PrivacyDashboard, DemoScenarios } from "./components";
import { GreetingView, CounterView, LlmPromptView } from "./views";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>("home");

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const logoStyle = {
    animation: "logo-spin 60s linear infinite",
  };

  const renderContent = () => {
    switch (activeTab) {
      case "marketplace":
        return <AgentMarketplace />;
      case "privacy":
        return <PrivacyDashboard />;
      case "demos":
        return <DemoScenarios />;
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">🤖 Agent Marketplace</h3>
                  <p className="text-sm text-gray-600">Browse and deploy specialized AI agents for secure computation tasks.</p>
                  <button 
                    onClick={() => setActiveTab("marketplace")}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Explore Agents →
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
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">🎭 Demo Scenarios</h3>
                  <p className="text-sm text-gray-600">See SecureCollab in action with real-world use cases.</p>
                  <button 
                    onClick={() => setActiveTab("demos")}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Demos →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

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
                onClick={() => setActiveTab("home")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "home" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab("marketplace")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "marketplace" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Agent Marketplace
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "privacy" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Privacy Dashboard
              </button>
              <button
                onClick={() => setActiveTab("demos")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "demos" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                Demo Scenarios
              </button>
              <button
                onClick={() => setActiveTab("llm")}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === "llm" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:text-gray-900"}`}
              >
                LLM Chat
              </button>
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
              © 2025 SecureCollab - Built on the Internet Computer
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
