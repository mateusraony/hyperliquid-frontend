import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Copy, Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Filter, ExternalLink, Clock, Zap, Users, Settings, AlertTriangle, Shield, DollarSign, Layers, GitBranch, PlayCircle, ChevronDown, ChevronUp, Trash2, Plus, X, Check, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Send } from 'lucide-react';

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
  
  // Estados para resumo Telegram
  const [isSendingResume, setIsSendingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  
  // NOVO: Estados para indicador Telegram integrado
  const [telegramStatus, setTelegramStatus] = useState('checking');
  const [telegramData, setTelegramData] = useState(null);

  // NOVO FASE 2: Estados para filtros nas abas Positions e Orders
  const [positionsFilter, setPositionsFilter] = useState('all'); // 'all', 'long', 'short'
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all', 'buy', 'sell'

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

  // NOVO: Verificar status do Telegram
  const checkTelegramStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/telegram/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        setTelegramData(data);
        
        const isActive = data.enabled && data.bot_token_configured && data.chat_id_configured;
        setTelegramStatus(isActive ? 'active' : 'inactive');
      } else {
        setTelegramStatus('error');
      }
    } catch (error) {
      setTelegramStatus('error');
    }
  };

  // Buscar dados das whales - COM DEBUG COMPLETO
  const fetchWhales = async () => {
    console.log('🔄 ============ FETCH WHALES INICIADO ============');
    console.log('⏰ Horário:', new Date().toLocaleString('pt-BR'));
    
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('📡 Chamando API:', `${API_URL}/whales`);
      
      const response = await fetch(`${API_URL}/whales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(60000)
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // DEBUG COMPLETO DOS DADOS
      console.log('✅ DADOS RECEBIDOS DA API:');
      console.log('📊 Tipo:', Array.isArray(data) ? 'Array' : 'Object');
      console.log('📊 Estrutura completa:', JSON.stringify(data, null, 2));
      
      let whalesArray = [];
      
      if (Array.isArray(data)) {
        whalesArray = data;
        console.log(`📊 ${whalesArray.length} whales no array`);
      } else if (data && Array.isArray(data.whales)) {
        whalesArray = data.whales;
        console.log(`📊 ${whalesArray.length} whales em data.whales`);
      } else {
        console.warn('⚠️ Formato inesperado:', data);
        whalesArray = [];
      }
      
      // DEBUG DE CADA WHALE
      whalesArray.forEach((whale, idx) => {
        console.log(`\n🐋 WHALE ${idx + 1}:`);
        console.log('  Address:', whale.address);
        console.log('  Nickname:', whale.nickname);
        console.log('  accountValue:', whale.accountValue, typeof whale.accountValue);
        console.log('  unrealizedPnl:', whale.unrealizedPnl, typeof whale.unrealizedPnl);
        console.log('  marginUsed:', whale.marginUsed, typeof whale.marginUsed);
        console.log('  total_position_value:', whale.total_position_value, typeof whale.total_position_value);
        console.log('  Positions:', whale.positions ? whale.positions.length : 0);
        console.log('  Campos disponíveis:', Object.keys(whale));
      });
      
      setWhalesData(whalesArray);
      setLastUpdate(new Date());
      setSystemStatus('online');
      
      console.log('✅ Dados salvos no state com sucesso!');
      console.log('🏁 ============ FETCH WHALES FINALIZADO ============\n');
      
    } catch (err) {
      console.error('❌ ERRO AO BUSCAR WHALES:', err);
      console.error('❌ Erro detalhado:', err.message);
      console.error('❌ Stack:', err.stack);
      setError(err.message);
      setSystemStatus('offline');
      setWhalesData([]);
    } finally {
      setIsLoading(false);
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
      console.log('➕ Adicionando wallet:', newWalletAddress.trim());
      console.log('📝 Nickname:', newWalletNickname.trim() || '(sem nickname)');
      
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

      console.log('✅ Wallet adicionada com sucesso!');
      await fetchWhales();
      setNewWalletAddress('');
      setNewWalletNickname('');
      setShowAddModal(false);
      
    } catch (err) {
      console.error('❌ Erro ao adicionar whale:', err);
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
      console.log('🗑️ Removendo wallet:', walletToDelete.address);
      
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

      console.log('✅ Wallet removida com sucesso!');
      await fetchWhales();
      setShowDeleteModal(false);
      setWalletToDelete(null);
      
    } catch (err) {
      console.error('❌ Erro ao deletar whale:', err);
      alert(`Erro ao remover: ${err.message}`);
    } finally {
      setIsDeletingWallet(false);
    }
  };

  // NOVA FUNCIONALIDADE: Enviar resumo Telegram com IA
  const handleSendTelegramResume = async () => {
    setIsSendingResume(true);
    setResumeSuccess(false);
    
    try {
      console.log('📱 Enviando resumo Telegram...');
      
      const response = await fetch(`${API_URL}/telegram/send-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar resumo');
      }

      const result = await response.json();
      console.log('✅ Resumo enviado:', result);
      
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 3000);
      
    } catch (err) {
      console.error('❌ Erro ao enviar resumo:', err);
      alert('Erro ao enviar resumo. Verifique o console.');
    } finally {
      setIsSendingResume(false);
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

  // ============================================
  // FASE 2: FUNÇÕES PARA PROCESSAR POSITIONS
  // ============================================
  const getAllPositions = () => {
    const allPositions = [];
    
    whalesData.forEach(whale => {
      const positions = whale.positions || whale.active_positions || [];
      const nickname = whale.nickname || `Whale ${whale.address.slice(0, 6)}`;
      
      positions.forEach(pos => {
        allPositions.push({
          ...pos,
          whaleAddress: whale.address,
          whaleNickname: nickname
        });
      });
    });
    
    return allPositions;
  };

  const getFilteredPositions = () => {
    let positions = getAllPositions();
    
    if (positionsFilter !== 'all') {
      positions = positions.filter(pos => {
        const szi = parseFloat(pos.szi || 0);
        const side = pos.side || '';
        const isLong = szi > 0 || side === 'L' || side === 'LONG';
        
        if (positionsFilter === 'long') return isLong;
        if (positionsFilter === 'short') return !isLong;
        return true;
      });
    }
    
    return positions;
  };

  // ============================================
  // FASE 2: FUNÇÕES PARA PROCESSAR ORDERS (se disponível)
  // ============================================
  const getAllOrders = () => {
    const allOrders = [];
    
    whalesData.forEach(whale => {
      const orders = whale.orders || whale.open_orders || [];
      const nickname = whale.nickname || `Whale ${whale.address.slice(0, 6)}`;
      
      orders.forEach(order => {
        allOrders.push({
          ...order,
          whaleAddress: whale.address,
          whaleNickname: nickname
        });
      });
    });
    
    return allOrders;
  };

  const getFilteredOrders = () => {
    let orders = getAllOrders();
    
    if (ordersFilter !== 'all') {
      orders = orders.filter(order => {
        const side = (order.side || order.orderType || '').toLowerCase();
        if (ordersFilter === 'buy') return side.includes('buy') || side.includes('long');
        if (ordersFilter === 'sell') return side.includes('sell') || side.includes('short');
        return true;
      });
    }
    
    return orders;
  };
  // ============================================

  // Carregamento inicial e atualização automática
  useEffect(() => {
    console.log('🚀 ============ COMPONENT MONTADO ============');
    console.log('⏰ Horário:', new Date().toLocaleString('pt-BR'));
    fetchWhales();
    checkTelegramStatus();
    
    const interval = setInterval(() => {
      console.log('\n⏰ ============ AUTO-REFRESH (30s) ============');
      fetchWhales();
      checkTelegramStatus();
    }, 30000);
    
    return () => {
      console.log('🛑 Limpando interval');
      clearInterval(interval);
    };
  }, []);

  // Formatação
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
  
  // NOVO: Funções para indicador Telegram
  const getTelegramIcon = () => {
    switch (telegramStatus) {
      case 'active': return '✅';
      case 'sending': return '⏳';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getTelegramColor = () => {
    switch (telegramStatus) {
      case 'active': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Calcular métricas totais REAIS das whales - CORRIGIDO
  const totalMetrics = whalesData.reduce((acc, whale) => {
    const positions = whale.positions || whale.active_positions || [];
    
    // CORREÇÃO: Adicionar suporte para total_position_value
    let accountValue = whale.accountValue || whale.account_value || whale.total_position_value || 0;
    
    // CORREÇÃO: Calcular PnL somando das posições se não vier direto
    let pnl = whale.unrealizedPnl || whale.unrealized_pnl || 0;
    if (!pnl && positions.length > 0) {
      pnl = positions.reduce((sum, pos) => {
        return sum + (parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0));
      }, 0);
    }
    
    acc.totalValue += parseFloat(accountValue) || 0;
    acc.totalPnL += parseFloat(pnl) || 0;
    acc.totalPositions += positions.length;
    return acc;
  }, { totalValue: 0, totalPnL: 0, totalPositions: 0 });

  // ============================================
  // FASE 1: CALCULAR LONG/SHORT REAL
  // ============================================
  const longShortMetrics = whalesData.reduce((acc, whale) => {
    const positions = whale.positions || whale.active_positions || [];
    
    positions.forEach(pos => {
      // Identificar se é LONG ou SHORT
      const side = pos.side || '';
      const szi = parseFloat(pos.szi || 0);
      
      // szi positivo = LONG, negativo = SHORT
      const isLong = szi > 0 || side === 'L' || side === 'LONG';
      
      if (isLong) {
        acc.totalLongs++;
      } else {
        acc.totalShorts++;
      }
    });
    
    return acc;
  }, { totalLongs: 0, totalShorts: 0 });

  // Calcular percentuais
  const totalTrades = longShortMetrics.totalLongs + longShortMetrics.totalShorts;
  const longPercentage = totalTrades > 0 ? ((longShortMetrics.totalLongs / totalTrades) * 100).toFixed(0) : 0;
  const shortPercentage = totalTrades > 0 ? ((longShortMetrics.totalShorts / totalTrades) * 100).toFixed(0) : 0;
  // ============================================

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
              
              {/* STATUS LIVE COM TELEGRAM INTEGRADO - COMPACTO */}
              <div className={`flex items-center gap-2 bg-${getStatusColor()}-500/10 border border-${getStatusColor()}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${getStatusColor()}-400 rounded-full animate-pulse`}></div>
                <span className={`text-${getStatusColor()}-400 font-medium flex items-center gap-2`}>
                  {getStatusEmoji()} Live • {whalesData.length}
                  {/* INDICADOR TELEGRAM INTEGRADO */}
                  <span className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-600">
                    <span className={`text-xs ${getTelegramColor()}`}>{getTelegramIcon()}</span>
                    <span className="text-[10px] text-slate-400">TG</span>
                  </span>
                </span>
              </div>

              <button 
                onClick={fetchWhales} 
                disabled={isLoading} 
                className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-50"
                title={isLoading ? "Atualizando..." : "Atualizar dados"}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
              
              {/* BOTÃO RESUMO TELEGRAM */}
              <button 
                onClick={handleSendTelegramResume}
                disabled={isSendingResume || whalesData.length === 0}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium shadow-lg transition-all ${
                  resumeSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } disabled:opacity-50`}
                title="Envia resumo completo com análise de IA via Telegram">
                {isSendingResume ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : resumeSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Enviado!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    📱 Resumo Telegram
                  </>
                )}
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
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
                  <p className="text-red-300 text-sm">{error}</p>
                  <button 
                    onClick={fetchWhales}
                    className="mt-2 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && whalesData.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400">Carregando dados das whales...</p>
                <p className="text-xs text-slate-500 mt-2">Isso pode levar até 60 segundos</p>
                <p className="text-xs text-slate-600 mt-1">Veja o console (F12) para detalhes</p>
              </div>
            )}

            {/* Métricas Principais */}
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

            {/* Métricas LONG/SHORT - AGORA COM DADOS REAIS! */}
            <div className="bg-gradient-to-r from-green-500/10 to-orange-500/10 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">📊 Métricas LONG vs SHORT (Ao Vivo)</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total LONGs</p>
                  <p className="text-3xl font-bold text-green-400">{longShortMetrics.totalLongs}</p>
                  <p className="text-xs text-green-400">{longPercentage}% das posições</p>
                </div>
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Total SHORTs</p>
                  <p className="text-3xl font-bold text-orange-400">{longShortMetrics.totalShorts}</p>
                  <p className="text-xs text-orange-400">{shortPercentage}% das posições</p>
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

            {/* Liquidações */}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Whales */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">🐋 Whales Monitoradas ({whalesData.length})</h3>
                {lastUpdate && (
                  <p className="text-xs text-slate-400">
                    Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
              
              {whalesData.length === 0 && !isLoading ? (
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
                      {sortedData.map((whale, idx) => {
                        // Suporte para múltiplos formatos de campo - CORRIGIDO
                        const positions = whale.positions || whale.active_positions || [];
                        
                        // CORREÇÃO: Adicionar total_position_value
                        let accountValue = whale.accountValue || whale.account_value || whale.total_position_value || 0;
                        
                        // CORREÇÃO: Calcular PnL das posições
                        let pnl = whale.unrealizedPnl || whale.unrealized_pnl || 0;
                        if (!pnl && positions.length > 0) {
                          pnl = positions.reduce((sum, pos) => {
                            return sum + (parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0));
                          }, 0);
                        }
                        
                        // CORREÇÃO: Calcular margem das posições
                        let margin = whale.marginUsed || whale.margin_used || whale.total_margin_used || 0;
                        if (!margin && positions.length > 0) {
                          margin = positions.reduce((sum, pos) => {
                            const posValue = parseFloat(pos.positionValue || pos.position_value || 0);
                            const leverage = pos.leverage?.value || pos.leverage || 1;
                            return sum + (posValue / leverage);
                          }, 0);
                        }
                        
                        const nickname = whale.nickname || `Whale #${idx + 1}`;
                        
                        return (
                          <tr key={whale.address} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="py-2 px-3">
                              <div className="font-semibold metric-value">{nickname}</div>
                              <div className="text-xs text-slate-400 font-mono metric-value">
                                {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                              </div>
                            </td>
                            <td className="text-right py-2 px-3 text-blue-400 font-bold metric-value">
                              {formatCurrency(accountValue)}
                            </td>
                            <td className={`text-right py-2 px-3 font-bold metric-value ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(pnl)}
                            </td>
                            <td className="text-right py-2 px-3 metric-value">
                              {formatCurrency(margin)}
                            </td>
                            <td className="text-center py-2 px-3 font-bold">
                              {positions.length}
                            </td>
                            <td className="text-center py-2 px-3">
                              <div className="flex items-center justify-center gap-2">
                                <a 
                                  href={`https://hypurrscan.io/address/${whale.address}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
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
                        );
                      })}
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

        {/* ============================================ */}
        {/* FASE 2: ABA POSITIONS - NOVA IMPLEMENTAÇÃO! */}
        {/* ============================================ */}
        {tab === 'positions' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold">📊 Todas as Posições Abertas</h2>
                    <p className="text-xs text-slate-400">
                      {getFilteredPositions().length} posições de {whalesData.length} whales
                    </p>
                  </div>
                </div>
                
                {/* Filtros */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPositionsFilter('all')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      positionsFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    Todas
                  </button>
                  <button
                    onClick={() => setPositionsFilter('long')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      positionsFilter === 'long'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    🟢 LONG
                  </button>
                  <button
                    onClick={() => setPositionsFilter('short')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      positionsFilter === 'short'
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    🔴 SHORT
                  </button>
                </div>
              </div>

              {getFilteredPositions().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma posição aberta no momento</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400 font-semibold">TOKEN</th>
                        <th className="text-left py-2 px-3 text-slate-400 font-semibold">WHALE</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">LADO</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">TAMANHO</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">VALOR</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">PNL</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">LIQUIDAÇÃO</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredPositions().map((pos, idx) => {
                        const coin = pos.coin || pos.symbol || pos.asset || 'N/A';
                        const szi = parseFloat(pos.szi || 0);
                        const side = pos.side || '';
                        const isLong = szi > 0 || side === 'L' || side === 'LONG';
                        
                        const size = Math.abs(szi);
                        const posValue = parseFloat(pos.positionValue || pos.position_value || 0);
                        const pnl = parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0);
                        const liquidationPx = parseFloat(pos.liquidationPx || pos.liquidation_px || 0);
                        const entryPx = parseFloat(pos.entryPx || pos.entry_px || 0);
                        
                        // Calcular distância de liquidação
                        let distLiq = 0;
                        if (liquidationPx && entryPx) {
                          distLiq = Math.abs(((liquidationPx - entryPx) / entryPx) * 100);
                        }
                        
                        return (
                          <tr key={`${pos.whaleAddress}-${coin}-${idx}`} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="py-2 px-3 font-bold text-blue-400">
                              {coin}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold">{pos.whaleNickname}</div>
                              <div className="text-xs text-slate-400 font-mono">
                                {pos.whaleAddress.slice(0, 6)}...{pos.whaleAddress.slice(-4)}
                              </div>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                isLong 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {isLong ? '🟢 LONG' : '🔴 SHORT'}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3 font-mono">
                              {size.toFixed(4)}
                            </td>
                            <td className="text-right py-2 px-3 font-bold">
                              {formatCurrency(posValue)}
                            </td>
                            <td className={`text-right py-2 px-3 font-bold ${
                              pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(pnl)}
                            </td>
                            <td className={`text-right py-2 px-3 font-bold ${
                              distLiq < 5 ? 'text-red-400' : distLiq < 15 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                              {distLiq > 0 ? `${distLiq.toFixed(1)}%` : '-'}
                            </td>
                            <td className="text-center py-2 px-3">
                              <a 
                                href={`https://hypurrscan.io/address/${pos.whaleAddress}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300">
                                <ExternalLink className="w-3.5 h-3.5 inline" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resumo da aba Positions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-green-400">Posições LONG</h3>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {getFilteredPositions().filter(p => {
                    const szi = parseFloat(p.szi || 0);
                    return szi > 0 || (p.side || '').includes('LONG');
                  }).length}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-orange-400" />
                  <h3 className="font-bold text-orange-400">Posições SHORT</h3>
                </div>
                <p className="text-3xl font-bold text-orange-400">
                  {getFilteredPositions().filter(p => {
                    const szi = parseFloat(p.szi || 0);
                    return szi < 0 || (p.side || '').includes('SHORT');
                  }).length}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-blue-400">Valor Total</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">
                  {formatCurrency(
                    getFilteredPositions().reduce((sum, p) => 
                      sum + (parseFloat(p.positionValue || p.position_value || 0)), 0
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FASE 2: ABA ORDERS - NOVA IMPLEMENTAÇÃO! */}
        {/* ============================================ */}
        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h2 className="text-xl font-bold">⏰ Ordens Pendentes</h2>
                    <p className="text-xs text-slate-400">
                      {getFilteredOrders().length} ordens aguardando execução
                    </p>
                  </div>
                </div>
                
                {/* Filtros */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrdersFilter('all')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      ordersFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    Todas
                  </button>
                  <button
                    onClick={() => setOrdersFilter('buy')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      ordersFilter === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    🟢 BUY
                  </button>
                  <button
                    onClick={() => setOrdersFilter('sell')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      ordersFilter === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}>
                    🔴 SELL
                  </button>
                </div>
              </div>

              {getAllOrders().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-1">Nenhuma ordem pendente no momento</p>
                  <p className="text-xs">
                    As ordens aparecerão aqui quando as whales criarem limit orders ou stop orders
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400 font-semibold">TOKEN</th>
                        <th className="text-left py-2 px-3 text-slate-400 font-semibold">WHALE</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">TIPO</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">LADO</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">PREÇO</th>
                        <th className="text-right py-2 px-3 text-slate-400 font-semibold">QUANTIDADE</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">STATUS</th>
                        <th className="text-center py-2 px-3 text-slate-400 font-semibold">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredOrders().map((order, idx) => {
                        const coin = order.coin || order.symbol || order.asset || 'N/A';
                        const orderType = order.orderType || order.type || 'LIMIT';
                        const side = order.side || '';
                        const isBuy = side.toLowerCase().includes('buy') || side.toLowerCase().includes('long');
                        
                        const price = parseFloat(order.limitPx || order.price || 0);
                        const sz = parseFloat(order.sz || order.size || 0);
                        const status = order.status || 'PENDING';
                        
                        return (
                          <tr key={`${order.whaleAddress}-${coin}-${idx}`} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="py-2 px-3 font-bold text-blue-400">
                              {coin}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold">{order.whaleNickname}</div>
                              <div className="text-xs text-slate-400 font-mono">
                                {order.whaleAddress.slice(0, 6)}...{order.whaleAddress.slice(-4)}
                              </div>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
                                {orderType}
                              </span>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                isBuy 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {isBuy ? '🟢 BUY' : '🔴 SELL'}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3 font-mono font-bold">
                              ${price.toFixed(2)}
                            </td>
                            <td className="text-right py-2 px-3 font-mono">
                              {sz.toFixed(4)}
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                                {status}
                              </span>
                            </td>
                            <td className="text-center py-2 px-3">
                              <a 
                                href={`https://hypurrscan.io/address/${order.whaleAddress}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300">
                                <ExternalLink className="w-3.5 h-3.5 inline" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info sobre Orders */}
            {getAllOrders().length === 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-400 mb-1">📱 Alertas Telegram Ativos</p>
                    <p className="text-sm text-slate-300">
                      Você receberá uma notificação no Telegram sempre que uma whale criar, executar ou cancelar uma ordem.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outras abas permanecem iguais */}
        {!['command', 'positions', 'orders'].includes(tab) && (
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
                className="text-slate-400 hover:text-white transition-colors">
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
                  className="flex-1 px-4 py-3 border-2 border-slate-600 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button
                  onClick={handleAddWhale}
                  disabled={isAddingWallet || !newWalletAddress.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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
                className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
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
                  className="flex-1 px-4 py-3 border-2 border-slate-600 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteWhale}
                  disabled={isDeletingWallet}
                  className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
