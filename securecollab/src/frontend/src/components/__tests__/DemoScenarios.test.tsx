import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DemoScenarios } from '../DemoScenarios';
import { backendService } from '../../services/backendService';

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    deployMpcAgents: jest.fn(),
    executePrivateComputation: jest.fn(),
    generatePrivacyProof: jest.fn(),
  },
}));

describe('DemoScenarios Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders demo scenarios correctly', () => {
    render(<DemoScenarios />);
    
    // Check if all demo scenarios are rendered
    expect(screen.getByText(/Multi-Hospital Cancer Research/i)).toBeInTheDocument();
    expect(screen.getByText(/Cross-Bank Fraud Detection/i)).toBeInTheDocument();
    expect(screen.getByText(/Competitive Market Analysis/i)).toBeInTheDocument();
  });

  test('starts and progresses through a demo scenario', async () => {
    // Mock the backend service functions
    (backendService.deployMpcAgents as jest.Mock).mockResolvedValue('team123');
    (backendService.executePrivateComputation as jest.Mock).mockResolvedValue({
      insights: 'Test insights',
      privacy_proof: 'proof123',
      timestamp: BigInt(1625097600000)
    });
    (backendService.generatePrivacyProof as jest.Mock).mockResolvedValue('proof123');
    
    render(<DemoScenarios />);
    
    // Start the first demo scenario
    const startButtons = screen.getAllByText('Start Demo');
    fireEvent.click(startButtons[0]); // Click the first "Start Demo" button
    
    // Check if the first step is displayed
    expect(screen.getByText(/Step 1:/i)).toBeInTheDocument();
    
    // Progress to the next step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    
    // Wait for the agent deployment to complete
    await waitFor(() => {
      expect(backendService.deployMpcAgents).toHaveBeenCalled();
      expect(screen.getByText(/Step 2:/i)).toBeInTheDocument();
    });
    
    // Progress to the next step
    fireEvent.click(screen.getByText('Next Step'));
    
    // Wait for the computation to complete
    await waitFor(() => {
      expect(backendService.executePrivateComputation).toHaveBeenCalled();
      expect(screen.getByText(/Step 3:/i)).toBeInTheDocument();
    });
    
    // Progress to the next step
    fireEvent.click(screen.getByText('Next Step'));
    
    // Wait for the proof generation to complete
    await waitFor(() => {
      expect(backendService.generatePrivacyProof).toHaveBeenCalled();
      expect(screen.getByText(/Step 4:/i)).toBeInTheDocument();
    });
    
    // Complete the demo
    fireEvent.click(screen.getByText('Complete Demo'));
    
    // Check if the demo is completed
    expect(screen.getByText(/Demo completed/i)).toBeInTheDocument();
  });

  test('handles errors during demo execution', async () => {
    // Mock the deployMpcAgents to reject with an error
    (backendService.deployMpcAgents as jest.Mock).mockRejectedValue(new Error('Failed to deploy agents'));
    
    render(<DemoScenarios />);
    
    // Start the first demo scenario
    const startButtons = screen.getAllByText('Start Demo');
    fireEvent.click(startButtons[0]); // Click the first "Start Demo" button
    
    // Progress to the next step
    const nextButton = screen.getByText('Next Step');
    fireEvent.click(nextButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  test('allows restarting a demo', async () => {
    render(<DemoScenarios />);
    
    // Start the first demo scenario
    const startButtons = screen.getAllByText('Start Demo');
    fireEvent.click(startButtons[0]); // Click the first "Start Demo" button
    
    // Check if the first step is displayed
    expect(screen.getByText(/Step 1:/i)).toBeInTheDocument();
    
    // Restart the demo
    fireEvent.click(screen.getByText('Restart Demo'));
    
    // Check if the demo selection is displayed again
    expect(screen.getAllByText('Start Demo')[0]).toBeInTheDocument();
  });
});
