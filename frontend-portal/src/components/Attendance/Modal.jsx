// Modal.jsx
import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ 
  title, 
  children, 
  onClose, 
  onConfirm, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  size = "medium",
  showConfirm = true
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      
      </div>
    </div>
  );
};

export default Modal;