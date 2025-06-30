use ic_cdk::api::{caller, time};
use candid::Principal;
use candid::{CandidType, Deserialize};
use std::collections::HashMap;
use sha2::{Sha256, Digest};

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UserIdentity {
    pub principal: Principal,
    pub vetkey_id: String,
    pub public_key: Vec<u8>,
    pub created_at: u64,
    pub last_active: u64,
    pub permissions: Vec<String>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct VetKDKey {
    pub key_id: String,
    pub owner: Principal,
    pub derived_key: Vec<u8>,
    pub key_derivation_path: Vec<u8>,
    pub created_at: u64,
    pub expires_at: Option<u64>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct MultiPartySignature {
    pub data_hash: String,
    pub signatures: HashMap<String, String>, // principal -> signature
    pub required_signers: Vec<String>,
    pub threshold: usize,
    pub created_at: u64,
}

thread_local! {
    static USER_IDENTITIES: std::cell::RefCell<HashMap<String, UserIdentity>> = 
        std::cell::RefCell::new(HashMap::new());
    
    static VETKD_KEYS: std::cell::RefCell<HashMap<String, VetKDKey>> = 
        std::cell::RefCell::new(HashMap::new());
    
    static MULTI_PARTY_SIGNATURES: std::cell::RefCell<HashMap<String, MultiPartySignature>> = 
        std::cell::RefCell::new(HashMap::new());
}

// Register a new user identity
pub fn register_identity(permissions: Vec<String>) -> Result<UserIdentity, String> {
    let principal = caller();
    let principal_text = principal.to_text();
    
    if principal == Principal::anonymous() {
        return Err("Anonymous users cannot register".to_string());
    }

    let now = time();
    
    // Generate vetKD key ID
    let vetkey_id = generate_vetkey_id(&principal);
    
    // Generate public key (simplified for demo)
    let public_key = generate_public_key(&principal);
    
    let identity = UserIdentity {
        principal,
        vetkey_id: vetkey_id.clone(),
        public_key,
        created_at: now,
        last_active: now,
        permissions,
    };

    USER_IDENTITIES.with(|identities| {
        identities.borrow_mut().insert(principal_text, identity.clone());
    });

    Ok(identity)
}

// Get user identity
pub fn get_identity() -> Result<UserIdentity, String> {
    let principal = caller();
    let principal_text = principal.to_text();
    
    USER_IDENTITIES.with(|identities| {
        identities.borrow().get(&principal_text)
            .cloned()
            .ok_or_else(|| "Identity not found. Please register first.".to_string())
    })
}

// Derive vetKD key for a specific purpose
pub fn derive_vetkd_key(purpose: String, derivation_path: Vec<u8>) -> Result<VetKDKey, String> {
    let principal = caller();
    let identity = get_identity()?;
    
    let key_id = format!("{}:{}:{}", principal.to_text(), purpose, hex::encode(&derivation_path));
    
    // Check if key already exists
    if let Some(existing_key) = VETKD_KEYS.with(|keys| keys.borrow().get(&key_id).cloned()) {
        return Ok(existing_key);
    }
    
    // Derive new key using vetKD simulation
    let derived_key = derive_key_from_vetkd(&identity.vetkey_id, &derivation_path)?;
    
    let vetkd_key = VetKDKey {
        key_id: key_id.clone(),
        owner: principal,
        derived_key,
        key_derivation_path: derivation_path,
        created_at: time(),
        expires_at: None, // Keys don't expire by default
    };

    VETKD_KEYS.with(|keys| {
        keys.borrow_mut().insert(key_id, vetkd_key.clone());
    });

    Ok(vetkd_key)
}

// Create multi-party signature requirement
pub fn create_signature_requirement(
    data_hash: String,
    required_signers: Vec<String>,
    threshold: usize,
) -> Result<String, String> {
    if threshold > required_signers.len() {
        return Err("Threshold cannot exceed number of required signers".to_string());
    }

    let signature_id = format!("sig_{}_{}", data_hash, time());
    
    let multi_sig = MultiPartySignature {
        data_hash: data_hash.clone(),
        signatures: HashMap::new(),
        required_signers,
        threshold,
        created_at: time(),
    };

    MULTI_PARTY_SIGNATURES.with(|sigs| {
        sigs.borrow_mut().insert(signature_id.clone(), multi_sig);
    });

    Ok(signature_id)
}

// Add signature to multi-party signature
pub fn add_signature(signature_id: String, signature: String) -> Result<bool, String> {
    let principal = caller();
    let principal_text = principal.to_text();
    
    MULTI_PARTY_SIGNATURES.with(|sigs| {
        let mut sigs_map = sigs.borrow_mut();
        let multi_sig = sigs_map.get_mut(&signature_id)
            .ok_or_else(|| "Signature requirement not found".to_string())?;
        
        // Check if this principal is required to sign
        if !multi_sig.required_signers.contains(&principal_text) {
            return Err("Principal not authorized to sign this data".to_string());
        }
        
        // Add signature
        multi_sig.signatures.insert(principal_text, signature);
        
        // Check if threshold is met
        Ok(multi_sig.signatures.len() >= multi_sig.threshold)
    })
}

// Verify multi-party signature is complete
pub fn verify_signature_complete(signature_id: String) -> Result<bool, String> {
    MULTI_PARTY_SIGNATURES.with(|sigs| {
        let sigs_map = sigs.borrow();
        let multi_sig = sigs_map.get(&signature_id)
            .ok_or_else(|| "Signature requirement not found".to_string())?;
        
        Ok(multi_sig.signatures.len() >= multi_sig.threshold)
    })
}

// Get signatures for verification
pub fn get_signatures(signature_id: String) -> Result<MultiPartySignature, String> {
    MULTI_PARTY_SIGNATURES.with(|sigs| {
        sigs.borrow().get(&signature_id)
            .cloned()
            .ok_or_else(|| "Signature requirement not found".to_string())
    })
}

// Helper functions
fn generate_vetkey_id(principal: &Principal) -> String {
    let mut hasher = Sha256::new();
    hasher.update(principal.as_slice());
    hasher.update(b"vetkey");
    hasher.update(&time().to_be_bytes());
    hex::encode(hasher.finalize())
}

fn generate_public_key(principal: &Principal) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(principal.as_slice());
    hasher.update(b"pubkey");
    hasher.finalize().to_vec()
}

fn derive_key_from_vetkd(vetkey_id: &str, derivation_path: &[u8]) -> Result<Vec<u8>, String> {
    // Simulate vetKD key derivation
    // In production, this would call the actual vetKD system canister
    let mut hasher = Sha256::new();
    hasher.update(vetkey_id.as_bytes());
    hasher.update(derivation_path);
    hasher.update(&time().to_be_bytes());
    
    Ok(hasher.finalize().to_vec())
}

// Encrypt data with party-specific vetKD key
pub fn encrypt_with_vetkd(data: &[u8], purpose: String) -> Result<Vec<u8>, String> {
    let derivation_path = purpose.as_bytes().to_vec();
    let vetkd_key = derive_vetkd_key(purpose, derivation_path)?;
    
    // XOR encryption with derived key (for IC compatibility)
    let key_bytes = &vetkd_key.derived_key;
    let mut encrypted = Vec::with_capacity(data.len());
    
    for (i, &byte) in data.iter().enumerate() {
        let key_byte = key_bytes[i % key_bytes.len()];
        encrypted.push(byte ^ key_byte);
    }
    
    Ok(encrypted)
}

// Decrypt data with party-specific vetKD key
pub fn decrypt_with_vetkd(encrypted_data: &[u8], purpose: String) -> Result<Vec<u8>, String> {
    // Decryption is the same as encryption with XOR
    encrypt_with_vetkd(encrypted_data, purpose)
}

// Check if caller has permission
pub fn check_permission(required_permission: &str) -> Result<(), String> {
    let identity = get_identity()?;
    
    if identity.permissions.contains(&required_permission.to_string()) {
        Ok(())
    } else {
        Err(format!("Permission denied: {} required", required_permission))
    }
}

// Update user activity
pub fn update_activity() -> Result<(), String> {
    let principal = caller();
    let principal_text = principal.to_text();
    
    USER_IDENTITIES.with(|identities| {
        let mut identities_map = identities.borrow_mut();
        if let Some(identity) = identities_map.get_mut(&principal_text) {
            identity.last_active = time();
            Ok(())
        } else {
            Err("Identity not found".to_string())
        }
    })
}
