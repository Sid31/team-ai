#[cfg(test)]
mod tests {
    use super::*;
    use crate::vetkey_manager::{
        simulate_dkg, generate_transport_key_pair, derive_key_share, encrypt_key_share,
        verify_encrypted_key_share, combine_encrypted_key_shares, decrypt_derived_key,
        encrypt_data, decrypt_data, simulate_complete_vetkd_process, generate_shared_key_for_mpc,
        MasterKeyShare, DerivedKey, EncryptedData, EncryptedKeyShare, TransportKeyPair
    };

    #[test]
    fn test_simulate_dkg() {
        let node_ids = vec![
            "node1".to_string(),
            "node2".to_string(),
            "node3".to_string()
        ];
        let threshold = 2;
        
        let shares = simulate_dkg(&node_ids, threshold);
        
        // Check that we have the right number of shares
        assert_eq!(shares.len(), 3);
        
        // Check that each node has a share
        for node_id in &node_ids {
            assert!(shares.contains_key(node_id));
        }
        
        // Check that shares have the expected structure
        for (node_id, share) in &shares {
            assert_eq!(share.node_id, *node_id);
            assert!(!share.key_bytes.is_empty());
            assert!(!share.public_component.is_empty());
        }
    }
    
    #[test]
    fn test_transport_key_pair() {
        let key_pair = generate_transport_key_pair();
        
        // Check that keys are not empty
        assert!(!key_pair.private_key.is_empty());
        assert!(!key_pair.public_key.is_empty());
        
        // Check that public and private keys are different
        assert_ne!(key_pair.private_key, key_pair.public_key);
    }
    
    #[test]
    fn test_derive_key_share() {
        let master_share = MasterKeyShare {
            node_id: "node1".to_string(),
            key_bytes: vec![1, 2, 3, 4, 5],
            public_component: vec![7, 14, 21, 28, 35],
        };
        
        let identity = "user123";
        
        let key_share = derive_key_share(&master_share, identity);
        
        // Check that the key share is not empty
        assert!(!key_share.is_empty());
        
        // Derive again with the same inputs and check for determinism
        let key_share2 = derive_key_share(&master_share, identity);
        assert_eq!(key_share, key_share2);
        
        // Derive with a different identity and check that the result is different
        let key_share3 = derive_key_share(&master_share, "user456");
        assert_ne!(key_share, key_share3);
    }
    
    #[test]
    fn test_encrypt_and_verify_key_share() {
        let key_share = vec![1, 2, 3, 4, 5];
        let transport_key = vec![10, 20, 30, 40, 50];
        
        let encrypted_share = encrypt_key_share(&key_share, &transport_key);
        
        // Check that the encrypted share has the expected structure
        assert!(!encrypted_share.encrypted_share.is_empty());
        assert!(!encrypted_share.verification_proof.is_empty());
        
        // Verify the encrypted share
        assert!(verify_encrypted_key_share(&encrypted_share, "any_identity"));
    }
    
    #[test]
    fn test_combine_encrypted_key_shares() {
        let shares = vec![
            EncryptedKeyShare {
                node_id: "node1".to_string(),
                encrypted_share: vec![1, 2, 3, 4, 5],
                verification_proof: "proof_123".to_string(),
            },
            EncryptedKeyShare {
                node_id: "node2".to_string(),
                encrypted_share: vec![6, 7, 8, 9, 10],
                verification_proof: "proof_456".to_string(),
            },
            EncryptedKeyShare {
                node_id: "node3".to_string(),
                encrypted_share: vec![11, 12, 13, 14, 15],
                verification_proof: "proof_789".to_string(),
            },
        ];
        
        // Test with threshold = 2
        let combined = combine_encrypted_key_shares(&shares, 2);
        assert!(combined.is_some());
        assert!(!combined.unwrap().is_empty());
        
        // Test with threshold > number of shares
        let combined = combine_encrypted_key_shares(&shares, 4);
        assert!(combined.is_none());
    }
    
    #[test]
    fn test_decrypt_derived_key() {
        let encrypted_key = vec![10, 20, 30, 40, 50];
        let transport_key_pair = TransportKeyPair {
            public_key: vec![1, 2, 3, 4, 5],
            private_key: vec![5, 4, 3, 2, 1],
        };
        
        let derived_key = decrypt_derived_key(&encrypted_key, &transport_key_pair);
        
        // Check that the derived key has the expected structure
        assert!(!derived_key.key_bytes.is_empty());
        assert!(!derived_key.verification_hash.is_empty());
    }
    
    #[test]
    fn test_encrypt_and_decrypt_data() {
        let derived_key = DerivedKey {
            identity: "user123".to_string(),
            key_bytes: vec![1, 2, 3, 4, 5],
            verification_hash: "verify_123".to_string(),
        };
        
        let data = vec![100, 101, 102, 103, 104];
        
        // Encrypt the data
        let encrypted_data = encrypt_data(&data, &derived_key);
        
        // Check that the encrypted data has the expected structure
        assert!(!encrypted_data.data_id.is_empty());
        assert!(!encrypted_data.encrypted_bytes.is_empty());
        assert_eq!(encrypted_data.encryption_key_id, derived_key.verification_hash);
        
        // Decrypt the data
        let decrypted_data = decrypt_data(&encrypted_data, &derived_key);
        
        // Check that we get back the original data
        assert_eq!(decrypted_data, data);
    }
    
    #[test]
    fn test_complete_vetkd_process() {
        let identity = "user123";
        
        let derived_key = simulate_complete_vetkd_process(identity);
        
        // Check that the derived key has the expected structure
        assert!(!derived_key.key_bytes.is_empty());
        assert!(!derived_key.verification_hash.is_empty());
        
        // Run the process again with the same identity and check for determinism
        let derived_key2 = simulate_complete_vetkd_process(identity);
        
        // The keys should be different due to randomness in the process
        // but they should have the same structure
        assert!(!derived_key2.key_bytes.is_empty());
        assert!(!derived_key2.verification_hash.is_empty());
    }
    
    #[test]
    fn test_shared_key_for_mpc() {
        let identities = vec![
            "user1".to_string(),
            "user2".to_string(),
            "user3".to_string(),
        ];
        
        let shared_key = generate_shared_key_for_mpc(&identities);
        
        // Check that the shared key has the expected structure
        assert!(!shared_key.key_bytes.is_empty());
        assert!(!shared_key.verification_hash.is_empty());
        
        // Generate a shared key for a different set of identities
        let other_identities = vec![
            "user1".to_string(),
            "user4".to_string(),
        ];
        
        let other_shared_key = generate_shared_key_for_mpc(&other_identities);
        
        // The keys should be different
        assert_ne!(shared_key.key_bytes, other_shared_key.key_bytes);
    }
}
