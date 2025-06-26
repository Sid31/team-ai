use candid::{CandidType, Deserialize};
use std::collections::HashMap;
use std::cell::RefCell;

// Import MPCAgent from parent module
use crate::MPCAgent;

// Store registered agents
thread_local! {
    static AGENTS: RefCell<HashMap<String, MPCAgent>> = RefCell::new(HashMap::new());
}

// Initialize with some demo agents
pub fn init() {
    let demo_agents = vec![
        MPCAgent {
            id: "medical_researcher".to_string(),
            identity: "Dr. Privacy".to_string(),
            capabilities: vec!["medical_data".to_string(), "statistical_analysis".to_string()],
            reputation_score: 48, // 4.8 * 10
            price_per_computation: 100,
        },
        MPCAgent {
            id: "financial_analyst".to_string(),
            identity: "Bank Guardian".to_string(),
            capabilities: vec!["financial_data".to_string(), "risk_assessment".to_string()],
            reputation_score: 46, // 4.6 * 10
            price_per_computation: 150,
        },
        MPCAgent {
            id: "market_intelligence".to_string(),
            identity: "Insight Engine".to_string(),
            capabilities: vec!["market_analysis".to_string(), "trend_prediction".to_string()],
            reputation_score: 47, // 4.7 * 10
            price_per_computation: 200,
        },
    ];

    AGENTS.with(|agents| {
        let mut agents_mut = agents.borrow_mut();
        for agent in demo_agents {
            agents_mut.insert(agent.id.clone(), agent);
        }
    });
}

// Register a new agent
pub fn register_agent(agent: MPCAgent) -> Result<(), String> {
    if agent.id.is_empty() {
        return Err("Agent ID cannot be empty".to_string());
    }

    AGENTS.with(|agents| {
        let mut agents_mut = agents.borrow_mut();
        if agents_mut.contains_key(&agent.id) {
            return Err(format!("Agent with ID {} already exists", agent.id));
        }
        agents_mut.insert(agent.id.clone(), agent);
        Ok(())
    })
}

// Get an agent by ID
pub fn get_agent(id: String) -> Option<MPCAgent> {
    AGENTS.with(|agents| {
        agents.borrow().get(&id).cloned()
    })
}

// List all available agents
pub fn list_all_agents() -> Vec<MPCAgent> {
    AGENTS.with(|agents| {
        agents.borrow().values().cloned().collect()
    })
}

// Update agent reputation
pub fn update_reputation(id: String, new_score: u32) -> Result<(), String> {
    AGENTS.with(|agents| {
        let mut agents_mut = agents.borrow_mut();
        if let Some(agent) = agents_mut.get_mut(&id) {
            agent.reputation_score = new_score;
            Ok(())
        } else {
            Err(format!("Agent with ID {} not found", id))
        }
    })
}
