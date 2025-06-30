export const idlFactory = ({ IDL }) => {
  const ChatMessage = IDL.Record({ 'content' : IDL.Text, 'role' : IDL.Text });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Vec(IDL.Nat8), 'Err' : IDL.Text });
  const ComputationResult = IDL.Record({
    'insights' : IDL.Text,
    'timestamp' : IDL.Nat64,
    'privacy_proof' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : ComputationResult, 'Err' : IDL.Text });
  const Vote = IDL.Record({
    'decision' : IDL.Text,
    'voter' : IDL.Principal,
    'timestamp' : IDL.Nat64,
  });
  const MPCComputation = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'required_parties' : IDL.Nat32,
    'title' : IDL.Text,
    'requester' : IDL.Principal,
    'vetkey_derivation_complete' : IDL.Bool,
    'votes' : IDL.Vec(Vote),
    'received_signatures' : IDL.Vec(IDL.Principal),
    'description' : IDL.Text,
    'created_at' : IDL.Nat64,
    'results' : IDL.Opt(IDL.Text),
    'signature_id' : IDL.Opt(IDL.Text),
    'required_signatures' : IDL.Vec(IDL.Principal),
    'approvals' : IDL.Vec(IDL.Principal),
  });
  const PrivateDataSource = IDL.Record({
    'id' : IDL.Text,
    'encrypted_data' : IDL.Vec(IDL.Nat8),
    'owner' : IDL.Principal,
    'schema' : IDL.Text,
    'name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'access_permissions' : IDL.Vec(IDL.Principal),
    'party_name' : IDL.Text,
    'vetkey_id' : IDL.Text,
    'record_count' : IDL.Nat32,
  });
  const Result_3 = IDL.Variant({ 'Ok' : MPCComputation, 'Err' : IDL.Text });
  const QueryStatus = IDL.Variant({
    'Executing' : IDL.Null,
    'Approved' : IDL.Null,
    'Rejected' : IDL.Null,
    'Completed' : IDL.Null,
    'Expired' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const LLMQueryRequest = IDL.Record({
    'id' : IDL.Text,
    'status' : QueryStatus,
    'result' : IDL.Opt(IDL.Text),
    'requester' : IDL.Principal,
    'received_signatures' : IDL.Vec(IDL.Principal),
    'query' : IDL.Text,
    'created_at' : IDL.Nat64,
    'target_datasets' : IDL.Vec(IDL.Text),
    'required_signatures' : IDL.Vec(IDL.Principal),
    'expires_at' : IDL.Nat64,
  });
  const PartyInfo = IDL.Record({
    'principal' : IDL.Principal,
    'name' : IDL.Text,
    'role' : IDL.Text,
    'last_seen' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'vetkey_id' : IDL.Text,
  });
  const VetkdEncryptedKeyResponse = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : IDL.Text,
  });
  const VetkdPublicKeyResponse = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'chat' : IDL.Func([IDL.Vec(ChatMessage)], [IDL.Text], []),
    'create_computation_request' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'create_llm_query' : IDL.Func([IDL.Text, IDL.Vec(IDL.Text)], [Result], []),
    'derive_agent_encryption_key' : IDL.Func([IDL.Text], [Result_1], []),
    'execute_computation_request' : IDL.Func([IDL.Text], [Result], []),
    'execute_llm_query' : IDL.Func([IDL.Text], [Result], []),
    'execute_secure_mpc_computation' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result_2],
        [],
      ),
    'generate_privacy_proof' : IDL.Func([IDL.Text], [Result], []),
    'get_all_computation_requests' : IDL.Func(
        [],
        [IDL.Vec(MPCComputation)],
        ['query'],
      ),
    'get_all_data_sources' : IDL.Func(
        [],
        [IDL.Vec(PrivateDataSource)],
        ['query'],
      ),
    'get_all_datasets' : IDL.Func([], [IDL.Vec(PrivateDataSource)], ['query']),
    'get_computation_request' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'get_data_sources_for_user' : IDL.Func(
        [],
        [IDL.Vec(PrivateDataSource)],
        ['query'],
      ),
    'get_llm_queries' : IDL.Func([], [IDL.Vec(LLMQueryRequest)], ['query']),
    'get_pending_queries_for_user' : IDL.Func(
        [],
        [IDL.Vec(LLMQueryRequest)],
        ['query'],
      ),
    'get_query_by_id' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(LLMQueryRequest)],
        ['query'],
      ),
    'get_registered_parties' : IDL.Func([], [IDL.Vec(PartyInfo)], ['query']),
    'get_user_identity' : IDL.Func([], [Result], ['query']),
    'prompt' : IDL.Func([IDL.Text], [IDL.Text], []),
    'register_party' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'register_user_identity' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'save_computation_results' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'secure_agent_communication' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8)],
        [Result_1],
        [],
      ),
    'sign_llm_query' : IDL.Func([IDL.Text], [Result], []),
    'upload_encrypted_dataset' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text, IDL.Nat32],
        [Result],
        [],
      ),
    'upload_private_data' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text],
        [Result],
        [],
      ),
    'vetkd_encrypted_key' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Nat8)],
        [VetkdEncryptedKeyResponse],
        [],
      ),
    'vetkd_public_key' : IDL.Func([], [VetkdPublicKeyResponse], []),
    'vote_on_computation_request' : IDL.Func(
        [IDL.Text, IDL.Text],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
