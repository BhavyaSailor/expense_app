import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const FeedbackContext = createContext(null);
export const useFeedback = () => useContext(FeedbackContext);

const TOAST_ICON = { success: 'check', error: 'alert', info: 'info' };

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (kind, message) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-2), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4000);
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  );

  const confirm = useCallback((options) => new Promise((resolve) => setDialog({ ...options, resolve })), []);
  const settle = (answer) => {
    dialog.resolve(answer);
    setDialog(null);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
            <Icon name={TOAST_ICON[t.kind]} size={18} />
            <p>{t.message}</p>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
      {dialog && (
        <Modal
          size="sm"
          title={dialog.title}
          onClose={() => settle(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => settle(false)}>
                {dialog.cancelLabel || 'Cancel'}
              </Button>
              <Button variant={dialog.danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
                {dialog.confirmLabel || 'Confirm'}
              </Button>
            </>
          }
        >
          <p className="muted">{dialog.message}</p>
        </Modal>
      )}
    </FeedbackContext.Provider>
  );
}
