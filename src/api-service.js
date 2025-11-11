// ============================================
// SERVIÇO DE COMUNICAÇÃO COM A API
// ============================================

import { CONFIG, ENDPOINTS, ERROR_MESSAGES } from './config.js';

// ============================================
// FUNÇÃO AUXILIAR: SLEEP
// ============================================

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// FUNÇÃO PRINCIPAL: FAZER REQUISIÇÃO HTTP
// ============================================

async function fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRIES) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || CONFIG.REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeout);

    // Se foi timeout
    if (error.name === 'AbortError') {
      if (retries > 0) {
        console.log(`⏳ Timeout! Tentando novamente... (${retries} tentativas restantes)`);
        await sleep(CONFIG.RETRY_DELAY);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error(ERROR_MESSAGES.TIMEOUT);
    }

    // Se foi erro de rede
    if (error.message.includes('Failed to fetch')) {
      if (retries > 0) {
        console.log(`🔄 Erro de rede! Tentando novamente... (${retries} tentativas restantes)`);
        await sleep(CONFIG.RETRY_DELAY);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error(ERROR_MESSAGES.NETWORK);
    }

    // Outros erros
    if (retries > 0) {
      console.log(`❌ Erro! Tentando novamente... (${retries} tentativas restantes)`);
      await sleep(CONFIG.RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }

    throw error;
  }
}

// ============================================
// API SERVICE - FUNÇÕES PÚBLICAS
// ============================================

export const apiService = {
  
  // --------------------------------------------
  // HEALTH CHECK
  // --------------------------------------------
  
  async healthCheck() {
    try {
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.HEALTH}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
        timeout: CONFIG.HEALTH_CHECK_TIMEOUT,
      }, 1); // Só 1 tentativa para health check
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ Health check falhou:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // --------------------------------------------
  // BUSCAR TODAS AS WHALES
  // --------------------------------------------
  
  async getWhales() {
    try {
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.WHALES}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data: data.whales || [],
        total: data.count || 0,
        lastUpdate: data.last_update,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar whales:', error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  // --------------------------------------------
  // BUSCAR DETALHES DE UMA WHALE
  // --------------------------------------------
  
  async getWhaleDetails(address) {
    try {
      if (!address) throw new Error('Endereço não fornecido');
      
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.WHALE_DETAILS(address)}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar detalhes de ${address}:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // --------------------------------------------
  // BUSCAR POSIÇÕES DE UMA WHALE
  // --------------------------------------------
  
  async getPositions(address) {
    try {
      if (!address) throw new Error('Endereço não fornecido');
      
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.POSITIONS(address)}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data: data.positions || [],
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar posições de ${address}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  // --------------------------------------------
  // BUSCAR TRADES DE UMA WHALE
  // --------------------------------------------
  
  async getTrades(address) {
    try {
      if (!address) throw new Error('Endereço não fornecido');
      
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.TRADES(address)}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data: data.trades || [],
      };
    } catch (error) {
      console.error(`❌ Erro ao buscar trades de ${address}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  // --------------------------------------------
  // BUSCAR ESTATÍSTICAS GLOBAIS
  // --------------------------------------------
  
  async getStats() {
    try {
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.STATS}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // --------------------------------------------
  // ✅ ADICIONAR NOVA WHALE
  // --------------------------------------------
  
  async addWhale(address) {
    try {
      if (!address) throw new Error('Endereço não fornecido');
      
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.ADD_WHALE}`;
      const data = await fetchWithRetry(url, {
        method: 'POST',
        body: JSON.stringify({ address }),
      });
      
      return {
        success: true,
        data,
        message: 'Whale adicionada com sucesso!',
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar whale:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // --------------------------------------------
  // ✅ DELETAR WHALE
  // --------------------------------------------
  
  async deleteWhale(address) {
    try {
      if (!address) throw new Error('Endereço não fornecido');
      
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.DELETE_WHALE(address)}`;
      const data = await fetchWithRetry(url, {
        method: 'DELETE',
      });
      
      return {
        success: true,
        data,
        message: 'Whale removida com sucesso!',
      };
    } catch (error) {
      console.error('❌ Erro ao deletar whale:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // --------------------------------------------
  // FORÇAR ATUALIZAÇÃO DOS DADOS
  // --------------------------------------------
  
  async forceRefresh() {
    try {
      const url = `${CONFIG.API_BASE_URL}${ENDPOINTS.REFRESH}`;
      const data = await fetchWithRetry(url, {
        method: 'GET',
      });
      
      return {
        success: true,
        data,
        message: 'Dados atualizados!',
      };
    } catch (error) {
      console.error('❌ Erro ao forçar atualização:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

};

export default apiService;
