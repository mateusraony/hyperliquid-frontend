import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

/**
 * INDICADOR DE ALERTAS TELEGRAM
 * Componente sutil para mostrar que alertas estão ativos
 */
export function IndicadorAlertas() {
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/telegram/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          setTelegramStatus(data);
        }
      } catch (error) {
        console.error('Erro ao verificar status do Telegram:', error);
        setTelegramStatus(null);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Verificar a cada 60 segundos
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !telegramStatus) return null;

  const isActive = telegramStatus.enabled && 
                   telegramStatus.bot_token_configured && 
                   telegramStatus.chat_id_configured;

  return (
    <div 
      className="fixed top-20 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
        border: isActive ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: isActive 
          ? '0 0 20px rgba(34, 197, 94, 0.2)' 
          : '0 0 20px rgba(239, 68, 68, 0.2)'
      }}
    >
      {/* Ícone pulsante */}
      <div className="relative">
        <Radio 
          className={`w-4 h-4 ${isActive ? 'text-green-500' : 'text-red-500'}`}
          style={{
            animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        />
        {isActive && (
          <div 
            className="absolute inset-0 rounded-full bg-green-500 opacity-75"
            style={{
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
        )}
      </div>

      {/* Texto */}
      <span 
        className="text-xs font-semibold"
        style={{ color: isActive ? '#22c55e' : '#ef4444' }}
      >
        {isActive ? 'Alertas Ativos' : 'Alertas Inativos'}
      </span>

      {/* Badge de contagem (opcional) */}
      {isActive && telegramStatus.active_positions_tracked > 0 && (
        <span 
          className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          {telegramStatus.active_positions_tracked}
        </span>
      )}
    </div>
  );
}

// Adicione estes estilos globalmente (no seu index.css ou App.css)
const styles = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
`;

// Auto-injeta estilos se ainda não existirem
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('indicador-alertas-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'indicador-alertas-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}
