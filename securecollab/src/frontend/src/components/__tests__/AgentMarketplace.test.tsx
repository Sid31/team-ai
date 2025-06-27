import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentMarketplace } from '../AgentMarketplace';
import { backendService } from '../../services/backendService';

// Mock window.alert to prevent errors in tests
window.alert = jest.fn();

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    getAvailableAgents: jest.fn(),
    deployMpcAgents: jest.fn(),
  },
}));

describe('AgentMarketplace Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock the getAvailableAgents to return a pending promise
    (backendService.getAvailableAgents as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<AgentMarketplace />);
    
    // The component shows a Loader component when loading
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('renders agents when loaded successfully', async () => {
    // Mock data
    const mockAgents = [
      {
        id: 'agent1',
        name: 'Test Agent 1',
        description: 'Test description 1',
        computation_type: 'healthcare',
        price_per_computation: BigInt(100),
        reputation_score: 4.5
      },
      {
        id: 'agent2',
        name: 'Test Agent 2',
        description: 'Test description 2',
        computation_type: 'finance',
        price_per_computation: BigInt(200),
        reputation_score: 4.8
      }
    ];
    
    // Mock the getAvailableAgents to resolve with mock data
    (backendService.getAvailableAgents as jest.Mock).mockResolvedValue(mockAgents);
    
    render(<AgentMarketplace />);
    
    // Wait for the agents to be displayed
    await waitFor(() => {
      expect(screen.getByText('🤖 AI Agent Marketplace')).toBeInTheDocument();
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
      expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
      expect(screen.getByText('Test description 1')).toBeInTheDocument();
      expect(screen.getByText('Test description 2')).toBeInTheDocument();
    });
  });

  test('handles agent selection and deployment', async () => {
    // Mock data
    const mockAgents = [
      {
        id: 'agent1',
        name: 'Test Agent 1',
        description: 'Test description 1',
        computation_type: 'healthcare',
        price_per_computation: BigInt(100),
        reputation_score: 4.5
      }
    ];
    
    // Mock the backend service functions
    (backendService.getAvailableAgents as jest.Mock).mockResolvedValue(mockAgents);
    (backendService.deployMpcAgents as jest.Mock).mockResolvedValue('team123');
    
    render(<AgentMarketplace />);
    
    // Wait for the agents to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    });
    
    // Select the agent by clicking on the agent card
    const agentCard = screen.getByText('Test Agent 1').closest('div');
    fireEvent.click(agentCard!);
    
    // Check if the deploy button appears
    await waitFor(() => {
      expect(screen.getByText('Deploy Selected Agents (1)')).toBeInTheDocument();
    });
    
    // Deploy the agent
    const deployButton = screen.getByText('Deploy Selected Agents (1)');
    fireEvent.click(deployButton);
    
    // Wait for the deployment to complete
    await waitFor(() => {
      expect(backendService.deployMpcAgents).toHaveBeenCalledWith(['agent1'], ['data_sample_1', 'data_sample_2']);
      expect(window.alert).toHaveBeenCalledWith('Agent team deployed successfully! Team ID: team123');
    });
  });

  test('handles errors when loading agents fails', async () => {
    // Mock the getAvailableAgents to reject with an error
    (backendService.getAvailableAgents as jest.Mock).mockRejectedValue(new Error('Failed to load agents'));
    
    render(<AgentMarketplace />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load agents/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no agents are available', async () => {
    // Mock the getAvailableAgents to return empty array
    (backendService.getAvailableAgents as jest.Mock).mockResolvedValue([]);
    
    render(<AgentMarketplace />);
    
    // Wait for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No agents available. Try refreshing the page.')).toBeInTheDocument();
    });
  });
});
