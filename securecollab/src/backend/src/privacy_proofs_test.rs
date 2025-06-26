#[cfg(test)]
mod tests {
    use super::*;
    use crate::privacy_proofs::{generate_proof, verify_proof, get_proof, list_proofs_for_computation, PrivacyProof};

    #[test]
    fn test_generate_proof() {
        // Generate a proof
        let computation_id = "comp_123".to_string();
        let proof_type = "zk-SNARK".to_string();
        
        let proof = generate_proof(computation_id.clone(), proof_type.clone());
        
        // Check that the proof has the expected structure
        assert!(!proof.id.is_empty());
        assert_eq!(proof.computation_id, computation_id);
        assert_eq!(proof.proof_type, proof_type);
        assert!(!proof.verification_hash.is_empty());
        assert!(proof.timestamp > 0);
        
        // Verify that the proof was stored
        let retrieved_proof = get_proof(proof.id.clone());
        assert!(retrieved_proof.is_some());
        
        let retrieved = retrieved_proof.unwrap();
        assert_eq!(retrieved.id, proof.id);
        assert_eq!(retrieved.computation_id, computation_id);
        assert_eq!(retrieved.proof_type, proof_type);
        assert_eq!(retrieved.verification_hash, proof.verification_hash);
        assert_eq!(retrieved.timestamp, proof.timestamp);
    }
    
    #[test]
    fn test_verify_proof() {
        // Generate a proof
        let computation_id = "comp_456".to_string();
        let proof_type = "zk-STARK".to_string();
        
        let proof = generate_proof(computation_id, proof_type);
        
        // Verify the proof
        let verification_result = verify_proof(proof.id.clone());
        assert!(verification_result.is_ok());
        assert!(verification_result.unwrap());
    }
    
    #[test]
    fn test_verify_nonexistent_proof() {
        // Try to verify a nonexistent proof
        let verification_result = verify_proof("nonexistent_proof_id".to_string());
        assert!(verification_result.is_err());
        assert!(verification_result.unwrap_err().contains("not found"));
    }
    
    #[test]
    fn test_get_nonexistent_proof() {
        // Try to get a nonexistent proof
        let result = get_proof("nonexistent_proof_id".to_string());
        assert!(result.is_none());
    }
    
    #[test]
    fn test_list_proofs_for_computation() {
        // Generate multiple proofs for the same computation
        let computation_id = "comp_789".to_string();
        
        let proof1 = generate_proof(computation_id.clone(), "zk-SNARK".to_string());
        let proof2 = generate_proof(computation_id.clone(), "zk-STARK".to_string());
        let proof3 = generate_proof(computation_id.clone(), "Bulletproofs".to_string());
        
        // Generate a proof for a different computation
        let other_proof = generate_proof("other_comp".to_string(), "zk-SNARK".to_string());
        
        // List proofs for the computation
        let proofs = list_proofs_for_computation(computation_id);
        
        // Check that we have exactly 3 proofs for this computation
        assert_eq!(proofs.len(), 3);
        
        // Check that all proofs are for the correct computation
        for proof in &proofs {
            assert_eq!(proof.computation_id, "comp_789");
        }
        
        // Check that we have all the expected proof types
        let proof_types: Vec<String> = proofs.iter().map(|p| p.proof_type.clone()).collect();
        assert!(proof_types.contains(&"zk-SNARK".to_string()));
        assert!(proof_types.contains(&"zk-STARK".to_string()));
        assert!(proof_types.contains(&"Bulletproofs".to_string()));
        
        // Check that the other proof is not included
        let other_comp_proofs = list_proofs_for_computation("other_comp".to_string());
        assert_eq!(other_comp_proofs.len(), 1);
        assert_eq!(other_comp_proofs[0].id, other_proof.id);
    }
    
    #[test]
    fn test_verification_hash_uniqueness() {
        // Generate two proofs with the same parameters
        let computation_id = "comp_uniqueness".to_string();
        let proof_type = "zk-SNARK".to_string();
        
        let proof1 = generate_proof(computation_id.clone(), proof_type.clone());
        
        // Small delay to ensure different timestamps
        std::thread::sleep(std::time::Duration::from_millis(10));
        
        let proof2 = generate_proof(computation_id.clone(), proof_type.clone());
        
        // Check that the verification hashes are different
        assert_ne!(proof1.verification_hash, proof2.verification_hash);
        
        // Generate a proof with different parameters
        let proof3 = generate_proof("different_comp".to_string(), proof_type.clone());
        
        // Check that the verification hash is different
        assert_ne!(proof1.verification_hash, proof3.verification_hash);
        assert_ne!(proof2.verification_hash, proof3.verification_hash);
    }
}
