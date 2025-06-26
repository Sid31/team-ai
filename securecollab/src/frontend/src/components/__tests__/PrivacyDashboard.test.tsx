import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivacyDashboard } from '../PrivacyDashboard';
import { backendService } from '../../services/backendService';

// Mock the backend service
jest.mock('../../services/backendService', () => ({
  backendService: {
    uploadPrivateData: jest.fn(),
    getDataSourcesForUser: jest.fn(),
    executePrivateComputation: jest.fn(),
    generatePrivacyProof: jest.fn(),
  },
}));

describe('PrivacyDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock the getDataSourcesForUser to return a pending promise
    (backendService.getDataSourcesForUser as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<PrivacyDashboard />);
    
    expect(screen.getByText(/Loading your data sources/i)).toBeInTheDocument();
  });

  test('renders data sources when loaded successfully', async () => {
    // Mock data
    const mockDataSources = [
      {
        id: 'data1',
        owner: 'user123',
        schema_hash: 'schema1',
        access_permissions: ['agent1', 'agent2']
      },
      {
        id: 'data2',
        owner: 'user123',
        schema_hash: 'schema2',
        access_permissions: ['agent3']
      }
    ];
    
    // Mock the getDataSourcesForUser to resolve with mock data
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue(mockDataSources);
    
    render(<PrivacyDashboard />);
    
    // Wait for the data sources to be displayed
    await waitFor(() => {
      expect(screen.getByText('data1')).toBeInTheDocument();
      expect(screen.getByText('data2')).toBeInTheDocument();
      expect(screen.getByText('schema1')).toBeInTheDocument();
      expect(screen.getByText('schema2')).toBeInTheDocument();
    });
  });

  test('handles data upload', async () => {
    // Mock the backend service functions
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    (backendService.uploadPrivateData as jest.Mock).mockResolvedValue('data123');
    
    render(<PrivacyDashboard />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Upload Private Data')).toBeInTheDocument();
    });
    
    // Fill in the form
    const schemaInput = screen.getByLabelText(/Data Schema/i);
    fireEvent.change(schemaInput, { target: { value: 'test-schema' } });
    
    // Submit the form
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);
    
    // Wait for the upload to complete
    await waitFor(() => {
      expect(backendService.uploadPrivateData).toHaveBeenCalled();
      expect(screen.getByText(/Successfully uploaded/i)).toBeInTheDocument();
    });
  });

  test('handles private computation execution', async () => {
    // Mock data
    const mockDataSources = [
      {
        id: 'data1',
        owner: 'user123',
        schema_hash: 'schema1',
        access_permissions: ['agent1']
      }
    ];
    
    const mockResult = {
      insights: 'Test insights',
      privacy_proof: 'proof123',
      timestamp: BigInt(1625097600000)
    };
    
    // Mock the backend service functions
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue(mockDataSources);
    (backendService.executePrivateComputation as jest.Mock).mockResolvedValue(mockResult);
    
    render(<PrivacyDashboard />);
    
    // Wait for the data sources to be displayed
    await waitFor(() => {
      expect(screen.getByText('data1')).toBeInTheDocument();
    });
    
    // Fill in the computation form
    const teamIdInput = screen.getByLabelText(/Agent Team ID/i);
    fireEvent.change(teamIdInput, { target: { value: 'team123' } });
    
    const queryInput = screen.getByLabelText(/Computation Query/i);
    fireEvent.change(queryInput, { target: { value: 'test query' } });
    
    // Submit the form
    const executeButton = screen.getByText('Execute');
    fireEvent.click(executeButton);
    
    // Wait for the computation to complete
    await waitFor(() => {
      expect(backendService.executePrivateComputation).toHaveBeenCalledWith('team123', 'test query');
      expect(screen.getByText('Test insights')).toBeInTheDocument();
    });
  });

  test('handles privacy proof generation', async () => {
    // Mock data
    const mockDataSources = [
      {
        id: 'data1',
        owner: 'user123',
        schema_hash: 'schema1',
        access_permissions: ['agent1']
      }
    ];
    
    // Mock the backend service functions
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue(mockDataSources);
    (backendService.generatePrivacyProof as jest.Mock).mockResolvedValue('proof123');
    
    render(<PrivacyDashboard />);
    
    // Wait for the data sources to be displayed
    await waitFor(() => {
      expect(screen.getByText('data1')).toBeInTheDocument();
    });
    
    // Generate a privacy proof
    const generateButton = screen.getByText('Generate Proof');
    fireEvent.click(generateButton);
    
    // Wait for the proof generation to complete
    await waitFor(() => {
      expect(backendService.generatePrivacyProof).toHaveBeenCalled();
      expect(screen.getByText(/proof123/i)).toBeInTheDocument();
    });
  });

  test('handles errors when loading data sources fails', async () => {
    // Mock the getDataSourcesForUser to reject with an error
    (backendService.getDataSourcesForUser as jest.Mock).mockRejectedValue(new Error('Failed to load data sources'));
    
    render(<PrivacyDashboard />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Error loading data sources/i)).toBeInTheDocument();
    });
  });
});
