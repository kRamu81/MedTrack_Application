import React, { createContext, useCallback, useContext, useState } from "react";
import ToastContainer from "../components/common/ToastContainer";
import { setShowToastFn } from "../services/toastService";

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast("success", msg), [addToast]);
  const showError = useCallback((msg) => addToast("error", msg), [addToast]);
  const showWarning = useCallback((msg) => addToast("warning", msg), [addToast]);
  const showInfo = useCallback((msg) => addToast("info", msg), [addToast]);

  React.useEffect(() => {
    setShowToastFn(() => addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
