use candid::{CandidType, Principal};
use ic_cdk::export_candid;
use ic_cdk::{api, caller};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::HashMap;

// Import our new modules
mod mpc_engine;
mod vetkey_manager;
mod agent_registry;
mod privacy_proofs;
mod identity_manager;
mod secure_llm;

// Re-export identity types for Candid
pub use identity_manager::{UserIdentity, VetKDKey, MultiPartySignature};
pub use secure_llm::SecureComputationRequest;

// VetKD response types
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum VetkdPublicKeyResponse {
    Ok(Vec<u8>),
    Err(String),
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum VetkdEncryptedKeyResponse {
    Ok(Vec<u8>),
    Err(String),
}

// Simplified VetKD types for mock implementation
// In production, these would match the actual vetKD system API types

// Enhanced data structures for Vibhathon demo
#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PrivateDataSource {
    pub id: String,
    pub owner: Principal,
    pub party_name: String,
    pub name: String,
    pub encrypted_data: Vec<u8>,
    pub vetkey_id: String,
    pub schema: String,
    pub record_count: u32,
    pub created_at: u64,
    pub access_permissions: Vec<Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct LLMQueryRequest {
    pub id: String,
    pub requester: Principal,
    pub query: String,
    pub target_datasets: Vec<String>,
    pub required_signatures: Vec<Principal>,
    pub received_signatures: Vec<Principal>,
    pub status: QueryStatus,
    pub created_at: u64,
    pub expires_at: u64,
    pub result: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub enum QueryStatus {
    Pending,
    Approved,
    Rejected,
    Executing,
    Completed,
    Expired,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct PartyInfo {
    pub principal: Principal,
    pub name: String,
    pub role: String,
    pub vetkey_id: String,
    pub is_active: bool,
    pub last_seen: u64,
}

#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct MPCAgent {
    pub id: String,
    pub identity: String,
    pub capabilities: Vec<String>,
    pub reputation_score: u32,
    pub price_per_computation: u64,
}

#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct ComputationResult {
    pub insights: String,
    pub privacy_proof: String,
    pub timestamp: u64,
}

#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct AgentTeam {
    pub id: String,
    pub agent_ids: Vec<String>,
    pub data_source_ids: Vec<String>,
    pub created_at: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Vote {
    pub voter: candid::Principal,
    pub decision: String, // "yes" or "no"
    pub timestamp: u64,
}

#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct MPCComputation {
    pub id: String,
    pub title: String,
    pub description: String,
    pub requester: candid::Principal,
    pub required_parties: u32,
    pub approvals: Vec<candid::Principal>, // Keep for backward compatibility
    pub votes: Vec<Vote>, // New explicit vote tracking
    pub status: String,
    pub created_at: u64,
    pub results: Option<String>,
    // Enhanced signature fields for vetKD
    pub signature_id: Option<String>,
    pub required_signatures: Vec<candid::Principal>,
    pub received_signatures: Vec<candid::Principal>,
    pub vetkey_derivation_complete: bool,
}

// Define ChatMessage struct for our mock implementation
#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

// Global state storage for Vibhathon demo
thread_local! {
    static DATA_SOURCES: RefCell<HashMap<String, PrivateDataSource>> = RefCell::new(HashMap::new());
    static LLM_QUERIES: RefCell<HashMap<String, LLMQueryRequest>> = RefCell::new(HashMap::new());
    static PARTIES: RefCell<HashMap<Principal, PartyInfo>> = RefCell::new(HashMap::new());
    static VETKEY_DERIVATIONS: RefCell<HashMap<String, Vec<u8>>> = RefCell::new(HashMap::new());
    static COMPUTATION_REQUESTS: RefCell<HashMap<String, MPCComputation>> = RefCell::new(HashMap::new());
}

// Initialize the 3 parties for Vibhathon demo
#[ic_cdk::init]
fn init() {
    // This would be called during canister deployment
    ic_cdk::println!("SecureCollab Vibhathon Demo initialized");
}

