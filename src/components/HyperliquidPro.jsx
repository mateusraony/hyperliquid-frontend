// ============================================
// HYPERLIQUID PRO TRACKER - VERSÃO FINAL CORRIGIDA
// Arquivo único - Cole tudo de uma vez
// ============================================

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Copy, Award, BarChart3, ArrowUpRight, ArrowDownRight, Eye, Filter, ExternalLink, Clock, Zap, Users, Settings, AlertTriangle, Shield, DollarSign, Layers, GitBranch, PlayCircle, ChevronDown, ChevronUp, Trash2, Plus, X, Check, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Send, Flame, Star } from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

export default function HyperliquidPro() {
  const [tab, setTab] = useState('command');
  const [expandedToken, setExpandedToken] = useState(null);
  const [expandedWallet, setExpandedWallet] = useState(null);
  const [selectedAnalyticsWallet, setSelectedAnalyticsWallet] = useState('Sigma Whale');
  const [simulatorCapital, setSimulatorCapital] = useState(10000);
  const [systemStatus, setSystemStatus] = useState('online');

  const [whalesData, setWhalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletNickname, setNewWalletNickname] = useState('');
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [addError, setAddError] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [isDeletingWallet, setIsDeletingWallet] = useState(false);

  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  const [isSendingResume, setIsSendingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  
  const [telegramStatus, setTelegramStatus] = useState('checking');
  const [telegramData, setTelegramData] = useState(null);

  const [positionsFilter, setPositionsFilter] = useState('all');
  const [ordersFilter, setOrdersFilter] = useState('all');
  
  const [sortPositionsField, setSortPositionsField] = useState(null);
  const [sortPositionsDirection, setSortPositionsDirection] = useState('asc');

  const [tokenFilter, setTokenFilter] = useState('all');
  const [tokenSortField, setTokenSortField] = useState('confidence');
  const [tokenSortDirection, setTokenSortDirection] = useState('desc');
  const [expandedTokenDetail, setExpandedTokenDetail] = useState(null);

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

  // ============================================
  // FORMATAÇÃO - VALORES EXATOS
  // ============================================
  
  const formatCurrencyExact = (value) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (absValue >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

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

  const fetchWhales = async () => {
    console.log('🔄 Buscando whales...');
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/whales`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

      const data = await response.json();
      let whalesArray = Array.isArray(data) ? data : (data?.whales || []);
      
      setWhalesData(whalesArray);
      setLastUpdate(new Date());
      setSystemStatus('online');
      console.log('✅ Whales carregadas:', whalesArray.length);
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
      setSystemStatus('offline');
      setWhalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWhale = async () => {
    if (!newWalletAddress.trim()) {
      setAddError('Endereço não pode estar vazio');
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress.trim())) {
      setAddError('Endereço inválido');
      return;
    }

    setIsAddingWallet(true);
    setAddError('');

    try {
      const response = await fetch(`${API_URL}/whales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setAddError(err.message);
    } finally {
      setIsAddingWallet(false);
    }
  };

  const confirmDeleteWhale = (whale) => {
    setWalletToDelete(whale);
    setShowDeleteModal(true);
  };

  const handleDeleteWhale = async () => {
    if (!walletToDelete) return;
    setIsDeletingWallet(true);

    try {
      const response = await fetch(`${API_URL}/whales/${walletToDelete.address}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
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
      alert(`Erro: ${err.message}`);
    } finally {
      setIsDeletingWallet(false);
    }
  };

  const handleSendTelegramResume = async () => {
    setIsSendingResume(true);
    setResumeSuccess(false);
    
    try {
      const response = await fetch(`${API_URL}/telegram/send-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) throw new Error('Erro ao enviar resumo');
      
      setResumeSuccess(true);
      setTimeout(() => setResumeSuccess(false), 3000);
    } catch (err) {
      alert('Erro ao enviar resumo');
    } finally {
      setIsSendingResume(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSortPositions = (field) => {
    if (sortPositionsField === field) {
      setSortPositionsDirection(sortPositionsDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortPositionsField(field);
      setSortPositionsDirection('asc');
    }
  };

  const getSortedData = () => {
    if (!sortField) return whalesData;
    return [...whalesData].sort((a, b) => {
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
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const getAllPositions = () => {
    const allPositions = [];
    whalesData.forEach(whale => {
      const positions = whale.positions || whale.active_positions || [];
      const nickname = whale.nickname || `Whale ${whale.address.slice(0, 6)}`;
      positions.forEach(pos => {
        allPositions.push({ ...pos, whaleAddress: whale.address, whaleNickname: nickname });
      });
    });
    return allPositions;
  };

  const getFilteredPositions = () => {
    let positions = getAllPositions();
    if (positionsFilter !== 'all') {
      positions = positions.filter(pos => {
        const szi = parseFloat(pos.szi || 0);
        const isLong = szi > 0;
        return positionsFilter === 'long' ? isLong : !isLong;
      });
    }
    return positions;
  };

  const getSortedPositions = () => {
    let positions = getFilteredPositions();
    if (!sortPositionsField) return positions;
    
    return [...positions].sort((a, b) => {
      let aValue, bValue;
      switch (sortPositionsField) {
        case 'coin': aValue = a.coin || ''; bValue = b.coin || ''; break;
        case 'whale': aValue = a.whaleNickname || ''; bValue = b.whaleNickname || ''; break;
        case 'side': aValue = parseFloat(a.szi || 0) > 0 ? 1 : 0; bValue = parseFloat(b.szi || 0) > 0 ? 1 : 0; break;
        case 'size': aValue = Math.abs(parseFloat(a.szi || 0)); bValue = Math.abs(parseFloat(b.szi || 0)); break;
        case 'value': aValue = parseFloat(a.positionValue || a.position_value || 0); bValue = parseFloat(b.positionValue || b.position_value || 0); break;
        case 'pnl': aValue = parseFloat(a.unrealizedPnl || a.unrealized_pnl || 0); bValue = parseFloat(b.unrealizedPnl || b.unrealized_pnl || 0); break;
        case 'entry': aValue = parseFloat(a.entryPx || a.entry_px || 0); bValue = parseFloat(b.entryPx || b.entry_px || 0); break;
        case 'liqPrice': aValue = parseFloat(a.liquidationPx || a.liquidation_px || 0); bValue = parseFloat(b.liquidationPx || b.liquidation_px || 0); break;
        case 'liquidation':
          const aLiqPx = parseFloat(a.liquidationPx || a.liquidation_px || 0);
          const bLiqPx = parseFloat(b.liquidationPx || b.liquidation_px || 0);
          const aEntry = parseFloat(a.entryPx || a.entry_px || 0);
          const bEntry = parseFloat(b.entryPx || b.entry_px || 0);
          aValue = aLiqPx && aEntry ? Math.abs(((aLiqPx - aEntry) / aEntry) * 100) : 0;
          bValue = bLiqPx && bEntry ? Math.abs(((bLiqPx - bEntry) / bEntry) * 100) : 0;
          break;
        default: return 0;
      }
      if (typeof aValue === 'string') {
        return sortPositionsDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortPositionsDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const getAllOrders = () => {
    const allOrders = [];
    whalesData.forEach(whale => {
      const orders = whale.orders || whale.open_orders || [];
      const nickname = whale.nickname || `Whale ${whale.address.slice(0, 6)}`;
      orders.forEach(order => {
        allOrders.push({ ...order, whaleAddress: whale.address, whaleNickname: nickname });
      });
    });
    return allOrders;
  };

  const getFilteredOrders = () => {
    let orders = getAllOrders();
    if (ordersFilter !== 'all') {
      orders = orders.filter(order => {
        const side = (order.side || '').toLowerCase();
        if (ordersFilter === 'buy') return side.includes('buy') || side.includes('long');
        if (ordersFilter === 'sell') return side.includes('sell') || side.includes('short');
        return true;
      });
    }
    return orders;
  };

  // ============================================
  // FUNÇÕES AI TOKEN - CORRIGIDAS
  // ============================================
  
  const calculateTokenMetrics = (tokenData) => {
    const { positions } = tokenData;
    
    const avgSize = tokenData.totalVolume / positions.length;
    
    const leverages = positions.map(p => p.leverage?.value || p.leverage || 1).filter(l => l > 0);
    const avgLeverage = leverages.length > 0 ? leverages.reduce((s, l) => s + l, 0) / leverages.length : 1;
    
    const volumeByWhale = {};
    positions.forEach(pos => {
      const addr = pos.whaleAddress;
      const val = parseFloat(pos.positionValue || pos.position_value || 0);
      volumeByWhale[addr] = (volumeByWhale[addr] || 0) + val;
    });
    const volumes = Object.values(volumeByWhale).sort((a, b) => b - a);
    const top2Volume = (volumes[0] || 0) + (volumes[1] || 0);
    const concentration = tokenData.totalVolume > 0 ? (top2Volume / tokenData.totalVolume) * 100 : 0;
    
    const liquidationDistances = positions.map(pos => {
      const liqPx = parseFloat(pos.liquidationPx || pos.liquidation_px || 0);
      const entryPx = parseFloat(pos.entryPx || pos.entry_px || 0);
      return liqPx && entryPx ? Math.abs(((liqPx - entryPx) / entryPx) * 100) : 0;
    }).filter(d => d > 0);
    
    const avgLiquidationDistance = liquidationDistances.length > 0
      ? liquidationDistances.reduce((s, d) => s + d, 0) / liquidationDistances.length : 0;
    
    const nearLiquidation = liquidationDistances.filter(d => d < 10).length;
    const cascadeRisk = liquidationDistances.length > 0 ? (nearLiquidation / liquidationDistances.length) * 100 : 0;
    
    // ✅ CORREÇÃO: Preço médio de ENTRADA das whales
    const entryPrices = positions.map(pos => parseFloat(pos.entryPx || pos.entry_px || 0)).filter(p => p > 0);
    const avgEntryPrice = entryPrices.length > 0 ? entryPrices.reduce((s, p) => s + p, 0) / entryPrices.length : 0;
    
    // ✅ CORREÇÃO: Preço ATUAL do mercado (markPx ou fallback para primeiro entry se não tiver)
    const markPrices = positions.map(pos => parseFloat(pos.markPx || 0)).filter(p => p > 0);
    const currentPrice = markPrices.length > 0 
      ? markPrices.reduce((s, p) => s + p, 0) / markPrices.length 
      : (entryPrices[0] || 0);
    
    const avgProfitPct = currentPrice && avgEntryPrice ? ((currentPrice - avgEntryPrice) / avgEntryPrice) * 100 : 0;
    const portfolioPercent = (tokenData.totalVolume / 10000000) * 100;
    
    let confidence = 50;
    const consensusStrength = Math.max(tokenData.longs, tokenData.shorts) / (tokenData.longs + tokenData.shorts);
    if (consensusStrength > 0.75) confidence += 20;
    else if (consensusStrength > 0.65) confidence += 10;
    if (tokenData.totalPnL > 0) confidence += 15;
    else if (tokenData.totalPnL < 0) confidence -= 10;
    if (avgLiquidationDistance > 15) confidence += 10;
    else if (avgLiquidationDistance < 5) confidence -= 15;
    if (tokenData.whaleCount >= 5) confidence += 10;
    else if (tokenData.whaleCount <= 2) confidence -= 5;
    if (concentration < 50) confidence += 10;
    else if (concentration > 80) confidence -= 10;
    if (tokenData.totalVolume > 1000000) confidence += 5;
    confidence = Math.max(0, Math.min(100, confidence));
    
    let signal = 'HOLD', signalColor = 'yellow', signalIcon = '⏸️';
    if (confidence >= 80 && tokenData.totalPnL > 0) {
      signal = 'STRONG BUY'; signalColor = 'green'; signalIcon = '🟢';
    } else if (confidence >= 65 && tokenData.totalPnL >= 0) {
      signal = 'BUY'; signalColor = 'green'; signalIcon = '🟢';
    } else if (confidence <= 35 && tokenData.totalPnL < 0) {
      signal = 'STRONG SELL'; signalColor = 'red'; signalIcon = '🔴';
    } else if (confidence <= 50 && tokenData.totalPnL < 0) {
      signal = 'SELL'; signalColor = 'orange'; signalIcon = '🟠';
    }
    
    return { avgSize, avgLeverage, concentration, avgLiquidationDistance, cascadeRisk, avgEntryPrice, currentPrice, avgProfitPct, portfolioPercent, confidence, signal, signalColor, signalIcon, momentum: 'STABLE' };
  };
  
  const getTokensAggregated = () => {
    const tokenMap = new Map();
    
    whalesData.forEach(whale => {
      const positions = whale.positions || whale.active_positions || [];
      const nickname = whale.nickname || `Whale ${whale.address.slice(0, 6)}`;
      
      positions.forEach(pos => {
        const coin = pos.coin || pos.symbol || 'UNKNOWN';
        const szi = parseFloat(pos.szi || 0);
        const isLong = szi > 0;
        const posValue = parseFloat(pos.positionValue || pos.position_value || 0);
        const pnl = parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0);
        
        if (!tokenMap.has(coin)) {
          tokenMap.set(coin, { coin, whales: new Set(), longs: 0, shorts: 0, totalVolume: 0, totalPnL: 0, positions: [] });
        }
        
        const tokenData = tokenMap.get(coin);
        tokenData.whales.add(whale.address);
        if (isLong) tokenData.longs++; else tokenData.shorts++;
        tokenData.totalVolume += posValue;
        tokenData.totalPnL += pnl;
        tokenData.positions.push({ ...pos, whaleAddress: whale.address, whaleNickname: nickname, isLong });
      });
    });
    
    return Array.from(tokenMap.values()).map(token => {
      const whaleCount = token.whales.size;
      const consensus = token.longs > token.shorts ? 'LONG' : token.shorts > token.longs ? 'SHORT' : 'MIXED';
      const metrics = calculateTokenMetrics(token);
      return { ...token, whaleCount, consensus, ...metrics };
    });
  };

  const getFilteredTokens = () => {
    let tokens = getTokensAggregated();
    if (tokenFilter === 'long') tokens = tokens.filter(t => t.longs > t.shorts);
    else if (tokenFilter === 'short') tokens = tokens.filter(t => t.shorts > t.longs);
    else if (tokenFilter === 'mixed') tokens = tokens.filter(t => Math.abs(t.longs - t.shorts) <= 1);
    return tokens;
  };

  const getSortedTokens = () => {
    let tokens = getFilteredTokens();
    return [...tokens].sort((a, b) => {
      let aValue, bValue;
      switch (tokenSortField) {
        case 'confidence': aValue = a.confidence; bValue = b.confidence; break;
        case 'popularity': aValue = a.whaleCount; bValue = b.whaleCount; break;
        case 'volume': aValue = a.totalVolume; bValue = b.totalVolume; break;
        case 'pnl': aValue = a.totalPnL; bValue = b.totalPnL; break;
        case 'name': aValue = a.coin; bValue = b.coin; break;
        default: aValue = a.confidence; bValue = b.confidence;
      }
      if (typeof aValue === 'string') {
        return tokenSortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return tokenSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  useEffect(() => {
    fetchWhales();
    checkTelegramStatus();
    const interval = setInterval(() => {
      fetchWhales();
      checkTelegramStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  const SortIconPositions = ({ field }) => {
    if (sortPositionsField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-500" />;
    return sortPositionsDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />;
  };

  const getStatusEmoji = () => systemStatus === 'online' ? '🟢' : systemStatus === 'warning' ? '🟡' : '🔴';
  const getStatusColor = () => systemStatus === 'online' ? 'green' : systemStatus === 'warning' ? 'yellow' : 'red';
  const getTelegramIcon = () => telegramStatus === 'active' ? '✅' : telegramStatus === 'error' ? '❌' : '⚙️';
  const getTelegramColor = () => telegramStatus === 'active' ? 'text-green-400' : telegramStatus === 'error' ? 'text-red-400' : 'text-gray-400';

  const totalMetrics = whalesData.reduce((acc, whale) => {
    const positions = whale.positions || whale.active_positions || [];
    let accountValue = whale.accountValue || whale.account_value || whale.total_position_value || 0;
    let pnl = whale.unrealizedPnl || whale.unrealized_pnl || 0;
    if (!pnl && positions.length > 0) {
      pnl = positions.reduce((sum, pos) => sum + (parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0)), 0);
    }
    acc.totalValue += parseFloat(accountValue) || 0;
    acc.totalPnL += parseFloat(pnl) || 0;
    acc.totalPositions += positions.length;
    return acc;
  }, { totalValue: 0, totalPnL: 0, totalPositions: 0 });

  const longShortMetrics = whalesData.reduce((acc, whale) => {
    const positions = whale.positions || whale.active_positions || [];
    positions.forEach(pos => {
      const szi = parseFloat(pos.szi || 0);
      if (szi > 0) acc.totalLongs++; else acc.totalShorts++;
    });
    return acc;
  }, { totalLongs: 0, totalShorts: 0 });

  const totalTrades = longShortMetrics.totalLongs + longShortMetrics.totalShorts;
  const longPercentage = totalTrades > 0 ? ((longShortMetrics.totalLongs / totalTrades) * 100).toFixed(0) : 0;
  const shortPercentage = totalTrades > 0 ? ((longShortMetrics.totalShorts / totalTrades) * 100).toFixed(0) : 0;
  const sortedData = getSortedData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#6366f1 #1e293b' }}>
      <style>{`::-webkit-scrollbar{width:12px}::-webkit-scrollbar-track{background:#1e293b;border-radius:10px}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#3b82f6 0%,#8b5cf6 100%);border-radius:10px;border:2px solid #1e293b}::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,#2563eb 0%,#7c3aed 100%)}.metric-card{overflow:hidden}.metric-value{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.sticky-header{position:sticky;top:0;background-color:#1e293b;backdrop-filter:blur(8px);z-index:10}.sticky-header::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:2px;background:linear-gradient(90deg,#3b82f6 0%,#8b5cf6 100%)}`}</style>

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
              <a href="https://hypurrscan.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />Hypurrscan
              </a>
              <a href="https://hyperdash.info" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />HyperDash
              </a>
              
              <div className={`flex items-center gap-2 bg-${getStatusColor()}-500/10 border border-${getStatusColor()}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${getStatusColor()}-400 rounded-full animate-pulse`}></div>
                <span className={`text-${getStatusColor()}-400 font-medium flex items-center gap-2`}>
                  {getStatusEmoji()} Live • {whalesData.length}
                  <span className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-600">
                    <span className={`text-xs ${getTelegramColor()}`}>{getTelegramIcon()}</span>
                    <span className="text-[10px] text-slate-400">TG</span>
                  </span>
                </span>
              </div>

              <button onClick={fetchWhales} disabled={isLoading} className="p-1.5 hover:bg-slate-800 rounded disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
              
              <button onClick={handleSendTelegramResume} disabled={isSendingResume || whalesData.length === 0}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium shadow-lg transition-all ${
                  resumeSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } disabled:opacity-50`}>
                {isSendingResume ? <><RefreshCw className="w-4 h-4 animate-spin" />Enviando...</> : resumeSuccess ? <><Check className="w-4 h-4" />Enviado!</> : <><Send className="w-4 h-4" />📱 Resumo Telegram</>}
              </button>
              
              <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-1.5 rounded text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">
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
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
                  <p className="text-red-300 text-sm">{error}</p>
                  <button onClick={fetchWhales} className="mt-2 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {isLoading && whalesData.length === 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-slate-400">Carregando dados das whales...</p>
              </div>
            )}

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

            <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold">⚡ Liquidações Capturadas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(liquidationData).map(([period, data]) => (
                  <div key={period} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-300 font-bold">{period}</p>
                        <p className="text-2xl font-bold text-red-400">{formatCurrencyExact(data.total)}</p>
                      </div>
                      <p className="text-xs text-slate-400">{data.trades} liquidações</p>
                    </div>
                    <div className="space-y-2 text-xs border-t border-slate-700 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lucro:</span>
                        <span className="text-green-400 font-bold">+{formatCurrencyExact(data.profit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">LONGs:</span>
                        <span className="text-green-400 font-bold">{data.longs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SHORTs:</span>
                        <span className="text-orange-400 font-bold">{data.shorts}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-3">🐋 Whales ({whalesData.length})</h3>
              {whalesData.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>Nenhuma whale monitorada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nickname')}>
                            WALLET <SortIcon field="nickname" />
                          </div>
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400">
                          <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSort('accountValue')}>
                            VALOR <SortIcon field="accountValue" />
                          </div>
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400">
                          <div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSort('unrealizedPnl')}>
                            PNL <SortIcon field="unrealizedPnl" />
                          </div>
                        </th>
                        <th className="text-center py-2 px-3 text-slate-400">
                          <div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSort('positions')}>
                            POS <SortIcon field="positions" />
                          </div>
                        </th>
                        <th className="text-center py-2 px-3 text-slate-400">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((whale, idx) => {
                        const positions = whale.positions || [];
                        let accountValue = whale.accountValue || whale.total_position_value || 0;
                        let pnl = whale.unrealizedPnl || 0;
                        if (!pnl && positions.length > 0) {
                          pnl = positions.reduce((s, p) => s + (parseFloat(p.unrealizedPnl || 0)), 0);
                        }
                        const nickname = whale.nickname || `Whale #${idx + 1}`;
                        
                        return (
                          <tr key={whale.address} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="py-2 px-3">
                              <div className="font-semibold">{nickname}</div>
                              <div className="text-xs text-slate-400 font-mono">{whale.address.slice(0, 6)}...{whale.address.slice(-4)}</div>
                            </td>
                            <td className="text-right py-2 px-3 text-blue-400 font-bold">{formatCurrency(accountValue)}</td>
                            <td className={`text-right py-2 px-3 font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(pnl)}</td>
                            <td className="text-center py-2 px-3 font-bold">{positions.length}</td>
                            <td className="text-center py-2 px-3">
                              <div className="flex items-center justify-center gap-2">
                                <a href={`https://hypurrscan.io/address/${whale.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button onClick={() => confirmDeleteWhale(whale)} className="text-red-400 hover:text-red-300">
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

            {/* ✅ ADICIONADO DE VOLTA: Risk Dashboard */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold">🛡️ Risk Dashboard</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Portfolio Heat</p>
                  <p className="text-2xl font-bold text-orange-400">{riskMetrics.portfolioHeat}%</p>
                  <p className="text-xs text-orange-400">MEDIUM</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Capital at Risk</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(riskMetrics.capitalAtRisk)}</p>
                  <p className="text-xs text-slate-400">Exposição</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Avg R:R</p>
                  <p className="text-2xl font-bold text-green-400">{riskMetrics.avgRR}</p>
                  <p className="text-xs text-green-400">Ótimo</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Correlação</p>
                  <p className="text-2xl font-bold text-yellow-400">{riskMetrics.correlation}%</p>
                  <p className="text-xs text-slate-400">Entre ativos</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">VaR 95%</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(riskMetrics.var95)}</p>
                  <p className="text-xs text-slate-400">Max loss</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'positions' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📊 Posições Abertas ({getFilteredPositions().length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setPositionsFilter('all')} className={`px-3 py-1.5 rounded text-xs font-medium ${positionsFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Todas</button>
                  <button onClick={() => setPositionsFilter('long')} className={`px-3 py-1.5 rounded text-xs font-medium ${positionsFilter === 'long' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>🟢 LONG</button>
                  <button onClick={() => setPositionsFilter('short')} className={`px-3 py-1.5 rounded text-xs font-medium ${positionsFilter === 'short' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>🔴 SHORT</button>
                </div>
              </div>

              {getSortedPositions().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p>Nenhuma posição aberta</p>
                </div>
              ) : (
                <div className="border border-slate-700 rounded-lg" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="w-full text-sm">
                    <thead className="sticky-header">
                      <tr className="border-b-2 border-blue-500/50">
                        <th className="text-left py-3 px-3 text-slate-400"><div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSortPositions('coin')}>TOKEN <SortIconPositions field="coin" /></div></th>
                        <th className="text-left py-3 px-3 text-slate-400"><div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSortPositions('whale')}>WHALE <SortIconPositions field="whale" /></div></th>
                        <th className="text-center py-3 px-3 text-slate-400"><div className="flex items-center justify-center gap-2 cursor-pointer" onClick={() => handleSortPositions('side')}>LADO <SortIconPositions field="side" /></div></th>
                        <th className="text-right py-3 px-3 text-slate-400"><div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSortPositions('value')}>VALOR <SortIconPositions field="value" /></div></th>
                        <th className="text-right py-3 px-3 text-slate-400"><div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSortPositions('pnl')}>PNL <SortIconPositions field="pnl" /></div></th>
                        <th className="text-right py-3 px-3 text-slate-400"><div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSortPositions('entry')}>ENTRADA <SortIconPositions field="entry" /></div></th>
                        <th className="text-right py-3 px-3 text-slate-400"><div className="flex items-center justify-end gap-2 cursor-pointer" onClick={() => handleSortPositions('liqPrice')}>LIQ. <SortIconPositions field="liqPrice" /></div></th>
                        <th className="text-center py-3 px-3 text-slate-400">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedPositions().map((pos, idx) => {
                        const coin = pos.coin || 'N/A';
                        const szi = parseFloat(pos.szi || 0);
                        const isLong = szi > 0;
                        const posValue = parseFloat(pos.positionValue || pos.position_value || 0);
                        const pnl = parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0);
                        const entryPx = parseFloat(pos.entryPx || pos.entry_px || 0);
                        const liqPx = parseFloat(pos.liquidationPx || pos.liquidation_px || 0);
                        
                        return (
                          <tr key={`${pos.whaleAddress}-${coin}-${idx}`} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                            <td className="py-2 px-3 font-bold text-blue-400">{coin}</td>
                            <td className="py-2 px-3">
                              <div className="font-semibold">{pos.whaleNickname}</div>
                              <div className="text-xs text-slate-400 font-mono">{pos.whaleAddress.slice(0, 6)}...{pos.whaleAddress.slice(-4)}</div>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${isLong ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {isLong ? '🟢 LONG' : '🔴 SHORT'}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3 font-bold">{formatCurrencyExact(posValue)}</td>
                            <td className={`text-right py-2 px-3 font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrencyExact(pnl)}</td>
                            <td className="text-right py-2 px-3 font-mono">${entryPx > 0 ? entryPx.toFixed(2) : '-'}</td>
                            <td className="text-right py-2 px-3 font-mono text-yellow-400">${liqPx > 0 ? liqPx.toFixed(2) : '-'}</td>
                            <td className="text-center py-2 px-3">
                              <a href={`https://hypurrscan.io/address/${pos.whaleAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                                <ExternalLink className="w-3.5 h-3.5" />
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

            {/* ✅ ADICIONADO DE VOLTA: Resumo LONG/SHORT */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Total LONGs</p>
                <p className="text-2xl font-bold text-green-400">{getSortedPositions().filter(p => parseFloat(p.szi || 0) > 0).length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Total SHORTs</p>
                <p className="text-2xl font-bold text-orange-400">{getSortedPositions().filter(p => parseFloat(p.szi || 0) < 0).length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Vol. LONGs</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(getSortedPositions().filter(p => parseFloat(p.szi || 0) > 0).reduce((s, p) => s + parseFloat(p.positionValue || p.position_value || 0), 0))}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Vol. SHORTs</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(getSortedPositions().filter(p => parseFloat(p.szi || 0) < 0).reduce((s, p) => s + parseFloat(p.positionValue || p.position_value || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">⏰ Ordens Pendentes ({getFilteredOrders().length})</h2>
                <div className="flex gap-2">
                  <button onClick={() => setOrdersFilter('all')} className={`px-3 py-1.5 rounded text-xs font-medium ${ordersFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Todas</button>
                  <button onClick={() => setOrdersFilter('buy')} className={`px-3 py-1.5 rounded text-xs font-medium ${ordersFilter === 'buy' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>🟢 BUY</button>
                  <button onClick={() => setOrdersFilter('sell')} className={`px-3 py-1.5 rounded text-xs font-medium ${ordersFilter === 'sell' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>🔴 SELL</button>
                </div>
              </div>

              {getAllOrders().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma ordem pendente</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-2 px-3 text-slate-400">TOKEN</th>
                        <th className="text-left py-2 px-3 text-slate-400">WHALE</th>
                        <th className="text-center py-2 px-3 text-slate-400">LADO</th>
                        <th className="text-right py-2 px-3 text-slate-400">PREÇO</th>
                        <th className="text-right py-2 px-3 text-slate-400">QTD</th>
                        <th className="text-center py-2 px-3 text-slate-400">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredOrders().map((order, idx) => {
                        const coin = order.coin || 'N/A';
                        const side = order.side || '';
                        const isBuy = side.toLowerCase().includes('buy');
                        const price = parseFloat(order.limitPx || order.price || 0);
                        const sz = parseFloat(order.sz || order.size || 0);
                        
                        return (
                          <tr key={`${order.whaleAddress}-${coin}-${idx}`} className="border-b border-slate-700/30">
                            <td className="py-2 px-3 font-bold text-blue-400">{coin}</td>
                            <td className="py-2 px-3">
                              <div className="font-semibold">{order.whaleNickname}</div>
                              <div className="text-xs text-slate-400 font-mono">{order.whaleAddress.slice(0, 6)}...{order.whaleAddress.slice(-4)}</div>
                            </td>
                            <td className="text-center py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isBuy ? '🟢 BUY' : '🔴 SELL'}
                              </span>
                            </td>
                            <td className="text-right py-2 px-3 font-mono">${price.toFixed(2)}</td>
                            <td className="text-right py-2 px-3 font-mono">{sz.toFixed(4)}</td>
                            <td className="text-center py-2 px-3">
                              <a href={`https://hypurrscan.io/address/${order.whaleAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                                <ExternalLink className="w-3.5 h-3.5" />
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
          </div>
        )}

        {tab === 'ai-token' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                    🤖 Análise Agregada por Token com IA
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {getSortedTokens().length} tokens com posições abertas • Confidence Score Ativo • ✅ Preços Corrigidos
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={tokenSortField}
                    onChange={(e) => setTokenSortField(e.target.value)}
                    className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="confidence">Confidence Score</option>
                    <option value="popularity">Popularidade</option>
                    <option value="volume">Volume</option>
                    <option value="pnl">PnL</option>
                    <option value="name">Nome</option>
                  </select>
                  <button
                    onClick={() => setTokenSortDirection(tokenSortDirection === 'asc' ? 'desc' : 'asc')}
                    className="bg-slate-800 border border-slate-600 rounded px-3 py-2"
                  >
                    {tokenSortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setTokenFilter('all')} className={`px-4 py-2 rounded text-sm font-medium ${tokenFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  Todos ({getTokensAggregated().length})
                </button>
                <button onClick={() => setTokenFilter('long')} className={`px-4 py-2 rounded text-sm font-medium ${tokenFilter === 'long' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  🟢 Maioria LONG ({getTokensAggregated().filter(t => t.longs > t.shorts).length})
                </button>
                <button onClick={() => setTokenFilter('short')} className={`px-4 py-2 rounded text-sm font-medium ${tokenFilter === 'short' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  🔴 Maioria SHORT ({getTokensAggregated().filter(t => t.shorts > t.longs).length})
                </button>
                <button onClick={() => setTokenFilter('mixed')} className={`px-4 py-2 rounded text-sm font-medium ${tokenFilter === 'mixed' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  ⚖️ Divididos ({getTokensAggregated().filter(t => Math.abs(t.longs - t.shorts) <= 1).length})
                </button>
              </div>

              {getSortedTokens().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum token encontrado com os filtros selecionados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSortedTokens().map(token => {
                    const isExpanded = expandedTokenDetail === token.coin;
                    const stars = Math.round((token.confidence / 100) * 5);
                    
                    return (
                      <div key={token.coin} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                        <div
                          className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                          onClick={() => setExpandedTokenDetail(isExpanded ? null : token.coin)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-blue-400">{token.coin}</h3>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xs text-slate-400">Confidence Score</div>
                                <div className={`text-2xl font-bold ${
                                  token.confidence >= 80 ? 'text-green-400' :
                                  token.confidence >= 65 ? 'text-blue-400' :
                                  token.confidence >= 50 ? 'text-yellow-400' :
                                  token.confidence >= 35 ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                  {token.confidence}
                                </div>
                              </div>
                              <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                                token.signalColor === 'green' ? 'bg-green-500/20 text-green-400' :
                                token.signalColor === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                                token.signalColor === 'red' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {token.signalIcon} {token.signal}
                              </div>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300">{token.whaleCount} whales</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300">{token.positions.length} posições</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-slate-400 text-xs mb-1">Consenso</div>
                                <div className={`font-bold ${
                                  token.consensus === 'LONG' ? 'text-green-400' :
                                  token.consensus === 'SHORT' ? 'text-orange-400' : 'text-yellow-400'
                                }`}>
                                  {token.consensus === 'LONG' ? '🟢' : token.consensus === 'SHORT' ? '🔴' : '⚖️'} {token.consensus} ({token.longs}L / {token.shorts}S)
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-400 text-xs mb-1">Volume Total</div>
                                <div className="font-bold text-blue-400">{formatCurrencyExact(token.totalVolume)}</div>
                              </div>
                              <div>
                                <div className="text-slate-400 text-xs mb-1">PnL Agregado</div>
                                <div className={`font-bold ${token.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatCurrencyExact(token.totalPnL)} ({token.avgProfitPct >= 0 ? '+' : ''}{token.avgProfitPct.toFixed(2)}%)
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                            <span>{isExpanded ? '▲' : '▼'} Clique para {isExpanded ? 'ocultar' : 'expandir'} análise detalhada</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-slate-700 p-4 bg-slate-900/50 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  📊 Análise Detalhada
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">💪 Força da Posição:</span>
                                    <span className="font-bold text-blue-400">
                                      {formatCurrencyExact(token.avgSize)} {token.avgSize > 500000 ? '🔥 ALTO' : token.avgSize > 100000 ? '📈 MÉDIO' : '📊 BAIXO'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">⚡ Alavancagem Média:</span>
                                    <span className="font-bold text-yellow-400">
                                      {token.avgLeverage.toFixed(1)}x {token.avgLeverage > 5 ? '🔴 ALTO' : token.avgLeverage > 3 ? '🟡 MODERADO' : '🟢 BAIXO'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">📊 Concentração:</span>
                                    <span className="font-bold text-purple-400">
                                      {token.concentration.toFixed(0)}% {token.concentration > 70 ? '🔴 ALTO' : token.concentration > 50 ? '🟡 MÉDIO' : '🟢 DISTRIBUÍDO'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">🛡️ Distância Liquidação:</span>
                                    <span className={`font-bold ${token.avgLiquidationDistance > 15 ? 'text-green-400' : token.avgLiquidationDistance > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {token.avgLiquidationDistance.toFixed(1)}% {token.avgLiquidationDistance > 15 ? '🟢 SEGURO' : token.avgLiquidationDistance > 10 ? '🟡 MÉDIO' : '🔴 RISCO'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  ⚠️ Análise de Risco
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Risco Cascata:</span>
                                    <span className={`font-bold ${token.cascadeRisk < 20 ? 'text-green-400' : token.cascadeRisk < 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {token.cascadeRisk.toFixed(0)}% {token.cascadeRisk < 20 ? '🟢 BAIXO' : token.cascadeRisk < 40 ? '🟡 MÉDIO' : '🔴 ALTO'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">% Portfolio:</span>
                                    <span className="font-bold text-cyan-400">{token.portfolioPercent.toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Momentum:</span>
                                    <span className="font-bold text-blue-400">{token.momentum}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/30">
                              <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                💡 Análise de Preço (✅ CORRIGIDO)
                              </h4>
                              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                <div>
                                  <div className="text-slate-400 text-xs mb-1">Preço Atual (markPx)</div>
                                  <div className="font-bold text-white">${token.currentPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-slate-400 text-xs mb-1">Preço Médio Whales (entry)</div>
                                  <div className="font-bold text-blue-400">${token.avgEntryPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-slate-400 text-xs mb-1">Lucro Médio</div>
                                  <div className={`font-bold ${token.avgProfitPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {token.avgProfitPct >= 0 ? '+' : ''}{token.avgProfitPct.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                              <div className={`text-xs p-3 rounded ${token.avgProfitPct >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {token.avgProfitPct >= 0 ? '✅' : '⚠️'} {token.avgProfitPct >= 0
                                  ? `Whales estão em lucro. Você entraria $${(token.currentPrice - token.avgEntryPrice).toFixed(2)} acima delas.`
                                  : `Whales estão em prejuízo. Você entraria $${Math.abs(token.currentPrice - token.avgEntryPrice).toFixed(2)} abaixo delas.`}
                              </div>
                            </div>

                            <div className={`rounded-lg p-4 border ${
                              token.signalColor === 'green' ? 'bg-green-500/10 border-green-500/30' :
                              token.signalColor === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                              token.signalColor === 'red' ? 'bg-red-500/10 border-red-500/30' :
                              'bg-yellow-500/10 border-yellow-500/30'
                            }`}>
                              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                                {token.signalIcon} RECOMENDAÇÃO: {token.signal}
                              </h4>
                              <p className="text-xs text-slate-300">
                                {token.signal === 'STRONG BUY' && 'Alto consenso, baixo risco, PnL positivo. Posição favorável para copiar.'}
                                {token.signal === 'BUY' && 'Consenso favorável com risco aceitável. Considere entrar com cautela.'}
                                {token.signal === 'HOLD' && 'Sinais mistos. Aguarde melhor momento para entrada.'}
                                {token.signal === 'SELL' && 'Consenso fraco com risco aumentado. Evite entrar ou considere sair.'}
                                {token.signal === 'STRONG SELL' && 'Alto risco, baixo consenso, PnL negativo. Não recomendado.'}
                              </p>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                📋 Posições Individuais ({token.positions.length})
                              </h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {token.positions.map((pos, idx) => (
                                  <div key={idx} className="bg-slate-900/50 rounded p-3 text-xs border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded font-bold ${pos.isLong ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                          {pos.isLong ? '🟢 LONG' : '🔴 SHORT'}
                                        </span>
                                        <span className="font-semibold text-white">{pos.whaleNickname}</span>
                                        <span className="text-slate-500 font-mono">{pos.whaleAddress.slice(0, 6)}...{pos.whaleAddress.slice(-4)}</span>
                                      </div>
                                      <a href={`https://hypurrscan.io/address/${pos.whaleAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                      <div>
                                        <div className="text-slate-500">Tamanho</div>
                                        <div className="text-white font-bold">{Math.abs(parseFloat(pos.szi || 0)).toFixed(4)}</div>
                                      </div>
                                      <div>
                                        <div className="text-slate-500">Valor</div>
                                        <div className="text-blue-400 font-bold">{formatCurrencyExact(parseFloat(pos.positionValue || pos.position_value || 0))}</div>
                                      </div>
                                      <div>
                                        <div className="text-slate-500">PnL</div>
                                        <div className={`font-bold ${parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {formatCurrencyExact(parseFloat(pos.unrealizedPnl || pos.unrealized_pnl || 0))}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-slate-500">Entrada</div>
                                        <div className="text-white font-mono">${parseFloat(pos.entryPx || pos.entry_px || 0).toFixed(2)}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Tokens Únicos</p>
                <p className="text-2xl font-bold text-purple-400">{getTokensAggregated().length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Consenso LONG</p>
                <p className="text-2xl font-bold text-green-400">{getTokensAggregated().filter(t => t.longs > t.shorts).length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Consenso SHORT</p>
                <p className="text-2xl font-bold text-orange-400">{getTokensAggregated().filter(t => t.shorts > t.longs).length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">Divididos</p>
                <p className="text-2xl font-bold text-yellow-400">{getTokensAggregated().filter(t => Math.abs(t.longs - t.shorts) <= 1).length}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs mb-1">High Confidence</p>
                <p className="text-2xl font-bold text-cyan-400">{getTokensAggregated().filter(t => t.confidence >= 80).length}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'trades' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Trade History - Em breve</p>
          </div>
        )}

        {tab === 'ai-wallet' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">AI Wallet Analysis - Em breve</p>
          </div>
        )}

        {tab === 'analytics' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Advanced Analytics - Em breve</p>
          </div>
        )}

        {tab === 'risk' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Risk Dashboard - Em breve</p>
          </div>
        )}

        {tab === 'simulator' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <PlayCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Copy Trading Simulator - Em breve</p>
          </div>
        )}

        {tab === 'board' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Whale Leaderboard - Em breve</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Adicionar Nova Whale</h3>
              <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Endereço da Wallet *</label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nickname (opcional)</label>
                <input
                  type="text"
                  value={newWalletNickname}
                  onChange={(e) => setNewWalletNickname(e.target.value)}
                  placeholder="Ex: Mega Whale"
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {addError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-sm text-red-400">
                  {addError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setAddError(''); }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddWhale}
                  disabled={isAddingWallet}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded font-medium disabled:opacity-50"
                >
                  {isAddingWallet ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && walletToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Confirmar Remoção</h3>
                <p className="text-sm text-slate-400">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded p-4 mb-4">
              <p className="text-sm text-slate-300 mb-2">Você está removendo:</p>
              <p className="font-bold text-white">{walletToDelete.nickname || 'Whale sem nome'}</p>
              <p className="text-xs text-slate-400 font-mono mt-1">{walletToDelete.address}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setWalletToDelete(null); }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWhale}
                disabled={isDeletingWallet}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {isDeletingWallet ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lastUpdate && (
        <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg px-4 py-2 text-xs text-slate-400">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </div>
      )}
    </div>
  );
}
