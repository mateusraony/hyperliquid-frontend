import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

const API_URL = 'https://hyperliquid-whale-backend.onrender.com';

/**
 * INDICADOR DE ALERTAS TELEGRAM - VERSÃO MELHORADA
 * Badge sutil mas VISÍVEL mostrando status dos alertas
 */
export function IndicadorAlertas() {
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('🔔 Verificando status do Telegram...');
        
        const response = await fetch(`${API_URL}/telegram/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Status Telegram:', data);
          setTelegramStatus(data);
        } else {
          console.warn('⚠️ Status Telegram não disponível:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status do Telegram:', error);
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
      className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-lg"
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
        border: isActive ? '2px solid rgba(34, 197, 94, 0.4)' : '2px solid rgba(239, 68, 68, 0.4)',
        boxShadow: isActive 
          ? '0 4px 24px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1)' 
          : '0 4px 24px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(239, 68, 68, 0.1)'
      }}
    >
      {/* Ícone pulsante */}
      <div className="relative flex items-center justify-center">
        <Radio 
          className={`w-5 h-5 relative z-10 ${isActive ? 'text-green-400' : 'text-red-400'}`}
          style={{
            animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            filter: 'drop-shadow(0 0 4px currentColor)'
          }}
        />
        {isActive && (
          <div 
            className="absolute inset-0 rounded-full bg-green-400 opacity-50"
            style={{
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
        )}
      </div>

      {/* Texto */}
      <div className="flex flex-col">
        <span 
          className="text-sm font-bold tracking-wide"
          style={{ 
            color: isActive ? '#22c55e' : '#ef4444',
            textShadow: '0 0 8px currentColor'
          }}
        >
          {isActive ? '🟢 Alertas Ativos' : '🔴 Alertas Inativos'}
        </span>
        {isActive && (
          <span className="text-xs text-green-300/80">
            Live Monitoring
          </span>
        )}
      </div>

      {/* Badge de contagem */}
      {isActive && telegramStatus.active_positions_tracked > 0 && (
        <span 
          className="ml-2 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(34, 197, 94, 0.25)',
            color: '#22c55e',
            border: '1.5px solid rgba(34, 197, 94, 0.4)',
            boxShadow: '0 0 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          {telegramStatus.active_positions_tracked} POS
        </span>
      )}
    </div>
  );
}

// Auto-injeta estilos se ainda não existirem
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('indicador-alertas-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'indicador-alertas-styles';
    styleSheet.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      @keyframes ping {
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}
