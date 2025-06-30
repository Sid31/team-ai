import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ChatMessage { 'content' : string, 'role' : string }
export interface ComputationResult {
  'insights' : string,
  'timestamp' : bigint,
  'privacy_proof' : string,
}
export interface LLMQueryRequest {
  'id' : string,
  'status' : QueryStatus,
  'result' : [] | [string],
  'requester' : Principal,
  'received_signatures' : Array<Principal>,
  'query' : string,
  'created_at' : bigint,
  'target_datasets' : Array<string>,
  'required_signatures' : Array<Principal>,
  'expires_at' : bigint,
}
export interface MPCComputation {
  'id' : string,
  'status' : string,
  'required_parties' : number,
  'title' : string,
  'requester' : Principal,
  'vetkey_derivation_complete' : boolean,
  'votes' : Array<Vote>,
  'received_signatures' : Array<Principal>,
  'description' : string,
  'created_at' : bigint,
  'results' : [] | [string],
  'signature_id' : [] | [string],
  'required_signatures' : Array<Principal>,
  'approvals' : Array<Principal>,
}
export interface PartyInfo {
  'principal' : Principal,
  'name' : string,
  'role' : string,
  'last_seen' : bigint,
  'is_active' : boolean,
  'vetkey_id' : string,
}
export interface PrivateDataSource {
  'id' : string,
  'encrypted_data' : Uint8Array | number[],
  'owner' : Principal,
  'schema' : string,
  'name' : string,
  'created_at' : bigint,
  'access_permissions' : Array<Principal>,
  'party_name' : string,
  'vetkey_id' : string,
  'record_count' : number,
}
export type QueryStatus = { 'Executing' : null } |
  { 'Approved' : null } |
  { 'Rejected' : null } |
  { 'Completed' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : Uint8Array | number[] } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : ComputationResult } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : MPCComputation } |
  { 'Err' : string };
export type VetkdEncryptedKeyResponse = { 'Ok' : Uint8Array | number[] } |
  { 'Err' : string };
export type VetkdPublicKeyResponse = { 'Ok' : Uint8Array | number[] } |
  { 'Err' : string };
export interface Vote {
  'decision' : string,
  'voter' : Principal,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'chat' : ActorMethod<[Array<ChatMessage>], string>,
  'create_computation_request' : ActorMethod<[string, string], Result>,
  'create_llm_query' : ActorMethod<[string, Array<string>], Result>,
  'derive_agent_encryption_key' : ActorMethod<[string], Result_1>,
  'execute_computation_request' : ActorMethod<[string], Result>,
  'execute_llm_query' : ActorMethod<[string], Result>,
  'execute_secure_mpc_computation' : ActorMethod<
    [string, string, Array<string>],
    Result_2
  >,
  'generate_privacy_proof' : ActorMethod<[string], Result>,
  'get_all_computation_requests' : ActorMethod<[], Array<MPCComputation>>,
  'get_all_data_sources' : ActorMethod<[], Array<PrivateDataSource>>,
  'get_all_datasets' : ActorMethod<[], Array<PrivateDataSource>>,
  'get_computation_request' : ActorMethod<[string], Result_3>,
  'get_data_sources_for_user' : ActorMethod<[], Array<PrivateDataSource>>,
  'get_llm_queries' : ActorMethod<[], Array<LLMQueryRequest>>,
  'get_pending_queries_for_user' : ActorMethod<[], Array<LLMQueryRequest>>,
  'get_query_by_id' : ActorMethod<[string], [] | [LLMQueryRequest]>,
  'get_registered_parties' : ActorMethod<[], Array<PartyInfo>>,
  'get_user_identity' : ActorMethod<[], Result>,
  'prompt' : ActorMethod<[string], string>,
  'register_party' : ActorMethod<[string, string], Result>,
  'register_user_identity' : ActorMethod<[string, string], Result>,
  'save_computation_results' : ActorMethod<[string, string], Result>,
  'secure_agent_communication' : ActorMethod<
    [string, string, Uint8Array | number[]],
    Result_1
  >,
  'sign_llm_query' : ActorMethod<[string], Result>,
  'upload_encrypted_dataset' : ActorMethod<
    [string, Uint8Array | number[], string, number],
    Result
  >,
  'upload_private_data' : ActorMethod<
    [string, Uint8Array | number[], string],
    Result
  >,
  'vetkd_encrypted_key' : ActorMethod<
    [Uint8Array | number[], Uint8Array | number[]],
    VetkdEncryptedKeyResponse
  >,
  'vetkd_public_key' : ActorMethod<[], VetkdPublicKeyResponse>,
  'vote_on_computation_request' : ActorMethod<[string, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
