import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { backendService } from '../../services/backendService';

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    prompt: jest.fn(),
    chat: jest.fn(),
    getAvailableAgents: jest.fn(),
    deployMpcAgents: jest.fn(),
    uploadPrivateData: jest.fn(),
    getDataSourcesForUser: jest.fn(),
    executePrivateComputation: jest.fn(),
    generatePrivacyProof: jest.fn(),
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header with logo', () => {
    render(<App />);
    
    // Check for the header elements
    expect(screen.getByText(/SecureCollab/i)).toBeInTheDocument();
    expect(screen.getByAltText(/React Logo/i)).toBeInTheDocument();
  });

  test('renders navigation tabs', () => {
    render(<App />);
    
    // Check for the navigation tabs
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Marketplace/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/LLM Chat/i)).toBeInTheDocument();
  });

  test('changes active tab when clicked', () => {
    render(<App />);
    
    // Initially, Home should be active
    const homeTab = screen.getByText(/Home/i);
    expect(homeTab.closest('button')).toHaveClass('bg-blue-600');
    
    // Click on the Agent Marketplace tab
    const marketplaceTab = screen.getByText(/Agent Marketplace/i);
    fireEvent.click(marketplaceTab);
    
    // Now Agent Marketplace should be active
    expect(marketplaceTab.closest('button')).toHaveClass('bg-blue-600');
    expect(homeTab.closest('button')).not.toHaveClass('bg-blue-600');
    
    // Check that the Agent Marketplace component is rendered
    expect(screen.getByText(/Available Agents/i)).toBeInTheDocument();
  });

  test('renders LLM Chat component when LLM Chat tab is clicked', () => {
    render(<App />);
    
    // Click on the LLM Chat tab
    const llmChatTab = screen.getByText(/LLM Chat/i);
    fireEvent.click(llmChatTab);
    
    // Check that the LLM Chat component is rendered
    expect(screen.getByText(/Chat with our AI assistant/i)).toBeInTheDocument();
  });

  test('renders Privacy Dashboard component when Privacy Dashboard tab is clicked', () => {
    render(<App />);
    
    // Click on the Privacy Dashboard tab
    const privacyDashboardTab = screen.getByText(/Privacy Dashboard/i);
    fireEvent.click(privacyDashboardTab);
    
    // Check that the Privacy Dashboard component is rendered
    expect(screen.getByText(/Upload Private Data/i)).toBeInTheDocument();
  });

  test('renders Demo Scenarios component when Demo Scenarios tab is clicked', () => {
    render(<App />);
    
    // Click on the Demo Scenarios tab
    const demoScenariosTab = screen.getByText(/Demo Scenarios/i);
    fireEvent.click(demoScenariosTab);
    
    // Check that the Demo Scenarios component is rendered
    expect(screen.getByText(/Multi-Hospital Cancer Research/i)).toBeInTheDocument();
  });

  test('renders footer with copyright information', () => {
    render(<App />);
    
    // Check for the footer
    expect(screen.getByText(/© 2025 SecureCollab/i)).toBeInTheDocument();
  });
});
