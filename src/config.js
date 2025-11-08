// Configurações Globais do Sistema
export const CONFIG = {
  // URL da sua API no Render.com
  API_BASE_URL: 'https://hyperliquid-whale-backend.onrender.com',
  
  // Tempo de atualização automática (em milissegundos)
  REFRESH_INTERVAL: 30000, // 30 segundos
  
  // Timeout para requisições HTTP
  REQUEST_TIMEOUT: 10000, // 10 segundos
  
  // Número de tentativas em caso de erro
  MAX_RETRIES: 3,
  
  // Delay entre tentativas (em milissegundos)
  RETRY_DELAY: 2000, // 2 segundos
};

// URLs dos endpoints
export const ENDPOINTS = {
  HEALTH: '/api/health',
  WHALES: '/api/whales',
  WHALE_DETAILS: (address) => `/api/whale/${address}`,
  POSITIONS: (address) => `/api/positions/${address}`,
  TRADES: (address) => `/api/trades/${address}`,
  STATS: '/api/stats',
  ADD_WHALE: '/api/whale/add',
};

// Status da wallet
export const WALLET_STATUS = {
  ONLINE: 'online',
  WARNING: 'warning',
  OFFLINE: 'offline',
};

// Emojis de status
export const STATUS_EMOJI = {
  [WALLET_STATUS.ONLINE]: '🟢',
  [WALLET_STATUS.WARNING]: '🟡',
  [WALLET_STATUS.OFFLINE]: '🔴',
};

// Links dos explorers
export const EXPLORER_URLS = {
  HYPURRSCAN: 'https://hypurrscan.io/address/',
  HYPERDASH: 'https://app.hyperliquid.xyz/explorer/',
};
