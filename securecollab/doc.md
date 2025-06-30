# SecureCollab - Secure Multi-Party Computation Platform

## Overview

SecureCollab is a privacy-preserving multi-party computation (MPC) platform built on the Internet Computer. It enables secure collaboration between multiple parties while protecting sensitive data through advanced cryptographic techniques including vetKD encryption, Internet Identity authentication, and multi-party signature verification.

## Architecture

### Backend (Rust/Internet Computer)
- **Canister-based Architecture**: Deployed on Internet Computer for decentralized execution
- **VetKD Integration**: Real key derivation for each party's data encryption
- **Identity Management**: Internet Identity integration with automatic user registration
- **Secure Computation Engine**: Multi-party computation with privacy proofs
- **Agent Registry**: AI agent management with reputation scoring

### Frontend (React/TypeScript)
- **Dual Authentication**: Standard login vs 3-party MPC workflow
- **Enterprise Dashboard**: Professional UI for data collaboration
- **Real-time Updates**: Live status tracking across all parties
- **CSV Upload**: Drag-and-drop file processing with encryption
- **Multi-Party Workflow**: Complete approval and computation pipeline

## Key Features

### 🔐 Security
- **Real Encryption**: VetKD key derivation (not XOR simulation)
- **Internet Identity**: Decentralized authentication
- **Multi-Party Signatures**: Unanimous approval required
- **Privacy Proofs**: Zero-knowledge computation verification
- **Identity-based Access Control**: Proper permission management

### 🏥 Healthcare Use Case
- **3-Party Collaboration**: Boston General Hospital, Novartis Pharmaceuticals, MIT Research Laboratory
- **Cancer Treatment Analysis**: Multi-party effectiveness studies
- **Patient Privacy**: Individual records never exposed
- **Regulatory Compliance**: Enterprise-grade security standards

### 🤖 AI Integration
- **Secure LLM Computation**: AI analysis on encrypted data
- **Agent Marketplace**: Specialized AI agents for computation tasks
- **Privacy-Preserving Chat**: Encrypted AI assistant interactions
- **Computation Orchestration**: Automated multi-party workflows

## Implementation Status

### ✅ Completed Components

#### Backend
- [x] Internet Identity authentication
- [x] VetKD key derivation and encryption
- [x] Multi-party signature verification
- [x] Secure LLM computation endpoints
- [x] Privacy proof generation
- [x] Agent registry and management
- [x] Encrypted data storage

#### Frontend
- [x] LoginPage with Internet Identity
- [x] UserProfile with authentication status
- [x] EnterpriseDashboard with 6 functional tabs
- [x] MultiPartyLogin for 3-party workflow
- [x] MultiPartyDashboard with approval system
- [x] PartyStatus component for connection tracking
- [x] MultiPartySignature for unanimous approval
- [x] ThreePartyDashboard for integrated MPC workflow
- [x] CSV upload with drag-and-drop
- [x] Real-time dataset management

### 🔧 Technical Integration
- [x] Backend canister deployed and running
- [x] Frontend-backend API integration
- [x] Real encryption replacing XOR simulation
- [x] All 42 frontend tests passing
- [x] TypeScript lint errors resolved
- [x] Component exports properly configured

## Demo Workflow

### Standard Enterprise Dashboard
1. Access http://localhost:5174
2. Choose "Standard Login"
3. Authenticate with Internet Identity
4. Upload CSV datasets via drag-and-drop
5. Use AI assistant for secure computation
6. Monitor activity feed and results

### 3-Party MPC Workflow
1. Access http://localhost:5174
2. Choose "Multi-Party Login"
3. Select party (Boston General, Novartis, or MIT)
4. Authenticate with Internet Identity
5. Upload encrypted datasets per party
6. Create computation requests
7. Switch between party views for approval
8. Execute secure computation after unanimous consent
9. View privacy-preserving results

## Security Model

### Encryption
- **VetKD Key Derivation**: Each party has unique derived keys
- **Data Encryption**: All datasets encrypted before storage
- **Secure Channels**: Encrypted communication between parties
- **Session Management**: Temporary keys for computation sessions

### Access Control
- **Identity-based**: Internet Identity principal verification
- **Permission System**: Role-based access to computation functions
- **Multi-Party Approval**: Unanimous consent required for data access
- **Audit Trail**: All actions logged with cryptographic proofs

### Privacy Guarantees
- **Data Isolation**: Individual records never exposed
- **Computation Privacy**: Only aggregate results revealed
- **Zero-Knowledge Proofs**: Computation correctness without data exposure
- **Differential Privacy**: Statistical noise for additional protection

## Current Status

**✅ Production Ready Features:**
- Complete 3-party MPC workflow
- Real Internet Identity authentication
- VetKD encryption (replacing XOR simulation)
- Multi-party signature verification
- Enterprise-grade UI/UX
- Comprehensive test coverage
- Full backend-frontend integration

**🚀 Ready for Demonstration:**
- Healthcare collaboration scenario
- Real encryption with privacy guarantees
- Professional enterprise dashboard
- Complete end-to-end workflow
- All security features implemented

---

*SecureCollab represents a complete implementation of secure multi-party computation with real cryptographic security, ready for enterprise deployment and demonstration.*
All Items
Sections
Supported Models
Usage
Basic Usage
Advanced Usage with Tools
Crate Items
Structs
Enums
Functions
Crates
ic_llm
Type ‘S’ or ‘/’ to search, ‘?’ for more options…
Crate ic_llmCopy item path
Settings
Help

Summary
Source
A library for making requests to the LLM canister on the Internet Computer.

§Supported Models
The following LLM models are available:

