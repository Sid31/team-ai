import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    prompt: jest.fn(),
    chat: jest.fn(),
    sendLlmPrompt: jest.fn(),
    getAvailableAgents: jest.fn().mockResolvedValue([]),
    deployMpcAgents: jest.fn(),
    uploadPrivateData: jest.fn(),
    getDataSourcesForUser: jest.fn().mockResolvedValue([]),
    executePrivateComputation: jest.fn(),
    generatePrivacyProof: jest.fn(),
  },
}));

// Mock the OpenAI service
jest.mock('../../services/openaiService', () => ({
  openaiService: {
    prompt: jest.fn(),
    chat: jest.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header with logo', () => {
    render(<App />);
    
    // Check for the header elements
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByAltText(/SecureCollab logo/i)).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    
    // Check for the navigation tabs in the nav section
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Check for navigation buttons
    expect(screen.getByRole('button', { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agent Marketplace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Privacy Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Demo Scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LLM Chat/i })).toBeInTheDocument();
  });

  test('changes active tab when clicked', async () => {
    render(<App />);
    
    // Initially, Home should be active
    const homeTab = screen.getByRole('button', { name: /Home/i });
    expect(homeTab).toHaveClass('bg-blue-100');
    
    // Click on the Agent Marketplace tab
    const marketplaceTab = screen.getByRole('button', { name: /Agent Marketplace/i });
    fireEvent.click(marketplaceTab);
    
    // Wait for the Agent Marketplace component to render
    await waitFor(() => {
      expect(screen.getByText(/🤖 AI Agent Marketplace/i)).toBeInTheDocument();
    });
  });

  test('renders LLM Chat component when LLM Chat tab is clicked', () => {
    render(<App />);
    
    // Click on the LLM Chat tab
    const llmChatTab = screen.getByRole('button', { name: /LLM Chat/i });
    fireEvent.click(llmChatTab);
    
    // Check that the LLM Prompt component is rendered (it uses LlmPromptView, not LlmChat)
    expect(screen.getByText(/LLM Prompt/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask the LLM something.../i)).toBeInTheDocument();
  });

  test('renders Privacy Dashboard component when Privacy Dashboard tab is clicked', async () => {
    render(<App />);
    
    // Click on the Privacy Dashboard tab
    const privacyDashboardTab = screen.getByRole('button', { name: /Privacy Dashboard/i });
    fireEvent.click(privacyDashboardTab);
    
    // Wait for the Privacy Dashboard component to render
    await waitFor(() => {
      expect(screen.getByText(/Privacy Dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders Demo Scenarios component when Demo Scenarios tab is clicked', () => {
    render(<App />);
    
    // Click on the Demo Scenarios tab - use the button in navigation, not the card
    const demoScenariosTab = screen.getByRole('button', { name: /Demo Scenarios/i });
    fireEvent.click(demoScenariosTab);
    
    // Check that the Demo Scenarios component is rendered
    expect(screen.getByText(/Multi-Hospital Cancer Research/i)).toBeInTheDocument();
  });

  test('renders footer with copyright information', () => {
    render(<App />);
    
    // Check for the footer
    expect(screen.getByText(/ 2025 SecureCollab/i)).toBeInTheDocument();
  });
});
