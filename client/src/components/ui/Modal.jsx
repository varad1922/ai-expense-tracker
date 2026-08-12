import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal — compound component demonstrating:
 *
 *  1. React Portals — renders outside the normal DOM tree into `document.body`
 *     so the modal is never clipped by an `overflow: hidden` ancestor.
 *
 *  2. Compound component pattern — <Modal>, <Modal.Header>, <Modal.Body>,
 *     <Modal.Footer> give the caller full control over content layout.
 *
 *  3. useEffect side effects:
 *     - Locks body scroll while the modal is open.
 *     - Adds a keyboard listener (Escape to close).
 *     - Both effects clean up properly on unmount / close.
 *
 *  4. Focus management — auto-focuses the modal container on open for
 *     accessibility (keyboard and screen-reader users).
 *
 * Usage:
 *
 *   const [open, setOpen] = useState(false);
 *
 *   <Modal isOpen={open} onClose={() => setOpen(false)}>
 *     <Modal.Header>Confirm Delete</Modal.Header>
 *     <Modal.Body>
 *       <p>Are you sure you want to delete this expense?</p>
 *     </Modal.Body>
 *     <Modal.Footer>
 *       <button onClick={() => setOpen(false)}>Cancel</button>
 *       <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
 *     </Modal.Footer>
 *   </Modal>
 */

// ── Root Modal ────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  const sizeMap = { sm: '400px', md: '560px', lg: '720px', xl: '920px' };

  // Side effect 1: lock body scroll and set up keyboard handler
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // prevent background scroll

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Focus the dialog for keyboard accessibility
    dialogRef.current?.focus();

    // Cleanup: restore scroll and remove listener when modal closes
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Click-outside to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-lg)',
          }}
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: sizeMap[size] ?? sizeMap.md,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// ── Modal.Header ──────────────────────────────────────────────────────────────
const ModalHeader = ({ children, onClose }) => (
  <div
    style={{
      padding: 'var(--space-lg)',
      borderBottom: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}
  >
    <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
      {children}
    </h2>
    {onClose && (
      <button
        onClick={onClose}
        aria-label="Close modal"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: 'var(--text-muted)',
          lineHeight: 1,
          padding: '4px',
        }}
      >
        ✕
      </button>
    )}
  </div>
);

// ── Modal.Body ────────────────────────────────────────────────────────────────
const ModalBody = ({ children, style = {} }) => (
  <div
    style={{
      padding: 'var(--space-lg)',
      overflowY: 'auto',
      flex: 1,
      color: 'var(--text-secondary)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Modal.Footer ──────────────────────────────────────────────────────────────
const ModalFooter = ({ children }) => (
  <div
    style={{
      padding: 'var(--space-md) var(--space-lg)',
      borderTop: '1px solid var(--glass-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--space-sm)',
      flexShrink: 0,
    }}
  >
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body   = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
