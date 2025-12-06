import React from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, title, message, type = 'info', onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', showCancel = false }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'error':
        return 'fa-solid fa-circle-exclamation';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'info':
      default:
        return 'fa-solid fa-circle-info';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className={`modal-header modal-header-${type}`}>
          <div className="modal-icon-wrapper">
            <i className={`${getIcon()} modal-icon`}></i>
          </div>
          {title && <h2 className="modal-title">{title}</h2>}
        </div>
        
        <div className="modal-content">
          {message && (
            <p className="modal-message">{message}</p>
          )}
        </div>

        <div className="modal-footer">
          {showCancel && (
            <button 
              className="modal-button modal-button-cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-button modal-button-${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;

