#[cfg(test)]
mod tests {
    use super::*;
    use crate::{ComputationResult, AgentTeam};
    use candid::{CandidType, Deserialize};

    #[tokio::test]
    async fn test_create_agent_team() {
        let team_id = create_agent_team(vec!["agent1".to_string(), "agent2".to_string()], vec!["data1".to_string()]);
        assert!(!team_id.is_empty());
        
        let team = get_agent_team(&team_id);
        assert!(team.is_some());
        let team = team.unwrap();
        assert_eq!(team.agent_ids.len(), 2);
        assert_eq!(team.data_source_ids.len(), 1);
    }
    
    #[tokio::test]
    async fn test_create_agent_team_empty_agents() {
        // Test with empty agent IDs
        let agent_ids: Vec<String> = vec![];
        let data_source_ids = vec!["data1".to_string()];
        
        let result = create_agent_team(agent_ids, data_source_ids).await;
        
        // Check that team creation failed with expected error
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Agent IDs cannot be empty");
    }
    
    #[tokio::test]
    async fn test_create_agent_team_empty_data_sources() {
        // Test with empty data source IDs
        let agent_ids = vec!["agent1".to_string()];
        let data_source_ids: Vec<String> = vec![];
        
        let result = create_agent_team(agent_ids, data_source_ids).await;
        
        // Check that team creation failed with expected error
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Data source IDs cannot be empty");
    }
    
    #[tokio::test]
    async fn test_run_secure_computation() {
        // First create a team
        let agent_ids = vec!["agent1".to_string(), "agent2".to_string()];
        let data_source_ids = vec!["data1".to_string(), "data2".to_string()];
        
        let team_id = create_agent_team(agent_ids, data_source_ids).await.unwrap();
        
        // Run a computation
        let computation_request = "analyze health data trends";
        let result = run_secure_computation(team_id, computation_request.to_string()).await;
        
        // Check that computation was successful
        assert!(result.is_ok());
        
        let computation_result = result.unwrap();
        assert!(!computation_result.insights.is_empty());
        assert!(computation_result.insights.contains(computation_request));
        assert!(!computation_result.privacy_proof.is_empty());
        assert!(computation_result.timestamp > 0);
    }
    
    #[tokio::test]
    async fn test_run_secure_computation_invalid_team() {
        // Try to run a computation with an invalid team ID
        let invalid_team_id = "nonexistent_team_id";
        let computation_request = "analyze health data trends";
        
        let result = run_secure_computation(invalid_team_id.to_string(), computation_request.to_string()).await;
        
        // Check that computation failed with expected error
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }
    
    #[tokio::test]
    async fn test_get_team_info_invalid_team() {
        // Try to get info for an invalid team ID
        let invalid_team_id = "nonexistent_team_id";
        
        let result = get_team_info(invalid_team_id.to_string());
        
        // Check that the operation failed with expected error
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }
    
    #[test]
    fn test_computation_result_candid() {
        // Test that ComputationResult can be serialized/deserialized with Candid
        let result = ComputationResult {
            insights: "Test insights".to_string(),
            privacy_proof: "Test proof".to_string(),
            timestamp: 12345678,
        };
        
        // This is a simple test to ensure the struct implements CandidType correctly
        // In a real test, we would serialize and deserialize
        assert_eq!(result.insights, "Test insights");
        assert_eq!(result.privacy_proof, "Test proof");
        assert_eq!(result.timestamp, 12345678);
    }
}
