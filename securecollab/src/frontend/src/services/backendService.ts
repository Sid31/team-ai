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
    const result = await backend.upload_private_data(data, schema);
    return 'Ok' in result ? result.Ok : result.Err || 'Error occurred';
  },

  /**
   * Deploy a team of MPC agents
   * @param agentIds The IDs of the agents to deploy
   * @param dataSourceIds The IDs of the data sources to use
   * @returns Promise with the team ID
   */
  async deployMpcAgents(agentIds: string[], dataSourceIds: string[]): Promise<string> {
    const result = await backend.deploy_mpc_agents(agentIds, dataSourceIds);
    return 'Ok' in result ? result.Ok : result.Err || 'Error occurred';
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
    const result = await backend.generate_privacy_proof(computationId);
    return 'Ok' in result ? result.Ok : result.Err || 'Error occurred';
  },

  // Identity Management Functions
  
  /**
   * Register user identity with permissions
   * @param permissions List of permissions for the user
   * @returns Promise with user identity
   */
  async registerUserIdentity(permissions: string[]): Promise<any> {
    const result = await backend.register_user_identity(permissions);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to register identity');
  },

  /**
   * Get current user identity
   * @returns Promise with user identity
   */
  async getUserIdentity(): Promise<any> {
    const result = await backend.get_user_identity();
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to get identity');
  },

  /**
   * Derive vetKD key for specific purpose
   * @param purpose Purpose of the key
   * @param derivationPath Derivation path as byte array
   * @returns Promise with derived key
   */
  async deriveUserVetkdKey(purpose: string, derivationPath: number[]): Promise<any> {
    const result = await backend.derive_user_vetkd_key(purpose, derivationPath);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to derive key');
  },

  /**
   * Create multi-party signature requirement
   * @param dataHash Hash of data to be signed
   * @param requiredSigners List of required signers
   * @param threshold Minimum number of signatures needed
   * @returns Promise with signature ID
   */
  async createMultiPartySignature(dataHash: string, requiredSigners: string[], threshold: number): Promise<string> {
    const result = await backend.create_multi_party_signature(dataHash, requiredSigners, threshold);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to create signature requirement');
  },

  /**
   * Add user signature to multi-party signature
   * @param signatureId ID of the signature requirement
   * @param signature User's signature
   * @returns Promise with success status
   */
  async addUserSignature(signatureId: string, signature: string): Promise<boolean> {
    const result = await backend.add_user_signature(signatureId, signature);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to add signature');
  },

  /**
   * Verify if all required signatures are complete
   * @param signatureId ID of the signature requirement
   * @returns Promise with completion status
   */
  async verifySignaturesComplete(signatureId: string): Promise<boolean> {
    const result = await backend.verify_signatures_complete(signatureId);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to verify signatures');
  },

  /**
   * Get signature status
   * @param signatureId ID of the signature requirement
   * @returns Promise with signature status
   */
  async getSignatureStatus(signatureId: string): Promise<any> {
    const result = await backend.get_signature_status(signatureId);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to get signature status');
  },

  // Secure LLM Computation Functions

  /**
   * Create secure computation request
   * @param encryptedDataIds List of encrypted data IDs
   * @param computationType Type of computation
   * @param prompt Computation prompt
   * @param requiredSigners List of required signers
   * @returns Promise with computation request
   */
  async createSecureComputation(encryptedDataIds: string[], computationType: string, prompt: string, requiredSigners: string[]): Promise<any> {
    const result = await backend.create_secure_computation(encryptedDataIds, computationType, prompt, requiredSigners);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to create secure computation');
  },

  /**
   * Execute secure LLM computation
   * @param request Secure computation request
   * @returns Promise with computation result
   */
  async executeSecureLlmComputation(request: any): Promise<any> {
    const result = await backend.execute_secure_llm_computation(request);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to execute secure computation');
  },

  /**
   * Verify computation result
   * @param result Computation result to verify
   * @returns Promise with verification status
   */
  async verifyComputationResult(result: any): Promise<boolean> {
    const verifyResult = await backend.verify_computation_result(result);
    if ('Ok' in verifyResult) return verifyResult.Ok;
    throw new Error(verifyResult.Err || 'Failed to verify computation result');
  },

  // Enhanced Data Encryption Functions

  /**
   * Encrypt data using vetKD
   * @param data Data to encrypt as byte array
   * @param purpose Purpose of encryption
   * @returns Promise with encrypted data
   */
  async encryptDataWithVetkd(data: number[], purpose: string): Promise<number[]> {
    const result = await backend.encrypt_data_with_vetkd(data, purpose);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to encrypt data');
  },

  /**
   * Decrypt data using vetKD
   * @param encryptedData Encrypted data as byte array
   * @param purpose Purpose of decryption
   * @returns Promise with decrypted data
   */
  async decryptDataWithVetkd(encryptedData: number[], purpose: string): Promise<number[]> {
    const result = await backend.decrypt_data_with_vetkd(encryptedData, purpose);
    if ('Ok' in result) return result.Ok;
    throw new Error(result.Err || 'Failed to decrypt data');
  },
};
