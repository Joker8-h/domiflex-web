import React, { useEffect, useRef } from "react";
import tokens from "../../design/tokens";

// Modal accesible único: focus-trap básico, ESC, aria-modal, min 44px en cerrar.
export default function Modal({ title, onClose, children, labelledBy = "df-modal-title" }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab" && boxRef.current) {
        const f = boxRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    boxRef.current?.querySelector("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: tokens.colors.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing.base,
        zIndex: tokens.zIndex.modal,
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: tokens.colors.bgCard,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.radius.lg,
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: tokens.spacing.lg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.spacing.base }}>
          <h2 id={labelledBy} style={{ fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.bold, margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar diálogo"
            style={{
              minWidth: tokens.touch.min,
              minHeight: tokens.touch.min,
              borderRadius: tokens.radius.full,
              border: `1px solid ${tokens.colors.border}`,
              background: "transparent",
              color: tokens.colors.textPrimary,
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
