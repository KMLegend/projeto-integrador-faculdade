import { useEffect, useRef } from 'react';
import './Toast.css';

/**
 * Toast — Notificação temporária no canto inferior direito.
 *
 * Props:
 * - message: string da mensagem
 * - type: 'success' | 'error'
 * - visible: boolean
 * - onHide(): callback quando deve ser ocultado
 */
export default function Toast({ message, type, visible, onHide }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onHide(), 3000);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, message, onHide]);

  return (
    <div className={`toast ${type} ${visible ? 'show' : ''}`}>
      <span className="toast-icon">{type === 'success' ? '✅' : '⚠️'}</span>
      <span>{message}</span>
    </div>
  );
}
