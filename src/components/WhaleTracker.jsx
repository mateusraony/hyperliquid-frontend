import React, { useState, useEffect } from 'react';
import apiService from './api-service';
import './WhaleTracker.css';

const WhaleTracker = () => {
  const [whales, setWhales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [newWhaleAddress, setNewWhaleAddress] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [whaleToDelete, setWhaleToDelete] = useState(null);

  // Buscar dados das whales
  const fetchWhales = async () => {
    try {
      setError(null);
      const data = await apiService.getWhales();
      setWhales(data.whales || []);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar whales:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Buscar status do monitoramento
  const fetchMonitoringStatus = async () => {
    try {
      const status = await apiService.getMonitoringStatus();
      setMonitoringActive(status.active);
    } catch (err) {
      console.error('Erro ao buscar status:', err);
    }
  };

  // Iniciar monitoramento
  const startMonitoring = async () => {
    try {
      await apiService.startMonitoring();
      setMonitoringActive(true);
      fetchWhales();
    } catch (err) {
      console.error('Erro ao iniciar monitoramento:', err);
      setError(err.message);
    }
  };

  // Parar monitoramento
  const stopMonitoring = async () => {
    try {
      await apiService.stopMonitoring();
      setMonitoringActive(false);
    } catch (err) {
      console.error('Erro ao parar monitoramento:', err);
      setError(err.message);
    }
  };

  // Adicionar whale
  const addWhale = async () => {
    if (!newWhaleAddress.trim()) {
      setError('Digite um endereço válido');
      return;
    }

    try {
      setError(null);
      await apiService.addWhale(newWhaleAddress);
      setNewWhaleAddress('');
      fetchWhales();
    } catch (err) {
      console.error('Erro ao adicionar whale:', err);
      setError(err.message);
    }
  };

  // Abrir modal de confirmação para deletar
  const openDeleteModal = (whale) => {
    setWhaleToDelete(whale);
    setShowDeleteModal(true);
  };

  // Confirmar deleção
  const confirmDelete = async () => {
    if (!whaleToDelete) return;

    try {
      setError(null);
      await apiService.deleteWhale(whaleToDelete.address);
      setShowDeleteModal(false);
      setWhaleToDelete(null);
      fetchWhales();
    } catch (err) {
      console.error('Erro ao deletar whale:', err);
      setError(err.message);
      setShowDeleteModal(false);
    }
  };

  // Cancelar deleção
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setWhaleToDelete(null);
  };

  // Formatar valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Efeitos
  useEffect(() => {
    fetchWhales();
    fetchMonitoringStatus();
  }, []);

  useEffect(() => {
    if (monitoringActive) {
      const interval = setInterval(fetchWhales, 30000); // Atualizar a cada 30s
      return () => clearInterval(interval);
    }
  }, [monitoringActive]);

  // Renderização
  if (loading) {
    return (
      <div className="whale-tracker">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando dados das whales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="whale-tracker">
      {/* Header */}
      <header className="header">
        <h1>🐋 Hyperliquid Whale Tracker</h1>
        <div className="header-controls">
          <div className={`status-badge ${monitoringActive ? 'active' : 'inactive'}`}>
            {monitoringActive ? '🟢 Monitorando' : '🔴 Parado'}
          </div>
          <button
            className={`btn-monitoring ${monitoringActive ? 'stop' : 'start'}`}
            onClick={monitoringActive ? stopMonitoring : startMonitoring}
          >
            {monitoringActive ? 'Parar' : 'Iniciar'} Monitoramento
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Add Whale Section */}
      <div className="add-whale-section">
        <input
          type="text"
          placeholder="Digite o endereço da whale (0x...)"
          value={newWhaleAddress}
          onChange={(e) => setNewWhaleAddress(e.target.value)}
          className="whale-input"
        />
        <button onClick={addWhale} className="btn-add">
          Adicionar Whale
        </button>
      </div>

      {/* Whales Grid */}
      <div className="whales-grid">
        {whales.length === 0 ? (
          <div className="no-data">
            <p>Nenhuma whale encontrada</p>
          </div>
        ) : (
          whales.map((whale) => (
            <div key={whale.address} className="whale-card">
              <div className="whale-header">
                <div className="whale-address">
                  <span className="address-label">Endereço:</span>
                  <a
                    href={`https://hypurrscan.io/address/${whale.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-link"
                  >
                    {formatAddress(whale.address)}
                  </a>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => openDeleteModal(whale)}
                  title="Remover whale"
                >
                  🗑️
                </button>
              </div>

              <div className="whale-stats">
                <div className="stat-item">
                  <span className="stat-label">Valor da Conta:</span>
                  <span className="stat-value">
                    {formatCurrency(whale.account_value || 0)}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Margem Usada:</span>
                  <span className="stat-value">
                    {formatCurrency(whale.total_margin_used || 0)}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">PnL Não Realizado:</span>
                  <span
                    className={`stat-value ${
                      (whale.unrealized_pnl || 0) >= 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {formatCurrency(whale.unrealized_pnl || 0)}
                  </span>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Risco de Liquidação:</span>
                  <span className={`risk-badge risk-${(whale.liquidation_risk || 'baixo').toLowerCase()}`}>
                    {whale.liquidation_risk || 'Baixo'}
                  </span>
                </div>
              </div>

              {/* Posições Ativas */}
              {whale.active_positions && whale.active_positions.length > 0 && (
                <div className="positions">
                  <h4>Posições Ativas ({whale.active_positions.length})</h4>
                  <div className="positions-list">
                    {whale.active_positions.map((pos, idx) => (
                      <div key={idx} className="position-item">
                        <div className="position-header">
                          <span className="position-coin">{pos.coin}</span>
                          <span className={`position-pnl ${pos.unrealized_pnl >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(pos.unrealized_pnl)}
                          </span>
                        </div>
                        <div className="position-details">
                          <span>Tamanho: {pos.size}</span>
                          <span>Alavancagem: {pos.leverage.toFixed(2)}x</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="whale-footer">
                <span className="last-update">
                  Última atualização: {new Date(whale.last_update).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Remoção</h3>
            <p>
              Tem certeza que deseja remover a whale{' '}
              <strong>{whaleToDelete?.address ? formatAddress(whaleToDelete.address) : ''}</strong>?
            </p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhaleTracker;
