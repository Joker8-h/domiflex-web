import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';

const fmtPrice = (val) => `$${Number(val || 0).toLocaleString('es-CO')}`;

export default function CartItem({ item, onUpdateQuantity, onIncrement, onDecrement, onRemove }) {
  const unitPrice = Number(item.precio ?? item.precioUnitario ?? 0);
  const qty = Number(item.cantidad ?? 1);

  const handleDec = () => {
    if (onUpdateQuantity) onUpdateQuantity(item.id, qty - 1);
    else if (onDecrement) onDecrement(item.id);
  };

  const handleInc = () => {
    if (onUpdateQuantity) onUpdateQuantity(item.id, qty + 1);
    else if (onIncrement) onIncrement(item.id);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      background: '#FFFFFF',
      borderRadius: 16,
      padding: '12px 14px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
    }}>
      {/* Imagen del producto */}
      <div style={{
        width: 58,
        height: 58,
        borderRadius: 12,
        background: '#F8F9FA',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #F3F4F6'
      }}>
        {item.imagenUrl ? (
          <img
            src={item.imagenUrl}
            alt={item.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 26 }}>🍕</span>
        )}
      </div>

      {/* Info del producto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700,
          color: '#11141A',
          fontSize: '0.96rem',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.nombre}
        </div>
        <div style={{
          color: '#11141A',
          fontWeight: 800,
          fontSize: '0.95rem'
        }}>
          {fmtPrice(unitPrice * qty)}
        </div>
      </div>

      {/* Controles - 1 + y papelera según boceto 4 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#F3F4F6',
          borderRadius: 9999,
          padding: '4px 8px',
          gap: 10,
          border: '1px solid #E5E7EB'
        }}>
          <button
            type="button"
            onClick={handleDec}
            aria-label="Disminuir cantidad"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: 'none',
              background: '#FFFFFF',
              color: '#11141A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>

          <span style={{
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#11141A',
            minWidth: 16,
            textAlign: 'center'
          }}>
            {qty}
          </span>

          <button
            type="button"
            onClick={handleInc}
            aria-label="Aumentar cantidad"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: 'none',
              background: '#FFFFFF',
              color: '#11141A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Eliminar producto"
          style={{
            background: 'none',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
