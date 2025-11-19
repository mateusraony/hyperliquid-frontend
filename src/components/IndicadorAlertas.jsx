import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

/**
 * INDICADOR DE ALERTAS TELEGRAM
 * Componente sutil para mostrar que alertas estão ativos
 * Coloque no topo do seu HyperliquidPro.jsx
 */
export function IndicadorAlertas() {
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('https://hyperliquid-whale-backend.onrender.com/telegram/status');
        if (response.ok) {
          const data = await response.json();
          setTelegramStatus(data);
        }
      } catch (error) {
        console.error('Erro ao verificar status do Telegram:', error);
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
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
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

/**
 * COMO USAR:
 * 
 * 1. Copie este arquivo para: src/components/IndicadorAlertas.jsx
 * 
 * 2. No seu HyperliquidPro.jsx, adicione no topo:
 * 
 *    import { IndicadorAlertas } from './IndicadorAlertas';
 * 
 * 3. Dentro do return do HyperliquidPro, adicione:
 * 
 *    return (
 *      <div className="...seu código...">
 *        <IndicadorAlertas />  {/* <-- ADICIONE AQUI */}
 *        ...resto do código...
 *      </div>
 *    );
 * 
 * PRONTO! O indicador aparecerá no canto superior direito! 🎉
 */

// Adicione estes estilos no seu CSS ou no index.css:
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

// Se quiser adicionar os estilos programaticamente:
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
