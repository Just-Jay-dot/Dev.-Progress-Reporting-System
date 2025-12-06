// Modal utility functions for easy use throughout the app
import React from 'react';
import { createRoot } from 'react-dom/client';
import Modal from '../components/Modal';

let modalRoot = null;

function getModalRoot() {
  if (!modalRoot) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    modalRoot = createRoot(container);
  }
  return modalRoot;
}

export function showModal(options) {
  return new Promise((resolve) => {
    const root = getModalRoot();
    
    const handleClose = () => {
      root.render(null);
      resolve(false);
    };

    const handleConfirm = () => {
      root.render(null);
      resolve(true);
    };

    const handleCancel = () => {
      root.render(null);
      resolve(false);
    };

    root.render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        {...options}
      />
    );
  });
}

export function alert(message, title = 'Alert', type = 'info') {
  return showModal({
    title,
    message,
    type,
    showCancel: false,
    confirmText: 'OK'
  });
}

export function confirm(message, title = 'Confirm', type = 'warning') {
  return showModal({
    title,
    message,
    type,
    showCancel: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });
}

export function success(message, title = 'Success') {
  return showModal({
    title,
    message,
    type: 'success',
    showCancel: false,
    confirmText: 'OK'
  });
}

export function error(message, title = 'Error') {
  return showModal({
    title,
    message,
    type: 'error',
    showCancel: false,
    confirmText: 'OK'
  });
}

export function warning(message, title = 'Warning') {
  return showModal({
    title,
    message,
    type: 'warning',
    showCancel: false,
    confirmText: 'OK'
  });
}

