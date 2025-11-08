import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Bell, Activity, Target, Brain, 
  Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, 
  ExternalLink, Clock, Zap, Users, Settings, Power, Plus, 
  ChevronDown, Trash2, AlertTriangle, X
} from 'lucide-react';
import { apiService } from './api-service.js';
import { CONFIG } from './config.js';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function HyperliquidWhaleTracker() {
  // Estados principais
  const [tab, setTab] = useState('command');
  const [whalesData, setWhalesData] = useState([]);
  const [selectedWhale, setSelectedWhale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online'); // online, warning, offline
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [whaleToDelete, setWhaleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dados mockados para liquidação (podem vir da API depois)
  const liquidationData = {
    '1D': { total: 2340000, trades: 12, profit: 450000, longs: 8, shorts: 4 },
    '7D': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1W': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1M': { total: 24500000, trades: 234, profit: 4870000, longs: 145, shorts: 89 },
  };

  // ============================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================

  useEffect(() => {
    loadWhalesData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadWhalesData, CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  async function loadWhalesData() {
    try {
      setError(null);
      
      // Health check primeiro
      const health = await apiService.healthCheck();
      
      if (!health.success) {
        setSystemStatus('offline');
        throw new Error('API está offline');
      }
      
      setSystemStatus('online');
      
      // Carrega dados das whales
      const response = await apiService.getWhales();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar dados');
      }
      
      setWhalesData(response.data);
      
      // Seleciona primeira whale se nenhuma estiver selecionada
      if (!selectedWhale && response.data.length > 0) {
        setSelectedWhale(response.data[0]);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message);
      setSystemStatus('offline');
      setLoading(false);
    }
  }

  // ============================================
  // FUNÇÃO DE DELETAR WHALE
  // ============================================

  function openDeleteModal(whale) {
    setWhaleToDelete(whale);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setWhaleToDelete(null);
  }

  async function confirmDelete() {
    if (!whaleToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      const response = await apiService.deleteWhale(whaleToDelete.address);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao deletar whale');
      }
      
      // Remove da lista local
      setWhalesData(prev => prev.filter(w => w.address !== whaleToDelete.address));
      
      // Se era a whale selecionada, seleciona outra
      if (selectedWhale?.address === whaleToDelete.address) {
        const remaining = whalesData.filter(w => w.address !== whaleToDelete.address);
        setSelectedWhale(remaining[0] || null);
      }
      
      closeDeleteModal();
      
    } catch (err) {
      console.error('Erro ao deletar whale:', err);
      alert(`Erro ao deletar whale: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ============================================
  // FUNÇÃO DE STATUS
  // ============================================

  function getSystemStatusDisplay() {
    const statusConfig = {
      online: { 
        color: 'bg-green-500', 
        text: 'ONLINE', 
        pulse: 'animate-pulse', 
        emoji: '🟢' 
      },
      warning: { 
        color: 'bg-yellow-500', 
        text: 'ALERTA', 
        pulse: 'animate-pulse', 
        emoji: '🟡' 
      },
      offline: { 
        color: 'bg-red-500', 
        text: 'OFFLINE', 
        pulse: '', 
        emoji: '🔴' 
      }
    };
    return statusConfig[systemStatus];
  }

  const status = getSystemStatusDisplay();

  // ============================================
  // FUNÇÕES AUXILIARES DE FORMATAÇÃO
  // ============================================

  function formatCurrency(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // ============================================
  // RENDERIZAÇÃO - LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-400">Carregando dados das whales...</p>
          <p className="text-sm text-slate-500 mt-2">Isso pode demorar até 60 segundos</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇÃO - ERRO
  // ============================================

  if (error && whalesData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={loadWhalesData}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      
      {/* ========================================== */}
      {/* ESTILO DA SCROLLBAR MELHORADA */}
      {/* ========================================== */}
      
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.3);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
        }
      `}</style>

      {/* ========================================== */}
      {/* HEADER COM STATUS INOVADOR */}
      {/* ========================================== */}
      
      <div className="mb-8 bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          
          {/* Logo e Título */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 transform hover:scale-105 transition-all">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hyperliquid Whale Tracker V24
              </h1>
              <p className="text-slate-400 text-sm">Monitoramento institucional em tempo real</p>
            </div>
          </div>

          {/* Status Indicator 3D Inovador */}
          <div className="flex items-center gap-3 bg-slate-900/50 px-6 py-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{status.emoji}</span>
              <div className={`w-3 h-3 rounded-full ${status.color} ${status.pulse}`}></div>
            </div>
            <span className="font-bold text-lg">{status.text}</span>
          </div>
          
        </div>
      </div>

      {/* ========================================== */}
      {/* MENU DE TABS */}
      {/* ========================================== */}
      
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'command', label: 'Command Center', icon: Target },
          { id: 'positions', label: 'Posições', icon: BarChart3 },
          { id: 'trades', label: 'Trades', icon: TrendingUp },
          { id: 'orders', label: 'Orders', icon: Bell },
          { id: 'ai-token', label: 'IA Token', icon: Brain },
          { id: 'ai-wallet', label: 'IA Wallet', icon: Eye },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'risk', label: 'Risco', icon: AlertTriangle },
          { id: 'simulator', label: 'Simulador', icon: Zap },
          { id: 'leaderboard', label: 'Leaderboard', icon: Award },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              tab === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* LAYOUT PRINCIPAL: SIDEBAR + CONTEÚDO */}
      {/* ========================================== */}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ========================================== */}
        {/* SIDEBAR: LISTA DE WHALES */}
        {/* ========================================== */}
        
        <div className="lg:col-span-1">
          
          {/* Botão Add Wallet Melhorado */}
          <button className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">
            <Plus className="w-5 h-5" />
            Add Wallet
          </button>

          {/* Lista de Whales */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {whalesData.map((whale) => (
              <div
                key={whale.address}
                onClick={() => setSelectedWhale(whale)}
                className={`bg-slate-800/50 backdrop-blur-xl border rounded-xl p-4 cursor-pointer transition-all hover:shadow-xl ${
                  selectedWhale?.address === whale.address
                    ? 'border-blue-500 shadow-lg shadow-blue-500/30'
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                {/* Header da Whale com Botão Excluir */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xs font-bold">
                        {whale.nickname?.slice(0, 2) || 'W'}
                      </div>
                      <h3 className="font-bold text-white">{whale.nickname}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {formatAddress(whale.address)}
                    </p>
                  </div>
                  
                  {/* Botão Excluir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(whale);
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                    title="Excluir whale"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* Métricas da Whale */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Valor Total</span>
                    <span className="font-bold text-green-400">
                      {formatCurrency(whale.total_value)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Posições</span>
                    <span className="font-bold text-blue-400">
                      {whale.positions_count}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">PnL 24h</span>
                    <span className={`font-bold ${whale.pnl_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {whale.pnl_24h >= 0 ? '+' : ''}{formatCurrency(whale.pnl_24h)}
                    </span>
                  </div>
                  
                  {/* Badge de Risco */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Risco</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      whale.risk_level === 'SAFE' ? 'bg-green-500/20 text-green-400' :
                      whale.risk_level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {whale.risk_level}
                    </span>
                  </div>
                  
                  {/* Link do Explorer */}
                  <a
                    href={whale.wallet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
                  >
                    Ver no Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================== */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ========================================== */}
        
        <div className="lg:col-span-3">
          
          {/* Command Center */}
          {tab === 'command' && (
            <div className="space-y-6">
              
              {/* Cards de Métricas Globais com LONG/SHORT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Value */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Valor Total</span>
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(whalesData.reduce((sum, w) => sum + w.total_value, 0))}
                  </p>
                </div>
                
                {/* Posições Abertas com LONG/SHORT */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Posições</span>
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {whalesData.reduce((sum, w) => sum + w.positions_count, 0)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      LONG: 45
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      SHORT: 23
                    </span>
                  </div>
                </div>
                
                {/* PnL 24h */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">PnL 24h</span>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    +{formatCurrency(whalesData.reduce((sum, w) => sum + w.pnl_24h, 0))}
                  </p>
                </div>
                
                {/* Whales Ativas */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Whales Ativas</span>
                    <Users className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold">{whalesData.length}</p>
                </div>
                
              </div>

              {/* Dados de Liquidação Expansíveis */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Métricas de Liquidação
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(liquidationData).map(([period, data]) => (
                    <div 
                      key={period}
                      className="cursor-pointer hover:bg-slate-700/30 rounded-lg p-4 transition-all"
                      onClick={() => setExpandedMetric(expandedMetric === period ? null : period)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-bold">{period}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedMetric === period ? 'rotate-180' : ''}`} />
                      </div>
                      
                      <p className="text-lg font-bold text-red-400">
                        {formatCurrency(data.total)}
                      </p>
                      
                      {expandedMetric === period && (
                        <div className="mt-3 space-y-2 border-t border-slate-700 pt-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Trades</span>
                            <span className="text-white">{data.trades}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Lucro</span>
                            <span className="text-green-400">+{formatCurrency(data.profit)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">LONGS</span>
                            <span className="text-green-400">{data.longs}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">SHORTS</span>
                            <span className="text-red-400">{data.shorts}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Outras Tabs (mockup simples) */}
          {tab !== 'command' && (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-lg">
                Conteúdo da aba <span className="font-bold text-white">{tab}</span> em desenvolvimento...
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ========================================== */}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Confirmar Exclusão
              </h3>
              <button 
                onClick={closeDeleteModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <p className="text-slate-300 mb-2">
              Deseja realmente excluir a whale:
            </p>
            <p className="font-bold text-white mb-1">
              {whaleToDelete?.nickname}
            </p>
            <p className="text-xs text-slate-400 font-mono mb-6">
              {whaleToDelete?.address}
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
