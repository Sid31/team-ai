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

  test('renders without crashing', async () => {
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    
    render(<PrivacyDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('🔒 Privacy Dashboard')).toBeInTheDocument();
    });
  });

  test('displays tabs correctly', async () => {
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    
    render(<PrivacyDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Private Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Secure Computations')).toBeInTheDocument();
    });
  });

  test('displays data sources when loaded successfully', async () => {
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
    });
  });

  test('displays upload form elements', async () => {
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    
    render(<PrivacyDashboard />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Upload New Data')).toBeInTheDocument();
    });
    
    // Check form elements exist
    expect(screen.getByPlaceholderText('Enter your sensitive data here...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., patient_records, financial_data')).toBeInTheDocument();
    expect(screen.getByText('Securely Upload Data')).toBeInTheDocument();
  });

  test('handles data upload', async () => {
    // Mock the backend service functions
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    (backendService.uploadPrivateData as jest.Mock).mockResolvedValue('data123');
    
    render(<PrivacyDashboard />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Upload New Data')).toBeInTheDocument();
    });
    
    // Fill in the form
    const dataTextarea = screen.getByPlaceholderText('Enter your sensitive data here...');
    const schemaInput = screen.getByPlaceholderText('e.g., patient_records, financial_data');
    
    fireEvent.change(dataTextarea, { target: { value: 'test data' } });
    fireEvent.change(schemaInput, { target: { value: 'test_schema' } });
    
    // Click upload button
    const uploadButton = screen.getByText('Securely Upload Data');
    fireEvent.click(uploadButton);
    
    // Wait for the upload to complete
    await waitFor(() => {
      expect(backendService.uploadPrivateData).toHaveBeenCalled();
    });
  });

  test('switches to computations tab and shows demo button', async () => {
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    
    render(<PrivacyDashboard />);
    
    // Wait for component to load first
    await waitFor(() => {
      expect(screen.getByText('Private Data Sources')).toBeInTheDocument();
    });
    
    // Switch to computations tab
    const computationsTab = screen.getByText('Secure Computations');
    fireEvent.click(computationsTab);
    
    // Wait for the tab to switch
    await waitFor(() => {
      expect(screen.getByText('Run Demo Computation')).toBeInTheDocument();
    });
  });

  test('handles demo computation execution', async () => {
    // Mock the backend service functions
    (backendService.getDataSourcesForUser as jest.Mock).mockResolvedValue([]);
    (backendService.executePrivateComputation as jest.Mock).mockResolvedValue({
      insights: 'Test insights',
      privacy_proof: 'proof123',
      timestamp: BigInt(Date.now() * 1000000)
    });
    
    render(<PrivacyDashboard />);
    
    // Wait for component to load first
    await waitFor(() => {
      expect(screen.getByText('Private Data Sources')).toBeInTheDocument();
    });
    
    // Switch to computations tab
    const computationsTab = screen.getByText('Secure Computations');
    fireEvent.click(computationsTab);
    
    // Wait for the tab to switch
    await waitFor(() => {
      expect(screen.getByText('Run Demo Computation')).toBeInTheDocument();
    });
    
    // Click the run computation button
    const runButton = screen.getByText('Run Demo Computation');
    fireEvent.click(runButton);
    
    // Wait for the computation to complete
    await waitFor(() => {
      expect(backendService.executePrivateComputation).toHaveBeenCalledWith(
        'demo_team',
        'analyze_data_patterns'
      );
    });
  });

  test('handles errors when loading data sources fails', async () => {
    // Mock the getDataSourcesForUser to reject with an error
    (backendService.getDataSourcesForUser as jest.Mock).mockRejectedValue(new Error('Failed to load data sources'));
    
    render(<PrivacyDashboard />);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data sources: Error: Failed to load data sources/i)).toBeInTheDocument();
    });
  });
});