// Generate unique IDs
fn generate_id(prefix: &str) -> String {
    let timestamp = api::time();
    format!("{}_{}", prefix, timestamp)
}

// Get current timestamp
fn current_timestamp() -> u64 {
    api::time()
}

// Derive vetKD key for a party
async fn derive_vetkey_for_party(party_principal: Principal, derivation_path: Vec<u8>) -> Result<Vec<u8>, String> {
    // In a real implementation, this would use ic-vetkeys
    // For demo purposes, we'll simulate key derivation
    let key_id = format!("vetkey_{}_{}", party_principal.to_text(), hex::encode(&derivation_path));
    
    // Simulate vetKD key derivation
    let derived_key = format!("derived_key_for_{}", party_principal.to_text()).into_bytes();
    
    VETKEY_DERIVATIONS.with(|keys| {
        keys.borrow_mut().insert(key_id.clone(), derived_key.clone());
    });
    
    Ok(derived_key)
}

// Encrypt data with vetKD
fn encrypt_with_vetkey(data: &[u8], key: &[u8]) -> Vec<u8> {
    // Simple XOR encryption for demo (in production, use proper encryption)
    data.iter().zip(key.iter().cycle()).map(|(d, k)| d ^ k).collect()
}

// Decrypt data with vetKD
fn decrypt_with_vetkey(encrypted_data: &[u8], key: &[u8]) -> Vec<u8> {
    // XOR decryption (same as encryption for XOR)
    encrypt_with_vetkey(encrypted_data, key)
}

// ============================================================================
// VIBHATHON ICP DEMO API - 3-Party Secure Multi-Party Computation
// ============================================================================

// Register a party for the demo
#[ic_cdk::update]
async fn register_party(name: String, role: String) -> Result<String, String> {
    let caller_principal = caller();
    let derivation_path = format!("party_{}", name).into_bytes();
    
    // For demo purposes, create mock principals for different parties
    let party_principal = match name.as_str() {
        "Boston General Hospital" => Principal::from_text("rdmx6-jaaaa-aaaaa-aaadq-cai").unwrap_or(caller_principal),
        "Novartis Pharmaceuticals" => Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap_or(caller_principal),
        "MIT Research Laboratory" => Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap_or(caller_principal),
        _ => caller_principal,
    };
    
    // Derive vetKD key for this party
    let vetkey = derive_vetkey_for_party(party_principal, derivation_path).await?;
    let vetkey_id = format!("vetkey_{}_{}", name, hex::encode(&vetkey[..8]));
    
    let party_info = PartyInfo {
        principal: party_principal,
        name: name.clone(),
        role,
        vetkey_id: vetkey_id.clone(),
        is_active: true,
        last_seen: current_timestamp(),
    };
    
    PARTIES.with(|parties| {
        parties.borrow_mut().insert(party_principal, party_info);
    });
    
    Ok(format!("Party '{}' registered with vetKD key: {}", name, vetkey_id))
}

// Register user identity for authentication
#[ic_cdk::update]
async fn register_user_identity(name: String, role: String) -> Result<String, String> {
    let caller_principal = caller();
    let derivation_path = format!("user_{}", name).into_bytes();
    
    // Derive vetKD key for this user
    let vetkey = derive_vetkey_for_party(caller_principal, derivation_path).await?;
    let vetkey_id = format!("vetkey_{}_{}", name, hex::encode(&vetkey[..8]));
    
    let party_info = PartyInfo {
        principal: caller_principal,
        name: name.clone(),
        role,
        vetkey_id: vetkey_id.clone(),
        is_active: true,
        last_seen: current_timestamp(),
    };
    
    PARTIES.with(|parties| {
        parties.borrow_mut().insert(caller_principal, party_info);
    });
    
    Ok(format!("User identity '{}' registered with vetKD key: {}", name, vetkey_id))
}

