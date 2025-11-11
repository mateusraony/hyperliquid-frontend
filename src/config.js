// ============================================
// CONFIGURAÇÕES DO HYPERLIQUID WHALE TRACKER
// ============================================

export const CONFIG = {
  // URL da API no Render.com
  API_BASE_URL: 'https://hyperliquid-whale-backend.onrender.com',
  
  // Tempo de atualização automática (30 segundos)
  REFRESH_INTERVAL: 30000,
  
  // ✅ TIMEOUT AUMENTADO: 60 SEGUNDOS
  // A API pode demorar até 50s para processar 11 whales
  REQUEST_TIMEOUT: 60000,
  
  // Número de tentativas em caso de erro
  MAX_RETRIES: 3,
  
  // Delay entre tentativas (5 segundos)
  RETRY_DELAY: 5000,
  
  // Timeout para health check (mais curto)
  HEALTH_CHECK_TIMEOUT: 10000,

  // Timeout de 60 segundos para processamento das whales
  API_TIMEOUT: 60000,
  
};

// ============================================
// ENDPOINTS DA API
// ============================================

export const ENDPOINTS = {
  // Health check
  HEALTH: '/api/health',
  
  // Lista de whales
  WHALES: '/api/whales',
  
  // Detalhes de whale específica
  WHALE_DETAILS: (address) => `/api/whale/${address}`,
  
  // Posições abertas
  POSITIONS: (address) => `/api/positions/${address}`,
  
  // Histórico de trades
  TRADES: (address) => `/api/trades/${address}`,
  
  // Estatísticas globais
  STATS: '/api/stats',
  
  // Adicionar whale
  ADD_WHALE: '/api/whale/add',
  
  // ✅ NOVO: Deletar whale
  DELETE_WHALE: (address) => `/api/whale/delete/${address}`,
  
  // Forçar atualização
  REFRESH: '/api/refresh',
};

// ============================================
// MENSAGENS DE ERRO
// ============================================

export const ERROR_MESSAGES = {
  TIMEOUT: 'API está demorando muito para responder. A API pode estar processando dados das whales, aguarde 1 minuto e tente novamente.',
  NETWORK: 'Erro de conexão com a API. Verifique sua internet.',
  SERVER: 'Servidor está processando muitas requisições. Aguarde alguns segundos.',
  NOT_FOUND: 'Recurso não encontrado.',
  UNKNOWN: 'Erro desconhecido. Tente novamente.',
};

// ============================================
// CORES E TEMAS
// ============================================

export const THEME = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
  },
  
  gradients: {
    primary: 'from-blue-600 to-purple-600',
    success: 'from-green-500 to-emerald-600',
    danger: 'from-red-500 to-rose-600',
    warning: 'from-yellow-500 to-orange-600',
  },
};

// ============================================
// CONFIGURAÇÕES DE NOTIFICAÇÃO
// ============================================

export const NOTIFICATION_CONFIG = {
  // Tempo de exibição (ms)
  duration: 5000,
  
  // Posição na tela
  position: 'top-right',
  
  // Animação
  animation: 'slide',
};

export default CONFIG;
