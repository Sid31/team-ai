import { backendService } from '../backendService';

// Mock the backend canister
jest.mock('../../../../declarations/backend', () => ({
  backend: {
    greet: jest.fn(),
    get_count: jest.fn(),
    increment: jest.fn(),
    prompt: jest.fn(),
    upload_private_data: jest.fn(),
    deploy_mpc_agents: jest.fn(),
    get_available_agents: jest.fn(),
    execute_private_computation: jest.fn(),
    get_data_sources_for_user: jest.fn(),
    generate_privacy_proof: jest.fn(),
  }
}));

// @ts-ignore - Backend module is mocked above
import { backend } from '../../../../declarations/backend';
const mockBackend = backend as jest.Mocked<typeof backend>;

describe('Backend Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('greet should call backend greet method', async () => {
    const name = 'Alice';
    const expectedResponse = 'Hello, Alice!';
    
    mockBackend.greet.mockResolvedValue(expectedResponse);
    
    const result = await backendService.greet(name);
    
    expect(mockBackend.greet).toHaveBeenCalledWith(name);
    expect(result).toBe(expectedResponse);
  });

  test('getCount should call backend get_count method', async () => {
    const expectedCount = BigInt(42);
    
    mockBackend.get_count.mockResolvedValue(expectedCount);
    
    const result = await backendService.getCount();
    
    expect(mockBackend.get_count).toHaveBeenCalled();
    expect(result).toBe(expectedCount);
  });

  test('incrementCounter should call backend increment method', async () => {
    const expectedCount = BigInt(43);
    
    mockBackend.increment.mockResolvedValue(expectedCount);
    
    const result = await backendService.incrementCounter();
    
    expect(mockBackend.increment).toHaveBeenCalled();
    expect(result).toBe(expectedCount);
  });

  test('sendLlmPrompt should call backend prompt method', async () => {
    const prompt = 'Hello, AI!';
    const expectedResponse = 'Hello, human!';
    
    mockBackend.prompt.mockResolvedValue(expectedResponse);
    
    const result = await backendService.sendLlmPrompt(prompt);
    
    expect(mockBackend.prompt).toHaveBeenCalledWith(prompt);
    expect(result).toBe(expectedResponse);
  });

  test('uploadPrivateData should upload data and return a data ID', async () => {
    const data = [1, 2, 3];
    const schema = 'test-schema';
    const expectedDataId = 'data123';
    
    mockBackend.upload_private_data.mockResolvedValue(expectedDataId);
    
    const result = await backendService.uploadPrivateData(data, schema);
    
    expect(mockBackend.upload_private_data).toHaveBeenCalledWith(data, schema);
    expect(result).toBe(expectedDataId);
  });

  test('deployMpcAgents should deploy agents and return a team ID', async () => {
    const agentIds = ['agent1', 'agent2'];
    const dataSourceIds = ['data1', 'data2'];
    const expectedTeamId = 'team123';
    
    mockBackend.deploy_mpc_agents.mockResolvedValue(expectedTeamId);
    
    const result = await backendService.deployMpcAgents(agentIds, dataSourceIds);
    
    expect(mockBackend.deploy_mpc_agents).toHaveBeenCalledWith(agentIds, dataSourceIds);
    expect(result).toBe(expectedTeamId);
  });

  test('getAvailableAgents should return a list of agents', async () => {
    const mockAgents = [
      { 
        id: '1', 
        name: 'Agent 1',
        description: 'Test agent 1',
        computation_type: 'privacy',
        price_per_computation: BigInt(100),
        reputation_score: 4.5
      },
      { 
        id: '2', 
        name: 'Agent 2',
        description: 'Test agent 2',
        computation_type: 'mpc',
        price_per_computation: BigInt(150),
        reputation_score: 4.8
      }
    ];
    
    mockBackend.get_available_agents.mockResolvedValue(mockAgents);
    
    const result = await backendService.getAvailableAgents();
    expect(result).toEqual(mockAgents);
    expect(mockBackend.get_available_agents).toHaveBeenCalled();
  });

  test('executePrivateComputation should run a computation and return results', async () => {
    const teamId = 'team123';
    const query = 'analyze data';
    const mockResult = {
      insights: 'Data analysis complete',
      privacy_proof: 'proof123',
      timestamp: BigInt(1625097600000)
    };
    
    mockBackend.execute_private_computation.mockResolvedValue(mockResult);
    
    const result = await backendService.executePrivateComputation(teamId, query);
    
    expect(mockBackend.execute_private_computation).toHaveBeenCalledWith(teamId, query);
    expect(result).toEqual(mockResult);
  });

  test('getDataSourcesForUser should return data sources', async () => {
    const mockDataSources = [
      { 
        id: '1', 
        name: 'Data Source 1',
        owner: 'user1',
        schema_hash: 'hash1',
        access_permissions: ['read', 'write']
      },
      { 
        id: '2', 
        name: 'Data Source 2',
        owner: 'user2',
        schema_hash: 'hash2',
        access_permissions: ['read']
      }
    ];
    
    mockBackend.get_data_sources_for_user.mockResolvedValue(mockDataSources);
    
    const result = await backendService.getDataSourcesForUser();
    expect(result).toEqual(mockDataSources);
    expect(mockBackend.get_data_sources_for_user).toHaveBeenCalled();
  });

  test('generatePrivacyProof should generate and return a proof', async () => {
    const computationId = 'comp123';
    const expectedProof = 'proof123';
    
    mockBackend.generate_privacy_proof.mockResolvedValue(expectedProof);
    
    const result = await backendService.generatePrivacyProof(computationId);
    
    expect(mockBackend.generate_privacy_proof).toHaveBeenCalledWith(computationId);
    expect(result).toBe(expectedProof);
  });
});