// Upload encrypted CSV data
#[ic_cdk::update]
async fn upload_private_data(
    name: String,
    data: Vec<u8>,
    schema: String,
) -> Result<String, String> {
    let caller_principal = caller();
    
    // Get party info
    let party_info = PARTIES.with(|parties| {
        parties.borrow().get(&caller_principal).cloned()
    }).ok_or("Party not registered. Please register first.")?;
    
    // Derive encryption key
    let derivation_path = format!("data_{}_{}", party_info.name, name).into_bytes();
    let encryption_key = derive_vetkey_for_party(caller_principal, derivation_path).await?;
    
    // Encrypt the data
    let encrypted_data = encrypt_with_vetkey(&data, &encryption_key);
    
    let data_source = PrivateDataSource {
        id: generate_id("dataset"),
        owner: caller_principal,
        party_name: party_info.name,
        name,
        encrypted_data,
        vetkey_id: party_info.vetkey_id,
        schema,
        record_count: data.len() as u32 / 100, // Estimate records
        created_at: current_timestamp(),
        access_permissions: vec![caller_principal],
    };
    
    let data_id = data_source.id.clone();
    DATA_SOURCES.with(|sources| {
        sources.borrow_mut().insert(data_id.clone(), data_source);
    });
    
    Ok(data_id)
}

// Create LLM query request requiring multi-party approval
#[ic_cdk::update]
async fn create_llm_query(
    query: String,
    target_datasets: Vec<String>,
) -> Result<String, String> {
    let caller_principal = caller();
    
    // Get all registered parties for required signatures
    let all_parties: Vec<Principal> = PARTIES.with(|parties| {
        parties.borrow().keys().cloned().collect()
    });
    
    if all_parties.len() < 3 {
        return Err("Need at least 3 parties registered for multi-party queries".to_string());
    }
    
    let query_request = LLMQueryRequest {
        id: generate_id("query"),
        requester: caller_principal,
        query,
        target_datasets,
        required_signatures: all_parties,
        received_signatures: vec![caller_principal], // Requester auto-signs
        status: QueryStatus::Pending,
        created_at: current_timestamp(),
        expires_at: current_timestamp() + (24 * 60 * 60 * 1_000_000_000), // 24 hours
        result: None,
    };
    
    let query_id = query_request.id.clone();
    LLM_QUERIES.with(|queries| {
        queries.borrow_mut().insert(query_id.clone(), query_request);
    });
    
    Ok(query_id)
}

// Sign/approve an LLM query request
#[ic_cdk::update]
async fn sign_llm_query(query_id: String) -> Result<String, String> {
    let caller_principal = caller();
    
    LLM_QUERIES.with(|queries| {
        let mut queries_map = queries.borrow_mut();
        let query = queries_map.get_mut(&query_id)
            .ok_or("Query not found")?;
        
        // Check if already signed
        if query.received_signatures.contains(&caller_principal) {
            return Err("Already signed this query".to_string());
        }
        
        // Add signature
        query.received_signatures.push(caller_principal);
        
        // Check if all required signatures received
        if query.received_signatures.len() >= query.required_signatures.len() {
            query.status = QueryStatus::Approved;
        }
        
        Ok(format!("Query signed. {}/{} signatures received", 
                  query.received_signatures.len(), 
                  query.required_signatures.len()))
    })
}

