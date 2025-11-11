import { API_CONFIG } from './config';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${i + 1}/${maxRetries} falhou:`, error.message);
      
      if (i < maxRetries - 1) {
        const backoffTime = Math.min(1000 * Math.pow(2, i), 10000);
        await delay(backoffTime);
      }
    }
  }
  
  throw new Error(`Falha após ${maxRetries} tentativas: ${lastError.message}`);
}

export async function fetchWhales() {
  const url = `${API_CONFIG.API_BASE_URL}/whales`;
  console.log('Buscando whales de:', url);
  return fetchWithRetry(url);
}

export async function fetchMonitoringStatus() {
  const url = `${API_CONFIG.API_BASE_URL}/monitoring/status`;
  return fetchWithRetry(url);
}

export async function addWhale(address) {
  const url = `${API_CONFIG.API_BASE_URL}/whales`;
  return fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify({ address }),
  });
}

export async function deleteWhale(address) {
  const url = `${API_CONFIG.API_BASE_URL}/whales/${address}`;
  return fetchWithRetry(url, {
    method: 'DELETE',
  });
}

export async function startMonitoring() {
  const url = `${API_CONFIG.API_BASE_URL}/monitoring/start`;
  return fetchWithRetry(url, {
    method: 'POST',
  });
}

export async function stopMonitoring() {
  const url = `${API_CONFIG.API_BASE_URL}/monitoring/stop`;
  return fetchWithRetry(url, {
    method: 'POST',
  });
}
