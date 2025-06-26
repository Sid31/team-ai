import { backend } from "../../../declarations/backend";

/**
 * Service for handling all backend canister API calls
 */
export const backendService = {
  /**
   * Sends a greeting to the backend and returns the response
   * @param name Name to greet
   * @returns Promise with the greeting response
   */
  async greet(name: string): Promise<string> {
    return await backend.greet(name || "World");
  },

  /**
   * Fetches the current counter value
   * @returns Promise with the current count
   */
  async getCount(): Promise<bigint> {
    return await backend.get_count();
  },

  /**
   * Increments the counter on the backend
   * @returns Promise with the new count
   */
  async incrementCounter(): Promise<bigint> {
    return await backend.increment();
  },

  /**
   * Sends a prompt to the LLM backend
   * @param prompt The user's prompt text
   * @returns Promise with the LLM response
   */
  async sendLlmPrompt(prompt: string): Promise<string> {
    return await backend.prompt(prompt);
  },

  // SecureCollab specific functions

  /**
   * Upload private data to be encrypted
   * @param data The data to encrypt and upload
   * @param schema The schema of the data
   * @returns Promise with the data source ID
   */
  async uploadPrivateData(data: number[], schema: string): Promise<string> {
    return await backend.upload_private_data(data, schema);
  },

  /**
   * Deploy a team of MPC agents
   * @param agentIds The IDs of the agents to deploy
   * @param dataSourceIds The IDs of the data sources to use
   * @returns Promise with the team ID
   */
  async deployMpcAgents(agentIds: string[], dataSourceIds: string[]): Promise<string> {
    return await backend.deploy_mpc_agents(agentIds, dataSourceIds);
  },

  /**
   * Get all available agents
   * @returns Promise with the list of available agents
   */
  async getAvailableAgents(): Promise<any[]> {
    return await backend.get_available_agents();
  },

  /**
   * Execute a private computation on encrypted data
   * @param teamId The ID of the agent team
   * @param computationRequest The computation request
   * @returns Promise with the computation result
   */
  async executePrivateComputation(teamId: string, computationRequest: string): Promise<any> {
    return await backend.execute_private_computation(teamId, computationRequest);
  },

  /**
   * Get all data sources for the current user
   * @returns Promise with the list of data sources
   */
  async getDataSourcesForUser(): Promise<any[]> {
    return await backend.get_data_sources_for_user();
  },

  /**
   * Generate a privacy proof for a computation
   * @param computationId The ID of the computation
   * @returns Promise with the proof verification hash
   */
  async generatePrivacyProof(computationId: string): Promise<string> {
    return await backend.generate_privacy_proof(computationId);
  },
};
