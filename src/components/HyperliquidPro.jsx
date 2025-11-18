import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, Plus, ExternalLink, RefreshCw, 
  Trash2, X, Check, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown,
  BarChart3, TrendingUp, Shield, PlayCircle, Bell, Target, Brain, Award
} from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

export default function HyperliquidPro() {
  const [tab, setTab] = useState('command');
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
  
  // Estado para deletar wallet
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState(null);
  const [isDeletingWallet, setIsDeletingWallet] = useState(false);

  // Estados para ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Cores para os círculos das whales
  const avatarColors = [
    'bg-purple-600', 'bg-blue-600', 'bg-pink-600', 'bg-indigo-600',
    'bg-violet-600', 'bg-fuchsia-600', 'bg-cyan-600', 'bg-sky-600',
    'bg-rose-600', 'bg-purple-500', 'bg-blue-500'
  ];

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
    } catch (err) {
      console.error('Erro ao buscar whales:', err);
      setError(err.message);
      setIsLoading(false);
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

  const formatCurrency = (value) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando whales...</p>
          <p className="text-slate-400 text-sm mt-2">Aguarde até 60 segundos</p>
        </div>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Hyperliquid Pro Tracker</h1>
                <p className="text-slate-400 text-sm">Institutional Grade - Live from Hypurrscan & HyperDash</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <a
                href="https://hypurrscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Hypurrscan
              </a>
              <a
                href="https://hyperdash.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                HyperDash
              </a>
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold text-sm">Live</span>
                <span className="text-white">• {whalesData.length}</span>
              </div>
              <button
                onClick={fetchWhales}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg flex items-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'command', icon: Activity, label: 'Command' },
              { id: 'positions', icon: BarChart3, label: 'Positions' },
              { id: 'trades', icon: TrendingUp, label: 'Trades' },
              { id: 'orders', icon: BarChart3, label: 'Orders' },
              { id: 'ai-token', icon: Brain, label: 'AI Token' },
              { id: 'ai-wallet', icon: Target, label: 'AI Wallet' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'risk', icon: Shield, label: 'Risk' },
              { id: 'simulator', icon: PlayCircle, label: 'Simulator' },
              { id: 'leaderboard', icon: Award, label: 'Leaderboard' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-6 py-3 font-semibold rounded-t-lg flex items-center gap-2 transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {whalesData.length === 0 ? (
          <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-700/50">
            <p className="text-slate-400 text-xl mb-2">Nenhuma whale monitorada</p>
            <p className="text-slate-500">Clique em "Add Wallet" para começar</p>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-700/50">
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">#</th>
                  <th 
                    className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('nickname')}
                  >
                    <div className="flex items-center gap-2">
                      WALLET
                      <SortIcon field="nickname" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('accountValue')}
                  >
                    <div className="flex items-center gap-2">
                      ACCOUNT VALUE
                      <SortIcon field="accountValue" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('unrealizedPnl')}
                  >
                    <div className="flex items-center gap-2">
                      PNL
                      <SortIcon field="unrealizedPnl" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('marginUsed')}
                  >
                    <div className="flex items-center gap-2">
                      MARGIN USADO
                      <SortIcon field="marginUsed" />
                    </div>
                  </th>
                  <th 
                    className="text-center px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider cursor-pointer hover:text-slate-300"
                    onClick={() => handleSort('positions')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      POSIÇÕES
                      <SortIcon field="positions" />
                    </div>
                  </th>
                  <th className="text-center px-6 py-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((whale, index) => {
                  const avatarText = (whale.address.slice(2, 4)).toUpperCase();
                  const colorClass = avatarColors[index % avatarColors.length];
                  
                  return (
                    <tr 
                      key={whale.address}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-slate-400 font-semibold">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-sm">{avatarText}</span>
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              {whale.nickname || `Whale #${index + 1}`}
                            </div>
                            <div className="text-slate-500 text-xs font-mono">
                              {whale.address.slice(0, 6)}...{whale.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-400 font-bold text-lg">
                          {formatCurrency(whale.accountValue || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-lg ${
                          (whale.unrealizedPnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatCurrency(whale.unrealizedPnl || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300 font-semibold">
                          {formatCurrency(whale.marginUsed || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold text-lg">
                          {(whale.positions || []).length}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`https://hypurrscan.io/address/${whale.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                          >
                            Hypurrscan
                          </a>
                          <button
                            onClick={() => confirmDeleteWhale(whale)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
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