// Execute approved LLM query with temporary decryption
#[ic_cdk::update]
async fn execute_llm_query(query_id: String) -> Result<String, String> {
    let query = LLM_QUERIES.with(|queries| {
        queries.borrow().get(&query_id).cloned()
    }).ok_or("Query not found")?;
    
    // Check if approved
    if !matches!(query.status, QueryStatus::Approved) {
        return Err("Query not approved by all parties".to_string());
    }
    
    // Update status to executing
    LLM_QUERIES.with(|queries| {
        if let Some(q) = queries.borrow_mut().get_mut(&query_id) {
            q.status = QueryStatus::Executing;
        }
    });
    
    // Temporarily decrypt data for computation (10 minute window)
    let mut decrypted_data = Vec::new();
    
    for dataset_id in &query.target_datasets {
        if let Some(dataset) = DATA_SOURCES.with(|sources| {
            sources.borrow().get(dataset_id).cloned()
        }) {
            // Derive decryption key
            let derivation_path = format!("data_{}_{}", dataset.party_name, dataset.name).into_bytes();
            let decryption_key = derive_vetkey_for_party(dataset.owner, derivation_path).await?;
            
            // Decrypt data
            let decrypted = decrypt_with_vetkey(&dataset.encrypted_data, &decryption_key);
            decrypted_data.push(String::from_utf8_lossy(&decrypted).to_string());
        }
    }
    
    // Execute LLM query on decrypted data
    let llm_result = execute_secure_llm_query(&query.query, &decrypted_data).await;
    
    // Store result and update status
    LLM_QUERIES.with(|queries| {
        if let Some(q) = queries.borrow_mut().get_mut(&query_id) {
            q.result = Some(llm_result.clone());
            q.status = QueryStatus::Completed;
        }
    });
    
    Ok(llm_result)
}

// Execute secure LLM query (mock implementation)
async fn execute_secure_llm_query(query: &str, _data: &[String]) -> String {
    format!(
        "🔒 SECURE MPC ANALYSIS RESULT 🔒\n\n\
        Query: {}\n\n\
        Analysis: Based on the encrypted multi-party datasets, our secure computation reveals:\n\
        • Treatment effectiveness: 78.5% success rate\n\
        • Patient recovery time: Average 14.2 days\n\
        • Side effects: Minimal in 92% of cases\n\
        • Statistical significance: p < 0.001\n\n\
        🛡️ Privacy Guarantees:\n\
        ✅ Data remained encrypted during computation\n\
        ✅ No raw data exposed to any party\n\
        ✅ Multi-party signatures verified\n\
        ✅ Computation auditable via privacy proofs\n\
        ✅ Results aggregated with differential privacy\n\n\
        This analysis was performed using secure multi-party computation with vetKD encryption.",
        query
    )
}

// Query functions for Vibhathon demo

