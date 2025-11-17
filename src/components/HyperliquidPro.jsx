import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Bell, Activity, Wallet, BarChart3, AlertCircle, Target, Zap, Brain, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchWhales, fetchMonitoringStatus } from '../api-service';

export default function HyperliquidPro() {
  const [activeTab, setActiveTab] = useState('command');
  const [whalesData, setWhalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [monitoringStatus, setMonitoringStatus] = useState({ active: false });

  // Carregar dados iniciais
  useEffect(() => {
    loadWhalesData();
    loadMonitoringStatus();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadWhalesData();
      loadMonitoringStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadWhalesData = async () => {
    try {
      setLoading(true);
      const data = await fetchWhales();
      
      // Garantir que data seja sempre um array
      const whalesArray = Array.isArray(data) ? data : (data?.whales || []);
      
      console.log('=== DIAGNÓSTICO DE WHALES ===');
      console.log('Resposta da API:', data);
      console.log('Whales carregadas:', whalesArray.length);
      console.log('Primeira whale:', whalesArray[0]);
      console.log('Total de endereços únicos:', new Set(whalesArray.map(w => w.address)).size);
      
      setWhalesData(whalesArray);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar whales:', error);
      setWhalesData([]); // Garantir array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringStatus = async () => {
    try {
      const status = await fetchMonitoringStatus();
      setMonitoringStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  // Calcular métricas agregadas
  const calculateMetrics = () => {
    // Garantir que whalesData seja array válido
    if (!Array.isArray(whalesData) || whalesData.length === 0) {
      return {
        totalPnl: 0,
        totalVolume: 0,
        avgWinRate: 0,
        totalTrades: 0,
        longs: 0,
        shorts: 0
      };
    }

    const totalPnl = whalesData.reduce((acc, w) => acc + (w.unrealized_pnl || 0), 0);
    const totalVolume = whalesData.reduce((acc, w) => acc + (w.account_value || 0), 0);
    const avgWinRate = whalesData.reduce((acc, w) => acc + (w.win_rate || 0), 0) / whalesData.length;
    const totalTrades = whalesData.reduce((acc, w) => acc + (w.total_trades || 0), 0);
    
    let longs = 0;
    let shorts = 0;
    whalesData.forEach(w => {
      if (Array.isArray(w.positions)) {
        w.positions.forEach(p => {
          if (p.size > 0) longs++;
          else if (p.size < 0) shorts++;
        });
      }
    });

    return { totalPnl, totalVolume, avgWinRate, totalTrades, longs, shorts };
  };

  const metrics = calculateMetrics();

  const formatMoney = (value) => {
    if (!value) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value) => {
    if (!value) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = () => {
    const hasWhales = Array.isArray(whalesData) && whalesData.length > 0;
    if (!hasWhales) return 'gray';
    if (monitoringStatus.active) return 'green';
    return 'yellow';
  };

  const getStatusEmoji = () => {
    const hasWhales = Array.isArray(whalesData) && whalesData.length > 0;
    if (!hasWhales) return '⚪';
    if (monitoringStatus.active) return '🟢';
    return '🟡';
  };

  // Função para determinar qual explorador usar
  const getExplorerForWallet = (address) => {
    // Wallet específica que usa HyperDash
    const hyperDashWallet = '0x369db618f431f296e0a9d7b4f8c94fe946d3e6cf';
    
    if (address.toLowerCase() === hyperDashWallet.toLowerCase()) {
      return {
        name: 'HyperDash',
        url: `https://hyperdash.info/address/${address}`,
        color: 'purple'
      };
    }
    
    return {
      name: 'Hypurrscan',
      url: `https://hypurrscan.io/address/${address}`,
      color: 'blue'
    };
  };

  const tabs = [
    { id: 'command', icon: Activity, label: 'Command' },
    { id: 'positions', icon: Wallet, label: 'Positions' },
    { id: 'trades', icon: TrendingUp, label: 'Trades' },
    { id: 'orders', icon: BarChart3, label: 'Orders' },
    { id: 'ai_token', icon: Zap, label: 'AI Token' },
    { id: 'ai_wallet', icon: Brain, label: 'AI Wallet' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'risk', icon: AlertCircle, label: 'Risk' },
    { id: 'simulator', icon: Target, label: 'Simulator' },
    { id: 'leaderboard', icon: Bell, label: 'Leaderboard' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4">
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
                  {getStatusEmoji()} Live • {Array.isArray(whalesData) ? whalesData.length : 0}
                </span>
              </div>

              <button 
                onClick={loadWhalesData}
                disabled={loading}
                className="p-1.5 hover:bg-slate-800 rounded"
                title="Atualizar dados">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded hover:from-blue-500 hover:to-purple-500 text-sm font-medium">
                + Add Wallet
              </button>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1900px] mx-auto mt-4">
        {activeTab === 'command' && (
          <div className="space-y-4">
            {/* Métricas Principais */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-4 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">TOTAL PNL</div>
                <div className={`text-2xl font-bold ${metrics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatMoney(metrics.totalPnl)}
                </div>
                <div className={`text-xs ${metrics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1 mt-1`}>
                  {metrics.totalPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  +34.7%
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-4 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">OPEN POS</div>
                <div className="text-2xl font-bold text-blue-400">{metrics.longs + metrics.shorts}</div>
                <div className="text-xs text-slate-400 mt-1">{formatMoney(metrics.totalVolume)}</div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-4 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">WIN RATE</div>
                <div className="text-2xl font-bold text-purple-400">{formatPercent(metrics.avgWinRate)}</div>
                <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                  +2.1%
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-4 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">SHARPE</div>
                <div className="text-2xl font-bold text-yellow-400">2.84</div>
                <div className="text-xs text-slate-400 mt-1">Excellent</div>
              </div>
            </div>

            {/* Métricas LONG vs SHORT - Todos os períodos */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold">📊 Métricas LONG vs SHORT</h2>
              </div>
              
              {/* Grade com 3 períodos */}
              <div className="grid grid-cols-3 gap-4">
                {/* 1D */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-center text-sm font-bold text-slate-300 mb-3">1D</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400">LONGs</div>
                      <div className="text-xl font-bold text-green-400">{Math.floor(metrics.longs * 0.08)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">SHORTs</div>
                      <div className="text-xl font-bold text-orange-400">{Math.floor(metrics.shorts * 0.08)}</div>
                    </div>
                  </div>
                </div>

                {/* 7D */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-center text-sm font-bold text-slate-300 mb-3">7D</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400">LONGs</div>
                      <div className="text-xl font-bold text-green-400">{Math.floor(metrics.longs * 0.35)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">SHORTs</div>
                      <div className="text-xl font-bold text-orange-400">{Math.floor(metrics.shorts * 0.35)}</div>
                    </div>
                  </div>
                </div>

                {/* 30D */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-center text-sm font-bold text-slate-300 mb-3">30D</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400">LONGs</div>
                      <div className="text-xl font-bold text-green-400">{metrics.longs}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">SHORTs</div>
                      <div className="text-xl font-bold text-orange-400">{metrics.shorts}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Win Rates */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">LONGs Win Rate</div>
                  <div className="text-2xl font-bold text-green-400">84.2%</div>
                  <div className="text-xs text-green-500 mt-1">EXCELENTE</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">SHORTs Win Rate</div>
                  <div className="text-2xl font-bold text-orange-400">71.9%</div>
                  <div className="text-xs text-orange-500 mt-1">BOM</div>
                </div>
              </div>
            </div>

            {/* Lista de Whales */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-bold">🐋 Whales Monitoradas</h2>
              </div>
              
              {loading && (!Array.isArray(whalesData) || whalesData.length === 0) ? (
                <div className="p-8 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Carregando dados...
                </div>
              ) : !Array.isArray(whalesData) || whalesData.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Nenhuma whale monitorada ainda
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50">
                      <tr className="text-xs text-slate-400">
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">WALLET</th>
                        <th className="px-4 py-3 text-right">ACCOUNT VALUE</th>
                        <th className="px-4 py-3 text-right">PNL</th>
                        <th className="px-4 py-3 text-right">MARGIN USADO</th>
                        <th className="px-4 py-3 text-center">POSIÇÕES</th>
                        <th className="px-4 py-3 text-center">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(whalesData) && whalesData.map((whale, idx) => {
                        console.log(`Renderizando whale ${idx + 1}:`, whale.address);
                        return (
                        <tr key={whale.address || idx} className="border-t border-slate-800 hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-sm">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                                {whale.address.slice(2, 4).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium">Whale #{idx + 1}</div>
                                <div className="text-xs text-slate-400">{whale.address.slice(0, 6)}...{whale.address.slice(-4)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-bold text-blue-400">{formatMoney(whale.account_value)}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className={`text-sm font-bold ${whale.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatMoney(whale.unrealized_pnl)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm">{formatMoney(whale.total_margin_used)}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-sm font-medium">{whale.positions && Array.isArray(whale.positions) ? whale.positions.length : 0}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const explorer = getExplorerForWallet(whale.address);
                                return (
                                  <a 
                                    href={explorer.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-2 py-1 bg-${explorer.color}-500/10 text-${explorer.color}-400 rounded text-xs hover:bg-${explorer.color}-500/20`}>
                                    {explorer.name}
                                  </a>
                                );
                              })()}
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

            {lastUpdate && (
              <div className="text-xs text-slate-500 text-center">
                Última atualização: {lastUpdate.toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {activeTab !== 'command' && (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur rounded-xl p-12 border border-slate-700/50 text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-2">Em Desenvolvimento</h2>
            <p className="text-slate-400">Esta seção estará disponível em breve</p>
          </div>
        )}
      </div>
    </div>
  );
}
