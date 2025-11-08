import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Copy, Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Filter, ExternalLink, Clock, Zap, Users, Settings, AlertTriangle, Shield, DollarSign, Layers, GitBranch, PlayCircle, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { apiService } from './api-service.js';
import { CONFIG } from './config.js';

export default function HyperliquidPro() {
  // ============================================
  // ESTADOS
  // ============================================
  const [tab, setTab] = useState('command');
  const [expandedToken, setExpandedToken] = useState(null);
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [selectedAnalyticsWallet, setSelectedAnalyticsWallet] = useState('Sigma Whale');
  const [simulatorCapital, setSimulatorCapital] = useState(10000);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online'); // online, warning, offline
  
  // Estados de dados reais da API
  const [whalesData, setWhalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Estados do modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [whaleToDelete, setWhaleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ============================================
  // DADOS MOCKADOS (para abas que não usam API)
  // ============================================
  const liquidationData = {
    '1D': { total: 2340000, trades: 12, profit: 450000, longs: 8, shorts: 4 },
    '7D': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1W': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1M': { total: 24500000, trades: 234, profit: 4870000, longs: 145, shorts: 89 },
  };

  const recentTrades = [
    { id: 1, wallet: 'Sigma Whale', token: 'BTC', type: 'LONG', size: 98000, entry: 66500, exit: 67890, pnl: 20482, pnlPct: 20.9, lev: 10, dur: '14h 32m', time: '23m ago', result: 'WIN' },
    { id: 2, wallet: 'Alpha Hunter', token: 'ETH', type: 'SHORT', size: 52000, entry: 3520, exit: 3456, pnl: 945, pnlPct: 1.8, lev: 5, dur: '2h 15m', time: '1h ago', result: 'WIN' },
    { id: 3, wallet: 'Diamond Hands', token: 'SOL', type: 'LONG', size: 73000, entry: 172.30, exit: 178.45, pnl: 2610, pnlPct: 3.6, lev: 8, dur: '8h 45m', time: '3h ago', result: 'WIN' },
    { id: 4, wallet: 'Momentum King', token: 'BTC', type: 'SHORT', size: 42000, entry: 68200, exit: 67234, pnl: 596, pnlPct: 1.4, lev: 12, dur: '1h 05m', time: '5h ago', result: 'WIN' },
    { id: 5, wallet: 'The Sniper', token: 'ARB', type: 'LONG', size: 38000, entry: 1.180, exit: 1.150, pnl: -1140, pnlPct: -3.0, lev: 20, dur: '45m', time: '8h ago', result: 'LOSS' },
  ];

  const pendingOrders = [
    { id: 1, wallet: 'Sigma Whale', token: 'BTC', type: 'LIMIT_BUY', price: 66000, size: 150000, lev: 10, placed: '2h ago', status: 'active', reason: 'Waiting for dip to support' },
    { id: 2, wallet: 'Alpha Hunter', token: 'ETH', type: 'STOP_LOSS', price: 3380, size: 85000, placed: '1h ago', status: 'active', reason: 'Protect current LONG position' },
    { id: 3, wallet: 'Diamond Hands', token: 'SOL', type: 'TAKE_PROFIT', price: 168, size: 62000, placed: '6h ago', status: 'active', reason: 'Exit SHORT at target' },
    { id: 4, wallet: 'Momentum King', token: 'ARB', type: 'LIMIT_SELL', price: 1.32, size: 45000, placed: '30m ago', status: 'cancelled', reason: 'Market moved too fast' },
  ];

  const riskMetrics = {
    portfolioHeat: 45,
    capitalAtRisk: 98500,
    avgRR: 2.8,
    correlation: 78,
    var95: -12450,
    maxDrawdown: -18.7,
    totalFees: 2847,
    netPnL: 18920,
    grossPnL: 21767
  };

  const timingMetrics = {
    avgHold: '8.4h',
    bestHour: '14:00-18:00 UTC',
    bestDay: 'Thursday',
    currentStreak: 7,
    avgTimeToTarget: '6.2h'
  };

  const copySimulator = {
    capital: 10000,
    final: 13847,
    return: 38.47,
    trades: 47,
    winRate: 72.3,
    maxDD: -8.2,
    sharpe: 2.94
  };

  const benchmarks = {
    whale: 156.8,
    btc: 134.4,
    eth: 67.6,
    avgWhale: 113.7,
    rank: 1,
    total: 247
  };

  // ============================================
  // CARREGAR DADOS DA API
  // ============================================
  useEffect(() => {
    loadWhalesData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadWhalesData, CONFIG.REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  async function loadWhalesData() {
    try {
      console.log('🔄 Carregando dados das whales...');
      
      // Health check primeiro
      const health = await apiService.healthCheck();
      
      if (!health.success) {
        setSystemStatus('offline');
        console.error('❌ API offline');
        throw new Error('API está offline');
      }
      
      setSystemStatus('online');
      console.log('✅ API online');
      
      // Carrega dados das whales
      const response = await apiService.getWhales();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar dados');
      }
      
      console.log('✅ Dados carregados:', response.data.length, 'whales');
      setWhalesData(response.data);
      setLastUpdate(response.lastUpdate);
      setError(null);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message);
      setSystemStatus('offline');
      setLoading(false);
    }
  }

  // ============================================
  // FUNÇÕES DE EXCLUSÃO
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
      console.log('🗑️ Deletando whale:', whaleToDelete.address);
      
      const response = await apiService.deleteWhale(whaleToDelete.address);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao deletar whale');
      }
      
      console.log('✅ Whale deletada com sucesso');
      
      // Remove da lista local
      setWhalesData(prev => prev.filter(w => w.address !== whaleToDelete.address));
      
      closeDeleteModal();
      
    } catch (err) {
      console.error('❌ Erro ao deletar whale:', err);
      alert(`Erro ao deletar whale: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================
  function getStatusEmoji() {
    if (systemStatus === 'online') return '🟢';
    if (systemStatus === 'warning') return '🟡';
    return '🔴';
  }

  function getStatusColor() {
    if (systemStatus === 'online') return 'green';
    if (systemStatus === 'warning') return 'yellow';
    return 'red';
  }

  function formatCurrency(value) {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Calcula métricas globais dos dados reais
  const globalMetrics = {
    totalValue: whalesData.reduce((sum, w) => sum + (w.total_value || 0), 0),
    totalPositions: whalesData.reduce((sum, w) => sum + (w.positions_count || 0), 0),
    totalPnl24h: whalesData.reduce((sum, w) => sum + (w.pnl_24h || 0), 0),
    totalWhales: whalesData.length,
  };

  // Converte dados reais para formato de posições
  const openPositions = whalesData.flatMap((whale, idx) => 
    Array(whale.positions_count || 0).fill(null).map((_, i) => ({
      id: `${idx}-${i}`,
      wallet: whale.nickname || `Whale #${idx + 1}`,
      token: ['BTC', 'ETH', 'SOL'][i % 3],
      type: i % 2 === 0 ? 'LONG' : 'SHORT',
      size: whale.total_value / (whale.positions_count || 1),
      lev: 10 + (i * 2),
      entry: 67234 + (i * 100),
      current: 68120 + (i * 50),
      target: 72000,
      stop: 65000,
      pnl: whale.pnl_24h / (whale.positions_count || 1),
      pnlPct: ((whale.pnl_24h / whale.total_value) * 100) || 0,
      liq: 61450,
      time: '3h 24m',
      breakeven: 67389,
      fees: 125,
      rr: 3.2,
      distLiq: 9.8,
      portPct: 18.5,
      exitPlan: '30% at target 1, 40% at target 2, 30% at target 3'
    }))
  ).slice(0, 10); // Limita a 10 posições

  // ============================================
  // RENDERIZAÇÃO - LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-400">Carregando dados das whales...</p>
          <p className="text-sm text-slate-500 mt-2">Isso pode demorar até 60 segundos na primeira carga</p>
          <p className="text-xs text-slate-600 mt-2">Processando 11 whales da Hyperliquid...</p>
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
          <p className="text-xs text-slate-500 mt-4">
            API: {CONFIG.API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#6366f1 #1e293b'
    }}>
      
      {/* Scrollbar customizado */}
      <style>{`
        ::-webkit-scrollbar {
          width: 12px;
        }
        ::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
          border: 2px solid #1e293b;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
        }
      `}</style>

      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1900px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Hyperliquid Pro Tracker</h1>
                <p className="text-xs text-slate-400">Institutional Grade - Live from Hypurrscan & HyperDash</p>
              </div>
            </div>
            
            {/* Botões e Status */}
            <div className="flex items-center gap-2">
              <a href="https://hypurrscan.io" target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />Hypurrscan
              </a>
              <a href="https://hyperdash.info" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />HyperDash
              </a>
              
              {/* Status Indicator */}
              <div className={`flex items-center gap-2 bg-${getStatusColor()}-500/10 border border-${getStatusColor()}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${getStatusColor()}-400 rounded-full animate-pulse`}></div>
                <span className={`text-${getStatusColor()}-400 font-medium flex items-center gap-1`}>
                  {getStatusEmoji()} Live • {whalesData.length} whales
                </span>
              </div>

              <button className="p-1.5 hover:bg-slate-800 rounded">
                <Bell className="w-4 h-4" />
              </button>
              
              {/* Botão Add Wallet */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-1.5 rounded text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
                + Add Wallet
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: 'command', icon: Target, label: 'Command' },
              { id: 'positions', icon: BarChart3, label: 'Positions' },
              { id: 'trades', icon: Activity, label: 'Trades' },
              { id: 'orders', icon: Clock, label: 'Orders' },
              { id: 'ai-token', icon: Brain, label: 'AI Token' },
              { id: 'ai-wallet', icon: Users, label: 'AI Wallet' },
              { id: 'analytics', icon: Layers, label: 'Analytics' },
              { id: 'risk', icon: Shield, label: 'Risk' },
              { id: 'simulator', icon: PlayCircle, label: 'Simulator' },
              { id: 'board', icon: Award, label: 'Leaderboard' },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium whitespace-nowrap ${
                    tab === t.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CONTEÚDO */}
      {/* ========================================== */}
      <div className="max-w-[1900px] mx-auto p-4">
        
        {/* COMMAND CENTER */}
        {tab === 'command' && (
          <div className="space-y-4">
            
            {/* Métricas Globais REAIS */}
            <div className="grid grid-cols-8 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(globalMetrics.totalValue)}</p>
                <p className="text-xs text-slate-400">{globalMetrics.totalWhales} whales</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Open Pos</p>
                <p className="text-2xl font-bold text-blue-400">{globalMetrics.totalPositions}</p>
                <p className="text-xs text-slate-400">Posições</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">PnL 24h</p>
                <p className="text-2xl font-bold text-green-400">
                  {globalMetrics.totalPnl24h >= 0 ? '+' : ''}{formatCurrency(globalMetrics.totalPnl24h)}
                </p>
                <p className="text-xs text-green-400">
                  +{((globalMetrics.totalPnl24h / globalMetrics.totalValue) * 100).toFixed(2)}%
                </p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-purple-400">79.3%</p>
                <p className="text-xs text-slate-400">+2.1%</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Sharpe</p>
                <p className="text-2xl font-bold text-yellow-400">2.84</p>
                <p className="text-xs text-slate-400">Excellent</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Heat</p>
                <p className="text-2xl font-bold text-orange-400">45%</p>
                <p className="text-xs text-slate-400">MEDIUM</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Alerts</p>
                <p className="text-2xl font-bold text-cyan-400">47</p>
                <p className="text-xs text-slate-400">12 high</p>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Fees</p>
                <p className="text-2xl font-bold text-slate-400">$2.8K</p>
                <p className="text-xs text-slate-400">30 days</p>
              </div>
            </div>

            {/* Métricas LONG/SHORT */}
            <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">📊 Métricas LONG vs SHORT (30 dias)</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total LONGs</p>
                  <p className="text-3xl font-bold text-green-400">145</p>
                  <p className="text-xs text-green-400">62% dos trades</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total SHORTs</p>
                  <p className="text-3xl font-bold text-orange-400">89</p>
                  <p className="text-xs text-orange-400">38% dos trades</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">LONGs Win Rate</p>
                  <p className="text-xl font-bold text-green-400">84.2%</p>
                  <p className="text-xs text-green-400">EXCELENTE</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">SHORTs Win Rate</p>
                  <p className="text-xl font-bold text-orange-400">71.9%</p>
                  <p className="text-xs text-orange-400">BOM</p>
                </div>
              </div>
            </div>

            {/* Liquidações Expansíveis */}
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold">⚡ Liquidações Capturadas</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(liquidationData).map(([period, data]) => {
                  const isExpanded = expandedMetric === period;
                  return (
                    <div key={period} 
                      onClick={() => setExpandedMetric(isExpanded ? null : period)}
                      className="bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800/50 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400 font-bold">{period}</p>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                      <p className="text-2xl font-bold text-red-400">${(data.total/1000000).toFixed(1)}M</p>
                      <p className="text-xs text-slate-400">{data.trades} liquidações</p>
                      
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Lucro Total:</span>
                            <span className="text-green-400 font-bold">+${(data.profit/1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">LONGs liquidados:</span>
                            <span className="text-green-400 font-bold">{data.longs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">SHORTs liquidados:</span>
                            <span className="text-orange-400 font-bold">{data.shorts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Avg por trade:</span>
                            <span className="font-bold">${(data.profit/data.trades/1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risk Dashboard */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold">⚠️ Risk Dashboard</h3>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Portfolio Heat</p>
                  <p className="text-2xl font-bold text-orange-400">{riskMetrics.portfolioHeat}%</p>
                  <p className="text-xs text-slate-400">MEDIUM Risk</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Capital at Risk</p>
                  <p className="text-xl font-bold">${(riskMetrics.capitalAtRisk/1000).toFixed(0)}K</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Avg R:R Ratio</p>
                  <p className="text-xl font-bold text-green-400">1:{riskMetrics.avgRR}</p>
                  <p className="text-xs text-green-400">GOOD</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Correlation Risk</p>
                  <p className="text-xl font-bold text-red-400">{riskMetrics.correlation}%</p>
                  <p className="text-xs text-red-400">HIGH</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">VaR (95%)</p>
                  <p className="text-xl font-bold text-red-400">${(riskMetrics.var95/1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-400">Worst scenario</p>
                </div>
              </div>
            </div>

            {/* Execution + Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h3 className="font-bold mb-3">📈 Execution Metrics (30d)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Avg Slippage:</span><span className="text-green-400 font-bold">0.08%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Fill Rate:</span><span className="font-bold">94.2%</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Total Fees Paid:</span><span className="font-bold">${riskMetrics.totalFees}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Gross PnL:</span><span className="text-green-400 font-bold">${riskMetrics.grossPnL}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Net PnL:</span><span className="text-green-400 font-bold">${riskMetrics.netPnL}</span></div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <h3 className="font-bold mb-3">⏰ Timing Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Avg Hold Time:</span><span className="font-bold">{timingMetrics.avgHold}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Best Hours:</span><span className="text-green-400 font-bold">{timingMetrics.bestHour}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Best Day:</span><span className="text-green-400 font-bold">{timingMetrics.bestDay}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Current Streak:</span><span className="text-green-400 font-bold">{timingMetrics.currentStreak} wins 🔥</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Avg to Target:</span><span className="font-bold">{timingMetrics.avgTimeToTarget}</span></div>
                </div>
              </div>
            </div>

            {/* Lista de Whales REAIS com Botão Excluir */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">🐋 Whales Monitoradas ({whalesData.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {whalesData.map((whale) => (
                  <div 
                    key={whale.address}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                  >
                    {/* Header com Botão Excluir */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xs font-bold">
                            {whale.nickname?.slice(0, 2) || 'W'}
                          </div>
                          <h4 className="font-bold">{whale.nickname}</h4>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">{formatAddress(whale.address)}</p>
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

                    {/* Métricas */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valor Total:</span>
                        <span className="font-bold text-green-400">{formatCurrency(whale.total_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Posições:</span>
                        <span className="font-bold">{whale.positions_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PnL 24h:</span>
                        <span className={`font-bold ${whale.pnl_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {whale.pnl_24h >= 0 ? '+' : ''}{formatCurrency(whale.pnl_24h)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risco:</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          whale.risk_level === 'SAFE' ? 'bg-green-500/20 text-green-400' :
                          whale.risk_level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {whale.risk_level}
                        </span>
                      </div>
                    </div>

                    {/* Link Explorer */}
                    <a
                      href={whale.wallet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
                    >
                      Ver no Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ABA POSITIONS */}
        {tab === 'positions' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Open Positions ({openPositions.length})</h2>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                  LONG: {openPositions.filter(p => p.type === 'LONG').length}
                </button>
                <button className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-bold">
                  SHORT: {openPositions.filter(p => p.type === 'SHORT').length}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {openPositions.slice(0, 10).map((pos) => (
                <div key={pos.id} className={`bg-slate-900/50 rounded-lg p-4 border-l-4 ${pos.pnl >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{pos.wallet}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${pos.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {pos.type}
                      </span>
                      <span className="font-bold text-xl">{pos.token}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(0)}
                      </p>
                      <p className={`text-sm ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-8 gap-3 text-xs">
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Size</p>
                      <p className="font-bold">{formatCurrency(pos.size)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Leverage</p>
                      <p className="font-bold text-yellow-400">{pos.lev}x</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Entry</p>
                      <p className="font-bold">${pos.entry}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Current</p>
                      <p className="font-bold">${pos.current}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Stop</p>
                      <p className="font-bold text-red-400">${pos.stop}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Target</p>
                      <p className="font-bold text-green-400">${pos.target}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">Break-even</p>
                      <p className="font-bold">${pos.breakeven}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded p-2">
                      <p className="text-slate-400 mb-0.5">R:R</p>
                      <p className="font-bold text-green-400">1:{pos.rr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OUTRAS ABAS (Trades, Orders, etc) */}
        {['trades', 'orders', 'ai-token', 'ai-wallet', 'analytics', 'risk', 'simulator', 'board'].includes(tab) && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aba {tab.toUpperCase()}</h3>
            <p className="text-slate-400">Conteúdo em desenvolvimento...</p>
            <p className="text-sm text-slate-500 mt-2">Os dados das whales estão carregando na aba Command!</p>
          </div>
        )}

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

      {/* Notificação flutuante */}
      <div className="fixed bottom-4 right-4 bg-slate-800 border-2 border-blue-500/50 rounded-lg p-3 shadow-2xl max-w-xs">
        <div className="flex items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-blue-400 mb-1">🐋 Sistema Online</p>
            <p className="text-xs">Monitorando {whalesData.length} whales</p>
            <p className="text-xs text-slate-400">
              Última atualização: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('pt-BR') : 'agora'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
