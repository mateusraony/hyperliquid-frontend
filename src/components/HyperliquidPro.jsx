import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Activity, AlertTriangle, Clock, 
  ChevronDown, ChevronUp, Plus, ExternalLink, RefreshCw, Wifi, 
  WifiOff, Trash2, X, Check 
} from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

export default function HyperliquidPro() {
  const [whalesData, setWhalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedWhale, setSelectedWhale] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
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

  // Buscar dados das whales
  const fetchWhales = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/whales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(60000) // 60 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // Validação robusta dos dados
      if (Array.isArray(data)) {
        setWhalesData(data);
        setIsOnline(true);
      } else if (data && Array.isArray(data.whales)) {
        setWhalesData(data.whales);
        setIsOnline(true);
      } else {
        console.warn('Formato de dados inesperado:', data);
        setWhalesData([]);
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao buscar whales:', err);
      setError(err.message);
      setIsOnline(false);
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

    // Validar formato do endereço Ethereum
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

      const result = await response.json();
      
      // Atualizar lista
      await fetchWhales();
      
      // Limpar e fechar modal
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

      // Atualizar lista
      await fetchWhales();
      
      // Fechar modal
      setShowDeleteModal(false);
      setWalletToDelete(null);
      
    } catch (err) {
      console.error('Erro ao deletar whale:', err);
      setAddError(err.message);
    } finally {
      setIsDeletingWallet(false);
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    fetchWhales();
    const interval = setInterval(fetchWhales, 30000);
    return () => clearInterval(interval);
  }, []);

  // Formatar valores
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value && value !== 0) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-300 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando whales...</p>
          <p className="text-purple-300 text-sm mt-2">Aguarde até 60 segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🐋 Hyperliquid Whale Tracker
          </h1>
          <p className="text-purple-200">Monitoramento em tempo real</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Online/Offline */}
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-400 animate-pulse" />
                <span className="text-green-400 font-semibold">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">OFFLINE</span>
              </>
            )}
          </div>
          
          {/* Última atualização */}
          {lastUpdate && (
            <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-300" />
              <span className="text-white text-sm">{formatTime(lastUpdate)}</span>
            </div>
          )}
          
          {/* Botão Refresh */}
          <button
            onClick={fetchWhales}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>

          {/* Botão Add Wallet */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Adicionar Wallet
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-red-400 font-semibold">Erro ao carregar dados</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de Whales */}
      {whalesData.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center">
          <Wallet className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Nenhuma whale monitorada</p>
          <p className="text-slate-400">Adicione uma wallet para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whalesData.map((whale) => (
            <div
              key={whale.address}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-800">
                      {whale.nickname || `Whale ${whale.address.slice(0, 6)}...${whale.address.slice(-4)}`}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    {whale.address}
                  </p>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-2 ml-2">
                  {/* Link Hypurrscan */}
                  <a
                    href={`https://hypurrscan.io/address/${whale.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded transition-colors"
                    title="Ver no Hypurrscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Botão Deletar */}
                  <button
                    onClick={() => confirmDeleteWhale(whale)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Remover whale"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div className="space-y-3">
                {/* Account Value */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Valor da Conta</span>
                  <span className="text-lg font-bold text-slate-800">
                    {formatCurrency(whale.accountValue)}
                  </span>
                </div>

                {/* Margin Used */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Margem Usada</span>
                  <span className="text-base font-semibold text-slate-700">
                    {formatCurrency(whale.marginUsed)}
                  </span>
                </div>

                {/* Unrealized PnL */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">PnL Não Realizado</span>
                  <span className={`text-base font-semibold ${
                    (whale.unrealizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(whale.unrealizedPnl)}
                  </span>
                </div>

                {/* Liquidation Risk */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Risco de Liquidação</span>
                  <span className={`text-base font-bold px-2 py-1 rounded ${
                    (whale.liquidationRisk || 0) < 5 ? 'bg-green-100 text-green-700' :
                    (whale.liquidationRisk || 0) < 15 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {formatPercent(whale.liquidationRisk || 0)}
                  </span>
                </div>

                {/* Posições Ativas */}
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Posições Ativas: {whale.positions?.length || 0}
                    </span>
                  </div>
                  
                  {whale.positions && whale.positions.length > 0 && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {whale.positions.map((pos, idx) => (
                        <div key={idx} className="text-xs bg-slate-50 rounded p-2 flex justify-between">
                          <span className="font-semibold text-slate-700">{pos.coin || pos.token}</span>
                          <span className={pos.szi > 0 ? 'text-green-600' : 'text-red-600'}>
                            {pos.szi > 0 ? 'LONG' : 'SHORT'} {Math.abs(pos.szi || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Wallet */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-600" />
                Adicionar Wallet
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddError('');
                  setNewWalletAddress('');
                  setNewWalletNickname('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Endereço */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Endereço da Wallet *
                </label>
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Exemplo: 0x8c5865689EABe45645fa034e53d0c9995DCcb9c9
                </p>
              </div>

              {/* Apelido */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Apelido (opcional)
                </label>
                <input
                  type="text"
                  value={newWalletNickname}
                  onChange={(e) => setNewWalletNickname(e.target.value)}
                  placeholder="Ex: Sigma Whale"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-purple-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Erro */}
              {addError && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{addError}</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddError('');
                    setNewWalletAddress('');
                    setNewWalletNickname('');
                  }}
                  disabled={isAddingWallet}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddWhale}
                  disabled={isAddingWallet || !newWalletAddress.trim()}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Confirmar Remoção
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setWalletToDelete(null);
                }}
                disabled={isDeletingWallet}
                className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600">
                Tem certeza que deseja remover esta wallet do monitoramento?
              </p>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {walletToDelete.nickname || 'Whale'}
                </p>
                <p className="text-xs text-slate-500 font-mono break-all">
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
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
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
