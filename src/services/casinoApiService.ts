import { supabase } from '@/integrations/supabase/client';

// Default fallback constants (legacy)
const DEFAULT_API_BASE_URL = 'https://api.bet-30.co';
const DEFAULT_API_KEY = 'QUs6LWRTRWhUTDNvUjJIdEtsbjZrekRMMjdhdDlkWUFISnNNWi1oMTlpZ19EcURfOF9BV0ZjREZRNTk1VjdkRnA2eDhRNkxKUll3bHA3eXJLZGF3bFlwckE';
const DEFAULT_AGENT_USERNAME = 'agentegeneral1';
const DEFAULT_PARENT_ID = 'cm7m4640502wklh41o1nbhm1w';
const DEFAULT_SKIN_ID = '3c5ccf8f549f';

interface CasinoConfig {
  apiBaseUrl: string;
  apiKey: string;
  agentUsername: string;
  parentId: string;
  skinId: string;
  webhookUrl?: string;
}

interface CasinoApiResponse<T = any> {
  result: T;
  targetUrl: string | null;
  success: boolean;
  error: string | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

interface PlayerBalance { id: string; balance: number; }
interface AgentInfo { userName: string; balance: number; id: string; rolename: string; currency: string; playersCount: number; email: string; name: string; surname: string; }
interface TransactionResult { transactionId: string; status: string; code: string | null; message: string; }

// Fetch casino config for a workspace
export async function getCasinoConfigForWorkspace(workspaceId: string): Promise<CasinoConfig | null> {
  try {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('casino_api_config_id')
      .eq('id', workspaceId)
      .single();

    if (!workspace?.casino_api_config_id) return null;

    const { data: config } = await supabase
      .from('casino_api_configs')
      .select('*')
      .eq('id', workspace.casino_api_config_id)
      .single();

    if (!config) return null;

    return {
      apiBaseUrl: (config as any).api_base_url || DEFAULT_API_BASE_URL,
      apiKey: (config as any).api_key || DEFAULT_API_KEY,
      agentUsername: (config as any).agent_username || DEFAULT_AGENT_USERNAME,
      parentId: (config as any).parent_id || DEFAULT_PARENT_ID,
      skinId: (config as any).skin_id || DEFAULT_SKIN_ID,
      webhookUrl: (config as any).webhook_url || undefined,
    };
  } catch (error) {
    console.error('Error fetching casino config for workspace:', error);
    return null;
  }
}

// Factory: create a casino API client with specific config
function createCasinoApiClient(config: CasinoConfig) {
  const casinoApiRequest = async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<CasinoApiResponse<T>> => {
    const url = new URL(`${config.apiBaseUrl}${endpoint}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));
    }
    const headers: HeadersInit = { 'x-api-key': config.apiKey, 'Content-Type': 'application/json' };
    const fetchConfig: RequestInit = { method, headers };
    if (body && method === 'POST') fetchConfig.body = JSON.stringify(body);
    const response = await fetch(url.toString(), fetchConfig);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    return response.json();
  };

  return {
    getAgentBalance: (agentId: string, username: string) =>
      casinoApiRequest<number>('/api/services/app/Agent/GetAgentBalance', 'GET', null, { agentId, username }),
    getAgentInfo: (agentId: string) =>
      casinoApiRequest<AgentInfo>('/api/services/app/Agent/GetAgentInfo', 'GET', null, { agentId, getParents: 'false', username: config.agentUsername }),
    addPlayer: (userName: string, password: string) =>
      casinoApiRequest<{ id: string; userName: string; status: string }>('/api/services/app/Players/AddPlayer', 'POST', { userName, password, parentId: config.parentId, skinId: config.skinId }),
    doDeposit: (userName: string, amount: number, userType: number = 1) =>
      casinoApiRequest<TransactionResult>('/api/services/app/Players/DoDeposit', 'POST', { userName, userType, agentId: config.parentId, agentUserName: config.agentUsername, amount }, { username: config.agentUsername }),
    doWithdraw: (userName: string, amount: number, userType: number = 1) =>
      casinoApiRequest<TransactionResult>('/api/services/app/Players/DoWithdraw', 'POST', { userName, userType, agentUserName: config.agentUsername, amount }, { username: config.agentUsername }),
    changePassword: (username: string, newPassword: string) =>
      casinoApiRequest<string>('/api/services/app/Agent/ChangePassword', 'POST', {}, { newPassword, username }),
    getPlayerHistory: (userId: string, playerName: string, startTime: string, endTime: string, pageSize = 20, offset = 0) =>
      casinoApiRequest('/api/services/app/Players/Report_HistoryPlayer', 'POST', { userId, startTime, endTime, playerName, includeCountAndTotals: 1, paginationOffset: offset, pageSize }, { username: playerName }),
    getMoneyTransfers: (startTime: string, endTime: string, userType = 'Agent', pageSize = 200) =>
      casinoApiRequest('/api/services/app/Players/Report_MoneyTransfers', 'POST', { StartTime: startTime, EndTime: endTime, UserType: userType, PlayerName: null, UserName: null, FirstLevelUsers: false, IncludeCountAndTotals: 1, AssociatedBrandId: 0, PaginationOffset: 0, PageSize: pageSize, OnlySuperiorTransactions: false, OnlyReceivedTransactions: false }, { username: config.agentUsername }),
    getBalances: (playerIds: string[]) =>
      casinoApiRequest<PlayerBalance[]>('/api/services/app/Agent/GetBalances', 'POST', playerIds),
    getAgentTreeView: (parentId: string) =>
      casinoApiRequest('/api/services/app/Agent/GetAgentTreeView', 'GET', null, { parentId, username: config.agentUsername }),
    createAgentUser: (userName: string, password: string, rolename = 'Agente', email = '', name = '', surname = '', language = 'es') =>
      casinoApiRequest<{ id: string; userName: string; status: string }>('/api/services/app/Agent/CreateAgentUser', 'POST', { userName, password, parentId: config.parentId, skinId: [config.skinId], rolename, email, surname, name, language }, { username: config.agentUsername }),
    constants: { AGENT_USERNAME: config.agentUsername, PARENT_ID: config.parentId, SKIN_ID: config.skinId },
  };
}

// Default client using legacy hardcoded values
const defaultConfig: CasinoConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  apiKey: DEFAULT_API_KEY,
  agentUsername: DEFAULT_AGENT_USERNAME,
  parentId: DEFAULT_PARENT_ID,
  skinId: DEFAULT_SKIN_ID,
};

export const casinoApiService = createCasinoApiClient(defaultConfig);
export { createCasinoApiClient, type CasinoConfig };
