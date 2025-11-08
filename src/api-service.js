import { CONFIG, ENDPOINTS } from './config';

/**
 * Service Layer - Centraliza todas as chamadas HTTP
 * ATUALIZADO com timeout maior e função de deletar
 */
class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.REQUEST_TIMEOUT;
  }

  /**
   * Função auxiliar para fazer requests com timeout e retry
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Backend está demorando muito (API Hyperliquid pode estar lenta). Tente novamente em 30s.');
      }
      
      throw error;
    }
  }

  /**
   * Função com retry automático
   */
  async fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRIES) {
    try {
      return await this.fetchWithTimeout(url, options);
    } catch (error) {
      if (retries > 0 && !error.message.includes('404')) {
        console.warn(`Tentando novamente... (${CONFIG.MAX_RETRIES - retries + 1}/${CONFIG.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Health Check - Verifica se a API está funcionando
   */
  async checkHealth() {
    const url = `${this.baseUrl}${ENDPOINTS.HEALTH}`;
    return await this.fetchWithTimeout(url);
  }

  /**
   * Busca todas as whales monitoradas
   */
  async getWhales() {
    const url = `${this.baseUrl}${ENDPOINTS.WHALES}`;
    return await this.fetchWithRetry(url);
  }

  /**
   * Busca detalhes de uma whale específica
   */
  async getWhaleDetails(address) {
    const url = `${this.baseUrl}${ENDPOINTS.WHALE_DETAILS(address)}`;
    return await this.fetchWithRetry(url);
  }

  /**
   * Busca posições abertas de uma whale
   */
  async getPositions(address) {
    const url = `${this.baseUrl}${ENDPOINTS.POSITIONS(address)}`;
    return await this.fetchWithRetry(url);
  }

  /**
   * Busca histórico de trades de uma whale
   */
  async getTrades(address, limit = 50) {
    const url = `${this.baseUrl}${ENDPOINTS.TRADES(address)}?limit=${limit}`;
    return await this.fetchWithRetry(url);
  }

  /**
   * Busca estatísticas globais
   */
  async getStats() {
    const url = `${this.baseUrl}${ENDPOINTS.STATS}`;
    return await this.fetchWithRetry(url);
  }

  /**
   * Adiciona uma nova whale para monitoramento
   */
  async addWhale(address, nickname) {
    const url = `${this.baseUrl}${ENDPOINTS.ADD_WHALE}?address=${address}&nickname=${nickname}`;
    return await this.fetchWithRetry(url, {
      method: 'POST',
    });
  }

  /**
   * NOVO! Remove uma whale do monitoramento
   */
  async deleteWhale(address) {
    const url = `${this.baseUrl}${ENDPOINTS.DELETE_WHALE(address)}`;
    return await this.fetchWithRetry(url, {
      method: 'DELETE',
    });
  }
}

// Exporta instância única (Singleton)
export const apiService = new ApiService();

// Exporta também a classe para testes
export default ApiService;
