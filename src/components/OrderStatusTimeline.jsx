import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'CONFIRMADO', label: 'Confirmado' },
  { key: 'EN_CAMINO', label: 'En camino' },
  { key: 'ENTREGADO', label: 'Entregado' },
];

function getStepIndex(estado) {
  if (!estado) return 0;
  if (estado === 'ENTREGADO') return 2;
  if (estado === 'EN_CAMINO') return 1;
  return 0;
}

export default function OrderStatusTimeline({ estadoActual, currentStatus }) {
  const status = estadoActual || currentStatus || 'EN_CAMINO';

  if (status === 'CANCELADO') {
    return (
      <div style={{
        background: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 16,
        padding: '16px 20px',
        textAlign: 'center',
        color: '#DC2626',
        fontWeight: 800
      }}>
        Pedido cancelado
      </div>
    );
  }

  const activeIndex = getStepIndex(status);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 18,
      padding: '20px 24px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Línea base gris */}
        <div style={{
          position: 'absolute',
          top: 15,
          left: 24,
          right: 24,
          height: 4,
          background: '#E5E7EB',
          borderRadius: 999,
          zIndex: 0
        }} />

        {/* Línea activa verde (#16A34A) según boceto 5 */}
        <div style={{
          position: 'absolute',
          top: 15,
          left: 24,
          width: activeIndex === 0 ? '0%' : activeIndex === 1 ? 'calc(50% - 24px)' : 'calc(100% - 48px)',
          height: 4,
          background: '#16A34A',
          borderRadius: 999,
          zIndex: 1,
          transition: 'width 0.35s ease'
        }} />

        {STEPS.map((step, idx) => {
          const completed = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={step.key}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: completed ? '#16A34A' : '#E5E7EB',
                color: completed ? '#FFFFFF' : '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.18)' : 'none',
                transition: 'all 0.25s ease'
              }}>
                <Check size={18} strokeWidth={3} />
              </div>

              <span style={{
                fontSize: '0.84rem',
                fontWeight: completed ? 800 : 600,
                color: completed ? '#11141A' : '#9CA3AF'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
