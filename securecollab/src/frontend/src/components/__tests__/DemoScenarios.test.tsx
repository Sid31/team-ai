import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DemoScenarios } from '../DemoScenarios';
import { backendService } from '../../services/backendService';

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    uploadPrivateData: jest.fn(),
    deployMpcAgents: jest.fn(),
    executePrivateComputation: jest.fn(),
    generatePrivacyProof: jest.fn(),
  },
}));

describe('DemoScenarios Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock all backend service methods
    (backendService.uploadPrivateData as jest.Mock).mockResolvedValue('data123');
    (backendService.deployMpcAgents as jest.Mock).mockResolvedValue('team123');
    (backendService.executePrivateComputation as jest.Mock).mockResolvedValue({
      insights: 'Test insights',
      privacy_proof: 'Test proof',
      timestamp: Date.now()
    });
    (backendService.generatePrivacyProof as jest.Mock).mockResolvedValue('proof123');
  });

  test('renders demo scenarios correctly', () => {
    render(<DemoScenarios />);
    
    // Check if demo scenarios are displayed
    expect(screen.getByText(/Multi-Hospital Cancer Research/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Bank Fraud Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitive Market Analysis/i)).toBeInTheDocument();
    
    // Check if run demo buttons are present
    const runButtons = screen.getAllByText('▶️ Run Demo');
    expect(runButtons).toHaveLength(3);
  });

  test('starts a medical demo scenario', async () => {
    render(<DemoScenarios />);
    
    // Click the first demo's run button (medical)
    const runButtons = screen.getAllByText('▶️ Run Demo');
    
    await act(async () => {
      fireEvent.click(runButtons[0]);
    });
    
    // Check if the demo is running
    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that the first step is displayed
    expect(screen.getByText(/Uploading encrypted patient data/i)).toBeInTheDocument();
  });

  test('starts a financial demo scenario', async () => {
    render(<DemoScenarios />);
    
    // Start the second demo scenario (financial)
    const runButtons = screen.getAllByText('▶️ Run Demo');
    
    await act(async () => {
      fireEvent.click(runButtons[1]);
    });
    
    // Check if the demo is running
    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that the first step is displayed
    expect(screen.getByText(/Securely connecting to 5 bank/i)).toBeInTheDocument();
  });

  test('starts a market analysis demo scenario', async () => {
    render(<DemoScenarios />);
    
    // Start the third demo scenario (market)
    const runButtons = screen.getAllByText('▶️ Run Demo');
    
    await act(async () => {
      fireEvent.click(runButtons[2]);
    });
    
    // Check if the demo is running
    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that the first step is displayed
    expect(screen.getByText(/Collecting encrypted market data/i)).toBeInTheDocument();
  });
});