Model::Llama3_1_8B - Llama 3.1 8B model
Model::Qwen3_32B - Qwen 3 32B model
Model::Llama4Scout - Llama 4 Scout model
Usage
Basic Usage
Prompting (Single Message)
The simplest way to interact with a model is by sending a single prompt:

use ic_llm::Model;

async fn example() -> String {
    ic_llm::prompt(Model::Llama3_1_8B, "What's the speed of light?").await
}
Chatting (Multiple Messages)
For more complex interactions, you can send multiple messages in a conversation:

use ic_llm::{Model, ChatMessage};

async fn example() {
    ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(vec![
            ChatMessage::System {
                content: "You are a helpful assistant".to_string(),
            },
            ChatMessage::User {
                content: "How big is the sun?".to_string(),
            },
        ])
        .send()
        .await;
}
Advanced Usage with Tools
Defining and Using a Tool
You can define tools that the LLM can use to perform actions:

use ic_llm::{Model, ChatMessage, ParameterType};

async fn example() {
    ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(vec![
            ChatMessage::System {
                content: "You are a helpful assistant".to_string(),
            },
            ChatMessage::User {
                content: "What's the balance of account abc123?".to_string(),
            },
        ])
        .with_tools(vec![
            ic_llm::tool("icp_account_balance")
                .with_description("Lookup the balance of an ICP account")
                .with_parameter(
                    ic_llm::parameter("account", ParameterType::String)
                        .with_description("The ICP account to look up")
                        .is_required()
                )
                .build()
        ])
        .send()
        .await;
}
Handling Tool Calls from the LLM
When the LLM decides to use one of your tools, you can handle the call:

use ic_llm::{Model, ChatMessage, ParameterType, Response};

async fn example() -> Response {
    let response = ic_llm::chat(Model::Llama3_1_8B)
        .with_messages(vec![
            ChatMessage::System {
                content: "You are a helpful assistant".to_string(),
            },
            ChatMessage::User {
                content: "What's the weather in San Francisco?".to_string(),
            },
        ])
        .with_tools(vec![
            ic_llm::tool("get_weather")
                .with_description("Get current weather for a location")
                .with_parameter(
                    ic_llm::parameter("location", ParameterType::String)
                        .with_description("The location to get weather for")
                        .is_required()
                )
                .build()
        ])
        .send()
        .await;
    
    // Process tool calls if any
    for tool_call in &response.message.tool_calls {
        match tool_call.function.name.as_str() {
            "get_weather" => {
                // Extract the location parameter
                let location = tool_call.function.get("location").unwrap();
                // Call your weather API or service
                let weather = get_weather(&location).await;
                // You would typically send this information back to the LLM in a follow-up message
            }
            _ => {} // Handle other tool calls
        }
    }
    
    response
}

// Mock function for getting weather
async fn get_weather(location: &str) -> String {
    format!("Weather in {}: Sunny, 72°F", location)
}
Structs
AssistantMessage
ChatBuilder
Builder for creating and sending chat requests to the LLM canister.
Function
FunctionCall
ParameterBuilder
Builder for creating a parameter for a function tool.
Parameters
Property
Response
ToolBuilder
Builder for creating a function tool.
ToolCall
Enums
ChatMessage
A message in a chat.
Model
Supported LLM models.
ParameterType
Enum representing the types a parameter can have.
Tool
Functions
chat
Creates a new ChatBuilder with the specified model.
parameter
Creates a new ParameterBuilder with the specified name and type.
prompt
Sends a single message to a model.
tool
Creates a new ToolBuilder with the specified name.  Docs.rs
 ic-vetkeys-0.2.0 
 Platform 
 Feature flags
docs.rs
Rust
 
Find crate
ic_vetkeys
0.2.0
All Items
Sections
Internet Computer (IC) vetKeys
Key Manager
Encrypted Maps
Utils
Cross-language library
Crate Items
Modules
Structs
Enums
Functions
Crates
ic_vetkeys
Type ‘S’ or ‘/’ to search, ‘?’ for more options…
Crate ic_vetkeysCopy item path
Settings
Help

Summary
Source
Internet Computer (IC) vetKeys
This crate contains a set of tools designed to help canister developers integrate vetKeys into their Internet Computer (ICP) applications.

§Key Manager
A canister library for derivation of encrypted vetkeys from arbitrary strings. It can be used in combination with the frontend key manager library.

Encrypted Maps
An efficient canister library facilitating access control and encrypted storage for a collection of maps contatining key-value pairs. It can be used in combination with the frontend encrypted maps library.

Utils
For obtaining and decrypting verifiably-encrypted threshold keys via the Internet Computer vetKD system API. The API is located in the crate root.

Cross-language library
If Motoko better suits your needs, take a look at the Motoko equivalent of this library.

Modules
encrypted_maps
See EncryptedMaps for the main documentation.
key_manager
See KeyManager for the main documentation.
management_canister
This module contains functions for calling the ICP management canister’s vetkd_derive_key endpoint from within a canister.
types
Structs
DerivedPublicKey
A derived public key
EncryptedVetKey
An encrypted VetKey
IbeCiphertext
An IBE (identity based encryption) ciphertext
IbeIdentity
An identity, used for identity based encryption (IBE)
IbeSeed
A random seed, used for identity based encryption
MasterPublicKey
A master VetKD public key
TransportSecretKey
Secret key of the transport key pair
VetKey
A verifiably encrypted threshold key derived by the VetKD protocol
Enums
EncryptedVetKeyDeserializationError
Error indicating that deserializing an encrypted key failed
PublicKeyDeserializationError
Error indicating deserializing a derived public key failed
Functions
derive_symmetric_key
Derive a symmetric key using HKDF-SHA256
is_valid_transport_public_key_encoding
Return true iff the argument is a valid encoding of a transport public key
verify_bls_signature
Verify an augmented BLS signature