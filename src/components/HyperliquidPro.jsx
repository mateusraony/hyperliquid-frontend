import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Copy, Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Filter, ExternalLink, Clock, Zap, Users, Settings, AlertTriangle, Shield, DollarSign, Layers, GitBranch, PlayCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import apiService from './api-service';

export default function HyperliquidPro() {
  const [tab, setTab] = useState('command');
  const [expandedToken, setExpandedToken] = useState(null);
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [selectedAnalyticsWallet, setSelectedAnalyticsWallet] = useState('Sigma Whale');
  const [simulatorCapital, setSimulatorCapital] = useState(10000);
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');
  
  // Estados para dados reais da API
  const [whalesData, setWhalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // MELHORIA #4: Dados de liquidação com LONG/SHORT
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

  const walletPositionsDetail = {
    'Sigma Whale': {
      positions: [
        { token: 'BTC', type: 'LONG', size: 125000, lev: 12, entry: 67234, current: 68120, stop: 65000, target: 72000, pnl: 11250, pnlPct: 13.2 },
        { token: 'ETH', type: 'LONG', size: 85000, lev: 8, entry: 3456, current: 3512, stop: 3380, target: 3650, pnl: 1290, pnlPct: 1.5 },
        { token: 'SOL', type: 'LONG', size: 45000, lev: 10, entry: 178.45, current: 179.20, stop: 175, target: 185, pnl: 890, pnlPct: 2.0 },
      ],
      assets: [
        { asset: 'USDC', amount: 12450, value: 12450 },
        { asset: 'HYPE', amount: 2340, value: 8920 },
        { asset: 'PURR', amount: 5600, value: 1120 },
      ],
      perpsSum: { exposure: 255000, avgLev: 10.2, totalPnL: 13430, totalPnLPct: 5.3 }
    }
  };

  const tokenPositionsList = {
    'BTC': [
      { wallet: 'Sigma Whale', type: 'LONG', size: 125000, lev: 12, entry: 67234, pnl: 11250, pnlPct: 13.2 },
      { wallet: 'Alpha Hunter', type: 'LONG', size: 98000, lev: 10, entry: 66500, pnl: 8920, pnlPct: 10.5 },
      { wallet: 'Momentum King', type: 'LONG', size: 45000, lev: 15, entry: 67100, pnl: 2340, pnlPct: 5.2 },
      { wallet: 'Diamond Hands', type: 'SHORT', size: 32000, lev: 10, entry: 68200, pnl: -890, pnlPct: -2.8 },
    ]
  };

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

  const marketStructure = {
    BTC: { support: 66200, resistance: 68500, funding: 0.0085, oi: 4.2, oiChange: 12, lsRatio: '62/38', liqWall: 65800, orderBook: 58 }
  };

  const whalePatterns = {
    'Sigma Whale': {
      entryStyle: 'Breakout Trader',
      exitStrategy: 'Partial Scale Out',
      favoriteEntry: 'After 3% dip + volume spike',
      leveragePattern: 'Starts 10x → 15x when 5% profit',
      tradingHours: '12:00-20:00 UTC',
      tokenSplit: { BTC: 55, ETH: 30, SOL: 15 },
      successByType: { breakout: 81, reversal: 73, continuation: 68 }
    }
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

  const COLORS = { LONG: '#10b981', SHORT: '#f59e0b' };

  // Função para formatar data/hora em BRL
  const formatDateBRL = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Carregar dados reais da API
  const loadWhalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getWhales();
      
      if (response.success) {
        setWhalesData(response.data || []);
        setLastUpdate(new Date());
        setSystemStatus('online');
      } else {
        setError(response.error);
        setSystemStatus('offline');
      }
    } catch (err) {
      console.error('Erro ao carregar whales:', err);
      setError(err.message);
      setSystemStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas globais dos dados reais
  const calculateGlobalMetrics = () => {
    if (!whalesData || whalesData.length === 0) {
      return {
        totalValue: 0,
        totalPnl24h: 0,
        totalPositions: 0,
        totalWhales: 0,
        totalLongs: 0,
        totalShorts: 0,
      };
    }

    return {
      totalValue: whalesData.reduce((sum, w) => sum + (w.account_value || 0), 0),
      totalPnl24h: whalesData.reduce((sum, w) => sum + (w.unrealized_pnl || 0), 0),
      totalPositions: whalesData.reduce((sum, w) => sum + (w.active_positions?.length || 0), 0),
      totalWhales: whalesData.length,
      totalLongs: whalesData.reduce((sum, w) => 
        sum + (w.active_positions?.filter(p => p.size > 0).length || 0), 0),
      totalShorts: whalesData.reduce((sum, w) => 
        sum + (w.active_positions?.filter(p => p.size < 0).length || 0), 0),
    };
  };

  const globalMetrics = calculateGlobalMetrics();

  // Converter dados reais para formato de posições abertas
  const openPositions = whalesData.flatMap(whale => 
    (whale.active_positions || []).map(pos => ({
      id: `${whale.address}-${pos.coin}`,
      wallet: whale.address.substring(0, 10) + '...',
      token: pos.coin,
      type: pos.size > 0 ? 'LONG' : 'SHORT',
      size: Math.abs(pos.size) * (pos.entry_price || 0),
      lev: pos.leverage || 1,
      entry: pos.entry_price || 0,
      current: pos.entry_price || 0,
      target: 0,
      stop: pos.liquidation_px || 0,
      pnl: pos.unrealized_pnl || 0,
      pnlPct: ((pos.unrealized_pnl || 0) / (Math.abs(pos.size) * (pos.entry_price || 1))) * 100,
      liq: pos.liquidation_px || 0,
      time: '0m',
      breakeven: pos.entry_price || 0,
      fees: 0,
      rr: 0,
      distLiq: pos.liquidation_px ? Math.abs(((pos.entry_price - pos.liquidation_px) / pos.entry_price) * 100) : 0,
      portPct: 0,
      exitPlan: 'Sem plano definido'
    }))
  );

  // Carregar dados ao montar
  useEffect(() => {
    loadWhalesData();
    const interval = setInterval(loadWhalesData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  // MELHORIA #2: Função para renderizar o status emoji
  const getStatusEmoji = () => {
    if (systemStatus === 'online') return '🟢';
    if (systemStatus === 'warning') return '🟡';
    return '🔴';
  };

  const getStatusColor = () => {
    if (systemStatus === 'online') return 'green';
    if (systemStatus === 'warning') return 'yellow';
    return 'red';
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#6366f1 #1e293b'
    }}>
      <style>{`
        /* MELHORIA #3: Barra de rolagem elegante */
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

      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1900px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Hyperliquid Pro Tracker</h1>
                <p className="text-xs text-slate-400">Institutional Grade - Live from Hypurrscan & HyperDash</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://hypurrscan.io" target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />Hypurrscan
              </a>
              <a href="https://hyperdash.info" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />HyperDash
              </a>
              
              {/* MELHORIA #2: Indicador LIVE melhorado com status e emoji */}
              <div className={`flex items-center gap-2 bg-${getStatusColor()}-500/10 border border-${getStatusColor()}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${getStatusColor()}-400 rounded-full animate-pulse`}></div>
                <span className={`text-${getStatusColor()}-400 font-medium flex items-center gap-1`}>
                  {getStatusEmoji()} Live • {whalesData.length}
                </span>
              </div>

              <button 
                onClick={loadWhalesData}
                disabled={loading}
                className="p-1.5 hover:bg-slate-800 rounded"
                title="Atualizar dados">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button className="p-1.5 hover:bg-slate-800 rounded"><Bell className="w-4 h-4" /></button>
              
              {/* MELHORIA #5: Botão Add Wallet com visual premium */}
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-1.5 rounded text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
                + Add Wallet
              </button>
            </div>
          </div>
          
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

      <div className="max-w-[1900px] mx-auto p-4">
        
        {/* Loading / Error */}
        {loading && whalesData.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-slate-400">Carregando dados das whales...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}
        
        {tab === 'command' && !loading && (
          <div className="space-y-4">
            {/* MELHORIA #4: Command Center com métricas LONG/SHORT e Liquidações */}
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
                <p className={`text-2xl font-bold ${globalMetrics.totalPnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(globalMetrics.totalPnl24h)}
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
                <p className="text-xs text-slate-400">30 dias</p>
              </div>
            </div>

            {/* MELHORIA #4: Métricas LONG/SHORT */}
            <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">📊 Métricas LONG vs SHORT</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total LONGs</p>
                  <p className="text-3xl font-bold text-green-400">{globalMetrics.totalLongs}</p>
                  <p className="text-xs text-green-400">
                    {globalMetrics.totalPositions > 0 
                      ? `${((globalMetrics.totalLongs / globalMetrics.totalPositions) * 100).toFixed(1)}%` 
                      : '0%'} dos trades
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total SHORTs</p>
                  <p className="text-3xl font-bold text-orange-400">{globalMetrics.totalShorts}</p>
                  <p className="text-xs text-orange-400">
                    {globalMetrics.totalPositions > 0 
                      ? `${((globalMetrics.totalShorts / globalMetrics.totalPositions) * 100).toFixed(1)}%` 
                      : '0%'} dos trades
                  </p>
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

            {/* MELHORIA #4: Dados de Liquidação expansíveis */}
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

            {/* Lista de Whales COM DADOS REAIS */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Whales Monitoradas ({whalesData.length})</h2>
              
              {whalesData.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Nenhuma whale encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {whalesData.map((whale) => (
                    <div key={whale.address} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <a
                              href={`https://hypurrscan.io/address/${whale.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1"
                            >
                              {formatAddress(whale.address)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              whale.liquidation_risk === 'Baixo' ? 'bg-green-500/20 text-green-400' :
                              whale.liquidation_risk === 'Médio' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {whale.liquidation_risk}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 text-xs">Valor Conta</p>
                              <p className="font-bold text-green-400">{formatCurrency(whale.account_value)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Margem Usada</p>
                              <p className="font-bold">{formatCurrency(whale.total_margin_used)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">PnL</p>
                              <p className={`font-bold ${whale.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatCurrency(whale.unrealized_pnl)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs">Posições</p>
                              <p className="font-bold text-blue-400">{whale.active_positions?.length || 0}</p>
                            </div>
                          </div>

                          {whale.active_positions && whale.active_positions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                              <p className="text-xs text-slate-400 mb-2">Posições Ativas:</p>
                              <div className="flex flex-wrap gap-2">
                                {whale.active_positions.slice(0, 5).map((pos, idx) => (
                                  <div key={idx} className="bg-slate-800/50 px-2 py-1 rounded text-xs">
                                    <span className="font-bold">{pos.coin}</span>
                                    <span className={`ml-2 ${pos.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {formatCurrency(pos.unrealized_pnl)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500">
                        Última atualização: {formatDateBRL(whale.last_update)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
              {openPositions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Nenhuma posição aberta</p>
                </div>
              ) : (
                openPositions.map((pos) => (
                  <div key={pos.id} className={`bg-slate-900/50 rounded-lg p-4 border-l-4 ${pos.pnl >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{pos.wallet}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${pos.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {pos.type}
                        </span>
                        <span className="font-bold text-xl">{pos.token}</span>
                        <a href="https://hypurrscan.io" target="_blank" rel="noopener noreferrer" className="text-blue-400">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{formatCurrency(pos.pnl)}
                        </p>
                        <p className={`text-sm ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnlPct.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-3 text-xs">
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Size</p>
                        <p className="font-bold">${(pos.size/1000).toFixed(0)}K</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Leverage</p>
                        <p className="font-bold text-yellow-400">{pos.lev.toFixed(1)}x</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Entry</p>
                        <p className="font-bold">${pos.entry.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Current</p>
                        <p className="font-bold">${pos.current.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Liquidation</p>
                        <p className="font-bold text-red-400">${pos.liq.toFixed(2)}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-slate-400 mb-0.5">Dist to Liq</p>
                        <p className={`font-bold ${pos.distLiq < 10 ? 'text-red-400' : 'text-green-400'}`}>
                          {pos.distLiq.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* OUTRAS ABAS - mantém os dados mockados como estava */}
        {['trades', 'orders', 'ai-token', 'ai-wallet', 'analytics', 'risk', 'simulator', 'board'].includes(tab) && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold mb-2">Em Desenvolvimento</h3>
            <p className="text-slate-400">
              A aba <span className="text-blue-400 font-bold">{tab}</span> será integrada com dados reais em breve
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
