import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Universal Viewport-Centered Modal Dialog for Royal Mart
 * Meets all accessibility and responsive requirements:
 * - Rendered in a portal directly at document.body (never clipped by page containers)
 * - Fixed inset 0 overlay centered in viewport regardless of page scroll position
 * - Locks background scroll & preserves previous scroll offset
 * - Traps keyboard focus inside dialog and restores focus to opener on dismiss
 * - Close on Escape & close on backdrop click (with unsaved changes confirmation)
 * - Sticky header and sticky action bar so tall forms never get lost
 * - Full responsive adaptation to mobile bottom sheet on phones
 */
export default function Modal({
  title,
  onClose,
  maxWidth = '640px',
  dirty = false,
  children
}) {
  const modalBoxRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  // 1. Lock body scrolling and capture opener focus
  useEffect(() => {
    previouslyFocusedElementRef.current = document.activeElement;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width
    };

    // Lock body without jumping
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Auto-focus first focusable input or button inside dialog
    const timer = setTimeout(() => {
      if (modalBoxRef.current) {
        const firstInput = modalBoxRef.current.querySelector(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        );
        if (firstInput) {
          firstInput.focus();
        } else {
          const firstFocusable = modalBoxRef.current.querySelector(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) firstFocusable.focus();
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.top = originalBodyStyle.top;
      document.body.style.width = originalBodyStyle.width;
      window.scrollTo(0, scrollY);

      // Restore focus to opening trigger
      if (
        previouslyFocusedElementRef.current &&
        typeof previouslyFocusedElementRef.current.focus === 'function'
      ) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, []);

  const handleRequestClose = () => {
    if (dirty) {
      const confirmDismiss = window.confirm(
        'You have unsaved changes. Are you sure you want to close this dialog?'
      );
      if (!confirmDismiss) return;
    }
    onClose();
  };

  // 2. Keyboard listeners: Escape to close, Tab focus trapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleRequestClose();
      } else if (e.key === 'Tab' && modalBoxRef.current) {
        const focusableElements = modalBoxRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dirty]);

  const modalNode = (
    <div
      className="modal-portal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleRequestClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Dialog'}
    >
      <div
        className="mbox"
        ref={modalBoxRef}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={handleRequestClose}
            aria-label="Close dialog"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
