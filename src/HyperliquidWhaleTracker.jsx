import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, TrendingUp, TrendingDown, Activity, AlertTriangle, Clock, 
         ChevronDown, ChevronUp, Plus, ExternalLink, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { apiService } from './api-service';
import { CONFIG, WALLET_STATUS, STATUS_EMOJI, EXPLORER_URLS } from './config';

/**
 * Hyperliquid Whale Tracker V24 - Conectado com API Real
 * Mantém todo o visual original, mas com dados ao vivo!
 */
const HyperliquidWhaleTracker = () => {
  // ============================================================================
  // ESTADOS - Gerenciamento de dados
  // ============================================================================
  
  // Dados das whales
  const [whales, setWhales] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedWhale, setSelectedWhale] = useState(null);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('command-center');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking'); // checking, online, offline
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Estados de expansão (Command Center)
  const [expandedMetrics, setExpandedMetrics] = useState({
    liquidations1D: false,
    liquidations7D: false,
    liquidations1M: false
  });
  
  // Modal de adicionar wallet
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletNickname, setNewWalletNickname] = useState('');

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  /**
   * Verifica status da API
   */
  const checkApiHealth = useCallback(async () => {
    try {
      await apiService.checkHealth();
      setApiStatus('online');
      return true;
    } catch (error) {
      console.error('API Health Check falhou:', error);
      setApiStatus('offline');
      return false;
    }
  }, []);

  /**
   * Carrega todas as whales
   */
  const loadWhales = useCallback(async () => {
    try {
      const data = await apiService.getWhales();
      setWhales(data);
      setError(null);
      
      // Se tem whales e nenhuma selecionada, seleciona a primeira
      if (data.length > 0 && !selectedWhale) {
        setSelectedWhale(data[0]);
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao carregar whales:', error);
      setError('Não foi possível carregar as whales. Tentando novamente...');
      throw error;
    }
  }, [selectedWhale]);

  /**
   * Carrega estatísticas globais
   */
  const loadStats = useCallback(async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      throw error;
    }
  }, []);

  /**
   * Carrega posições de uma whale específica
   */
  const loadPositions = useCallback(async (address) => {
    if (!address) return;
    
    try {
      const data = await apiService.getPositions(address);
      setPositions(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
      setPositions([]);
      throw error;
    }
  }, []);

  /**
   * Carrega trades de uma whale específica
   */
  const loadTrades = useCallback(async (address) => {
    if (!address) return;
    
    try {
      const data = await apiService.getTrades(address, 50);
      setTrades(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar trades:', error);
      setTrades([]);
      throw error;
    }
  }, []);

  /**
   * Carrega todos os dados (função principal)
   */
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verifica API
      const isHealthy = await checkApiHealth();
      
      if (!isHealthy) {
        throw new Error('API está offline');
      }
      
      // Carrega dados em paralelo
      await Promise.all([
        loadWhales(),
        loadStats(),
      ]);
      
      // Se tem whale selecionada, carrega seus detalhes
      if (selectedWhale) {
        await Promise.all([
          loadPositions(selectedWhale.address),
          loadTrades(selectedWhale.address),
        ]);
      }
      
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message || 'Erro ao conectar com a API');
    } finally {
      setIsLoading(false);
    }
  }, [checkApiHealth, loadWhales, loadStats, loadPositions, loadTrades, selectedWhale]);

  /**
   * Adiciona nova whale
   */
  const handleAddWhale = async () => {
    if (!newWalletAddress || !newWalletNickname) {
      alert('Preencha todos os campos!');
      return;
    }
    
    try {
      setIsLoading(true);
      await apiService.addWhale(newWalletAddress, newWalletNickname);
      
      // Recarrega whales
      await loadWhales();
      
      // Limpa form e fecha modal
      setNewWalletAddress('');
      setNewWalletNickname('');
      setShowAddWallet(false);
      
      alert('Whale adicionada com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar whale: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // EFFECTS - Carregamento inicial e auto-refresh
  // ============================================================================

  // Carregamento inicial
  useEffect(() => {
    loadAllData();
  }, []);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh ativado');
      loadAllData();
    }, CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [autoRefresh, loadAllData]);

  // Quando seleciona uma whale, carrega seus detalhes
  useEffect(() => {
    if (selectedWhale) {
      loadPositions(selectedWhale.address);
      loadTrades(selectedWhale.address);
    }
  }, [selectedWhale, loadPositions, loadTrades]);

  // ============================================================================
  // FUNÇÕES AUXILIARES DE UI
  // ============================================================================

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    const formatted = Math.abs(value).toFixed(2);
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case WALLET_STATUS.ONLINE: return 'text-green-400';
      case WALLET_STATUS.WARNING: return 'text-yellow-400';
      case WALLET_STATUS.OFFLINE: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const toggleMetricExpansion = (metric) => {
    setExpandedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  // ============================================================================
  // COMPONENTES DE UI - Loading e Error States
  // ============================================================================

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-400">Carregando dados ao vivo...</p>
      </div>
    </div>
  );

  const ErrorMessage = ({ message, onRetry }) => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4 bg-red-500/10 border border-red-500/30 rounded-lg p-8">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-red-400 text-center">{message}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );

  // Status da API no header
  const ApiStatusIndicator = () => (
    <div className="flex items-center gap-2">
      {apiStatus === 'online' ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">API Online</span>
        </>
      ) : apiStatus === 'offline' ? (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">API Offline</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
          <span className="text-yellow-400 text-sm">Verificando...</span>
        </>
      )}
    </div>
  );

  // Continua na parte 2...
  // Continuação da parte 1...

  // ============================================================================
  // RENDER - Header
  // ============================================================================

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border-b border-purple-500/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🐋 Hyperliquid Whale Tracker V24
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitoramento em tempo real de whales institucionais
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <ApiStatusIndicator />
          
          {lastUpdate && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Última atualização: {formatDate(lastUpdate)}</span>
            </div>
          )}
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Pausado'}
          </button>
          
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER - Command Center Tab
  // ============================================================================

  const renderCommandCenter = () => {
    if (!stats) {
      return <LoadingSpinner />;
    }

    return (
      <div className="space-y-6">
        {/* Métricas Principais */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Wallet className="w-4 h-4" />
              <span>Total de Whales</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total_whales || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Valor Total</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{formatCurrency(stats.total_value_tracked)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Activity className="w-4 h-4" />
              <span>PnL 24h</span>
            </div>
            <p className={`text-3xl font-bold ${stats.total_pnl_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.total_pnl_24h)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Status</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="text-green-400">{STATUS_EMOJI.online} {stats.online_whales}</span>
              <span className="text-yellow-400">{STATUS_EMOJI.warning} {stats.warning_whales}</span>
              <span className="text-red-400">{STATUS_EMOJI.offline} {stats.offline_whales}</span>
            </div>
          </div>
        </div>

        {/* Posições LONG/SHORT */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-lg font-semibold text-green-400">Posições LONG</span>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats.long_positions || 0}</span>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-lg font-semibold text-red-400">Posições SHORT</span>
              </div>
              <span className="text-2xl font-bold text-red-400">{stats.short_positions || 0}</span>
            </div>
          </div>
        </div>

        {/* Liquidações Expandíveis - Simulado */}
        <div className="space-y-3">
          {['1D', '7D', '1M'].map((period) => {
            const metricKey = `liquidations${period}`;
            const isExpanded = expandedMetrics[metricKey];
            
            return (
              <div key={period} className="bg-gray-800/50 border border-gray-700/50 rounded-lg">
                <button
                  onClick={() => toggleMetricExpansion(metricKey)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Liquidações ({period})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">
                      {period === '1D' ? '2 eventos' : period === '7D' ? '8 eventos' : '15 eventos'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-700/50 p-4 space-y-2">
                    <p className="text-gray-400 text-sm">
                      Detalhes das liquidações do período {period}
                    </p>
                    <p className="text-gray-500 text-xs">
                      * Dados detalhados em desenvolvimento
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER - Posições Tab
  // ============================================================================

  const renderPositions = () => {
    if (!selectedWhale) {
      return (
        <div className="text-center text-gray-400 py-12">
          Selecione uma whale para ver as posições
        </div>
      );
    }

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (positions.length === 0) {
      return (
        <div className="text-center text-gray-400 py-12">
          Nenhuma posição aberta
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Posições Abertas - {selectedWhale.nickname}
          </h3>
          <span className="text-gray-400">{positions.length} posições</span>
        </div>

        <div className="grid gap-3">
          {positions.map((position, index) => (
            <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">{position.symbol}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    position.side === 'LONG' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {position.side}
                  </span>
                  <span className="text-gray-400 text-sm">{position.leverage}x</span>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(position.pnl)}
                  </p>
                  <p className={`text-sm ${position.pnl_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(position.pnl_percentage)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Tamanho</p>
                  <p className="text-white font-semibold">{position.size.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Entrada</p>
                  <p className="text-white font-semibold">{formatCurrency(position.entry_price)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Atual</p>
                  <p className="text-white font-semibold">{formatCurrency(position.current_price)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Liquidação</p>
                  <p className="text-red-400 font-semibold">
                    {position.liquidation_price ? formatCurrency(position.liquidation_price) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Continua na parte 3...
  // Continuação da parte 2...

  // ============================================================================
  // RENDER - Trades Tab
  // ============================================================================

  const renderTrades = () => {
    if (!selectedWhale) {
      return (
        <div className="text-center text-gray-400 py-12">
          Selecione uma whale para ver os trades
        </div>
      );
    }

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (trades.length === 0) {
      return (
        <div className="text-center text-gray-400 py-12">
          Nenhum trade recente
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Histórico de Trades - {selectedWhale.nickname}
          </h3>
          <span className="text-gray-400">{trades.length} trades</span>
        </div>

        <div className="space-y-2">
          {trades.map((trade, index) => (
            <div key={index} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    trade.side === 'BUY' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.side}
                  </span>
                  <span className="text-white font-semibold">{trade.symbol}</span>
                  <span className="text-gray-400 text-sm">{trade.size.toFixed(4)} @ {formatCurrency(trade.price)}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(trade.total_value)}</p>
                  <p className="text-gray-400 text-xs">{formatDate(trade.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER - Lista de Whales (Sidebar)
  // ============================================================================

  const renderWhalesList = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Whales Monitoradas</h3>
        <button
          onClick={() => setShowAddWallet(true)}
          className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Add Wallet</span>
        </button>
      </div>

      {whales.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>Nenhuma whale monitorada</p>
          <p className="text-sm mt-2">Adicione uma whale para começar</p>
        </div>
      ) : (
        whales.map((whale) => {
          const isSelected = selectedWhale?.address === whale.address;
          
          return (
            <div
              key={whale.address}
              onClick={() => setSelectedWhale(whale)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xl ${getStatusColor(whale.status)}`}>
                    {STATUS_EMOJI[whale.status]}
                  </span>
                  <span className="font-semibold text-white">{whale.nickname}</span>
                </div>
                <a
                  href={`${EXPLORER_URLS.HYPURRSCAN}${whale.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor Total:</span>
                  <span className="text-white font-semibold">{formatCurrency(whale.total_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PnL 24h:</span>
                  <span className={whale.pnl_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {formatCurrency(whale.pnl_24h)} ({formatPercentage(whale.pnl_percentage)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Posições:</span>
                  <span className="text-white">{whale.positions_count}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Endereço:</span>
                  <span className="text-gray-400 font-mono">{formatAddress(whale.address)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // ============================================================================
  // RENDER - Modal Add Wallet
  // ============================================================================

  const renderAddWalletModal = () => {
    if (!showAddWallet) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 max-w-md w-full shadow-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">Adicionar Nova Whale</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Endereço da Wallet</label>
              <input
                type="text"
                value={newWalletAddress}
                onChange={(e) => setNewWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Nickname</label>
              <input
                type="text"
                value={newWalletNickname}
                onChange={(e) => setNewWalletNickname(e.target.value)}
                placeholder="Whale Master"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddWhale}
                disabled={isLoading || !newWalletAddress || !newWalletNickname}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddWallet(false);
                  setNewWalletAddress('');
                  setNewWalletNickname('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {renderHeader()}
      
      {/* Mostrar erro global se houver */}
      {error && apiStatus === 'offline' && (
        <div className="bg-red-500/10 border-b border-red-500/30 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Reconectar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Lista de Whales */}
          <div className="col-span-3">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 sticky top-6">
              {renderWhalesList()}
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="col-span-9">
            {/* Tabs Navigation */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-2 mb-6 flex gap-2">
              {[
                { id: 'command-center', label: 'Command Center', icon: Activity },
                { id: 'positions', label: 'Posições', icon: TrendingUp },
                { id: 'trades', label: 'Trades', icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6">
              {activeTab === 'command-center' && renderCommandCenter()}
              {activeTab === 'positions' && renderPositions()}
              {activeTab === 'trades' && renderTrades()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add Wallet */}
      {renderAddWalletModal()}
    </div>
  );
};

export default HyperliquidWhaleTracker;
