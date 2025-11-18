import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Copy, Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Filter, ExternalLink, Clock, Zap, Users, Settings, AlertTriangle, Shield, DollarSign, Layers, GitBranch, PlayCircle, ChevronDown, ChevronUp, Trash2, Plus, X, Check, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

export default function HyperliquidPro() {
  const [tab, setTab] = useState('command');
  const [expandedToken, setExpandedToken] = useState(null);
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [selectedAnalyticsWallet, setSelectedAnalyticsWallet] = useState('Sigma Whale');
  const [simulatorCapital, setSimulatorCapital] = useState(10000);
  const [systemStatus, setSystemStatus] = useState('online');

  // Estados da API
  const [whalesData, setWhalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  
  // Estados para adicionar wallet
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletNickname, setNewWalletNickname] = useState('');
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [addError, setAddError] = useState('');
  
  // Estados para deletar wallet
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [isDeletingWallet, setIsDeletingWallet] = useState(false);

  // Estados para ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Dados de liquidação (SEMPRE VISÍVEIS)
  const liquidationData = {
    '1D': { total: 2340000, trades: 12, profit: 450000, longs: 8, shorts: 4 },
    '1W': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1M': { total: 24500000, trades: 234, profit: 4870000, longs: 145, shorts: 89 },
  };

  const riskMetrics = {
    portfolioHeat: 45,
    capitalAtRisk: 98500,
    avgRR: 2.8,
    correlation: 78,
    var95: -12450,
  };

  // Buscar dados das whales
  const fetchWhales = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/whales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setWhalesData(data);
      } else if (data && Array.isArray(data.whales)) {
        setWhalesData(data.whales);
      } else {
        setWhalesData([]);
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
      setSystemStatus('online');
    } catch (err) {
      console.error('Erro ao buscar whales:', err);
      setError(err.message);
      setIsLoading(false);
      setSystemStatus('offline');
      setWhalesData([]);
    }
  };

  // Adicionar nova whale
  const handleAddWhale = async () => {
    if (!newWalletAddress.trim()) {
      setAddError('Endereço não pode estar vazio');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress.trim())) {
      setAddError('Endereço inválido. Use formato: 0x...');
      return;
    }

    setIsAddingWallet(true);
    setAddError('');

    try {
      const response = await fetch(`${API_URL}/whales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: newWalletAddress.trim(),
          nickname: newWalletNickname.trim() || undefined
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao adicionar whale');
      }

      await fetchWhales();
      setNewWalletAddress('');
      setNewWalletNickname('');
      setShowAddModal(false);
      
    } catch (err) {
      console.error('Erro ao adicionar whale:', err);
      setAddError(err.message);
    } finally {
      setIsAddingWallet(false);
    }
  };

  // Confirmar deleção
  const confirmDeleteWhale = (whale) => {
    setWalletToDelete(whale);
    setShowDeleteModal(true);
  };

  // Deletar whale
  const handleDeleteWhale = async () => {
    if (!walletToDelete) return;

    setIsDeletingWallet(true);

    try {
      const response = await fetch(`${API_URL}/whales/${walletToDelete.address}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao remover whale');
      }

      await fetchWhales();
      setShowDeleteModal(false);
      setWalletToDelete(null);
      
    } catch (err) {
      console.error('Erro ao deletar whale:', err);
      alert(`Erro ao remover: ${err.message}`);
    } finally {
      setIsDeletingWallet(false);
    }
  };

  // Função de ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar dados
  const getSortedData = () => {
    if (!sortField) return whalesData;

    const sorted = [...whalesData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'nickname') {
        aValue = a.nickname || a.address;
        bValue = b.nickname || b.address;
      }

      if (sortField === 'positions') {
        aValue = (a.positions || []).length;
        bValue = (b.positions || []).length;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return sorted;
  };

  useEffect(() => {
    fetchWhales();
    const interval = setInterval(fetchWhales, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatação MELHORADA para caber nas caixas
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    
    const absValue = Math.abs(value);
    
    if (absValue >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  const formatCurrencyFull = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-blue-400" />
      : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

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

  // Calcular métricas totais REAIS das whales
  const totalMetrics = whalesData.reduce((acc, whale) => {
    acc.totalValue += whale.accountValue || 0;
    acc.totalPnL += whale.unrealizedPnl || 0;
    acc.totalPositions += (whale.positions || []).length;
    return acc;
  }, { totalValue: 0, totalPnL: 0, totalPositions: 0 });

  const sortedData = getSortedData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#6366f1 #1e293b'
    }}>
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
        /* Prevenir overflow em todos os cards */
        .metric-card {
          overflow: hidden;
        }
        .metric-value {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
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
              
              <div className={`flex items-center gap-2 bg-${getStatusColor()}-500/10 border border-${getStatusColor()}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${getStatusColor()}-400 rounded-full animate-pulse`}></div>
                <span className={`text-${getStatusColor()}-400 font-medium flex items-center gap-1`}>
                  {getStatusEmoji()} Live • {whalesData.length}
                </span>
              </div>

              <button onClick={fetchWhales} disabled={isLoading} className="p-1.5 hover:bg-slate-800 rounded">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-1.5 rounded text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
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
        
        {tab === 'command' && (
          <div className="space-y-4">
            {/* Métricas Principais com dados REAIS - CSS CORRIGIDO */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Total Value</p>
                <p className="metric-value text-2xl font-bold text-green-400">{formatCurrency(totalMetrics.totalValue)}</p>
                <p className="text-xs text-slate-400">Live</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Posições</p>
                <p className="metric-value text-2xl font-bold text-blue-400">{totalMetrics.totalPositions}</p>
                <p className="text-xs text-slate-400">Ativas</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">PNL 24h</p>
                <p className="metric-value text-2xl font-bold text-green-400">{formatCurrency(totalMetrics.totalPnL)}</p>
                <p className="text-xs text-green-400">Não realizado</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Whales</p>
                <p className="metric-value text-2xl font-bold text-purple-400">{whalesData.length}</p>
                <p className="text-xs text-slate-400">Monitoradas</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Win Rate</p>
                <p className="metric-value text-2xl font-bold text-green-400">79.3%</p>
                <p className="text-xs text-slate-400">+2.1%</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Sharpe</p>
                <p className="metric-value text-2xl font-bold text-yellow-400">2.84</p>
                <p className="text-xs text-slate-400">Excellent</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Heat</p>
                <p className="metric-value text-2xl font-bold text-orange-400">45%</p>
                <p className="text-xs text-slate-400">MEDIUM</p>
              </div>
              <div className="metric-card bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs uppercase mb-1">Alerts</p>
                <p className="metric-value text-2xl font-bold text-cyan-400">47</p>
                <p className="text-xs text-slate-400">12 high</p>
              </div>
            </div>

            {/* Métricas LONG/SHORT */}
            <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">📊 Métricas LONG vs SHORT (30 dias)</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Liquidações SEMPRE ABERTAS - SEM COLLAPSE */}
            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold">⚡ Liquidações Capturadas</h3>
                <span className="text-xs text-slate-400">(valores em perdas de traders liquidados)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(liquidationData).map(([period, data]) => (
                  <div key={period} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-300 font-bold">{period}</p>
                        <p className="text-2xl font-bold text-red-400 metric-value">${(data.total/1000000).toFixed(1)}M</p>
                      </div>
                      <p className="text-xs text-slate-400">{data.trades} liquidações capturadas</p>
                    </div>
                    
                    <div className="space-y-2 text-xs border-t border-slate-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">💰 Lucro Capturado:</span>
                        <span className="text-green-400 font-bold metric-value">+${(data.profit/1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">📈 LONGs liquidados:</span>
                        <span className="text-green-400 font-bold">{data.longs}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">📉 SHORTs liquidados:</span>
                        <span className="text-orange-400 font-bold">{data.shorts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">⚡ Média/trade:</span>
                        <span className="font-bold metric-value">${(data.profit/data.trades/1000).toFixed(1)}K</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-700/50">
                        <p className="text-[10px] text-slate-500 italic">
                          Quando traders são liquidados, suas posições são fechadas à força. 
                          Você pode lucrar posicionando-se contra eles antes da liquidação.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Whales Monitoradas - COM NICKNAME PERSISTINDO */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">🐋 Whales Monitoradas ({whalesData.length})</h3>
              </div>
              
              {whalesData.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Nenhuma whale monitorada</p>
                  <p className="text-sm">Clique em "+ Add Wallet" para começar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400 font-semibold">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nickname')}>
                            WALLET <SortIcon field="nickname" />
                          </div>
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">
                          <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSort('accountValue')}>
                            VALOR <SortIcon field="accountValue" />
                          </div>
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">
                          <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSort('unrealizedPnl')}>
                            PNL <SortIcon field="unrealizedPnl" />
                          </div>
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">
                          <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSort('marginUsed')}>
                            MARGEM <SortIcon field="marginUsed" />
                          </div>
                        </th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">
                          <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSort('positions')}>
                            POS <SortIcon field="positions" />
                          </div>
                        </th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((whale, idx) => (
                        <tr key={whale.address} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                          <td className="py-2 px-3">
                            <div className="font-semibold metric-value">{whale.nickname || `Whale #${idx + 1}`}</div>
                            <div className="text-xs text-slate-400 font-mono metric-value">{whale.address.slice(0, 6)}...{whale.address.slice(-4)}</div>
                          </td>
                          <td className="text-right py-2 px-3 text-blue-400 font-bold metric-value">{formatCurrency(whale.accountValue || 0)}</td>
                          <td className={`text-right py-2 px-3 font-bold metric-value ${(whale.unrealizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(whale.unrealizedPnl || 0)}
                          </td>
                          <td className="text-right py-2 px-3 metric-value">{formatCurrency(whale.marginUsed || 0)}</td>
                          <td className="text-center py-2 px-3 font-bold">{(whale.positions || []).length}</td>
                          <td className="text-center py-2 px-3">
                            <div className="flex items-center justify-center gap-2">
                              <a href={`https://hypurrscan.io/address/${whale.address}`} target="_blank" rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => confirmDeleteWhale(whale)}
                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Risk Dashboard */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold">⚠️ Risk Dashboard</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="metric-card bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Portfolio Heat</p>
                  <p className="metric-value text-2xl font-bold text-orange-400">{riskMetrics.portfolioHeat}%</p>
                  <p className="text-xs text-slate-400">MEDIUM Risk</p>
                </div>
                <div className="metric-card bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Capital at Risk</p>
                  <p className="metric-value text-xl font-bold">${(riskMetrics.capitalAtRisk/1000).toFixed(0)}K</p>
                </div>
                <div className="metric-card bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Avg R:R Ratio</p>
                  <p className="metric-value text-xl font-bold text-green-400">1:{riskMetrics.avgRR}</p>
                  <p className="text-xs text-green-400">GOOD</p>
                </div>
                <div className="metric-card bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Correlation Risk</p>
                  <p className="metric-value text-xl font-bold text-red-400">{riskMetrics.correlation}%</p>
                  <p className="text-xs text-red-400">HIGH</p>
                </div>
                <div className="metric-card bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">VaR (95%)</p>
                  <p className="metric-value text-xl font-bold text-red-400">${(riskMetrics.var95/1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-400">Worst scenario</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab !== 'command' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Em desenvolvimento</h2>
            <p className="text-slate-400">Aba {tab} será implementada em breve</p>
          </div>
        )}
      </div>

      {/* Modal Adicionar Wallet */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-400" />
                Adicionar Wallet
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError('');
                  setNewWalletAddress('');
                  setNewWalletNickname('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Endereço da Wallet *
                </label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Apelido (opcional)
                </label>
                <input
                  type="text"
                  value={newWalletNickname}
                  onChange={(e) => setNewWalletNickname(e.target.value)}
                  placeholder="Ex: Sigma Whale"
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-white"
                />
              </div>

              {addError && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{addError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                    setNewWalletAddress('');
                    setNewWalletNickname('');
                  }}
                  disabled={isAddingWallet}
                  className="flex-1 px-4 py-3 border-2 border-slate-600 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddWhale}
                  disabled={isAddingWallet || !newWalletAddress.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAddingWallet ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Adicionar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Deleção */}
      {showDeleteModal && walletToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Confirmar Remoção
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWalletToDelete(null);
                }}
                disabled={isDeletingWallet}
                className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300">
                Tem certeza que deseja remover esta wallet do monitoramento?
              </p>
              
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm font-semibold text-white mb-1">
                  {walletToDelete.nickname || 'Whale'}
                </p>
                <p className="text-xs text-slate-400 font-mono break-all">
                  {walletToDelete.address}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setWalletToDelete(null);
                  }}
                  disabled={isDeletingWallet}
                  className="flex-1 px-4 py-3 border-2 border-slate-600 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteWhale}
                  disabled={isDeletingWallet}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeletingWallet ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Remover
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
