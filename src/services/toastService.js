let showToastFn = null;

export function setShowToastFn(fn) {
  showToastFn = fn;
}

export function showSuccess(message) { showToastFn?.('success', message); }
export function showError(message) { showToastFn?.('error', message); }
export function showWarning(message) { showToastFn?.('warning', message); }
export function showInfo(message) { showToastFn?.('info', message); }
