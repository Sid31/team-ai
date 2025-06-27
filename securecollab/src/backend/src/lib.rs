use candid::CandidType;
use ic_cdk::export_candid;
use ic_llm::{ChatMessage, Model};
use ic_cdk::api::management_canister::main::raw_rand;
use std::cell::RefCell;
use std::collections::HashMap;

// Import our new modules
mod mpc_engine;
mod vetkey_manager;
mod agent_registry;
mod privacy_proofs;

// Disable test modules for now
// #[cfg(test)]
// mod vetkey_manager_test;
// #[cfg(test)]
// mod mpc_engine_test;
// #[cfg(test)]
// mod agent_registry_test;
// #[cfg(test)]
// mod privacy_proofs_test;

// Define data structures for SecureCollab
#[derive(CandidType, candid::Deserialize, Clone, Debug)]
pub struct PrivateDataSource {
    pub id: String,
    pub owner: String,
    pub encrypted_data: vetkey_manager::EncryptedData,
    pub schema_hash: String,
    pub access_permissions: Vec<String>,
    pub created_at: u64,
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

// Store private data sources
thread_local! {
    static DATA_SOURCES: RefCell<Vec<PrivateDataSource>> = RefCell::new(Vec::new());
}

// Generate a simple ID for data sources
fn generate_id() -> String {
    let timestamp = ic_cdk::api::time();
    format!("data_{}", timestamp)
}

// Hash a string (for schema hashing)
fn hash_string(input: &str) -> String {
    // Simple hash for demo purposes
    format!("0x{:x}", ic_cdk::api::call::arg_data_raw_size() + input.len())
}

// Store a data source
fn store_data_source(data_source: PrivateDataSource) {
    DATA_SOURCES.with(|sources| {
        sources.borrow_mut().push(data_source);
    });
}

#[ic_cdk::update]
async fn prompt(prompt_str: String) -> String {
    ic_llm::prompt(Model::Llama3_1_8B, prompt_str).await
}

#[ic_cdk::update]
async fn chat(messages: Vec<ChatMessage>) -> String {
    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(messages)
        .send()
        .await;

    // A response can contain tool calls, but we're not calling tools in this project,
    // so we can return the response message directly.
    response.message.content.unwrap_or_default()
}

thread_local! {
    static COUNTER: RefCell<u64> = const { RefCell::new(0) };
}

#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[ic_cdk::update]
fn increment() -> u64 {
    COUNTER.with(|counter| {x
        let val = *counter.borrow() + 1;
        *counter.borrow_mut() = val;
        val
    })
}

#[ic_cdk::query]
fn get_count() -> u64 {
    COUNTER.with(|counter| *counter.borrow())
}

#[ic_cdk::update]
fn set_count(value: u64) -> u64 {
    COUNTER.with(|counter| {
        *counter.borrow_mut() = value;
        value
    })
}

// New MPC functions for SecureCollab

// Initialize the agent registry with demo agents
#[ic_cdk::init]
fn init() {
    agent_registry::init();
}

#[ic_cdk::update]
pub async fn upload_private_data(
    data: Vec<u8>,
    schema: String
) -> Result<String, String> {
    // Create a dummy derived key for now
    let dummy_key = vetkey_manager::DerivedKey {
        identity: ic_cdk::caller().to_string(),
        key_bytes: vec![0u8; 32], // dummy key
        verification_hash: "dummy_hash".to_string(),
    };
    
    // Encrypt data using vetKD
    let encrypted = vetkey_manager::encrypt_data(&data, &dummy_key);
    
    let data_source = PrivateDataSource {
        id: generate_id(),
        owner: ic_cdk::caller().to_string(),
        encrypted_data: encrypted,
        schema_hash: hash_string(&schema),
        access_permissions: vec![],
        created_at: ic_cdk::api::time(),
    };
    
    store_data_source(data_source.clone());
    Ok(data_source.id)
}

#[ic_cdk::update]
async fn deploy_mpc_agents(
    agent_ids: Vec<String>,
    data_source_ids: Vec<String>
) -> Result<String, String> {
    // Create secure agent team using vetKD identities
    let team_id = mpc_engine::create_agent_team(agent_ids, data_source_ids).await?;
    Ok(team_id)
}

#[ic_cdk::query]
fn get_available_agents() -> Vec<MPCAgent> {
    agent_registry::list_all_agents()
}

#[ic_cdk::update]
async fn execute_private_computation(
    team_id: String,
    computation_request: String
) -> Result<ComputationResult, String> {
    mpc_engine::run_secure_computation(team_id, computation_request).await
}

#[ic_cdk::query]
fn get_data_sources_for_user() -> Vec<PrivateDataSource> {
    let caller = ic_cdk::caller().to_string();
    DATA_SOURCES.with(|sources| {
        sources.borrow().iter()
            .filter(|source| source.owner == caller)
            .cloned()
            .collect()
    })
}

#[ic_cdk::update]
async fn generate_privacy_proof(
    computation_id: String
) -> Result<String, String> {
    let proof = privacy_proofs::generate_proof(computation_id, "zk-SNARK".to_string());
    Ok(proof.verification_hash)
}

#[ic_cdk::update]
async fn execute_secure_mpc_computation(
    team_id: String,
    computation_request: String,
    data_sources: Vec<String>
) -> Result<ComputationResult, String> {
    // Get the agent team
    let team = mpc_engine::get_team_info(team_id)?;
    
    // Execute secure multi-party computation
    mpc_engine::execute_secure_mpc_computation(&team, &computation_request, &data_sources).await
}

#[ic_cdk::update]
async fn derive_agent_encryption_key(agent_id: String) -> Result<Vec<u8>, String> {
    vetkey_manager::derive_encryption_key(&agent_id).await
}

#[ic_cdk::update]
async fn secure_agent_communication(
    sender_id: String,
    recipient_id: String,
    message: Vec<u8>
) -> Result<Vec<u8>, String> {
    vetkey_manager::secure_agent_message(&sender_id, &recipient_id, &message).await
}

export_candid!();
