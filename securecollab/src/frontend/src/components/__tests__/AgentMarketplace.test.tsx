import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AgentMarketplace } from '../AgentMarketplace';
import { backendService } from '../../services/backendService';

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
    
    expect(screen.getByText(/Loading available agents/i)).toBeInTheDocument();
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
    
    // Select the agent
    const selectButton = screen.getByText('Select');
    fireEvent.click(selectButton);
    
    // Check if the agent is selected
    expect(screen.getByText('Selected Agents (1)')).toBeInTheDocument();
    
    // Deploy the agent
    const deployButton = screen.getByText('Deploy Selected Agents');
    fireEvent.click(deployButton);
    
    // Wait for the deployment to complete
    await waitFor(() => {
      expect(backendService.deployMpcAgents).toHaveBeenCalledWith(['agent1'], []);
      expect(screen.getByText(/Successfully deployed/i)).toBeInTheDocument();
    });
  });

  test('handles errors when loading agents fails', async () => {
    // Mock the getAvailableAgents to reject with an error
    (backendService.getAvailableAgents as jest.Mock).mockRejectedValue(new Error('Failed to load agents'));
    
    render(<AgentMarketplace />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading agents/i)).toBeInTheDocument();
    });
  });
});
