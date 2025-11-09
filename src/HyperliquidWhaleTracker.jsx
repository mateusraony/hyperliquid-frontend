import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bell, Activity, Target, Brain, Award, BarChart3, ExternalLink, Clock, Zap, Users, Shield, AlertTriangle, PlayCircle, Layers, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

export default function HyperliquidWhaleTracker() {
  // Estados
  const [tab, setTab] = useState('command');
  const [whalesData, setWhalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState('online');
  const [expandedMetric, setExpandedMetric] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [whaleToDelete, setWhaleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Configuração da API
  const API_URL = 'https://hyperliquid-whale-backend.onrender.com';
  const TIMEOUT = 60000; // 60 segundos

  // Dados mockados para liquidação
  const liquidationData = {
    '1D': { total: 2340000, trades: 12, profit: 450000, longs: 8, shorts: 4 },
    '7D': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1W': { total: 8920000, trades: 67, profit: 1890000, longs: 42, shorts: 25 },
    '1M': { total: 24500000, trades: 234, profit: 4870000, longs: 145, shorts: 89 },
  };

  // Carregar dados da API
  useEffect(() => {
    loadWhalesData();
    const interval = setInterval(loadWhalesData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadWhalesData() {
    try {
      console.log('🔄 Carregando dados...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const response = await fetch(`${API_URL}/api/whales`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados carregados:', data);

      if (data.whales && Array.isArray(data.whales)) {
        setWhalesData(data.whales);
        setSystemStatus('online');
        setError(null);
      } else {
        throw new Error('Formato de dados inválido');
      }

      setLoading(false);

    } catch (err) {
      console.error('❌ Erro:', err);
      setError(err.message);
      setSystemStatus('offline');
      setLoading(false);
    }
  }

  // Função de deletar
  async function deleteWhale(address) {
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`${API_URL}/api/whale/delete/${address}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao deletar');

      setWhalesData(prev => prev.filter(w => w.address !== address));
      setShowDeleteModal(false);
      setWhaleToDelete(null);

    } catch (err) {
      alert('Erro ao deletar whale: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Funções auxiliares
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

  function getStatusEmoji() {
    if (systemStatus === 'online') return '🟢';
    if (systemStatus === 'warning') return '🟡';
    return '🔴';
  }

  // Calcula métricas
  const totalValue = whalesData.reduce((sum, w) => sum + (w.total_value || 0), 0);
  const totalPositions = whalesData.reduce((sum, w) => sum + (w.positions_count || 0), 0);
  const totalPnl = whalesData.reduce((sum, w) => sum + (w.pnl_24h || 0), 0);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando dados das whales...</p>
          <p className="text-sm text-slate-500 mt-2">Aguarde até 60 segundos</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && whalesData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800/50 border border-red-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erro ao Carregar</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={loadWhalesData}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* Scrollbar */}
      <style>{`
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
          border-radius: 10px;
          border: 2px solid #1e293b;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb 0%, #7c3aed 100%);
        }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-[1900px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Hyperliquid Pro Tracker</h1>
                <p className="text-xs text-slate-400">Institutional Grade - Live from Hypurrscan & HyperDash</p>
              </div>
            </div>
            
            {/* Status e Botões */}
            <div className="flex items-center gap-2">
              <a href="https://hypurrscan.io" target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700">
                <ExternalLink className="w-3 h-3" />Hypurrscan
              </a>
              
              {/* Status */}
              <div className={`flex items-center gap-2 bg-${systemStatus === 'online' ? 'green' : 'red'}-500/10 border border-${systemStatus === 'online' ? 'green' : 'red'}-500/30 px-3 py-1 rounded text-xs`}>
                <div className={`w-2 h-2 bg-${systemStatus === 'online' ? 'green' : 'red'}-400 rounded-full animate-pulse`}></div>
                <span className="font-medium flex items-center gap-1">
                  {getStatusEmoji()} Live • {whalesData.length}
                </span>
              </div>

              <button className="p-1.5 hover:bg-slate-800 rounded">
                <Bell className="w-4 h-4" />
              </button>
              
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-1.5 rounded text-sm font-medium shadow-lg">
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

      {/* Conteúdo */}
      <div className="max-w-[1900px] mx-auto p-4">
        
        {tab === 'command' && (
          <div className="space-y-4">
            
            {/* Métricas Globais */}
            <div className="grid grid-cols-8 gap-3">
              {[
                { label: 'Total PnL', val: formatCurrency(totalPnl), sub: '+34.7%', color: 'green' },
                { label: 'Open Pos', val: totalPositions, sub: formatCurrency(totalValue), color: 'blue' },
                { label: 'Win Rate', val: '79.3%', sub: '+2.1%', color: 'purple' },
                { label: 'Sharpe', val: '2.84', sub: 'Excellent', color: 'yellow' },
                { label: 'Heat', val: '45%', sub: 'MEDIUM', color: 'orange' },
                { label: 'VaR 95%', val: '-$12.4K', sub: 'Risk', color: 'red' },
                { label: 'Alerts', val: '47', sub: '12 high', color: 'cyan' },
                { label: 'Fees', val: '$2.8K', sub: '30 days', color: 'slate' },
              ].map((s, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs uppercase mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-green-400">{s.val}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* LONG/SHORT */}
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

            {/* Liquidações */}
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista de Whales */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">🐋 Whales Monitoradas ({whalesData.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {whalesData.map((whale) => (
                  <div 
                    key={whale.address}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                  >
                    {/* Header */}
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
                        onClick={() => {
                          setWhaleToDelete(whale);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
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

                    {/* Link */}
                    <a
                      href={whale.wallet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
                    >
                      Ver no Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Outras abas */}
        {tab !== 'command' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Aba {tab.toUpperCase()}</h3>
            <p className="text-slate-400">Conteúdo em desenvolvimento...</p>
          </div>
        )}

      </div>

      {/* Modal de Exclusão */}
      {showDeleteModal && whaleToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                Confirmar Exclusão
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-2">Deseja realmente excluir a whale:</p>
            <p className="font-bold text-white mb-1">{whaleToDelete.nickname}</p>
            <p className="text-xs text-slate-400 font-mono mb-6">{whaleToDelete.address}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteWhale(whaleToDelete.address)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
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
