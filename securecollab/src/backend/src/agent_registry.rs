use std::collections::HashMap;
use std::cell::RefCell;


use crate::MPCAgent;

// Store registered agents
thread_local! {
    static AGENT_REGISTRY: RefCell<HashMap<String, MPCAgent>> = RefCell::new(HashMap::new());
}

/// Initialize the agent registry with specialized AI agents
pub fn init() {
    let agents = vec![
        MPCAgent {
            id: "medical_research_agent".to_string(),
            identity: "Medical Research Specialist".to_string(),
            capabilities: vec![
                "healthcare_data_analysis".to_string(),
                "clinical_trial_analysis".to_string(),
                "medical_privacy_compliance".to_string(),
                "epidemiological_modeling".to_string(),
                "drug_discovery_insights".to_string(),
            ],
            reputation_score: 95,
            price_per_computation: 1000,
        },
        MPCAgent {
            id: "financial_analysis_agent".to_string(),
            identity: "Financial Analysis Expert".to_string(),
            capabilities: vec![
                "risk_assessment".to_string(),
                "fraud_detection".to_string(),
                "market_analysis".to_string(),
                "regulatory_compliance".to_string(),
                "portfolio_optimization".to_string(),
            ],
            reputation_score: 92,
            price_per_computation: 800,
        },
        MPCAgent {
            id: "compliance_verification_agent".to_string(),
            identity: "Privacy & Compliance Auditor".to_string(),
            capabilities: vec![
                "gdpr_compliance".to_string(),
                "hipaa_verification".to_string(),
                "data_anonymization".to_string(),
                "privacy_impact_assessment".to_string(),
                "regulatory_audit".to_string(),
            ],
            reputation_score: 98,
            price_per_computation: 1200,
        },
        MPCAgent {
            id: "data_science_agent".to_string(),
            identity: "Advanced Data Science AI".to_string(),
            capabilities: vec![
                "statistical_analysis".to_string(),
                "machine_learning".to_string(),
                "predictive_modeling".to_string(),
                "data_visualization".to_string(),
                "pattern_recognition".to_string(),
            ],
            reputation_score: 89,
            price_per_computation: 600,
        },
        MPCAgent {
            id: "cybersecurity_agent".to_string(),
            identity: "Cybersecurity Specialist".to_string(),
            capabilities: vec![
                "threat_detection".to_string(),
                "vulnerability_assessment".to_string(),
                "security_audit".to_string(),
                "incident_response".to_string(),
                "cryptographic_analysis".to_string(),
            ],
            reputation_score: 94,
            price_per_computation: 900,
        },
        MPCAgent {
            id: "legal_analysis_agent".to_string(),
            identity: "Legal & Regulatory AI".to_string(),
            capabilities: vec![
                "contract_analysis".to_string(),
                "regulatory_interpretation".to_string(),
                "legal_risk_assessment".to_string(),
                "compliance_monitoring".to_string(),
                "policy_analysis".to_string(),
            ],
            reputation_score: 91,
            price_per_computation: 1100,
        },
    ];

    AGENT_REGISTRY.with(|registry| {
        let mut reg = registry.borrow_mut();
        for agent in agents {
            reg.insert(agent.id.clone(), agent);
        }
    });
}

/// List all available agents
pub fn list_all_agents() -> Vec<MPCAgent> {
    AGENT_REGISTRY.with(|registry| {
        registry.borrow().values().cloned().collect()
    })
}

/// Get agent by ID
pub fn get_agent_by_id(agent_id: &str) -> Option<MPCAgent> {
    AGENT_REGISTRY.with(|registry| {
        registry.borrow().get(agent_id).cloned()
    })
}

/// Register a new agent
pub fn register_agent(agent: crate::MPCAgent) -> Result<(), String> {
    AGENT_REGISTRY.with(|registry| {
        let mut reg = registry.borrow_mut();
        if reg.contains_key(&agent.id) {
            return Err(format!("Agent with ID {} already exists", agent.id));
        }
        reg.insert(agent.id.clone(), agent.clone());
        Ok(())
    })
}

/// Update agent reputation based on computation performance
pub fn update_agent_reputation(agent_id: &str, performance_score: u32) -> Result<(), String> {
    AGENT_REGISTRY.with(|registry| {
        let mut reg = registry.borrow_mut();
        if let Some(agent) = reg.get_mut(agent_id) {
            // Update reputation using weighted average
            let new_reputation = ((agent.reputation_score as u64 * 9) + (performance_score as u64)) / 10;
            agent.reputation_score = new_reputation.min(100) as u32;
            Ok(())
        } else {
            Err(format!("Agent {} not found", agent_id))
        }
    })
}

/// Find agents by capability
pub fn find_agents_by_capability(capability: &str) -> Vec<MPCAgent> {
    AGENT_REGISTRY.with(|registry| {
        registry.borrow()
            .values()
            .filter(|agent| agent.capabilities.contains(&capability.to_string()))
            .cloned()
            .collect()
    })
}

/// Get top agents by reputation
pub fn get_top_agents(limit: usize) -> Vec<MPCAgent> {
    let mut agents = list_all_agents();
    agents.sort_by(|a, b| b.reputation_score.cmp(&a.reputation_score));
    agents.into_iter().take(limit).collect()
}

/// Check if agent is available for computation
pub fn is_agent_available(agent_id: &str) -> bool {
    AGENT_REGISTRY.with(|registry| {
        registry.borrow().contains_key(agent_id)
    })
}

/// Get agents suitable for a specific computation type
pub fn get_suitable_agents(computation_type: &str) -> Vec<MPCAgent> {
    let relevant_capabilities = match computation_type.to_lowercase().as_str() {
        "medical" | "healthcare" => vec!["healthcare_data_analysis", "medical_privacy_compliance"],
        "financial" | "finance" => vec!["risk_assessment", "fraud_detection", "market_analysis"],
        "compliance" | "privacy" => vec!["gdpr_compliance", "hipaa_verification", "privacy_impact_assessment"],
        "security" | "cybersecurity" => vec!["threat_detection", "security_audit", "cryptographic_analysis"],
        "legal" => vec!["contract_analysis", "legal_risk_assessment", "regulatory_interpretation"],
        _ => vec!["statistical_analysis", "machine_learning", "data_visualization"],
    };

    AGENT_REGISTRY.with(|registry| {
        registry.borrow()
            .values()
            .filter(|agent| {
                relevant_capabilities.iter().any(|cap| 
                    agent.capabilities.contains(&cap.to_string())
                )
            })
            .cloned()
            .collect()
    })
}