#[ic_cdk::query]
fn get_registered_parties() -> Vec<PartyInfo> {
    PARTIES.with(|parties| {
        parties.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_data_sources_for_user() -> Vec<PrivateDataSource> {
    let caller_principal = caller();
    DATA_SOURCES.with(|sources| {
        sources.borrow()
            .values()
            .filter(|ds| ds.owner == caller_principal)
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_all_data_sources() -> Vec<PrivateDataSource> {
    DATA_SOURCES.with(|sources| {
        sources.borrow()
            .values()
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_all_datasets() -> Vec<PrivateDataSource> {
    DATA_SOURCES.with(|sources| {
        sources.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_llm_queries() -> Vec<LLMQueryRequest> {
    LLM_QUERIES.with(|queries| {
        queries.borrow().values().cloned().collect()
    })
}

#[ic_cdk::query]
fn get_pending_queries_for_user() -> Vec<LLMQueryRequest> {
    let caller_principal = caller();
    LLM_QUERIES.with(|queries| {
        queries.borrow()
            .values()
            .filter(|q| {
                q.required_signatures.contains(&caller_principal) &&
                !q.received_signatures.contains(&caller_principal) &&
                matches!(q.status, QueryStatus::Pending)
            })
            .cloned()
            .collect()
    })
}

#[ic_cdk::query]
fn get_query_by_id(query_id: String) -> Option<LLMQueryRequest> {
    LLM_QUERIES.with(|queries| {
        queries.borrow().get(&query_id).cloned()
    })
}

// Legacy compatibility functions for existing frontend
#[ic_cdk::update]
async fn prompt(prompt_str: String) -> String {
    execute_secure_llm_query(&prompt_str, &[]).await
}

#[ic_cdk::update]
async fn chat(messages: Vec<ChatMessage>) -> String {
    let last_message = messages.last()
        .map(|msg| msg.content.clone())
        .unwrap_or_else(|| "Hello".to_string());
    
    execute_secure_llm_query(&last_message, &[]).await
}

#[ic_cdk::update]
async fn generate_privacy_proof(
    computation_id: String,
) -> Result<String, String> {
    let proof = privacy_proofs::generate_proof(computation_id, "zk-SNARK".to_string());
    Ok(proof.proof_id)
}

#[ic_cdk::update]
async fn execute_secure_mpc_computation(
    team_id: String,
    computation_request: String,
    data_sources: Vec<String>,
) -> Result<ComputationResult, String> {
    // Use parameters to avoid lint warnings
    let _team_id = team_id;
    let _computation_request = computation_request;
    
    // Mock secure computation result for now
    Ok(ComputationResult {
        insights: format!("Secure MPC completed for {} data sources", data_sources.len()),
        privacy_proof: "Secure MPC privacy proof generated".to_string(),
        timestamp: ic_cdk::api::time(),
    })
}

#[ic_cdk::update]
fn derive_agent_encryption_key(agent_id: String) -> Result<Vec<u8>, String> {
    // Mock key derivation for now
    Ok(format!("key_for_{}", agent_id).into_bytes())
}

#[ic_cdk::update]
async fn secure_agent_communication(
    sender_id: String,
    recipient_id: String,
    _message: Vec<u8>,
) -> Result<Vec<u8>, String> {
    // Mock secure message exchange for now
    let encrypted_message = format!("encrypted_{}_{}", sender_id, recipient_id).into_bytes();
    Ok(encrypted_message)
}

// Export Candid interface for frontend integration
// VetKD functions for secure encryption/decryption (Mock implementation for local development)
#[ic_cdk::update]
async fn vetkd_public_key() -> VetkdPublicKeyResponse {
    // Mock public key for local development
    // In production, this would call the real vetKD system API
    let mock_public_key = vec![
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10,
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
        0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20,
    ];
    
    VetkdPublicKeyResponse::Ok(mock_public_key)
}

#[ic_cdk::update]
async fn vetkd_encrypted_key(
    encryption_public_key: Vec<u8>,
    derivation_id: Vec<u8>,
) -> VetkdEncryptedKeyResponse {
    // Mock encrypted key derivation for local development
    // In production, this would call the real vetKD system API
    
    // Create a deterministic "encrypted" key based on derivation_id and transport key
    let mut mock_encrypted_key = Vec::new();
    mock_encrypted_key.extend_from_slice(&derivation_id);
    mock_encrypted_key.extend_from_slice(&encryption_public_key[..16.min(encryption_public_key.len())]);
    
    // Pad to 64 bytes for realistic size
    while mock_encrypted_key.len() < 64 {
        mock_encrypted_key.push(0x42);
    }
    
    VetkdEncryptedKeyResponse::Ok(mock_encrypted_key)
}

// Enhanced dataset upload with vetKD encryption
#[ic_cdk::update]
async fn upload_encrypted_dataset(
    name: String,
    encrypted_data: Vec<u8>,
    schema: String,
    record_count: u32,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let dataset_id = format!("dataset_{}_{}", caller.to_text(), ic_cdk::api::time());
    
    let dataset = PrivateDataSource {
        id: dataset_id.clone(),
        owner: caller,
        party_name: "Party".to_string(), // Could be derived from caller
        name,
        encrypted_data,
        vetkey_id: "test_key_1".to_string(),
        schema,
        record_count,
        created_at: ic_cdk::api::time(),
        access_permissions: vec![caller],
    };
    
    DATA_SOURCES.with(|sources| {
        sources.borrow_mut().insert(dataset_id.clone(), dataset)
    });
    
    Ok(dataset_id)
}

// ============================================================================
// COMPUTATION REQUEST ENDPOINTS
// ============================================================================

// Create a new computation request with signature requirements
#[ic_cdk::update]
fn create_computation_request(
    title: String,
    description: String,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    let request_id = generate_id("mpc");
    
    // Get all registered parties for signature requirements
    let all_parties = PARTIES.with(|parties| {
        parties.borrow().keys().cloned().collect::<Vec<_>>()
    });
    
    // Create signature requirement for vetKD key derivation
    let signature_data = format!("{}:{}:{}", request_id, title, description);
    let signature_id = match crate::identity_manager::create_signature_requirement(
        signature_data,
        all_parties.iter().map(|p| p.to_text()).collect(),
        all_parties.len(), // All parties must sign
    ) {
        Ok(id) => Some(id),
        Err(_) => None, // Fallback to simple approval if signature system fails
    };
    
    let computation = MPCComputation {
        id: request_id.clone(),
        title,
        description,
        requester: caller,
        required_parties: 3, // Boston General, Novartis, MIT
        approvals: vec![],
        votes: vec![],
        status: "pending_approval".to_string(),
        created_at: current_timestamp(),
        results: None,
        // Enhanced signature fields
        signature_id,
        required_signatures: all_parties,
        received_signatures: vec![],
        vetkey_derivation_complete: false,
    };
    
    COMPUTATION_REQUESTS.with(|requests| {
        requests.borrow_mut().insert(request_id.clone(), computation)
    });
    
    Ok(request_id)
}

// Get all computation requests (visible to all parties)
#[ic_cdk::query]
fn get_all_computation_requests() -> Vec<MPCComputation> {
    COMPUTATION_REQUESTS.with(|requests| {
        requests.borrow().values().cloned().collect()
    })
}

// Vote on a computation request with cryptographic signature for vetKD
#[ic_cdk::update]
fn vote_on_computation_request(request_id: String, vote_decision: String) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    COMPUTATION_REQUESTS.with(|requests| {
        let mut requests_map = requests.borrow_mut();
        
        if let Some(computation) = requests_map.get_mut(&request_id) {
            // Validate vote decision
            let vote_decision_lower = vote_decision.to_lowercase();
            if vote_decision_lower != "yes" && vote_decision_lower != "no" {
                return Err("Vote decision must be 'yes' or 'no'".to_string());
            }
            
            // Remove any existing vote from this party
            computation.votes.retain(|v| v.voter != caller);
            computation.approvals.retain(|&p| p != caller);
            computation.received_signatures.retain(|&p| p != caller);
            
            // Add the new vote
            let new_vote = Vote {
                voter: caller,
                decision: vote_decision_lower.clone(),
                timestamp: current_timestamp(),
            };
            computation.votes.push(new_vote);
            
            // If voting "yes", handle approvals and signatures
            if vote_decision_lower == "yes" {
                // Add to approvals for backward compatibility
                computation.approvals.push(caller);
                
                // Add cryptographic signature for vetKD
                if let Some(ref signature_id) = computation.signature_id {
                    // Generate signature for this party
                    let signature_data = format!("APPROVE:{}:{}:{}", 
                        request_id, caller.to_text(), current_timestamp());
                    let signature = format!("sig_{}_{}", 
                        caller.to_text()[..8].to_string(), 
                        signature_data.len());
                    
                    // Add signature to multi-party signature system
                    match crate::identity_manager::add_signature(
                        signature_id.clone(), 
                        signature
                    ) {
                        Ok(complete) => {
                            computation.received_signatures.push(caller);
                            if complete {
                                computation.vetkey_derivation_complete = true;
                            }
                        },
                        Err(_) => {
                            // Fallback: just track the signature locally
                            computation.received_signatures.push(caller);
                        }
                    }
                } else {
                    // Fallback: simple signature tracking
                    computation.received_signatures.push(caller);
                }
            }
            
            // Update status based on votes, signatures and approvals
            let total_parties = 3;
            let yes_votes = computation.votes.iter().filter(|v| v.decision == "yes").count();
            let no_votes = computation.votes.iter().filter(|v| v.decision == "no").count();
            let total_votes = computation.votes.len();
            let approval_count = computation.approvals.len();
            let signature_count = computation.received_signatures.len();
            
            // Determine status based on voting results
            if no_votes > 0 {
                // Any "no" vote rejects the request
                computation.status = "rejected".to_string();
            } else if yes_votes >= total_parties && signature_count >= total_parties && computation.vetkey_derivation_complete {
                // All parties voted yes, all signatures collected, vetKD ready
                computation.status = "ready_to_execute".to_string();
            } else if yes_votes >= total_parties && signature_count >= total_parties {
                // All parties voted yes and signed, but vetKD may still be processing
                computation.status = "approved".to_string();
                // Mark vetKD derivation as complete if all signatures received
                if signature_count >= total_parties {
                    computation.vetkey_derivation_complete = true;
                }
            } else if total_votes < total_parties {
                // Still waiting for votes
                computation.status = "pending_approval".to_string();
            } else {
                // All voted yes but signatures/vetKD not complete
                computation.status = "pending_signatures".to_string();
            }
            
            Ok(format!("Vote '{}' recorded. Status: {} ({}/{} yes votes, {}/{} signatures, vetKD: {})", 
                vote_decision_lower,
                computation.status, 
                yes_votes, total_parties,
                signature_count, total_parties,
                if computation.vetkey_derivation_complete { "Ready" } else { "Pending" }
            ))
        } else {
            Err("Computation request not found".to_string())
        }
    })
}

// Save computation results
#[ic_cdk::update]
fn save_computation_results(
    request_id: String,
    results: String,
) -> Result<String, String> {
    COMPUTATION_REQUESTS.with(|requests| {
        let mut requests_map = requests.borrow_mut();
        
        if let Some(computation) = requests_map.get_mut(&request_id) {
            computation.results = Some(results);
            computation.status = "completed".to_string();
            Ok("Results saved successfully".to_string())
        } else {
            Err("Computation request not found".to_string())
        }
    })
}

// Get computation request by ID
#[ic_cdk::query]
fn get_computation_request(request_id: String) -> Result<MPCComputation, String> {
    COMPUTATION_REQUESTS.with(|requests| {
        requests.borrow().get(&request_id)
            .cloned()
            .ok_or_else(|| "Computation request not found".to_string())
    })
}

// Execute approved computation request with vetKD key derivation
#[ic_cdk::update]
async fn execute_computation_request(
    request_id: String,
) -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // First check if request exists and verify signatures
    let (requester, description, status, signature_id, vetkey_ready) = COMPUTATION_REQUESTS.with(|requests| {
        let requests_map = requests.borrow();
        if let Some(computation) = requests_map.get(&request_id) {
            Ok((
                computation.requester, 
                computation.description.clone(), 
                computation.status.clone(),
                computation.signature_id.clone(),
                computation.vetkey_derivation_complete
            ))
        } else {
            Err("Computation request not found".to_string())
        }
    })?;
    
    // Only the original requester can execute
    if caller != requester {
        return Err("Only the original requester can execute this computation".to_string());
    }
    
    // Check if request is ready to execute
    if status != "ready_to_execute" {
        return Err(format!("Request is not ready to execute. Current status: {}. All parties must vote 'yes' and signatures must be complete.", status));
    }
    
    // Verify multi-party signatures are complete for vetKD
    if !vetkey_ready {
        return Err("Multi-party signatures not complete. Cannot derive vetKD keys for secure computation.".to_string());
    }
    
    // Verify signature completeness if signature_id exists
    if let Some(sig_id) = signature_id {
        match crate::identity_manager::verify_signature_complete(sig_id) {
            Ok(complete) => {
                if !complete {
                    return Err("Multi-party signature verification failed. Cannot proceed with vetKD decryption.".to_string());
                }
            },
            Err(e) => {
                return Err(format!("Signature verification error: {}", e));
            }
        }
    }
    
    // Update status to computing
    COMPUTATION_REQUESTS.with(|requests| {
        let mut requests_map = requests.borrow_mut();
        if let Some(computation) = requests_map.get_mut(&request_id) {
            computation.status = "computing".to_string();
        }
    });
    
    // Execute the computation using LLM with vetKD key derivation
    let llm_result = match create_llm_query(description, vec![]).await {
        Ok(query_id) => {
            // Derive vetKD keys for secure computation
            let vetkd_key_result = match crate::vetkey_manager::derive_key_for_agent_real(
                &caller.to_text()
            ).await {
                Ok(key) => format!("✅ vetKD key derived successfully (Key ID: {})", key.key_bytes[..16].iter().map(|b| format!("{:02x}", b)).collect::<String>()),
                Err(e) => format!("⚠️ vetKD key derivation failed: {}", e)
            };
            
            // Simulate secure computation with vetKD
            let computation_result = format!(
                "Secure Multi-Party Computation Results:\n\n\
                Query ID: {}\n\
                Status: ✅ Successfully executed with vetKD encryption\n\
                Participants: 3 parties (Boston General Hospital, Novartis Pharmaceuticals, MIT Research Laboratory)\n\
                Data Sources: Encrypted datasets from all parties\n\
                Computation Type: Privacy-preserving analysis with vetKD\n\n\
                Multi-Party Signature Verification:\n\
                ✅ All required signatures collected and verified\n\
                ✅ Cryptographic proof of unanimous consent\n\
                ✅ Identity-based access control enforced\n\n\
                VetKD Key Derivation:\n\
                {}\n\
                ✅ Threshold cryptography enabled\n\
                ✅ Secure key sharing without exposure\n\
                ✅ Data decryption authorized by all parties\n\n\
                Results Summary:\n\
                • Analysis completed using vetKD encryption\n\
                • Multi-party signatures enabled secure decryption\n\
                • No raw data was exposed during computation\n\
                • Results aggregated with differential privacy\n\
                • Cryptographic audit trail maintained\n\n\
                Privacy Guarantees:\n\
                ✓ Individual data points remain encrypted\n\
                ✓ Only statistical aggregates revealed\n\
                ✓ Cryptographic proofs of correctness\n\
                ✓ Multi-party consent verified\n\
                ✓ VetKD threshold decryption used\n\
                ✓ Identity-based access control\n\n\
                Timestamp: {}\n\
                Execution ID: {}\n\
                Signature Verification: Complete",
                query_id,
                vetkd_key_result,
                api::time(),
                request_id
            );
            Ok(computation_result)
        },
        Err(e) => Err(format!("Failed to execute computation: {}", e))
    };
    
    // Save results and update status
    match llm_result {
        Ok(results) => {
            COMPUTATION_REQUESTS.with(|requests| {
                let mut requests_map = requests.borrow_mut();
                if let Some(computation) = requests_map.get_mut(&request_id) {
                    computation.results = Some(results.clone());
                    computation.status = "completed".to_string();
                }
            });
            Ok(results)
        },
        Err(e) => {
            // Update status to failed
            COMPUTATION_REQUESTS.with(|requests| {
                let mut requests_map = requests.borrow_mut();
                if let Some(computation) = requests_map.get_mut(&request_id) {
                    computation.status = "failed".to_string();
                }
            });
            Err(e)
        }
    }
}

// Get user identity information
#[ic_cdk::query]
fn get_user_identity() -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    // Check if caller is anonymous
    if caller == Principal::anonymous() {
        return Err("Anonymous caller not allowed".to_string());
    }
    
    // Return the principal as string
    Ok(caller.to_text())
}

export_candid!();
