#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent_registry::{MPCAgent, init, register_agent, get_agent, list_all_agents, update_reputation};

    #[test]
    fn test_init() {
        // Initialize the registry with demo agents
        init();
        
        // Check that demo agents were added
        let agents = list_all_agents();
        
        // Verify we have at least 3 demo agents
        assert!(agents.len() >= 3);
        
        // Check for specific demo agents
        let medical_agent = get_agent("medical_researcher".to_string());
        assert!(medical_agent.is_some());
        assert_eq!(medical_agent.unwrap().name, "Dr. Privacy");
        
        let financial_agent = get_agent("financial_analyst".to_string());
        assert!(financial_agent.is_some());
        assert_eq!(financial_agent.unwrap().name, "Bank Guardian");
        
        let market_agent = get_agent("market_intelligence".to_string());
        assert!(market_agent.is_some());
        assert_eq!(market_agent.unwrap().name, "Insight Engine");
    }
    
    #[test]
    fn test_register_agent() {
        // Initialize the registry
        init();
        
        // Create a new agent
        let new_agent = MPCAgent {
            id: "test_agent".to_string(),
            name: "Test Agent".to_string(),
            description: "A test agent for unit testing".to_string(),
            computation_type: "test_analytics".to_string(),
            price_per_computation: 5,
            reputation_score: 4.0,
        };
        
        // Register the agent
        let result = register_agent(new_agent.clone());
        assert!(result.is_ok());
        
        // Verify the agent was registered
        let retrieved_agent = get_agent("test_agent".to_string());
        assert!(retrieved_agent.is_some());
        
        let agent = retrieved_agent.unwrap();
        assert_eq!(agent.id, "test_agent");
        assert_eq!(agent.name, "Test Agent");
        assert_eq!(agent.description, "A test agent for unit testing");
        assert_eq!(agent.computation_type, "test_analytics");
        assert_eq!(agent.price_per_computation, 5);
        assert_eq!(agent.reputation_score, 4.0);
    }
    
    #[test]
    fn test_register_duplicate_agent() {
        // Initialize the registry
        init();
        
        // Create a new agent
        let new_agent = MPCAgent {
            id: "duplicate_agent".to_string(),
            name: "Duplicate Agent".to_string(),
            description: "An agent that will be duplicated".to_string(),
            computation_type: "test_analytics".to_string(),
            price_per_computation: 5,
            reputation_score: 4.0,
        };
        
        // Register the agent first time
        let result = register_agent(new_agent.clone());
        assert!(result.is_ok());
        
        // Try to register the same agent again
        let result = register_agent(new_agent);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }
    
    #[test]
    fn test_register_agent_empty_id() {
        // Create an agent with an empty ID
        let invalid_agent = MPCAgent {
            id: "".to_string(),
            name: "Invalid Agent".to_string(),
            description: "An agent with an empty ID".to_string(),
            computation_type: "test_analytics".to_string(),
            price_per_computation: 5,
            reputation_score: 4.0,
        };
        
        // Try to register the agent
        let result = register_agent(invalid_agent);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Agent ID cannot be empty");
    }
    
    #[test]
    fn test_get_nonexistent_agent() {
        // Initialize the registry
        init();
        
        // Try to get an agent that doesn't exist
        let result = get_agent("nonexistent_agent".to_string());
        assert!(result.is_none());
    }
    
    #[test]
    fn test_list_all_agents() {
        // Initialize the registry
        init();
        
        // Add a new agent
        let new_agent = MPCAgent {
            id: "list_test_agent".to_string(),
            name: "List Test Agent".to_string(),
            description: "An agent for testing list functionality".to_string(),
            computation_type: "test_analytics".to_string(),
            price_per_computation: 5,
            reputation_score: 4.0,
        };
        
        let _ = register_agent(new_agent);
        
        // Get all agents
        let agents = list_all_agents();
        
        // Check that our new agent is in the list
        let found = agents.iter().any(|agent| agent.id == "list_test_agent");
        assert!(found);
    }
    
    #[test]
    fn test_update_reputation() {
        // Initialize the registry
        init();
        
        // Add a new agent
        let new_agent = MPCAgent {
            id: "reputation_test_agent".to_string(),
            name: "Reputation Test Agent".to_string(),
            description: "An agent for testing reputation updates".to_string(),
            computation_type: "test_analytics".to_string(),
            price_per_computation: 5,
            reputation_score: 4.0,
        };
        
        let _ = register_agent(new_agent);
        
        // Update the agent's reputation
        let result = update_reputation("reputation_test_agent".to_string(), 4.5);
        assert!(result.is_ok());
        
        let updated_agent = result.unwrap();
        assert_eq!(updated_agent.reputation_score, 4.5);
        
        // Verify the update was persisted
        let retrieved_agent = get_agent("reputation_test_agent".to_string());
        assert!(retrieved_agent.is_some());
        assert_eq!(retrieved_agent.unwrap().reputation_score, 4.5);
    }
    
    #[test]
    fn test_update_nonexistent_agent_reputation() {
        // Initialize the registry
        init();
        
        // Try to update a nonexistent agent's reputation
        let result = update_reputation("nonexistent_agent".to_string(), 5.0);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }
}
